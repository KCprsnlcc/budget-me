# AI Insights Service Technical Guide

## Overview
The AI Insights Service (`src/app/(dashboard)/predictions/_lib/ai-insights-service.ts`) is a sophisticated financial intelligence system that leverages OpenRouter's GPT model to generate comprehensive financial analysis, risk assessments, and personalized recommendations. This document provides a detailed technical breakdown of how the entire AI-powered insights system works.

## Architecture Overview

### Core Components
1. **OpenRouter API Integration**: External AI service for financial analysis
2. **Financial Context Builder**: Transforms prediction data into AI-readable format
3. **Prompt Engineering System**: Structured prompts for consistent AI responses
4. **Response Processing Engine**: Validates and structures AI responses
5. **Fallback Intelligence**: Local algorithms when AI service is unavailable
6. **Data Persistence Layer**: Stores insights in Supabase database

### Key Dependencies
- **OpenRouter API**: External AI service (openai/gpt-oss-20b model)
- **Supabase Client**: Database operations and storage
- **Prediction Types**: TypeScript interfaces for data structures
- **Environment Variables**: API key configuration

## Configuration and Constants

### API Configuration
```typescript
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"
const OPENROUTER_API_KEY = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY
const AI_MODEL = "openai/gpt-oss-20b"
```

### Model Parameters
- **Temperature**: 0.7 (balanced creativity vs consistency)
- **Max Tokens**: 2048 (comprehensive responses)
- **Response Format**: JSON object (structured output)

## Data Structures and Interfaces

### Input Interface: `AIInsightRequest`
```typescript
interface AIInsightRequest {
  userId: string;
  forecastData: {
    historical: MonthlyForecast[];
    predicted: MonthlyForecast[];
    summary: {
      avgGrowth: number;
      maxSavings: number;
      confidence: number;
      trendDirection?: "up" | "down" | "stable";
      trendStrength?: number;
    };
  };
  categoryPredictions: CategoryPrediction[];
  expenseTypes: {
    recurring: ExpenseTypeForecast;
    variable: ExpenseTypeForecast;
  };
  behaviorInsights: TransactionBehaviorInsight[];
  summary: PredictionSummary;
}
```

### Output Interface: `AIInsightResponse`
```typescript
interface AIInsightResponse {
  financialSummary: string;
  riskLevel: "low" | "medium" | "high";
  riskScore: number; // 0-100
  riskAnalysis: string;
  growthPotential: string;
  growthAnalysis: string;
  recommendations: Array<{
    title: string;
    description: string;
    priority: "high" | "medium" | "low";
    category: "savings" | "expenses" | "income" | "investment" | "debt";
  }>;
  riskMitigationStrategies: Array<{
    strategy: string;
    description: string;
    impact: "high" | "medium" | "low";
  }>;
  longTermOpportunities: Array<{
    opportunity: string;
    description: string;
    timeframe: string;
    potentialReturn: string;
  }>;
}
```

## Detailed Function Analysis

### 1. Financial Context Builder

#### `buildFinancialContext(request: AIInsightRequest): string`
**Purpose**: Transforms complex financial data into AI-readable narrative format

**Process Breakdown**:

1. **Currency Formatting Setup**:
   ```typescript
   const fmt = (n: number) => `₱${n.toLocaleString('en-PH', {
     minimumFractionDigits: 2,
     maximumFractionDigits: 2
   })}`
   ```

2. **Income vs Expenses Forecast Section**:
   ```typescript
   // Historical Data Processing
   forecastData.historical.forEach((month) => {
     const net = month.income - month.expense;
     context += `- ${month.month}: Income ${fmt(month.income)}, ` +
                `Expenses ${fmt(month.expense)}, Net ${fmt(net)}\n`;
   });

   // Predicted Data Processing
   forecastData.predicted.forEach((month) => {
     const net = month.income - month.expense;
     context += `- ${month.month}: Income ${fmt(month.income)}, ` +
                `Expenses ${fmt(month.expense)}, Net ${fmt(net)} ` +
                `(${month.confidence}% confidence)\n`;
   });
   ```

