"use client";

import { createClient } from "@/lib/supabase/client";
import type { AnomalyAlert } from "../_components/types";

const supabase = createClient();

function formatCurrency(amount: number): string {
  return `₱${amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function getDateRange(timeframe: 'month' | 'quarter' | 'year') {
  const now = new Date();
  const endDateFull = now.toISOString();
  const endDate = now.toISOString().split('T')[0]; 
  let startDateFull: string;
  let startDate: string;

  switch (timeframe) {
    case 'month':

      const monthAgo = new Date(now);
      monthAgo.setDate(monthAgo.getDate() - 30);
      startDateFull = monthAgo.toISOString();
      startDate = monthAgo.toISOString().split('T')[0];
      break;
    case 'quarter':

      const quarterAgo = new Date(now);
      quarterAgo.setDate(quarterAgo.getDate() - 90);
      startDateFull = quarterAgo.toISOString();
      startDate = quarterAgo.toISOString().split('T')[0];
      break;
    case 'year':

      const yearAgo = new Date(now);
      yearAgo.setDate(yearAgo.getDate() - 365);
      startDateFull = yearAgo.toISOString();
      startDate = yearAgo.toISOString().split('T')[0];
      break;
    default:
      const defaultAgo = new Date(now);
      defaultAgo.setDate(defaultAgo.getDate() - 30);
      startDateFull = defaultAgo.toISOString();
      startDate = defaultAgo.toISOString().split('T')[0];
  }

  return { startDate, endDate, startDateFull, endDateFull };
}

export async function fetchReportSummary(userId: string, timeframe: 'month' | 'quarter' | 'year' = 'month') {
  try {
    const { startDate, endDate } = getDateRange(timeframe);

    const { count: transactionCount, error: transError } = await supabase
      .from('transactions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate);

    if (transError) throw transError;

    const { data: budgets, error: budgetError } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active');

    if (budgetError) throw budgetError;

    const onTrack = budgets?.filter(b => (b.spent / b.amount) <= 0.8).length || 0;
    const warning = budgets?.filter(b => (b.spent / b.amount) > 0.8 && (b.spent / b.amount) < 1).length || 0;

    const { data: goals, error: goalsError } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .in('status', ['not_started', 'in_progress']);

    if (goalsError) throw goalsError;

    const nearingCompletion = goals?.filter(g => (g.current_amount / g.target_amount) >= 0.8).length || 0;

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

export async function fetchAnomalyAlerts(userId: string, timeframe: 'month' | 'quarter' | 'year' = 'month'): Promise<AnomalyAlert[]> {
  try {
    const { startDateFull, endDateFull } = getDateRange(timeframe);

    const { data: dbAnomalies, error: anomalyError } = await supabase
      .from('admin_anomalies')
      .select('*')
      .eq('user_id', userId)
      .eq('resolution_status', 'open')
      .gte('detected_at', startDateFull)
      .lte('detected_at', endDateFull)
      .order('detected_at', { ascending: false });

    if (anomalyError) {
      console.error('Error fetching anomalies from database:', anomalyError);
    }

    const transformedAnomalies: AnomalyAlert[] = (dbAnomalies || []).map(anomaly => ({
      id: anomaly.id,
      type: mapAnomalyType(anomaly.anomaly_type),
      title: anomaly.anomaly_type.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
      description: anomaly.anomaly_data?.description || 'No description available',
      severity: anomaly.severity as 'low' | 'medium' | 'high',
      timestamp: new Date(anomaly.detected_at).toLocaleDateString(),
      amount: anomaly.anomaly_data?.amount,
      category: anomaly.anomaly_data?.category,
      trend: anomaly.anomaly_data?.trend,
      status: 'active',
    }));

    return transformedAnomalies.slice(0, 10);
  } catch (error) {
    console.error('Error fetching anomaly alerts:', error);
    return [];
  }
}

function mapAnomalyType(dbType: string): 'unusual-spending' | 'duplicate-transaction' | 'budget-overspend' | 'income-anomaly' {
  const typeMap: Record<string, 'unusual-spending' | 'duplicate-transaction' | 'budget-overspend' | 'income-anomaly'> = {
    'spending_spike': 'unusual-spending',
    'unusual_pattern': 'unusual-spending',
    'income_drop': 'income-anomaly',
    'prediction_variance': 'unusual-spending',
    'data_inconsistency': 'duplicate-transaction',
    'service_failure': 'unusual-spending',
    'accuracy_drop': 'unusual-spending',
    'user_behavior': 'unusual-spending',
  };
  
  return typeMap[dbType] || 'unusual-spending';
}

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

async function fetchPredictionsData(userId: string) {

  return {
    nextMonth: {
      expenses: 0,
      income: 0,
      savings: 0,
      confidence: 0,
    },
  };
}

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

export async function computeAnomalyDetails(anomalyId: string, userId: string) {
  try {

    const [type, ...rest] = anomalyId.split('-');
    const category = rest.join('-');

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
