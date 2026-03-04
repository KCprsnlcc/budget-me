"use client";

import { createClient } from "@/lib/supabase/client";
import type { AnomalyAlert } from "../_components/types";

const supabase = createClient();

/**
 * Reports Service
 * Fetches real data for Reports page: summary cards, anomalies, and chart data
 */

// Helper to format currency
function formatCurrency(amount: number): string {
  return `₱${amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Helper to calculate date ranges
function getDateRange(timeframe: 'month' | 'quarter' | 'year') {
  const now = new Date();
  const endDate = now.toISOString().split('T')[0];
  let startDate: string;

  switch (timeframe) {
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      break;
    case 'quarter':
      const quarterStart = Math.floor(now.getMonth() / 3) * 3;
      startDate = new Date(now.getFullYear(), quarterStart, 1).toISOString().split('T')[0];
      break;
    case 'year':
      startDate = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
      break;
    default:
      startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  }

  return { startDate, endDate };
}

/**
 * Fetch report summary data (Total Transactions, Active Budgets, Active Goals, Last Updated)
 */
export async function fetchReportSummary(userId: string, timeframe: 'month' | 'quarter' | 'year' = 'month') {
  try {
    const { startDate, endDate } = getDateRange(timeframe);

    // Fetch total transactions count
    const { count: transactionCount, error: transError } = await supabase
      .from('transactions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate);

    if (transError) throw transError;

    // Fetch active budgets
    const { data: budgets, error: budgetError } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active');

    if (budgetError) throw budgetError;

    // Calculate budget status
    const onTrack = budgets?.filter(b => (b.spent / b.amount) <= 0.8).length || 0;
    const warning = budgets?.filter(b => (b.spent / b.amount) > 0.8 && (b.spent / b.amount) < 1).length || 0;

    // Fetch active goals
    const { data: goals, error: goalsError } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .in('status', ['not_started', 'in_progress']);

    if (goalsError) throw goalsError;

    // Calculate nearing completion goals (>= 80% progress)
    const nearingCompletion = goals?.filter(g => (g.current_amount / g.target_amount) >= 0.8).length || 0;

    // Get last transaction date
    const { data: lastTransaction, error: lastTransError } = await supabase
      .from('transactions')
      .select('created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (lastTransError && lastTransError.code !== 'PGRST116') throw lastTransError;

    const lastUpdated = lastTransaction?.created_at 
      ? new Date(lastTransaction.created_at).toLocaleString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          hour: 'numeric', 
          minute: '2-digit', 
          hour12: true 
        })
      : 'Never';

    return {
      totalTransactions: transactionCount || 0,
      activeBudgets: budgets?.length || 0,
      budgetsOnTrack: onTrack,
      budgetsWarning: warning,
      activeGoals: goals?.length || 0,
      goalsNearing: nearingCompletion,
      lastUpdated,
    };
  } catch (error) {
    console.error('Error fetching report summary:', error);
    throw error;
  }
}

/**
 * Detect anomalies in transaction data
 */
export async function fetchAnomalyAlerts(userId: string, timeframe: 'month' | 'quarter' | 'year' = 'month'): Promise<AnomalyAlert[]> {
  try {
    const { startDate, endDate } = getDateRange(timeframe);
    const anomalies: AnomalyAlert[] = [];

    // Fetch transactions for the period
    const { data: transactions, error: transError } = await supabase
      .from('transactions')
      .select('*, expense_category_id, expense_categories(category_name)')
      .eq('user_id', userId)
      .eq('type', 'expense')
      .gte('date', startDate)
      .lte('date', endDate);

    if (transError) throw transError;

    if (!transactions || transactions.length === 0) {
      return anomalies;
    }

    // Group by category
    const categorySpending: Record<string, { total: number; count: number; transactions: any[] }> = {};
    
    transactions.forEach(t => {
      const categoryName = (t.expense_categories as any)?.category_name || 'Uncategorized';
      if (!categorySpending[categoryName]) {
        categorySpending[categoryName] = { total: 0, count: 0, transactions: [] };
      }
      categorySpending[categoryName].total += parseFloat(t.amount);
      categorySpending[categoryName].count += 1;
      categorySpending[categoryName].transactions.push(t);
    });

    // Detect unusual spending patterns (spending > 40% above average)
    for (const [category, data] of Object.entries(categorySpending)) {
      const avgSpending = data.total / data.count;
      const recentSpending = data.transactions
        .slice(-Math.ceil(data.count / 3)) // Last third of transactions
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
      
      const recentAvg = recentSpending / Math.ceil(data.count / 3);
      const percentageIncrease = ((recentAvg - avgSpending) / avgSpending) * 100;

      if (percentageIncrease > 40) {
        anomalies.push({
          id: `unusual-${category}`,
          type: 'unusual-spending',
          title: 'Unusual Spending Pattern',
          description: `Your "${category}" spending is ${percentageIncrease.toFixed(0)}% higher than usual for this time period.`,
          severity: percentageIncrease > 60 ? 'high' : 'medium',
          timestamp: new Date().toISOString(),
          amount: recentAvg,
          category,
          trend: percentageIncrease,
          status: 'active',
        });
      }
    }

    // Detect duplicate transactions (same amount, same day, same category)
    const duplicates = new Map<string, any[]>();
    transactions.forEach(t => {
      const key = `${t.date}-${t.amount}-${t.expense_category_id}`;
      if (!duplicates.has(key)) {
        duplicates.set(key, []);
      }
      duplicates.get(key)!.push(t);
    });

    duplicates.forEach((group, key) => {
      if (group.length > 1) {
        const categoryName = (group[0].expense_categories as any)?.category_name || 'Uncategorized';
        anomalies.push({
          id: `duplicate-${key}`,
          type: 'duplicate-transaction',
          title: 'Duplicate Transaction',
          description: `Possible duplicate charge detected: ${group[0].description || categoryName} (${formatCurrency(parseFloat(group[0].amount))}) charged ${group.length} times.`,
          severity: 'low',
          timestamp: new Date().toISOString(),
          amount: parseFloat(group[0].amount),
          category: categoryName,
          status: 'active',
        });
      }
    });

    // Detect budget overspend
    const { data: budgets, error: budgetError } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active');

    if (!budgetError && budgets) {
      budgets.forEach(budget => {
        if (budget.spent > budget.amount) {
          anomalies.push({
            id: `overspend-${budget.id}`,
            type: 'budget-overspend',
            title: 'Budget Overspend',
            description: `Your "${budget.budget_name}" budget has been exceeded by ${formatCurrency(budget.spent - budget.amount)}.`,
            severity: 'high',
            timestamp: new Date().toISOString(),
            amount: budget.spent - budget.amount,
            category: budget.budget_name,
            status: 'active',
          });
        }
      });
    }

    return anomalies.slice(0, 10); // Return top 10 anomalies
  } catch (error) {
    console.error('Error fetching anomaly alerts:', error);
    return [];
  }
}

/**
 * Fetch chart data based on report type and timeframe
 */
export async function fetchReportChartData(
  userId: string,
  reportType: 'spending' | 'income-expense' | 'savings' | 'trends' | 'goals' | 'predictions',
  timeframe: 'month' | 'quarter' | 'year' = 'month'
) {
  try {
    const { startDate, endDate } = getDateRange(timeframe);

    switch (reportType) {
      case 'spending':
        return await fetchSpendingByCategory(userId, startDate, endDate);
      case 'income-expense':
        return await fetchIncomeExpenseData(userId, startDate, endDate);
      case 'savings':
        return await fetchSavingsData(userId, startDate, endDate);
      case 'trends':
        return await fetchTrendsData(userId, startDate, endDate);
      case 'goals':
        return await fetchGoalsData(userId);
      case 'predictions':
        return await fetchPredictionsData(userId);
      default:
        return null;
    }
  } catch (error) {
    console.error('Error fetching chart data:', error);
    return null;
  }
}

// Fetch spending by category
async function fetchSpendingByCategory(userId: string, startDate: string, endDate: string) {
  const { data: transactions, error } = await supabase
    .from('transactions')
    .select('amount, expense_category_id, expense_categories(category_name)')
    .eq('user_id', userId)
    .eq('type', 'expense')
    .gte('date', startDate)
    .lte('date', endDate);

  if (error) throw error;

  const categoryTotals: Record<string, number> = {};
  let total = 0;

  transactions?.forEach(t => {
    const categoryName = (t.expense_categories as any)?.category_name || 'Other';
    const amount = parseFloat(t.amount);
    categoryTotals[categoryName] = (categoryTotals[categoryName] || 0) + amount;
    total += amount;
  });

  const categories = Object.entries(categoryTotals)
    .map(([name, amount]) => ({
      name,
      amount,
      percentage: (amount / total) * 100,
      color: getColorForCategory(name),
    }))
    .sort((a, b) => b.amount - a.amount);

  return {
    total,
    categories,
  };
}

// Fetch income vs expense data
async function fetchIncomeExpenseData(userId: string, startDate: string, endDate: string) {
  const { data: transactions, error } = await supabase
    .from('transactions')
    .select('date, amount, type')
    .eq('user_id', userId)
    .in('type', ['income', 'expense'])
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true });

  if (error) throw error;

  // Group by month
  const monthlyData: Record<string, { income: number; expenses: number }> = {};

  transactions?.forEach(t => {
    const month = new Date(t.date).toLocaleDateString('en-US', { month: 'short' });
    if (!monthlyData[month]) {
      monthlyData[month] = { income: 0, expenses: 0 };
    }
    const amount = parseFloat(t.amount);
    if (t.type === 'income') {
      monthlyData[month].income += amount;
    } else {
      monthlyData[month].expenses += amount;
    }
  });

  const monthly = Object.entries(monthlyData).map(([month, data]) => ({
    month,
    income: data.income,
    expenses: data.expenses,
  }));

  const totalIncome = monthly.reduce((sum, m) => sum + m.income, 0);
  const totalExpenses = monthly.reduce((sum, m) => sum + m.expenses, 0);

  return {
    monthly,
    totals: {
      income: totalIncome,
      expenses: totalExpenses,
      netSavings: totalIncome - totalExpenses,
    },
  };
}

// Fetch savings data
async function fetchSavingsData(userId: string, startDate: string, endDate: string) {
  const { data: goals, error } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', userId)
    .in('status', ['in_progress', 'completed']);

  if (error) throw error;

  const total = goals?.reduce((sum, g) => sum + parseFloat(g.current_amount), 0) || 0;
  const targetTotal = goals?.reduce((sum, g) => sum + parseFloat(g.target_amount), 0) || 1;
  const rate = (total / targetTotal) * 100;

  const funds = goals?.map(g => ({
    name: g.goal_name,
    amount: parseFloat(g.current_amount),
    percentage: (parseFloat(g.current_amount) / parseFloat(g.target_amount)) * 100,
    color: getColorForCategory(g.category),
    target: parseFloat(g.target_amount),
  })) || [];

  return {
    total,
    rate,
    funds,
  };
}

// Fetch trends data
async function fetchTrendsData(userId: string, startDate: string, endDate: string) {
  const { data: transactions, error } = await supabase
    .from('transactions')
    .select('date, amount, expense_category_id, expense_categories(category_name)')
    .eq('user_id', userId)
    .eq('type', 'expense')
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true });

  if (error) throw error;

  // Calculate category trends
  const categoryTrends: Record<string, number[]> = {};
  
  transactions?.forEach(t => {
    const categoryName = (t.expense_categories as any)?.category_name || 'Other';
    if (!categoryTrends[categoryName]) {
      categoryTrends[categoryName] = [];
    }
    categoryTrends[categoryName].push(parseFloat(t.amount));
  });

  const categories = Object.entries(categoryTrends).map(([name, amounts]) => {
    const avg = amounts.reduce((sum, a) => sum + a, 0) / amounts.length;
    const recent = amounts.slice(-Math.ceil(amounts.length / 2));
    const recentAvg = recent.reduce((sum, a) => sum + a, 0) / recent.length;
    const change = ((recentAvg - avg) / avg) * 100;

    return {
      name,
      change,
      trend: change > 5 ? 'up' : change < -5 ? 'down' : 'stable',
      color: getColorForCategory(name),
    };
  });

  return { categories };
}

// Fetch goals data
async function fetchGoalsData(userId: string) {
  const { data: goals, error } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', userId)
    .in('status', ['not_started', 'in_progress', 'completed']);

  if (error) throw error;

  const goalsData = goals?.map(g => ({
    name: g.goal_name,
    current: parseFloat(g.current_amount),
    target: parseFloat(g.target_amount),
    percentage: (parseFloat(g.current_amount) / parseFloat(g.target_amount)) * 100,
    color: getColorForCategory(g.category),
  })) || [];

  const completed = goals?.filter(g => g.status === 'completed').length || 0;
  const nearing = goals?.filter(g => (parseFloat(g.current_amount) / parseFloat(g.target_amount)) >= 0.8 && g.status !== 'completed').length || 0;

  return {
    goals: goalsData,
    totalGoals: goals?.length || 0,
    completedGoals: completed,
    nearingCompletion: nearing,
  };
}

// Fetch predictions data (placeholder - would integrate with Prophet service)
async function fetchPredictionsData(userId: string) {
  // This would integrate with the Prophet prediction service
  // For now, return placeholder structure
  return {
    nextMonth: {
      expenses: 0,
      income: 0,
      savings: 0,
      confidence: 0,
    },
  };
}

// Helper to get color for category
function getColorForCategory(category: string): string {
  const colors: Record<string, string> = {
    'Housing': '#94a3b8',
    'Food & Dining': '#10b981',
    'Shopping': '#3b82f6',
    'Transportation': '#f59e0b',
    'Entertainment': '#a855f7',
    'Utilities': '#06b6d4',
    'Health': '#ef4444',
    'Education': '#8b5cf6',
    'emergency': '#10b981',
    'vacation': '#3b82f6',
    'house': '#f59e0b',
    'car': '#a855f7',
    'education': '#8b5cf6',
    'retirement': '#06b6d4',
    'debt': '#ef4444',
    'general': '#94a3b8',
  };

  return colors[category] || '#e2e8f0';
}

/**
 * Compute anomaly details for modal
 */
export async function computeAnomalyDetails(anomalyId: string, userId: string) {
  try {
    // Parse anomaly ID to determine type and category
    const [type, ...rest] = anomalyId.split('-');
    const category = rest.join('-');

    // Fetch related transactions
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('*, expense_categories(category_name)')
      .eq('user_id', userId)
      .eq('type', 'expense')
      .order('date', { ascending: false })
      .limit(10);

    if (error) throw error;

    const relatedTransactions = transactions?.map(t => ({
      id: t.id,
      name: t.description || (t.expense_categories as any)?.category_name || 'Transaction',
      amount: parseFloat(t.amount),
      date: new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }),
      category: (t.expense_categories as any)?.category_name || 'Uncategorized',
    })) || [];

    // Generate historical data (weekly aggregates)
    const historicalData = [
      { period: 'Week 1', amount: 0, isAnomalous: false },
      { period: 'Week 2', amount: 0, isAnomalous: false },
      { period: 'Week 3', amount: 0, isAnomalous: false },
      { period: 'Week 4', amount: 0, isAnomalous: true },
    ];

    const recommendations = [
      'Review recent transactions for potential duplicates or errors',
      'Consider setting a budget limit for this category',
      'Track spending more closely for the remainder of the period',
    ];

    return {
      relatedTransactions,
      historicalData,
      recommendations,
    };
  } catch (error) {
    console.error('Error computing anomaly details:', error);
    return {
      relatedTransactions: [],
      historicalData: [],
      recommendations: [],
    };
  }
}