3. **Forecast Summary Integration**:
   ```typescript
   context += `- Average Growth: ${forecastData.summary.avgGrowth}%\n`;
   context += `- Max Savings Potential: ${fmt(forecastData.summary.maxSavings)}\n`;
   context += `- Overall Confidence: ${forecastData.summary.confidence}%\n`;
   context += `- Trend Direction: ${forecastData.summary.trendDirection || "stable"}\n`;
   context += `- Trend Strength: ${forecastData.summary.trendStrength || 0}\n`;
   ```

4. **Category Spending Analysis**:
   ```typescript
   categoryPredictions.forEach((cat) => {
     context += `- ${cat.category}: Current ${fmt(cat.actual)}, ` +
                `Predicted ${fmt(cat.predicted)}, Change ${cat.changePercent}% ` +
                `(${cat.trend}), Confidence ${cat.confidence}%\n`;
   });
   ```

5. **Expense Type Breakdown**:
   ```typescript
   context += `- Recurring Expenses: ${fmt(expenseTypes.recurring.amount)} ` +
              `(${expenseTypes.recurring.percentage}%), Trend: ${expenseTypes.recurring.trend}\n`;
   context += `- Variable Expenses: ${fmt(expenseTypes.variable.amount)} ` +
              `(${expenseTypes.variable.percentage}%), Trend: ${expenseTypes.variable.trend}\n`;
   ```

6. **Transaction Behavior Insights**:
   ```typescript
   behaviorInsights.forEach((insight) => {
     context += `- ${insight.name}: Current Avg ${fmt(insight.currentAvg)}, ` +
                `Next Month ${fmt(insight.nextMonth)}, Trend: ${insight.trend}, ` +
                `Confidence: ${insight.confidence}%\n`;
   });
   ```

7. **Overall Summary Compilation**:
   ```typescript
   context += `- Monthly Income: ${fmt(summary.monthlyIncome)}\n`;
   context += `- Monthly Expenses: ${fmt(summary.monthlyExpenses)}\n`;
   context += `- Net Balance: ${fmt(summary.netBalance)}\n`;
   context += `- Savings Rate: ${summary.savingsRate.toFixed(1)}%\n`;
   
   if (summary.incomeChange !== null) {
     context += `- Income Change: ${summary.incomeChange > 0 ? "+" : ""}${summary.incomeChange.toFixed(1)}%\n`;
   }
   if (summary.expenseChange !== null) {
     context += `- Expense Change: ${summary.expenseChange > 0 ? "+" : ""}${summary.expenseChange.toFixed(1)}%\n`;
   }
   ```

**Output Format**: Structured markdown text with clear sections and formatted currency values

### 2. Main AI Insights Generator

#### `generateAIFinancialInsights(request: AIInsightRequest): Promise<AIInsightResponse>`
**Purpose**: Orchestrates the complete AI analysis process

**Detailed Workflow**:

1. **API Key Validation**:
   ```typescript
   if (!OPENROUTER_API_KEY) {
     throw new Error("OpenRouter API key not configured");
   }
   ```

2. **Financial Context Preparation**:
   ```typescript
   const financialContext = buildFinancialContext(request);
   ```

3. **System Prompt Engineering**:
   ```typescript
   const systemPrompt = `You are an expert financial analyst AI specializing in personal finance, budgeting, and financial planning. Your role is to analyze financial data and provide actionable insights, risk assessments, and strategic recommendations.

   Guidelines:
   - Analyze income vs expenses trends, category spending patterns, expense types, and transaction behaviors
   - Provide clear, actionable recommendations prioritized by impact
   - Assess financial risks and provide mitigation strategies
   - Identify growth opportunities and long-term financial planning strategies
   - Use Philippine Peso (₱) as the currency
   - Be concise but comprehensive in your analysis
   - Focus on practical, implementable advice
   - Consider both short-term and long-term financial health

   Response Format:
   You must respond with a valid JSON object containing the following structure:
   {
     "financialSummary": "Brief 2-3 sentence overview of the user's financial situation",
     "riskLevel": "low" | "medium" | "high",
     "riskScore": number (0-100),
     "riskAnalysis": "Detailed explanation of the risk level and contributing factors",
     "growthPotential": "Brief statement about growth potential (e.g., '₱5,000/month')",
     "growthAnalysis": "Detailed explanation of growth opportunities and potential",
     "recommendations": [...],
     "riskMitigationStrategies": [...],
     "longTermOpportunities": [...]
   }`;
   ```

