# Prediction Service Technical Guide

## Overview
The prediction service (`src/app/(dashboard)/predictions/_lib/prediction-service.ts`) is a comprehensive financial forecasting system that uses exponential smoothing algorithms to generate predictions, detect anomalies, and provide AI-powered financial insights. This document provides a detailed technical breakdown of how the entire system works.

## Architecture Overview

### Core Components
1. **Data Fetching Layer**: Retrieves historical transaction data from Supabase
2. **Exponential Smoothing Engine**: Core forecasting algorithm with confidence intervals
3. **Seasonality Detection**: Pattern recognition for seasonal spending
4. **Anomaly Detection**: Identifies unusual financial patterns
5. **AI Insights Generator**: Provides intelligent financial recommendations
6. **Data Persistence**: Saves predictions to `ai_reports` table

### Key Dependencies
- **Supabase Client**: Database operations and real-time data
- **Timezone Utils**: Philippine timezone handling
- **TypeScript Types**: Comprehensive type definitions for predictions

## Detailed Function Analysis

### 1. Data Fetching and Preparation

#### `fetchHistoricalTransactions(userId: string, months: number = 6)`
**Purpose**: Retrieves user's transaction history for analysis

**Process**:
1. **Date Calculation**: Creates start date by subtracting specified months from current Philippine time
2. **Database Query**: 
   - Fetches from `transactions` table
   - Includes related `expense_categories` and `income_categories`
   - Filters by `user_id`, `status = "completed"`, and date range
   - Orders by date ascending for chronological analysis
3. **Error Handling**: Returns empty array on database errors
4. **Data Structure**: Returns array of transaction objects with category information

**SQL Query Structure**:
```sql
SELECT *, 
       expense_categories(category_name, icon, color),
       income_categories(category_name, icon, color)
FROM transactions 
WHERE user_id = ? 
  AND status = 'completed' 
  AND date >= ?
ORDER BY date ASC
```

#### `aggregateByMonth(transactions: any[])`
**Purpose**: Groups transactions by month for time series analysis

**Process**:
1. **Month Key Generation**: Creates `YYYY-MM` format keys for grouping
2. **Transaction Classification**:
   - `income` and `cash_in` types → income bucket
   - `expense` type → expenses bucket
3. **Aggregation**: Sums amounts by month and type
4. **Data Structure**: Returns `Record<string, {income: number, expenses: number, transactions: any[]}>`

**Algorithm**:
```typescript
for each transaction:
  monthKey = `${year}-${month.padStart(2, "0")}`
  if (!monthlyData[monthKey]) initialize month
  classify transaction by type
  add amount to appropriate bucket
  store transaction reference
```

### 2. Core Forecasting Engine

#### `exponentialSmoothing(data: number[], alpha: number = 0.3, forecastHorizon: number = 3)`
**Purpose**: Implements exponential smoothing with confidence intervals and trend detection

**Mathematical Foundation**:
- **Exponential Smoothing Formula**: `S[t] = α × X[t] + (1-α) × S[t-1]`
- **Alpha Parameter**: 0.3 (30% weight to recent data, 70% to historical trend)
- **Confidence Intervals**: 95% confidence using z-score of 1.96

**Detailed Process**:

1. **Input Validation**:
   ```typescript
   if (data.length === 0) return default empty forecast
   ```

2. **Smoothing Calculation**:
   ```typescript
   smoothed[0] = data[0]  // Initialize with first value
   for i = 1 to data.length:
     smoothed[i] = alpha * data[i] + (1 - alpha) * smoothed[i-1]
   ```

3. **Trend Detection**:
   ```typescript
   trendValue = lastSmoothed - prevSmoothed
   trendStrength = |trendValue| / averageValue
   trend = trendValue > 2% ? "up" : trendValue < -2% ? "down" : "stable"
   ```

4. **Statistical Analysis**:
   ```typescript
   residuals = data.map((d, i) => d - smoothed[i])
   variance = sum(residuals²) / (length - 1)
   stdError = sqrt(variance)
   ```

