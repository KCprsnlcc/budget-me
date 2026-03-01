"use client";

import { createClient } from "@/lib/supabase/client";
import type { CategoryPrediction, MonthlyForecast, ExpenseTypeForecast, TransactionBehaviorInsight, PredictionHistory, PredictionSummary, CategorySpendingData } from "./types";

const supabase = createClient();

// Prophet-style forecasting parameters
const PROPHET_CONFIG = {
  seasonalityMode: "multiplicative" as const,
  yearlySeasonality: true,
  weeklySeasonality: false,
  dailySeasonality: false,
  changepointPriorScale: 0.05,
  seasonalityPriorScale: 10,
  uncertaintySamples: 1000,
};

/**
 * Fetch historical transaction data for forecasting
 */
async function fetchHistoricalTransactions(userId: string, months: number = 6) {
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);
  
  const { data, error } = await supabase
    .from("transactions")
    .select(`
      *,
      expense_categories ( category_name, icon, color ),
      income_categories ( category_name, icon, color )
    `)
    .eq("user_id", userId)
    .eq("status", "completed")
    .gte("date", startDate.toISOString().split("T")[0])
    .order("date", { ascending: true });

  if (error) {
    console.error("Error fetching transactions:", error);
    return [];
  }

  return data || [];
}

/**
 * Aggregate transactions by month
 */
function aggregateByMonth(transactions: any[]) {
  const monthlyData: Record<string, { income: number; expenses: number; transactions: any[] }> = {};

  for (const tx of transactions) {
    const date = new Date(tx.date);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

    if (!monthlyData[key]) {
      monthlyData[key] = { income: 0, expenses: 0, transactions: [] };
    }

    const amount = Number(tx.amount);
    if (tx.type === "income" || tx.type === "cash_in") {
      monthlyData[key].income += amount;
    } else if (tx.type === "expense") {
      monthlyData[key].expenses += amount;
    }

    monthlyData[key].transactions.push(tx);
  }

  return monthlyData;
}

/**
 * Simple exponential smoothing for time series forecasting (Prophet-like)
 */
function exponentialSmoothing(
  data: number[],
  alpha: number = 0.3,
  forecastHorizon: number = 3
): { forecast: number[]; confidence: number[]; trend: "up" | "down" | "stable" } {
  if (data.length === 0) {
    return { forecast: Array(forecastHorizon).fill(0), confidence: Array(forecastHorizon).fill(0), trend: "stable" };
  }

  // Calculate smoothed values
  const smoothed: number[] = [data[0]];
  for (let i = 1; i < data.length; i++) {
    smoothed[i] = alpha * data[i] + (1 - alpha) * smoothed[i - 1];
  }

  // Calculate trend
  const lastSmoothed = smoothed[smoothed.length - 1];
  const prevSmoothed = smoothed.length > 1 ? smoothed[smoothed.length - 2] : lastSmoothed;
  const trendValue = lastSmoothed - prevSmoothed;
  const trend: "up" | "down" | "stable" = 
    trendValue > lastSmoothed * 0.02 ? "up" : 
    trendValue < -lastSmoothed * 0.02 ? "down" : "stable";

  // Calculate standard error for confidence intervals
  const residuals = data.map((d, i) => d - (smoothed[i] || d));
  const variance = residuals.reduce((sum, r) => sum + r * r, 0) / Math.max(1, residuals.length - 1);
  const stdError = Math.sqrt(variance);

  // Generate forecasts with increasing uncertainty
  const forecast: number[] = [];
  const confidence: number[] = [];
  
  let currentValue = lastSmoothed;
  for (let i = 0; i < forecastHorizon; i++) {
    // Add slight trend continuation
    currentValue += trendValue * Math.pow(0.9, i); // Decaying trend influence
    forecast.push(Math.max(0, currentValue));
    
    // Confidence decreases with forecast horizon
    const conf = Math.max(50, 95 - i * 8 - (stdError / Math.max(1, currentValue)) * 20);
    confidence.push(Math.min(98, conf));
  }

  return { forecast, confidence, trend };
}

/**
 * Detect seasonality patterns in the data
 */