4. **User Prompt Construction**:
   ```typescript
   const userPrompt = `Analyze the following financial data and provide comprehensive insights:\n\n${financialContext}\n\nProvide your analysis in the specified JSON format.`;
   ```

5. **OpenRouter API Request**:
   ```typescript
   const response = await fetch(OPENROUTER_API_URL, {
     method: "POST",
     headers: {
       "Content-Type": "application/json",
       Authorization: `Bearer ${OPENROUTER_API_KEY}`,
       "HTTP-Referer": typeof window !== "undefined" ? window.location.origin : "",
       "X-Title": "BudgetSense AI Predictions",
     },
     body: JSON.stringify({
       model: AI_MODEL,
       messages: [
         { role: "system", content: systemPrompt },
         { role: "user", content: userPrompt },
       ],
       temperature: 0.7,
       max_tokens: 2048,
       response_format: { type: "json_object" },
     }),
   });
   ```

6. **Response Validation and Processing**:
   ```typescript
   if (!response.ok) {
     const errorData = await response.json().catch(() => ({}));
     console.error("OpenRouter API Error:", errorData);
     throw new Error(`API error: ${response.status}`);
   }

   const data = await response.json();
   const aiContent = data.choices?.[0]?.message?.content;

   if (!aiContent) {
     throw new Error("No response from AI model");
   }

   // Parse AI response
   const aiResponse: AIInsightResponse = JSON.parse(aiContent);

   // Validate response structure
   if (!aiResponse.financialSummary || !aiResponse.riskLevel || !aiResponse.recommendations) {
     throw new Error("Invalid AI response structure");
   }
   ```

7. **Data Persistence**:
   ```typescript
   await storeAIInsights(request.userId, aiResponse);
   ```

8. **Error Handling with Fallback**:
   ```typescript
   } catch (error) {
     console.error("Error generating AI insights:", error);
     return generateFallbackInsights(request);
   }
   ```

### 3. Data Persistence System

#### `storeAIInsights(userId: string, insights: AIInsightResponse): Promise<void>`
**Purpose**: Stores AI-generated insights in Supabase database

**Database Schema Integration**:
```typescript
await supabase.from("ai_insights").insert({
  user_id: userId,
  ai_service: "openrouter",
  model_used: AI_MODEL,
  insights: {
    financial_summary: insights.financialSummary,
    growth_potential: insights.growthPotential,
    growth_analysis: insights.growthAnalysis,
  },
  risk_assessment: {
    risk_level: insights.riskLevel,
    risk_score: insights.riskScore,
    risk_analysis: insights.riskAnalysis,
  },
  recommendations: insights.recommendations,
  opportunity_areas: {
    risk_mitigation_strategies: insights.riskMitigationStrategies,
    long_term_opportunities: insights.longTermOpportunities,
  },
  confidence_level: 0.85,
  generated_at: new Date().toISOString(),
  expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
});
```

**Key Features**:
- **JSONB Storage**: Complex nested data stored efficiently
- **Expiration System**: 30-day automatic expiration
- **Service Tracking**: Records AI service and model used
- **Confidence Scoring**: Fixed 0.85 confidence for AI-generated insights
- **Silent Failure**: Doesn't break flow if storage fails

### 4. Fallback Intelligence System

#### `generateFallbackInsights(request: AIInsightRequest): AIInsightResponse`
**Purpose**: Provides intelligent insights when AI service is unavailable

**Risk Assessment Algorithm**:
```typescript
let riskLevel: "low" | "medium" | "high" = "low";
let riskScore = 20;

if (summary.savingsRate < 5) {
  riskLevel = "high";
  riskScore = 80;
} else if (summary.savingsRate < 15) {
  riskLevel = "medium";
  riskScore = 50;
}
```

