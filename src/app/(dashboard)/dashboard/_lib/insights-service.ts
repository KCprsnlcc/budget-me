// Flexible transaction type for insights generation
import { getPhilippinesNow, formatInPhilippines } from "@/lib/timezone";

export interface InsightsTransaction {
  id?: string;
  user_id?: string;
  date: string;
  amount: number | string;
  notes?: string | null;
  type: "income" | "expense" | "transfer" | "contribution" | "cash_in";
  category?: string | null;
  expense_category_id?: string | null;
  income_category_id?: string | null;
  description?: string | null;
  account_id?: string | null;
  goal_id?: string | null;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

// Flexible budget type for insights generation
export interface InsightsBudget {
  id?: string;
  user_id?: string;
  budget_name?: string;
  expense_category_name?: string;
  category_name?: string;
  amount?: number;
  spent?: number;
  percentage_used?: number;
  remaining?: number;
  status?: string;
}

export interface InsightData {
  title: string;
  description: string;
  type: "info" | "warning" | "success" | "danger";
  icon: string;
}

/**
 * Generate financial insights based on transactions, budgets, and financial data
 * Exact replication from useInsightsAndCharts.ts
 */
"use client";

import { getPhilippinesNow, formatInPhilippines } from "@/lib/timezone";
import type { DashboardSummary, RecentTransaction, BudgetProgress } from "./dashboard-service";

export function generateInsights(
  transactions: InsightsTransaction[],
  budgets: InsightsBudget[],
  income: number,
  expenses: number,
  savingsRate: number
): InsightData[] {
  const newInsights: InsightData[] = [];
  
  // Validate inputs
  const safeIncome = isNaN(income) || !isFinite(income) ? 0 : Math.max(0, income);
  const safeExpenses = isNaN(expenses) || !isFinite(expenses) ? 0 : Math.max(0, expenses);
  const safeSavingsRate = isNaN(savingsRate) || !isFinite(savingsRate) ? 0 : savingsRate;
  const balance = safeIncome - safeExpenses;
  
  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 0 }).format(n);
  
  const formatPercentage = (n: number) =>
    new Intl.NumberFormat("en-PH", { style: "percent", minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(n / 100);
  
  // PRIORITY 1: Critical Financial Alerts
  
  // Zero income with expenses - CRITICAL
  if (safeIncome === 0 && safeExpenses > 0) {
    newInsights.push({
      title: "Critical: No income recorded",
      description: `You have expenses of ${formatCurrency(safeExpenses)} but no recorded income. Add your income sources to get accurate financial insights and improve your financial health score.`,
      type: "danger",
      icon: "lucide:alert-triangle",
    });
  }
  
  // Significant negative balance - URGENT
  if (balance < -5000) {
    newInsights.push({
      title: "Urgent: Significant negative balance",
      description: `Your expenses exceed income by ${formatCurrency(Math.abs(balance))}. Take immediate action to balance your finances or review your budget.`,
      type: "danger",
      icon: "lucide:alert-circle",
    });
  } else if (balance < 0) {
    newInsights.push({
      title: "Warning: Negative balance detected",
      description: `Your expenses exceed income by ${formatCurrency(Math.abs(balance))}. Consider reducing expenses or increasing income.`,
      type: "warning",
      icon: "lucide:alert-triangle",
    });
  }
  
  // Find unusually large subscription transactions
  const unusualTransactions = transactions.filter(tx => {
    const amount = typeof tx.amount === 'string' ? parseFloat(tx.amount) : tx.amount;
    return amount > 1000 && 
      (tx.category?.toLowerCase().includes('subscription') || 
       tx.notes?.toLowerCase().includes('subscription'));
  });
  
  if (unusualTransactions.length > 0) {
    const largeSubscription = unusualTransactions.find(tx => {
      const amount = typeof tx.amount === 'string' ? parseFloat(tx.amount) : tx.amount;
      return amount > 10000;
    });
    
    if (largeSubscription) {
      const amount = typeof largeSubscription.amount === 'string' ? parseFloat(largeSubscription.amount) : largeSubscription.amount;
      newInsights.push({
        title: "Critical: Unusual subscription charge",
        description: `There's an unusually large subscription charge of ${formatCurrency(amount)} on ${formatInPhilippines(largeSubscription.date)}. Please verify this transaction.`,
        type: "danger",
        icon: "lucide:alert-circle",
      });
    } else if (unusualTransactions.length > 0) {
      newInsights.push({
        title: "Unusual spending detected",
        description: `Found ${unusualTransactions.length} ${unusualTransactions.length === 1 ? 'transaction' : 'transactions'} that ${unusualTransactions.length === 1 ? 'doesn\'t' : 'don\'t'} match your typical spending pattern.`,
        type: "warning",
        icon: "lucide:alert-circle",
      });
    }
  }
  
  // Budget insights
  const overBudgetCategories = budgets.filter(budget => 
    (budget.spent || 0) > (budget.amount || 0)
  );
  
  if (overBudgetCategories.length > 0) {
    newInsights.push({
      title: `Over budget in ${overBudgetCategories.length} ${overBudgetCategories.length === 1 ? 'category' : 'categories'}`,
      description: `You've exceeded your budget in ${overBudgetCategories.map(b => b.expense_category_name || b.budget_name).join(', ')}. Consider adjusting your spending or your budget amounts.`,
      type: "danger",
      icon: "lucide:alert-triangle",
    });
  }
  
  // Income vs expenses insight
  if (safeIncome < safeExpenses && safeIncome > 0) {
    const deficit = safeExpenses - safeIncome;
    const deficitPercentage = (deficit / safeIncome) * 100;
    if (deficitPercentage > 50) {
      newInsights.push({
        title: "Critical: Major overspending",
        description: `You spent ${formatCurrency(deficit)} (${formatPercentage(deficitPercentage)}) more than earned. Immediate action needed.`,
        type: "danger",
        icon: "lucide:trending-down",
      });
    } else {
      newInsights.push({
        title: "Spending exceeds income",
        description: `You spent ${formatCurrency(deficit)} more than you earned this period. Review your expenses to identify areas to cut back.`,
        type: "danger",
        icon: "lucide:trending-down",
      });
    }
  } else if (safeIncome > safeExpenses && safeSavingsRate >= 30) {
    newInsights.push({
      title: "Outstanding savings rate!",
      description: `Excellent! You're saving ${formatPercentage(safeSavingsRate)} of your income. Consider investing excess funds for growth.`,
      type: "success",
      icon: "lucide:trophy",
    });
  } else if (safeIncome > safeExpenses && safeSavingsRate >= 20) {
    newInsights.push({
      title: "Great savings rate!",
      description: `You're saving ${formatPercentage(safeSavingsRate)} of your income, which meets or exceeds the recommended 20%.`,
      type: "success",
      icon: "lucide:piggy-bank",
    });
  } else if (safeIncome > safeExpenses && safeSavingsRate < 20 && safeSavingsRate >= 10) {
    newInsights.push({
      title: "Improve your savings",
      description: `Your current savings rate is ${formatPercentage(safeSavingsRate)}. Try to save at least 20% of your income for financial security.`,
      type: "info",
      icon: "lucide:line-chart",
    });
  } else if (safeIncome > safeExpenses && safeSavingsRate < 10 && safeSavingsRate >= 5) {
    newInsights.push({
      title: "Low savings rate warning",
      description: `You're only saving ${formatPercentage(safeSavingsRate)} of your income. Consider reducing expenses to improve financial security.`,
      type: "warning",
      icon: "lucide:alert-circle",
    });
  } else if (safeIncome > safeExpenses && safeSavingsRate < 5) {
    newInsights.push({
      title: "Critical: Minimal savings",
      description: `Your savings rate is only ${formatPercentage(safeSavingsRate)}. This leaves you vulnerable to financial emergencies.`,
      type: "danger",
      icon: "lucide:shield-alert",
    });
  }
  
  // NEW INSIGHTS - SPENDING PATTERNS
  
  const expenseTransactions = transactions.filter(tx => tx.type === 'expense');
  
  // 1. Daily spending analysis
  const dailyAverage = safeExpenses / 30;
  const last7DaysTx = expenseTransactions.filter(tx => {
    const txDate = new Date(tx.date);
    const sevenDaysAgo = new Date(getPhilippinesNow());
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return txDate >= sevenDaysAgo;
  });
  
  if (last7DaysTx.length > 0) {
    const recent7DaysSpending = last7DaysTx.reduce((sum, tx) => {
      const amount = typeof tx.amount === 'string' ? parseFloat(tx.amount) : tx.amount;
      return sum + (amount || 0);
    }, 0);
    const recentDailyAvg = recent7DaysSpending / 7;
    
    if (dailyAverage > 0 && recentDailyAvg > dailyAverage * 1.5) {
      newInsights.push({
        title: "Recent spending spike",
        description: `Your daily spending this week (${formatCurrency(recentDailyAvg)}) is ${formatPercentage((recentDailyAvg / dailyAverage - 1) * 100)} above average.`,
        type: "warning",
        icon: "lucide:arrow-up",
      });
    } else if (dailyAverage > 0 && recentDailyAvg < dailyAverage * 0.7) {
      newInsights.push({
        title: "Great spending control!",
        description: `Excellent! Your daily spending this week (${formatCurrency(recentDailyAvg)}) is ${formatPercentage((1 - recentDailyAvg / dailyAverage) * 100)} below average.`,
        type: "success",
        icon: "lucide:thumbs-up",
      });
    }
  }
  
  // 2. Large transaction analysis
  if (expenseTransactions.length > 0 && safeExpenses > 0) {
    const largeTransactions = expenseTransactions.filter(tx => {
      const amount = typeof tx.amount === 'string' ? parseFloat(tx.amount) : tx.amount;
      return amount > safeExpenses * 0.15;
    });
    if (largeTransactions.length > 0) {
      const largestTx = largeTransactions.reduce((max, tx) => {
        const maxAmount = typeof max.amount === 'string' ? parseFloat(max.amount) : max.amount;
        const txAmount = typeof tx.amount === 'string' ? parseFloat(tx.amount) : tx.amount;
        return txAmount > maxAmount ? tx : max;
      });
      const largestAmount = typeof largestTx.amount === 'string' ? parseFloat(largestTx.amount) : largestTx.amount;
      const percentage = (largestAmount / safeExpenses) * 100;
      
      newInsights.push({
        title: "Large expense detected",
        description: `Your largest expense (${formatCurrency(largestAmount)}) represents ${formatPercentage(percentage)} of total spending.`,
        type: percentage > 30 ? "warning" : "info",
        icon: "lucide:alert-circle",
      });
    }
  }
  
  // 3. Frequent small transactions
  const smallTransactions = expenseTransactions.filter(tx => {
    const amount = typeof tx.amount === 'string' ? parseFloat(tx.amount) : tx.amount;
    return amount < 100;
  });
  if (smallTransactions.length > 20 && safeExpenses > 0) {
    const totalSmall = smallTransactions.reduce((sum, tx) => {
      const amount = typeof tx.amount === 'string' ? parseFloat(tx.amount) : tx.amount;
      return sum + (amount || 0);
    }, 0);
    const smallPercentage = (totalSmall / safeExpenses) * 100;
    
    newInsights.push({
      title: "Many small purchases",
      description: `You have ${smallTransactions.length} transactions under ₱100, totaling ${formatCurrency(totalSmall)} (${formatPercentage(smallPercentage)} of expenses).`,
      type: "info",
      icon: "lucide:coins",
    });
  }
  
  // 4. Weekend vs weekday spending
  const weekendExpenses = expenseTransactions.filter(tx => {
    const day = new Date(tx.date).getDay();
    return day === 0 || day === 6;
  });
  const weekdayExpenses = expenseTransactions.filter(tx => {
    const day = new Date(tx.date).getDay();
    return day >= 1 && day <= 5;
  });
  
  if (weekendExpenses.length > 0 && weekdayExpenses.length > 0) {
    const weekendTotal = weekendExpenses.reduce((sum, tx) => {
      const amount = typeof tx.amount === 'string' ? parseFloat(tx.amount) : tx.amount;
      return sum + (amount || 0);
    }, 0);
    const weekdayTotal = weekdayExpenses.reduce((sum, tx) => {
      const amount = typeof tx.amount === 'string' ? parseFloat(tx.amount) : tx.amount;
      return sum + (amount || 0);
    }, 0);
    const weekendAvg = weekendTotal / Math.max(1, weekendExpenses.length / 2);
    const weekdayAvg = weekdayTotal / Math.max(1, weekdayExpenses.length / 5);
    
    if (weekdayAvg > 0 && weekendAvg > weekdayAvg * 1.5) {
      newInsights.push({
        title: "High weekend spending",
        description: `You spend ${formatPercentage((weekendAvg / weekdayAvg - 1) * 100)} more per day on weekends. Consider budgeting for weekend activities.`,
        type: "warning",
        icon: "lucide:calendar",
      });
    }
  }
  
  // 5. Monthly spending trend analysis
  const currentMonth = getPhilippinesNow().getMonth();
  const currentYear = getPhilippinesNow().getFullYear();
  const currentMonthTx = expenseTransactions.filter(tx => {
    const txDate = new Date(tx.date);
    return txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear;
  });
  const lastMonthTx = expenseTransactions.filter(tx => {
    const txDate = new Date(tx.date);
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const year = currentMonth === 0 ? currentYear - 1 : currentYear;
    return txDate.getMonth() === lastMonth && txDate.getFullYear() === year;
  });
  
  if (currentMonthTx.length > 0 && lastMonthTx.length > 0) {
    const currentTotal = currentMonthTx.reduce((sum, tx) => {
      const amount = typeof tx.amount === 'string' ? parseFloat(tx.amount) : tx.amount;
      return sum + amount;
    }, 0);
    const lastTotal = lastMonthTx.reduce((sum, tx) => {
      const amount = typeof tx.amount === 'string' ? parseFloat(tx.amount) : tx.amount;
      return sum + amount;
    }, 0);
    const monthlyChange = lastTotal > 0 ? ((currentTotal - lastTotal) / lastTotal) * 100 : 0;
    
    if (monthlyChange > 20) {
      newInsights.push({
        title: "Spending increased significantly",
        description: `Your spending this month is ${formatPercentage(monthlyChange)} higher than last month. Review recent purchases.`,
        type: "warning",
        icon: "lucide:trending-up",
      });
    } else if (monthlyChange < -15) {
      newInsights.push({
        title: "Great spending reduction!",
        description: `Excellent! You've reduced spending by ${formatPercentage(Math.abs(monthlyChange))} compared to last month.`,
        type: "success",
        icon: "lucide:trending-down",
      });
    }
  }
  
  // 6. Income consistency analysis
  const incomeTransactions = transactions.filter(tx => tx.type === 'income');
  if (incomeTransactions.length >= 2) {
    const incomeAmounts = incomeTransactions.map(tx => {
      const amount = typeof tx.amount === 'string' ? parseFloat(tx.amount) : tx.amount;
      return amount;
    });
    const minIncome = Math.min(...incomeAmounts);
    const maxIncome = Math.max(...incomeAmounts);
    const avgIncomePerTx = safeIncome / incomeTransactions.length;
    const variability = avgIncomePerTx > 0 ? ((maxIncome - minIncome) / avgIncomePerTx) * 100 : 0;
    
    if (variability > 50) {
      newInsights.push({
        title: "Irregular income detected",
        description: `Your income varies by ${formatPercentage(variability)}. Consider building a larger emergency fund for stability.`,
        type: "info",
        icon: "lucide:line-chart",
      });
    } else if (variability < 10) {
      newInsights.push({
        title: "Stable income stream",
        description: `Great! Your income is very consistent with only ${formatPercentage(variability)} variation.`,
        type: "success",
        icon: "lucide:check-circle",
      });
    }
  }
  
  // 7. Emergency fund assessment
  const monthlyExpenses = safeExpenses / Math.max(1, expenseTransactions.length / 30);
  const emergencyFundMonths = (safeIncome > safeExpenses && monthlyExpenses > 0) 
    ? (safeIncome - safeExpenses) / monthlyExpenses 
    : 0;
  
  if (emergencyFundMonths < 1 && safeIncome > 0) {
    newInsights.push({
      title: "Build emergency fund",
      description: "You need an emergency fund covering 3-6 months of expenses. Start saving immediately for financial security.",
      type: "danger",
      icon: "lucide:shield-alert",
    });
  } else if (emergencyFundMonths >= 6) {
    newInsights.push({
      title: "Strong emergency fund!",
      description: `Excellent! Your current savings can cover ${Math.floor(emergencyFundMonths)} months of expenses.`,
      type: "success",
      icon: "lucide:shield-check",
    });
  } else if (emergencyFundMonths >= 3) {
    newInsights.push({
      title: "Good emergency fund",
      description: `You have ${Math.floor(emergencyFundMonths)} months of expenses saved. Consider building up to 6 months.`,
      type: "info",
      icon: "lucide:shield",
    });
  }
  
  // 8. Subscription and recurring payment detection
  const subscriptionKeywords = ['subscription', 'monthly', 'netflix', 'spotify', 'gym', 'membership', 'plan'];
  const potentialSubscriptions = expenseTransactions.filter(tx => {
    const notes = (tx.notes || '').toLowerCase();
    const amount = typeof tx.amount === 'string' ? parseFloat(tx.amount) : tx.amount;
    return subscriptionKeywords.some(keyword => notes.includes(keyword)) ||
           amount.toString().endsWith('.00');
  });
  
  if (potentialSubscriptions.length > 5) {
    const subscriptionTotal = potentialSubscriptions.reduce((sum, tx) => {
      const amount = typeof tx.amount === 'string' ? parseFloat(tx.amount) : tx.amount;
      return sum + amount;
    }, 0);
    const subscriptionPercentage = safeExpenses > 0 ? (subscriptionTotal / safeExpenses) * 100 : 0;
    
    newInsights.push({
      title: "Multiple subscriptions detected",
      description: `You have ${potentialSubscriptions.length} potential subscriptions costing ${formatCurrency(subscriptionTotal)} (${formatPercentage(subscriptionPercentage)} of expenses).`,
      type: subscriptionPercentage > 15 ? "warning" : "info",
      icon: "lucide:repeat",
    });
  }
  
  // 9. Cash flow timing analysis
  const transactionsByDay = new Map<number, number>();
  expenseTransactions.forEach(tx => {
    const day = new Date(tx.date).getDate();
    const amount = typeof tx.amount === 'string' ? parseFloat(tx.amount) : tx.amount;
    transactionsByDay.set(day, (transactionsByDay.get(day) || 0) + amount);
  });
  
  const heavySpendingDays = Array.from(transactionsByDay.entries())
    .filter(([_, amount]) => amount > safeExpenses * 0.1)
    .sort((a, b) => b[1] - a[1]);
  
  if (heavySpendingDays.length > 0) {
    const topDay = heavySpendingDays[0];
    newInsights.push({
      title: "Heavy spending day identified",
      description: `Day ${topDay[0]} of the month shows highest spending (${formatCurrency(topDay[1])}). Plan major purchases carefully.`,
      type: "info",
      icon: "lucide:calendar-days",
    });
  }
  
  // 10. Transaction frequency patterns
  const dailyTransactionCount = new Map<string, number>();
  expenseTransactions.forEach(tx => {
    const dateKey = new Date(tx.date).toDateString();
    dailyTransactionCount.set(dateKey, (dailyTransactionCount.get(dateKey) || 0) + 1);
  });
  
  const avgTransactionsPerDay = dailyTransactionCount.size > 0
    ? Array.from(dailyTransactionCount.values()).reduce((sum, count) => sum + count, 0) / dailyTransactionCount.size
    : 0;
  
  const highActivityDays = Array.from(dailyTransactionCount.entries())
    .filter(([_, count]) => count > avgTransactionsPerDay * 2).length;
  
  if (highActivityDays > 0) {
    newInsights.push({
      title: "Spending pattern detected",
      description: `You have ${highActivityDays} days with unusually high transaction activity. Consider consolidating purchases.`,
      type: "info",
      icon: "lucide:bar-chart-3",
    });
  }
  
  // 11. Round number spending analysis
  const roundNumberTx = expenseTransactions.filter(tx => {
    const amount = typeof tx.amount === 'string' ? parseFloat(tx.amount) : tx.amount;
    return amount % 100 === 0 || amount % 50 === 0;
  });
  
  if (roundNumberTx.length > expenseTransactions.length * 0.3 && expenseTransactions.length > 0) {
    newInsights.push({
      title: "Round number spending pattern",
      description: `${formatPercentage((roundNumberTx.length / expenseTransactions.length) * 100)} of your transactions are round numbers. This might indicate budgeting opportunities.`,
      type: "info",
      icon: "lucide:calculator",
    });
  }
  
  // 12. Category concentration analysis
  const categorySpending = new Map<string, number>();
  expenseTransactions.forEach(tx => {
    const category = tx.category || 'Uncategorized';
    const amount = typeof tx.amount === 'string' ? parseFloat(tx.amount) : tx.amount;
    categorySpending.set(category, (categorySpending.get(category) || 0) + amount);
  });
  
  const topCategory = Array.from(categorySpending.entries())
    .sort((a, b) => b[1] - a[1])[0];
  
  if (topCategory && categorySpending.size > 1 && safeExpenses > 0) {
    const categoryPercentage = (topCategory[1] / safeExpenses) * 100;
    if (categoryPercentage > 40) {
      newInsights.push({
        title: "Spending concentrated in one category",
        description: `${formatPercentage(categoryPercentage)} of spending is in ${topCategory[0]}. Consider diversifying expenses or reviewing this category.`,
        type: "warning",
        icon: "lucide:pie-chart",
      });
    }
  }
  
  // 13. Impulse buying detection
  const sameDayPurchases = new Map<string, typeof expenseTransactions>();
  expenseTransactions.forEach(tx => {
    const dateKey = new Date(tx.date).toDateString();
    if (!sameDayPurchases.has(dateKey)) {
      sameDayPurchases.set(dateKey, []);
    }
    sameDayPurchases.get(dateKey)!.push(tx);
  });
  
  const impulseDays = Array.from(sameDayPurchases.entries())
    .filter(([_, txs]) => {
      const total = txs.reduce((sum, tx) => {
        const amount = typeof tx.amount === 'string' ? parseFloat(tx.amount) : tx.amount;
        return sum + amount;
      }, 0);
      return txs.length >= 5 && total > safeExpenses * 0.15;
    });
  
  if (impulseDays.length > 0) {
    newInsights.push({
      title: "Potential impulse buying detected",
      description: `Found ${impulseDays.length} days with 5+ transactions and high spending. Consider implementing a 24-hour waiting period for purchases.`,
      type: "warning",
      icon: "lucide:alert-triangle",
    });
  }
  
  // 14. Financial health score
  const healthScore = (safeIncome + safeExpenses) > 0 
    ? (safeIncome / (safeIncome + safeExpenses)) * 100 
    : 0;
  
  if (healthScore >= 60) {
    newInsights.push({
      title: "Excellent financial health!",
      description: `Your financial health score is ${Math.round(healthScore)}%. You're managing money very well.`,
      type: "success",
      icon: "lucide:heart",
    });
  } else if (healthScore >= 45) {
    newInsights.push({
      title: "Good financial health",
      description: `Your financial health score is ${Math.round(healthScore)}%. There's room for improvement by increasing income or reducing expenses.`,
      type: "info",
      icon: "lucide:activity",
    });
  } else if (healthScore > 0) {
    newInsights.push({
      title: "Financial health needs attention",
      description: `Your financial health score is ${Math.round(healthScore)}%. Focus on increasing income and controlling expenses.`,
      type: "warning",
      icon: "lucide:heart-crack",
    });
  } else if (safeExpenses > 0) {
    newInsights.push({
      title: "Critical: Financial health at risk",
      description: "No income recorded while having expenses. Add income sources immediately to improve your financial health score.",
      type: "danger",
      icon: "lucide:heart-crack",
    });
  }
  
  // 15. Seasonal spending patterns
  const monthlySpendingPattern = new Map<number, number>();
  expenseTransactions.forEach(tx => {
    const month = new Date(tx.date).getMonth();
    const amount = typeof tx.amount === 'string' ? parseFloat(tx.amount) : tx.amount;
    monthlySpendingPattern.set(month, (monthlySpendingPattern.get(month) || 0) + amount);
  });
  
  if (monthlySpendingPattern.size >= 3) {
    const spendingValues = Array.from(monthlySpendingPattern.values());
    const avgMonthlySpending = spendingValues.reduce((sum, val) => sum + val, 0) / spendingValues.length;
    const highSpendingMonths = Array.from(monthlySpendingPattern.entries())
      .filter(([_, amount]) => amount > avgMonthlySpending * 1.3);
    
    if (highSpendingMonths.length > 0) {
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const highMonths = highSpendingMonths.map(([month]) => monthNames[month]).join(', ');
      
      newInsights.push({
        title: "Seasonal spending pattern detected",
        description: `Higher spending detected in ${highMonths}. Plan and budget for these seasonal increases.`,
        type: "info",
        icon: "lucide:calendar-range",
      });
    }
  }
  
  // 16. Debt-to-income warning
  const recentMonths = 3;
  let monthsWithDeficit = 0;
  
  for (let i = 0; i < recentMonths; i++) {
    const monthDate = new Date();
    monthDate.setMonth(monthDate.getMonth() - i);
    
    const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
    const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
    
    const monthTx = transactions.filter(tx => {
      const txDate = new Date(tx.date);
      return txDate >= monthStart && txDate <= monthEnd;
    });
    
    const monthIncome = monthTx.filter(tx => tx.type === 'income')
      .reduce((sum, tx) => sum + (typeof tx.amount === 'string' ? parseFloat(tx.amount) : tx.amount), 0);
    const monthExpenses = monthTx.filter(tx => tx.type === 'expense')
      .reduce((sum, tx) => sum + (typeof tx.amount === 'string' ? parseFloat(tx.amount) : tx.amount), 0);
    
    if (monthExpenses > monthIncome) {
      monthsWithDeficit++;
    }
  }
  
  if (monthsWithDeficit >= 2) {
    newInsights.push({
      title: "Persistent deficit warning",
      description: `You've spent more than earned in ${monthsWithDeficit} of the last ${recentMonths} months. Consider debt counseling or financial planning.`,
      type: "danger",
      icon: "lucide:alert-circle",
    });
  }
  
  // 17. Goal achievement potential
  if (safeIncome > safeExpenses) {
    const monthlySavings = safeIncome - safeExpenses;
    const yearlyPotential = monthlySavings * 12;
    
    if (yearlyPotential >= 50000) {
      newInsights.push({
        title: "Strong goal achievement potential",
        description: `At current savings rate, you could save ${formatCurrency(yearlyPotential)} annually. Perfect for major financial goals!`,
        type: "success",
        icon: "lucide:bullseye",
      });
    } else if (yearlyPotential >= 20000) {
      newInsights.push({
        title: "Moderate goal achievement potential",
        description: `You could save ${formatCurrency(yearlyPotential)} annually. Consider setting medium-term financial goals.`,
        type: "info",
        icon: "lucide:target",
      });
    }
  }
  
  // 18. Transaction timing optimization
  const morningTx = expenseTransactions.filter(tx => {
    const hour = new Date(tx.date).getHours();
    return hour >= 6 && hour < 12;
  });
  const afternoonTx = expenseTransactions.filter(tx => {
    const hour = new Date(tx.date).getHours();
    return hour >= 12 && hour < 18;
  });
  const eveningTx = expenseTransactions.filter(tx => {
    const hour = new Date(tx.date).getHours();
    return hour >= 18 || hour < 6;
  });
  
  const morningTotal = morningTx.reduce((sum, tx) => sum + (typeof tx.amount === 'string' ? parseFloat(tx.amount) : tx.amount), 0);
  const afternoonTotal = afternoonTx.reduce((sum, tx) => sum + (typeof tx.amount === 'string' ? parseFloat(tx.amount) : tx.amount), 0);
  const eveningTotal = eveningTx.reduce((sum, tx) => sum + (typeof tx.amount === 'string' ? parseFloat(tx.amount) : tx.amount), 0);
  
  const maxTimeSlot = Math.max(morningTotal, afternoonTotal, eveningTotal);
  if (maxTimeSlot > 0 && safeExpenses > 0) {
    let timeSlotName = 'morning';
    if (maxTimeSlot === afternoonTotal) timeSlotName = 'afternoon';
    if (maxTimeSlot === eveningTotal) timeSlotName = 'evening';
    
    const percentage = (maxTimeSlot / safeExpenses) * 100;
    if (percentage > 50) {
      newInsights.push({
        title: `Heavy ${timeSlotName} spending`,
        description: `${formatPercentage(percentage)} of spending occurs in the ${timeSlotName}. Consider if this aligns with your financial goals.`,
        type: "info",
        icon: "lucide:clock",
      });
    }
  }
  
  // 19. Financial milestone tracking
  const totalWealth = safeIncome - safeExpenses;
  const milestones = [
    { amount: 100000, title: "₱100K milestone achieved!" },
    { amount: 500000, title: "₱500K milestone achieved!" },
    { amount: 1000000, title: "₱1M milestone achieved!" },
    { amount: 5000000, title: "₱5M milestone achieved!" },
    { amount: 10000000, title: "₱10M milestone achieved!" },
  ];
  
  const achievedMilestones = milestones.filter(m => totalWealth >= m.amount);
  const highestMilestone = achievedMilestones[achievedMilestones.length - 1];
  
  if (highestMilestone && achievedMilestones.length > 0) {
    // Only show milestone if user hasn't seen it before (would need to track in DB)
    // For now, show the most recent milestone
    const nextMilestone = milestones.find(m => totalWealth < m.amount);
    const nextTarget = nextMilestone ? nextMilestone.amount : highestMilestone.amount * 2;
    
    newInsights.push({
      title: highestMilestone.title,
      description: `Congratulations! You've reached ${formatCurrency(highestMilestone.amount)} in net savings. Next target: ${formatCurrency(nextTarget)}.`,
      type: "success",
      icon: "lucide:award",
    });
  }
  
  // 20. Dynamic time-based insights (change on refresh)
  const currentHour = getPhilippinesNow().getHours();
  const dayOfWeek = getPhilippinesNow().getDay();
  
  // Time-based motivational insights
  if (currentHour >= 9 && currentHour <= 11) {
    newInsights.push({
      title: "Morning financial check-in",
      description: "Good morning! Take 2 minutes to review your spending goals for today.",
      type: "info",
      icon: "lucide:sunrise",
    });
  } else if (currentHour >= 12 && currentHour <= 14) {
    newInsights.push({
      title: "Lunchtime financial tip",
      description: "Consider tracking your lunch expenses - small daily savings add up over time.",
      type: "info", 
      icon: "lucide:coffee",
    });
  } else if (currentHour >= 17 && currentHour <= 19) {
    newInsights.push({
      title: "Evening financial review",
      description: "End of day review: Did you stay within your budget today?",
      type: "info",
      icon: "lucide:sunset",
    });
  }
  
  // Day-based insights
  if (dayOfWeek === 0) { // Sunday
    newInsights.push({
      title: "Sunday planning session",
      description: "Perfect time to plan your budget for the upcoming week!",
      type: "success",
      icon: "lucide:calendar",
    });
  } else if (dayOfWeek === 1) { // Monday
    newInsights.push({
      title: "Monday motivation",
      description: "Start the week strong! Review your financial goals and set weekly targets.",
      type: "success",
      icon: "lucide:target",
    });
  } else if (dayOfWeek === 5) { // Friday
    newInsights.push({
      title: "Friday financial wrap-up",
      description: "Great job this week! Review your spending patterns before the weekend.",
      type: "success",
      icon: "lucide:party-popper",
    });
  }
  
  // Random financial tips (add variety)
  const randomTips = [
    {
      title: "Tip: Track every expense",
      description: "Small purchases add up. Track everything for accurate budgeting.",
      type: "info" as const,
      icon: "lucide:receipt",
    },
    {
      title: "Tip: Emergency fund first",
      description: "Build 3-6 months of expenses before investing for long-term security.",
      type: "warning" as const,
      icon: "lucide:shield-alert",
    },
    {
      title: "Tip: Review subscriptions monthly",
      description: "Cancel unused subscriptions to save money automatically each month.",
      type: "info" as const,
      icon: "lucide:repeat",
    },
    {
      title: "Tip: Use the 50/30/20 rule",
      description: "50% needs, 30% wants, 20% savings - a balanced budget approach.",
      type: "success" as const,
      icon: "lucide:pie-chart",
    },
  ];
  
  // Add a random tip occasionally
  if (Math.random() > 0.7) { // 30% chance
    const randomTip = randomTips[Math.floor(Math.random() * randomTips.length)];
    newInsights.push(randomTip);
  }
  
  return newInsights;
}