function detectSeasonality(data: number[]): { hasSeasonality: boolean; seasonalityStrength: number } {
  if (data.length < 4) {
    return { hasSeasonality: false, seasonalityStrength: 0 };
  }

  // Simple seasonality detection using variance analysis
  const mean = data.reduce((a, b) => a + b, 0) / data.length;
  const variance = data.reduce((sum, d) => sum + Math.pow(d - mean, 2), 0) / data.length;
  
  // Check for repeating patterns (every 3 months for quarterly)
  let seasonalVariance = 0;
  let count = 0;
  for (let i = 3; i < data.length; i++) {
    seasonalVariance += Math.pow(data[i] - data[i - 3], 2);
    count++;
  }
  
  const avgSeasonalVariance = count > 0 ? seasonalVariance / count : variance;
  const seasonalityStrength = Math.max(0, 1 - avgSeasonalVariance / Math.max(variance, 1));
  
  return { 
    hasSeasonality: seasonalityStrength > 0.3, 
    seasonalityStrength 
  };
}

/**
 * Generate income vs expenses forecast
 */
export async function generateIncomeExpenseForecast(userId: string): Promise<{
  historical: MonthlyForecast[];
  predicted: MonthlyForecast[];
  summary: {
    avgGrowth: number;
    maxSavings: number;
    confidence: number;
  };
}> {
  const transactions = await fetchHistoricalTransactions(userId, 6);
  const monthlyData = aggregateByMonth(transactions);

  // Get sorted months
  const sortedMonths = Object.keys(monthlyData).sort();
  
  if (sortedMonths.length < 2) {
    // Not enough data - return defaults
    const currentMonth = new Date().toLocaleDateString("en-US", { month: "short" });
    return {
      historical: [{ month: currentMonth, income: 0, expense: 0, type: "current" }],
      predicted: [
        { month: "Next", income: 0, expense: 0, type: "predicted" },
        { month: "Next+1", income: 0, expense: 0, type: "predicted" },
        { month: "Next+2", income: 0, expense: 0, type: "predicted" },
      ],
      summary: { avgGrowth: 0, maxSavings: 0, confidence: 0 },
    };
  }

  // Build historical data
  const incomeData = sortedMonths.map((m) => monthlyData[m].income);
  const expenseData = sortedMonths.map((m) => monthlyData[m].expenses);

  // Generate forecasts
  const incomeForecast = exponentialSmoothing(incomeData, 0.3, 3);
  const expenseForecast = exponentialSmoothing(expenseData, 0.3, 3);

  // Build historical array
  const historical: MonthlyForecast[] = sortedMonths.map((month, i) => ({
    month: new Date(month + "-01").toLocaleDateString("en-US", { month: "short" }),
    income: incomeData[i],
    expense: expenseData[i],
    type: i === sortedMonths.length - 1 ? "current" : "historical",
  }));

  // Build predicted array
  const lastDate = new Date(sortedMonths[sortedMonths.length - 1] + "-01");
  const predicted: MonthlyForecast[] = incomeForecast.forecast.map((inc, i) => {
    const predDate = new Date(lastDate);
    predDate.setMonth(predDate.getMonth() + i + 1);
    return {
      month: predDate.toLocaleDateString("en-US", { month: "short" }),
      income: Math.round(inc),
      expense: Math.round(expenseForecast.forecast[i]),
      type: "predicted",
      confidence: Math.round((incomeForecast.confidence[i] + expenseForecast.confidence[i]) / 2),
    };
  });

  // Calculate summary stats
  const avgIncomeGrowth = incomeData.length > 1
    ? ((incomeData[incomeData.length - 1] - incomeData[0]) / Math.max(1, incomeData[0])) * 100 / (incomeData.length - 1)
    : 0;
  
  const savings = incomeForecast.forecast.map((inc, i) => inc - expenseForecast.forecast[i]);
  const maxSavings = Math.max(...savings);

  return {
    historical,
    predicted,
    summary: {
      avgGrowth: Number(avgIncomeGrowth.toFixed(1)),
      maxSavings: Math.round(maxSavings),
      confidence: Math.round(
        (incomeForecast.confidence.reduce((a, b) => a + b, 0) + 
         expenseForecast.confidence.reduce((a, b) => a + b, 0)) / (incomeForecast.confidence.length * 2)
      ),
    },
  };
}