**Growth Potential Calculation**:
```typescript
const avgIncome = forecastData.predicted.reduce((sum, p) => sum + p.income, 0) / forecastData.predicted.length;
const avgExpense = forecastData.predicted.reduce((sum, p) => sum + p.expense, 0) / forecastData.predicted.length;
const potentialSavings = (avgIncome - avgExpense) * 0.1; // 10% improvement potential
```

**Recommendation Engine**:
```typescript
recommendations: [
  {
    title: "Build Emergency Fund",
    description: "Aim to save 3-6 months of expenses in an easily accessible account for financial security.",
    priority: summary.savingsRate < 10 ? "high" : "medium",
    category: "savings",
  },
  {
    title: "Review Top Spending Categories",
    description: categoryPredictions.length > 0
      ? `Focus on ${categoryPredictions[0].category} which shows a ${categoryPredictions[0].changePercent}% change.`
      : "Track your spending by category to identify optimization opportunities.",
    priority: "high",
    category: "expenses",
  },
  {
    title: "Automate Savings",
    description: "Set up automatic transfers to savings accounts right after receiving income.",
    priority: "medium",
    category: "savings",
  },
]
```

**Risk Mitigation Strategies**:
```typescript
riskMitigationStrategies: [
  {
    strategy: "Expense Tracking",
    description: "Monitor all expenses daily to identify unnecessary spending and stay within budget.",
    impact: "high",
  },
  {
    strategy: "Budget Allocation",
    description: "Follow the 50/30/20 rule: 50% needs, 30% wants, 20% savings.",
    impact: "high",
  },
  {
    strategy: "Income Diversification",
    description: "Explore additional income streams to reduce dependency on single source.",
    impact: "medium",
  },
]
```

**Long-term Opportunities**:
```typescript
longTermOpportunities: [
  {
    opportunity: "Investment Portfolio",
    description: "Once emergency fund is established, consider low-risk investment options for long-term growth.",
    timeframe: "6-12 months",
    potentialReturn: "5-10% annual growth",
  },
  {
    opportunity: "Debt Elimination",
    description: "Focus on paying off high-interest debt to free up cash flow for savings and investments.",
    timeframe: "12-24 months",
    potentialReturn: `₱${(avgExpense * 0.15).toFixed(0)}/month freed up`,
  },
  {
    opportunity: "Financial Education",
    description: "Invest time in learning about personal finance, investing, and wealth building strategies.",
    timeframe: "Ongoing",
    potentialReturn: "Improved financial decision-making",
  },
]
```

### 5. Data Retrieval System

#### `fetchLatestAIInsights(userId: string): Promise<AIInsightResponse | null>`
**Purpose**: Retrieves most recent AI insights from database

**Database Query**:
```typescript
const { data, error } = await supabase
  .from("ai_insights")
  .select("*")
  .eq("user_id", userId)
  .order("generated_at", { ascending: false })
  .limit(1)
  .single();
```

**Data Reconstruction**:
```typescript
const insights = data.insights || {};
const riskAssessment = data.risk_assessment || {};
const opportunityAreas = data.opportunity_areas || {};

return {
  financialSummary: insights.financial_summary || "",
  riskLevel: riskAssessment.risk_level || "medium",
  riskScore: riskAssessment.risk_score || 50,
  riskAnalysis: riskAssessment.risk_analysis || "",
  growthPotential: insights.growth_potential || "",
  growthAnalysis: insights.growth_analysis || "",
  recommendations: data.recommendations || [],
  riskMitigationStrategies: opportunityAreas.risk_mitigation_strategies || [],
  longTermOpportunities: opportunityAreas.long_term_opportunities || [],
};
```

## AI Prompt Engineering Strategy

### System Prompt Design
The system prompt is carefully crafted to:
1. **Establish Expertise**: Positions AI as financial analyst specialist
2. **Define Scope**: Personal finance, budgeting, and financial planning
3. **Set Guidelines**: Clear analysis and recommendation criteria
4. **Specify Currency**: Philippine Peso (₱) for localization
5. **Enforce Structure**: JSON response format requirement
6. **Prioritize Practicality**: Focus on implementable advice

### Response Format Enforcement
```typescript
response_format: { type: "json_object" }
```
This ensures structured, parseable responses from the AI model.

### Temperature Tuning
```typescript
temperature: 0.7
```
Balanced between creativity (higher values) and consistency (lower values) for reliable financial advice.