5. **Forecast Generation**:
   ```typescript
   for each forecast period:
     // Apply trend with decay
     trendAdjustment = calculateTrendAdjustment(trendValue, i)
     
     // Add controlled randomness (±3% variation)
     randomVariation = (random() - 0.5) * 0.06 * currentValue
     randomFactor = 1 + (random() - 0.5) * 0.04
     
     // Calculate forecast value
     currentValue += trendAdjustment + randomVariation
     currentValue *= randomFactor
     forecastValue = max(0, currentValue)
     
     // Calculate confidence intervals
     horizonUncertainty = stdError * sqrt(i + 1)
     marginOfError = 1.96 * horizonUncertainty
     upper = forecastValue + marginOfError
     lower = max(0, forecastValue - marginOfError)
     
     // Calculate confidence (decreases with horizon)
     confidence = max(50, 95 - i*8 - uncertaintyPenalty)
   ```

**Output Structure**:
```typescript
{
  forecast: number[],      // Predicted values
  confidence: number[],    // Confidence percentages
  upper: number[],         // Upper confidence bounds
  lower: number[],         // Lower confidence bounds
  trend: "up"|"down"|"stable",
  trendStrength: number    // Numerical trend strength
}
```

### 3. Seasonality Detection

#### `detectSeasonality(data: number[])`
**Purpose**: Identifies seasonal patterns in financial data

**Algorithm**:
1. **Minimum Data Check**: Requires at least 4 data points
2. **Variance Analysis**:
   ```typescript
   mean = sum(data) / length
   variance = sum((data[i] - mean)²) / length
   ```
3. **Seasonal Pattern Detection**:
   ```typescript
   for i = 3 to data.length:
     seasonalVariance += (data[i] - data[i-3])²
   avgSeasonalVariance = seasonalVariance / count
   seasonalityStrength = max(0, 1 - avgSeasonalVariance/variance)
   ```
4. **Classification**: `seasonalityStrength > 0.3` indicates seasonality

### 4. Main Forecasting Functions

#### `generateIncomeExpenseForecast(userId: string)`
**Purpose**: Creates comprehensive income vs expense predictions

**Detailed Workflow**:

1. **Data Preparation**:
   ```typescript
   transactions = await fetchHistoricalTransactions(userId, 6)
   monthlyData = aggregateByMonth(transactions)
   sortedMonths = Object.keys(monthlyData).sort()
   ```

2. **Insufficient Data Handling**:
   - If < 2 months of data, returns default structure with Prophet config
   - Includes empty historical and predicted arrays

3. **Data Extraction**:
   ```typescript
   incomeData = sortedMonths.map(m => monthlyData[m].income)
   expenseData = sortedMonths.map(m => monthlyData[m].expenses)
   ```

4. **Seasonality Analysis**:
   ```typescript
   incomeSeasonality = detectSeasonality(incomeData)
   expenseSeasonality = detectSeasonality(expenseData)
   avgSeasonalityStrength = (income + expense) / 2
   ```

5. **Forecast Generation**:
   ```typescript
   incomeForecast = exponentialSmoothing(incomeData, 0.3, 3)
   expenseForecast = exponentialSmoothing(expenseData, 0.3, 3)
   ```

6. **Changepoint Detection**:
   ```typescript
   for each month pair:
     incomeChange = |(current - previous) / previous|
     expenseChange = |(current - previous) / previous|
     if change > 25%: mark as changepoint
   ```

7. **Trend Analysis**:
   ```typescript
   trendDirection = 
     incomeTrend == "up" && expenseTrend != "up" ? "up" :
     incomeTrend == "down" && expenseTrend != "down" ? "down" : "stable"
   ```

8. **Historical Array Construction**:
   ```typescript
   historical = sortedMonths.map((month, i) => ({
     month: formatMonth(month),
     income: incomeData[i],
     expense: expenseData[i],
     type: i == last ? "current" : "historical",
     changepoint: isChangepoint(month),
     year: extractYear(month)
   }))
   ```

9. **Predicted Array Construction**:
   ```typescript
   predicted = incomeForecast.forecast.map((inc, i) => ({
     month: formatFutureMonth(i+1),
     income: round(inc),
     expense: round(expenseForecast.forecast[i]),
     type: "predicted",
     confidence: round(avgConfidence),
     incomeUpper: round(incomeForecast.upper[i]),
     incomeLower: round(incomeForecast.lower[i]),
     expenseUpper: round(expenseForecast.upper[i]),
     expenseLower: round(expenseForecast.lower[i]),
     year: calculateFutureYear(i+1)
   }))
   ```