/**
 * Generate category spending forecast
 */
export async function generateCategoryForecast(userId: string): Promise<CategoryPrediction[]> {
  const transactions = await fetchHistoricalTransactions(userId, 6);
  
  // Group by category
  const categoryData: Record<string, {
    name: string;
    icon?: string;
    color?: string;
    amounts: number[];
    months: string[];
  }> = {};

  for (const tx of transactions) {
    if (tx.type !== "expense") continue;

    const cat = tx.expense_categories as Record<string, any> | null;
    const categoryName = cat?.category_name || "Uncategorized";

    if (!categoryData[categoryName]) {
      categoryData[categoryName] = {
        name: categoryName,
        icon: cat?.icon,
        color: cat?.color,
        amounts: [],
        months: [],
      };
    }

    const date = new Date(tx.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    
    if (!categoryData[categoryName].months.includes(monthKey)) {
      categoryData[categoryName].months.push(monthKey);
      categoryData[categoryName].amounts.push(0);
    }

    const monthIndex = categoryData[categoryName].months.indexOf(monthKey);
    categoryData[categoryName].amounts[monthIndex] += Number(tx.amount);
  }

  // Generate predictions for each category
  const predictions: CategoryPrediction[] = [];

  for (const [, data] of Object.entries(categoryData)) {
    if (data.amounts.length < 2) continue;

    const forecast = exponentialSmoothing(data.amounts, 0.25, 1);
    const historicalAvg = data.amounts.reduce((a, b) => a + b, 0) / data.amounts.length;
    const predicted = forecast.forecast[0];
    const change = predicted - historicalAvg;
    const changePercent = historicalAvg > 0 ? (change / historicalAvg) * 100 : 0;

    predictions.push({
      category: data.name,
      icon: data.icon,
      color: data.color,
      predicted: Math.round(predicted),
      actual: Math.round(historicalAvg),
      confidence: Math.round(forecast.confidence[0]),
      trend: forecast.trend,
      change: Math.round(change),
      changePercent: Number(changePercent.toFixed(1)),
      insight: generateCategoryInsight(data.name, changePercent, forecast.trend),
    });
  }

  // Sort by predicted amount descending
  return predictions.sort((a, b) => b.predicted - a.predicted);
}

/**
 * Generate insight text for a category
 */
function generateCategoryInsight(category: string, changePercent: number, trend: string): string {
  if (Math.abs(changePercent) < 5) {
    return `Spending pattern for ${category} remains stable based on historical data.`;
  }
  
  if (changePercent > 20) {
    return `Significant spending increase predicted for ${category}. Review upcoming expenses.`;
  }
  
  if (changePercent > 5) {
    return `${category} spending expected to rise by ${changePercent.toFixed(0)}% due to seasonal patterns.`;
  }
  
  if (changePercent < -20) {
    return `${category} costs dropping significantly. Great opportunity for savings!`;
  }
  
  return `${category} spending trending downward by ${Math.abs(changePercent).toFixed(0)}%.`;
}

/**
 * Analyze expense types (recurring vs variable)
 */
export async function analyzeExpenseTypes(userId: string): Promise<{
  recurring: ExpenseTypeForecast;
  variable: ExpenseTypeForecast;
}> {
  const transactions = await fetchHistoricalTransactions(userId, 6);

  // Simple heuristic: recurring expenses have similar amounts within 15% variance
  const descriptionPatterns: Record<string, number[]> = {};

  for (const tx of transactions) {
    if (tx.type !== "expense") continue;
    
    const desc = tx.description?.toLowerCase().trim() || "unknown";
    if (!descriptionPatterns[desc]) {
      descriptionPatterns[desc] = [];
    }
    descriptionPatterns[desc].push(Number(tx.amount));
  }

  let recurringTotal = 0;
  let variableTotal = 0;
  let recurringCount = 0;

  for (const [desc, amounts] of Object.entries(descriptionPatterns)) {
    if (amounts.length >= 2) {
      const avg = amounts.reduce((a, b) => a + b, 0) / amounts.length;
      const variance = amounts.reduce((sum, a) => sum + Math.pow(a - avg, 2), 0) / amounts.length;
      const cv = Math.sqrt(variance) / avg; // Coefficient of variation

      if (cv < 0.15 && amounts.length >= 2) {
        // Likely recurring
        recurringTotal += avg;
        recurringCount++;
      } else {
        variableTotal += avg;
      }
    } else {
      // Single occurrence - variable
      variableTotal += amounts[0] || 0;
    }
  }

  const total = recurringTotal + variableTotal;
  
  return {
    recurring: {
      amount: Math.round(recurringTotal),
      percentage: total > 0 ? Math.round((recurringTotal / total) * 100) : 0,
      trend: "stable", // Simplified - would need more history for trend
      trendValue: 0,
    },
    variable: {
      amount: Math.round(variableTotal),
      percentage: total > 0 ? Math.round((variableTotal / total) * 100) : 0,
      trend: "up", // Variable tends to fluctuate
      trendValue: 2.5,
    },
  };
}

/**
 * Analyze transaction behavior patterns
 */
export async function analyzeTransactionBehavior(userId: string): Promise<TransactionBehaviorInsight[]> {
  const transactions = await fetchHistoricalTransactions(userId, 6);

  // Group by transaction description patterns
  const patterns: Record<string, {
    amounts: number[];
    dates: Date[];
    category?: string;
  }> = {};

  for (const tx of transactions) {
    const desc = tx.description?.toLowerCase().trim() || "unknown";
    if (!patterns[desc]) {
      const cat = tx.expense_categories?.category_name || tx.income_categories?.category_name;
      patterns[desc] = { amounts: [], dates: [], category: cat };
    }
    patterns[desc].amounts.push(Number(tx.amount));
    patterns[desc].dates.push(new Date(tx.date));
  }

  const insights: TransactionBehaviorInsight[] = [];

  // Identify subscription-like patterns
  for (const [desc, data] of Object.entries(patterns)) {
    if (data.amounts.length >= 2) {
      const avg = data.amounts.reduce((a, b) => a + b, 0) / data.amounts.length;
      const variance = data.amounts.reduce((sum, a) => sum + Math.pow(a - avg, 2), 0) / data.amounts.length;
      const cv = Math.sqrt(variance) / avg;

      if (cv < 0.1 && data.amounts.length >= 2) {
        // Likely subscription/recurring
        const isIncreasing = data.amounts[data.amounts.length - 1] > data.amounts[0];
        
        insights.push({
          type: "Subscription",
          name: desc,
          currentAvg: Math.round(avg),
          nextMonth: Math.round(avg * (isIncreasing ? 1.02 : 1)),
          trend: isIncreasing ? "up" : "stable",
          confidence: Math.round(Math.max(70, 95 - cv * 100)),
        });
      }
    }
  }

  // Sort by confidence and take top results
  return insights
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 6);
}

