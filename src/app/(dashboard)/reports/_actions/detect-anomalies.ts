"use server";

import { createClient } from "@/lib/supabase/server";

/**
 * Detect and save anomalies from transaction data
 * This runs server-side to compute anomalies and save them to the database
 */
export async function detectAndSaveAnomalies(userId: string, timeframe: 'month' | 'quarter' | 'year' = 'month') {
  try {
    const supabase = await createClient();

    // Calculate date range
    const now = new Date();
    const endDate = now.toISOString().split('T')[0];
    let startDate: string;

    switch (timeframe) {
      case 'month':
        const monthAgo = new Date(now);
        monthAgo.setDate(monthAgo.getDate() - 30);
        startDate = monthAgo.toISOString().split('T')[0];
        break;
      case 'quarter':
        const quarterAgo = new Date(now);
        quarterAgo.setDate(quarterAgo.getDate() - 90);
        startDate = quarterAgo.toISOString().split('T')[0];
        break;
      case 'year':
        const yearAgo = new Date(now);
        yearAgo.setDate(yearAgo.getDate() - 365);
        startDate = yearAgo.toISOString().split('T')[0];
        break;
      default:
        const defaultAgo = new Date(now);
        defaultAgo.setDate(defaultAgo.getDate() - 30);
        startDate = defaultAgo.toISOString().split('T')[0];
    }

    const anomaliesToSave: any[] = [];

    // Fetch transactions for the period
    const { data: transactions, error: transError } = await supabase
      .from('transactions')
      .select('*, expense_category_id, expense_categories(category_name)')
      .eq('user_id', userId)
      .eq('type', 'expense')
      .gte('date', startDate)
      .lte('date', endDate);

    if (transError) throw transError;

    if (transactions && transactions.length > 0) {
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
          .slice(-Math.ceil(data.count / 3))
          .reduce((sum, t) => sum + parseFloat(t.amount), 0);
        
        const recentAvg = recentSpending / Math.ceil(data.count / 3);
        const percentageIncrease = ((recentAvg - avgSpending) / avgSpending) * 100;

        if (percentageIncrease > 40) {
          anomaliesToSave.push({
            user_id: userId,
            anomaly_type: 'spending_spike',
            severity: percentageIncrease > 60 ? 'high' : 'medium',
            data_source: 'transactions',
            anomaly_data: {
              description: `Your "${category}" spending is ${percentageIncrease.toFixed(0)}% higher than usual for this time period.`,
              amount: recentAvg,
              category,
              trend: percentageIncrease,
            },
            resolution_status: 'open',
            detection_method: 'automated',
          });
        }
      }
    }

    // Detect budget overspend
    const { data: budgets, error: budgetError } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active');

    if (!budgetError && budgets) {
      budgets.forEach(budget => {
        if (budget.spent > budget.amount) {
          anomaliesToSave.push({
            user_id: userId,
            anomaly_type: 'spending_spike',
            severity: 'high',
            data_source: 'transactions',
            anomaly_data: {
              description: `Your "${budget.budget_name}" budget has been exceeded by ₱${(budget.spent - budget.amount).toFixed(2)}.`,
              amount: budget.spent - budget.amount,
              category: budget.budget_name,
            },
            resolution_status: 'open',
            detection_method: 'automated',
          });
        }
      });
    }

    // Save anomalies to database (only if they don't already exist)
    if (anomaliesToSave.length > 0) {
      // Check for existing anomalies with the same category (regardless of status or time)
      // This prevents recreating anomalies that were previously dismissed or resolved
      const { data: existingAnomalies } = await supabase
        .from('admin_anomalies')
        .select('anomaly_data')
        .eq('user_id', userId);

      const existingCategories = new Set(
        (existingAnomalies || []).map(a => a.anomaly_data?.category).filter(Boolean)
      );

      // Filter out anomalies that already exist (in any status)
      const newAnomalies = anomaliesToSave.filter(
        a => !existingCategories.has(a.anomaly_data.category)
      );

      if (newAnomalies.length > 0) {
        const { error: insertError } = await supabase
          .from('admin_anomalies')
          .insert(newAnomalies);

        if (insertError) {
          console.error('Error inserting anomalies:', insertError);
          return { success: false, error: insertError.message, count: 0 };
        }

        return { success: true, count: newAnomalies.length };
      }
    }

    return { success: true, count: 0 };
  } catch (error: any) {
    console.error('Error detecting and saving anomalies:', error);
    return { success: false, error: error.message, count: 0 };
  }
}