10. **Summary Statistics**:
    ```typescript
    avgGrowth = ((lastIncome - firstIncome) / firstIncome) * 100 / months
    maxSavings = max(incomeForecast - expenseForecast)
    confidence = average(allConfidenceScores)
    ```

#### `generateCategoryForecast(userId: string)`
**Purpose**: Predicts spending by expense category

**Process**:
1. **Category Grouping**:
   ```typescript
   for each expense transaction:
     categoryName = transaction.expense_categories?.category_name || "Uncategorized"
     group by categoryName and month
     sum amounts per category per month
   ```

2. **Prediction Generation**:
   ```typescript
   for each category with >= 2 months data:
     forecast = exponentialSmoothing(amounts, 0.25, 1)  // Lower alpha for stability
     
     // Add controlled randomness
     predicted = forecast[0] * randomFactor + randomVariation
     
     // Calculate changes
     change = predicted - historicalAverage
     changePercent = (change / historicalAverage) * 100
   ```

3. **Insight Generation**:
   ```typescript
   insight = generateCategoryInsight(category, changePercent, trend)
   ```

4. **Sorting**: Results sorted by predicted amount (descending)

#### `analyzeExpenseTypes(userId: string)`
**Purpose**: Classifies expenses as recurring vs variable

**Algorithm**:
1. **Pattern Recognition**:
   ```typescript
   for each unique transaction description:
     calculate coefficient of variation (CV = stdDev / mean)
     if CV < 0.15 && occurrences >= 2:
       classify as recurring
     else:
       classify as variable
   ```

2. **Aggregation**:
   ```typescript
   recurringTotal = sum(recurringExpenses)
   variableTotal = sum(variableExpenses)
   total = recurring + variable
   
   return {
     recurring: { amount, percentage, trend: "stable" },
     variable: { amount, percentage, trend: "up" }
   }
   ```

#### `analyzeTransactionBehavior(userId: string)`
**Purpose**: Analyzes patterns by transaction type

**Process**:
1. **Type Grouping**: Groups by `income`, `expense`, `cash_in`, `transfer`
2. **Trend Analysis**:
   ```typescript
   recentAvg = average(last3Transactions)
   olderAvg = average(first3Transactions)
   isIncreasing = recentAvg > olderAvg * 1.05
   ```
3. **Prediction with Randomness**:
   ```typescript
   nextMonthValue = avg * (isIncreasing ? 1.02 : 1)
   nextMonthValue *= randomFactor + randomVariation
   ```
4. **Confidence Calculation**: `max(70, 95 - CV*100)`

### 5. AI Insights and Analysis

#### `generateAIInsights(userId: string)`
**Purpose**: Provides comprehensive financial intelligence

**Risk Assessment Algorithm**:
```typescript
if savingsRate < 10%:
  riskLevel = "high", riskScore = 75
else if savingsRate < 20% || anomalies > 2:
  riskLevel = "medium", riskScore = 45
else:
  riskLevel = "low", riskScore = 15
```

**Recommendation Engine**:
1. **Emergency Fund**: If savings rate < 20%
2. **Top Opportunity**: First savings opportunity
3. **Anomaly Review**: If anomalies detected

#### `detectAnomalies(userId: string)`
**Purpose**: Identifies unusual financial patterns

**Detection Methods**:
1. **Duplicate Detection**:
   ```typescript
   key = `${description}-${amount}-${date}`
   if duplicates found: flag as warning
   ```

2. **Spending Spike Detection**:
   ```typescript
   if currentMonthExpenses > averageExpenses * 1.5:
     flag as spending spike
   ```

#### `generateSavingsOpportunities(userId: string)`
**Purpose**: Identifies potential cost savings

**Opportunity Detection**:
1. **Subscription Analysis**: Finds recurring charges (3+ occurrences)
2. **Dining Analysis**: Identifies high dining expenses (>₱100/month average)
3. **Transportation Analysis**: Calculates transport cost optimization

### 6. Data Persistence

#### `savePrediction(userId: string, prediction: object)`
**Purpose**: Stores prediction results in database

**Storage Structure**:
```typescript
{
  user_id: string,
  report_type: string,
  timeframe: "month",
  insights: array,
  data_points: number,
  accuracy_score: number,
  model_version: "Prophet v1.1",  // Historical reference
  prediction_data: {
    // Summary data
    projectedIncome, projectedExpenses, projectedSavings,
    incomeGrowth, expenseGrowth, savingsGrowth,
    categoriesAnalyzed, topCategories,
    recurringExpenses, variableExpenses,
    transactionPatterns, anomaliesDetected, savingsOpportunities,
    
    // Full reconstruction data
    fullForecastData, fullCategoryPredictions,
    fullExpenseTypes, fullBehaviorInsights, fullAIInsights
  }
}
```