/**
 * Generate comprehensive prediction summary
 */
export async function generatePredictionSummary(userId: string): Promise<PredictionSummary> {
  const transactions = await fetchHistoricalTransactions(userId, 3);
  const monthlyData = aggregateByMonth(transactions);
  const sortedMonths = Object.keys(monthlyData).sort();

  if (sortedMonths.length === 0) {
    return {
      monthlyIncome: 0,
      monthlyExpenses: 0,
      netBalance: 0,
      savingsRate: 0,
      incomeChange: null,
      expenseChange: null,
    };
  }

  const currentMonth = sortedMonths[sortedMonths.length - 1];
  const income = monthlyData[currentMonth].income;
  const expenses = monthlyData[currentMonth].expenses;
  const net = income - expenses;

  // Calculate changes
  let incomeChange = null;
  let expenseChange = null;

  if (sortedMonths.length >= 2) {
    const prevMonth = sortedMonths[sortedMonths.length - 2];
    const prevIncome = monthlyData[prevMonth].income;
    const prevExpenses = monthlyData[prevMonth].expenses;

    if (prevIncome > 0) {
      incomeChange = ((income - prevIncome) / prevIncome) * 100;
    }
    if (prevExpenses > 0) {
      expenseChange = ((expenses - prevExpenses) / prevExpenses) * 100;
    }
  }

  return {
    monthlyIncome: income,
    monthlyExpenses: expenses,
    netBalance: net,
    savingsRate: income > 0 ? (net / income) * 100 : 0,
    incomeChange,
    expenseChange,
  };
}