## Error Handling and Resilience

### API Error Handling
1. **Network Errors**: Timeout and connection issues
2. **Authentication Errors**: Invalid API key handling
3. **Rate Limiting**: API quota exceeded scenarios
4. **Response Validation**: Malformed JSON responses
5. **Content Filtering**: AI safety restrictions

### Fallback Strategy
- **Immediate Fallback**: Local algorithm-based insights
- **No Service Interruption**: Users always receive insights
- **Quality Maintenance**: Fallback insights follow same structure
- **Transparent Operation**: System continues seamlessly

### Data Validation
```typescript
// Validate response structure
if (!aiResponse.financialSummary || !aiResponse.riskLevel || !aiResponse.recommendations) {
  throw new Error("Invalid AI response structure");
}
```

## Performance Considerations

### API Optimization
- **Single Request**: All analysis in one API call
- **Token Efficiency**: Optimized prompts for token usage
- **Response Caching**: Database storage for reuse
- **Timeout Handling**: Graceful degradation on slow responses

### Database Efficiency
- **JSONB Storage**: Efficient nested data storage
- **Indexed Queries**: Optimized user_id and timestamp queries
- **Automatic Cleanup**: 30-day expiration system
- **Silent Failures**: Non-blocking storage operations

### Memory Management
- **Streaming Responses**: No large data accumulation
- **Garbage Collection**: Proper cleanup of temporary objects
- **Efficient Parsing**: Direct JSON parsing without intermediate steps

## Security Considerations

### API Key Management
- **Environment Variables**: Secure key storage
- **Client-side Exposure**: Public key with domain restrictions
- **Request Headers**: Proper referer and title headers
- **Error Sanitization**: No key exposure in error messages

### Data Privacy
- **User Isolation**: User-specific data processing
- **No Data Retention**: AI service doesn't store user data
- **Local Processing**: Sensitive calculations done locally
- **Audit Trail**: Complete operation logging

### Input Validation
- **Data Sanitization**: Clean financial data before AI processing
- **Type Checking**: TypeScript interface validation
- **Range Validation**: Reasonable financial value checks
- **SQL Injection Prevention**: Parameterized queries

## Integration Points

### Prediction Service Integration
```typescript
// Receives processed data from prediction-service.ts
interface AIInsightRequest {
  forecastData: // From generateIncomeExpenseForecast()
  categoryPredictions: // From generateCategoryForecast()
  expenseTypes: // From analyzeExpenseTypes()
  behaviorInsights: // From analyzeTransactionBehavior()
  summary: // From generatePredictionSummary()
}
```

### Database Schema Dependencies
- **ai_insights**: Main storage table with JSONB fields
- **User Authentication**: user_id foreign key relationship
- **Expiration System**: automated cleanup based on expires_at

### Frontend Integration
- **React Components**: Direct consumption of AIInsightResponse
- **Loading States**: Async operation handling
- **Error Boundaries**: Graceful error display
- **Caching Strategy**: Local state management

## Future Enhancement Opportunities

### AI Model Improvements
1. **Model Upgrades**: Newer, more capable models
2. **Fine-tuning**: Custom financial analysis training
3. **Multi-model Ensemble**: Combining multiple AI services
4. **Specialized Models**: Domain-specific financial AI

### Feature Enhancements
1. **Personalization**: Learning from user preferences
2. **Goal Integration**: AI-powered goal recommendations
3. **Market Data**: External economic factor integration
4. **Comparative Analysis**: Peer benchmarking insights

### Performance Optimizations
1. **Response Streaming**: Real-time insight generation
2. **Predictive Caching**: Pre-generate insights
3. **Edge Computing**: Reduce latency with edge deployment
4. **Batch Processing**: Multiple user analysis optimization

### Security Enhancements
1. **End-to-end Encryption**: Enhanced data protection
2. **Zero-knowledge Architecture**: Server-side data isolation
3. **Audit Logging**: Comprehensive operation tracking
4. **Compliance Features**: Financial regulation adherence

This technical guide provides a complete understanding of how the AI insights service operates, from data preparation through AI analysis to final insight delivery and storage.