#### `fetchPredictionHistory(userId: string)`
**Purpose**: Retrieves historical predictions

**Process**:
1. **Database Query**: Fetches from `ai_reports` table, ordered by creation date
2. **Confidence Mapping**:
   ```typescript
   if accuracy >= 90: "very high"
   else if accuracy >= 80: "high"  
   else if accuracy >= 70: "medium"
   else: "low"
   ```
3. **Data Reconstruction**: Extracts prediction data from JSON field

## Configuration and Constants

### Prophet Configuration
```typescript
const PROPHET_CONFIG = {
  seasonalityMode: "multiplicative",
  yearlySeasonality: true,
  weeklySeasonality: false,
  dailySeasonality: false,
  changepointPriorScale: 0.05,
  seasonalityPriorScale: 10,
  uncertaintySamples: 1000
}
```
**Note**: This is a legacy configuration object that maintains Prophet-style output format but doesn't actually use Prophet library.

### Key Parameters
- **Alpha (α)**: 0.3 for main forecasts, 0.25 for categories
- **Forecast Horizon**: 3 months for main forecasts, 1 month for categories
- **Confidence Level**: 95% (z-score = 1.96)
- **Trend Threshold**: 2% for trend classification
- **Changepoint Threshold**: 25% change for significant trend changes
- **Seasonality Threshold**: 0.3 strength for seasonal classification

## Error Handling and Edge Cases

### Data Validation
1. **Empty Data**: Returns zero-filled default structures
2. **Insufficient Data**: Requires minimum 2 months for meaningful predictions
3. **Database Errors**: Graceful fallback to empty arrays
4. **Invalid Amounts**: Ensures non-negative forecast values

### Randomness Control
- **Forecast Variation**: ±3% controlled randomness for realistic predictions
- **Category Variation**: ±2-5% variation for category predictions
- **Behavior Variation**: ±1-3% variation for transaction behavior

### Performance Considerations
- **Data Limiting**: Default 6-month lookback for balance of accuracy and performance
- **Efficient Aggregation**: Single-pass monthly aggregation
- **Minimal Database Calls**: Batched data retrieval with joins
- **Client-side Processing**: All calculations performed in browser

## Integration Points

### Database Schema Dependencies
- **transactions**: Main data source with user_id, amount, type, date, status
- **expense_categories**: Category information with name, icon, color
- **income_categories**: Income category information
- **ai_reports**: Prediction storage with JSON data field

### Type System Integration
- **CategoryPrediction**: Category forecast structure
- **MonthlyForecast**: Income/expense forecast structure
- **ExpenseTypeForecast**: Recurring/variable analysis structure
- **TransactionBehaviorInsight**: Behavior analysis structure
- **PredictionHistory**: Historical prediction structure
- **PredictionSummary**: Summary statistics structure

### Timezone Handling
- **Philippine Time**: All date calculations use Philippine timezone
- **Date Formatting**: Consistent date formatting for database queries
- **Month Calculations**: Proper month arithmetic for historical lookback

## Future Enhancement Opportunities

### Algorithm Improvements
1. **Advanced Seasonality**: Implement Fourier transforms for complex seasonal patterns
2. **Multiple Seasonalities**: Support weekly, monthly, and yearly patterns simultaneously
3. **External Factors**: Incorporate economic indicators and holidays
4. **Machine Learning**: Implement actual Prophet or ARIMA models

### Feature Enhancements
1. **Goal Integration**: Predict goal completion timelines
2. **Budget Forecasting**: Predict budget performance
3. **Cash Flow**: Detailed cash flow predictions
4. **Scenario Analysis**: What-if scenario modeling

### Performance Optimizations
1. **Caching**: Implement prediction result caching
2. **Incremental Updates**: Update predictions with new data only
3. **Background Processing**: Move heavy calculations to background
4. **Data Compression**: Optimize historical data storage

This technical guide provides a complete understanding of how the prediction service operates, from data ingestion through complex forecasting algorithms to final result storage and retrieval.