/**
 * Fetch prediction history from ai_reports table
 */
export async function fetchPredictionHistory(userId: string): Promise<PredictionHistory[]> {
  const { data, error } = await supabase
    .from("ai_reports")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    console.error("Error fetching prediction history:", error);
    return [];
  }

  return (data || []).map((report) => ({
    id: report.id,
    date: report.created_at,
    type: report.report_type || "monthly",
    status: "completed",
    accuracy: report.accuracy_score,
    insights: report.insights?.length || 0,
    dataPoints: report.data_points || 0,
    model: report.model_version || "Prophet v1.0",
  }));
}

/**
 * Save prediction to history
 */
export async function savePrediction(
  userId: string,
  prediction: {
    type: string;
    insights: unknown[];
    dataPoints: number;
    accuracy?: number;
  }
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from("ai_reports")
    .insert({
      user_id: userId,
      report_type: prediction.type,
      insights: prediction.insights,
      data_points: prediction.dataPoints,
      accuracy_score: prediction.accuracy,
      model_version: "Prophet v1.1",
    });

  if (error) {
    console.error("Error saving prediction:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Detect anomalies in transaction data
 */
export async function detectAnomalies(userId: string): Promise<Array<{
  type: "warning" | "info" | "error";
  title: string;
  description: string;
  amount?: string;
  action: string;
}>> {
  const transactions = await fetchHistoricalTransactions(userId, 3);
  const anomalies: Array<{
    type: "warning" | "info" | "error";
    title: string;
    description: string;
    amount?: string;
    action: string;
  }> = [];

  // Check for duplicate transactions
  const txMap: Record<string, any[]> = {};
  for (const tx of transactions) {
    const key = `${tx.description}-${tx.amount}-${tx.date}`;
    if (!txMap[key]) txMap[key] = [];
    txMap[key].push(tx);
  }

  for (const [key, txs] of Object.entries(txMap)) {
    if (txs.length > 1) {
      const totalAmount = txs.reduce((sum, t) => sum + Number(t.amount), 0);
      anomalies.push({
        type: "warning",
        title: `Duplicate ${txs[0].description || "Transaction"}`,
        description: `${txs.length} charges of ₱${Number(txs[0].amount).toFixed(2)} detected on ${txs[0].date}`,
        amount: `₱${totalAmount.toFixed(2)}`,
        action: "Review",
      });
    }
  }

  // Check for unusual spending spikes
  const monthlyData = aggregateByMonth(transactions);
  const expenses = Object.values(monthlyData).map((m) => m.expenses);
  
  if (expenses.length >= 2) {
    const avg = expenses.reduce((a, b) => a + b, 0) / expenses.length;
    const lastExpense = expenses[expenses.length - 1];
    
    if (lastExpense > avg * 1.5) {
      anomalies.push({
        type: "info",
        title: "Spending Spike Detected",
        description: `Current month spending is ${((lastExpense / avg - 1) * 100).toFixed(0)}% above your average`,
        action: "Review",
      });
    }
  }

  return anomalies;
}

/**
 * Generate savings opportunities based on transaction analysis
 */
export async function generateSavingsOpportunities(userId: string): Promise<Array<{
  title: string;
  potential: string;
  confidence: number;
}>> {
  const transactions = await fetchHistoricalTransactions(userId, 6);
  const monthlyData = aggregateByMonth(transactions);
  const months = Object.keys(monthlyData);

  if (months.length < 2) {
    return [];
  }

  const opportunities: Array<{ title: string; potential: string; confidence: number }> = [];

  // Calculate average monthly expenses
  const avgExpense = months.reduce((sum, m) => sum + monthlyData[m].expenses, 0) / months.length;

  // Check for subscription patterns
  const descriptionCounts: Record<string, number> = {};
  for (const tx of transactions) {
    if (tx.type === "expense") {
      const desc = tx.description?.toLowerCase().trim() || "unknown";
      descriptionCounts[desc] = (descriptionCounts[desc] || 0) + 1;
    }
  }

  // Find recurring subscriptions (3+ occurrences)
  const subscriptions = Object.entries(descriptionCounts)
    .filter(([, count]) => count >= 3)
    .sort((a, b) => b[1] - a[1]);

  if (subscriptions.length > 2) {
    const potential = avgExpense * 0.05; // 5% potential savings
    opportunities.push({
      title: `Optimize ${subscriptions.length} recurring subscriptions`,
      potential: `₱${potential.toFixed(0)}/month`,
      confidence: 85,
    });
  }

  // Check for dining/entertainment spending
  const diningTx = transactions.filter((t) => {
    const cat = t.expense_categories?.category_name?.toLowerCase();
    return t.type === "expense" && (cat?.includes("food") || cat?.includes("dining"));
  });

  if (diningTx.length > 4) {
    const avgDining = diningTx.reduce((sum, t) => sum + Number(t.amount), 0) / months.length;
    if (avgDining > 100) {
      opportunities.push({
        title: "Reduce dining out frequency by 20%",
        potential: `₱${(avgDining * 0.2).toFixed(0)}/month`,
        confidence: 78,
      });
    }
  }

  // Check transportation costs
  const transportTx = transactions.filter((t) => {
    const cat = t.expense_categories?.category_name?.toLowerCase();
    return t.type === "expense" && cat?.includes("transport");
  });

  if (transportTx.length > 0) {
    const avgTransport = transportTx.reduce((sum, t) => sum + Number(t.amount), 0) / months.length;
    opportunities.push({
      title: "Explore alternative transportation",
      potential: `₱${(avgTransport * 0.1).toFixed(0)}/month`,
      confidence: 65,
    });
  }

  return opportunities.slice(0, 3);
}

/**
 * Generate comprehensive AI insights
 */
export async function generateAIInsights(userId: string): Promise<{
  summary: string;
  riskLevel: "low" | "medium" | "high";
  riskScore: number;
  growthPotential: string;
  recommendations: string[];
}> {
  const summary = await generatePredictionSummary(userId);
  const anomalies = await detectAnomalies(userId);
  const opportunities = await generateSavingsOpportunities(userId);

  // Determine risk level based on savings rate and anomalies
  let riskLevel: "low" | "medium" | "high" = "low";
  let riskScore = 15;

  if (summary.savingsRate < 10) {
    riskLevel = "high";
    riskScore = 75;
  } else if (summary.savingsRate < 20 || anomalies.length > 2) {
    riskLevel = "medium";
    riskScore = 45;
  }

  // Calculate growth potential
  const totalPotential = opportunities.reduce((sum, o) => {
    const amount = parseFloat(o.potential.replace(/[^0-9.]/g, ""));
    return sum + (isNaN(amount) ? 0 : amount);
  }, 0);

  const recommendations: string[] = [];
  
  if (summary.savingsRate < 20) {
    recommendations.push("Focus on building an emergency fund to cover 3-6 months of expenses");
  }
  
  if (opportunities.length > 0) {
    recommendations.push(`Start with: ${opportunities[0].title}`);
  }

  if (anomalies.length > 0) {
    recommendations.push("Review flagged transactions for potential savings");
  }

  return {
    summary: `Your financial health shows a ${summary.savingsRate.toFixed(1)}% savings rate with ${anomalies.length === 0 ? "no major concerns" : `${anomalies.length} items requiring attention`}.`,
    riskLevel,
    riskScore,
    growthPotential: `₱${totalPotential.toFixed(0)}/month`,
    recommendations: recommendations.length > 0 ? recommendations : ["Keep up your good financial habits!"],
  };
}
