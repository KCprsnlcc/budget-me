# Report Insights Service Technical Guide

## Overview
The Report Insights Service (`src/app/(dashboard)/reports/_lib/report-insights-service.ts`) is a comprehensive financial report analysis system that leverages OpenRouter's GPT model to generate AI-powered insights, risk assessments, and actionable recommendations for various financial reports. This document provides a detailed technical breakdown of how the entire report analysis system works.

## Architecture Overview

### Core Components
1. **OpenRouter API Integration**: External AI service for report analysis
2. **Report Context Builder**: Transforms report data into AI-readable format
3. **Prompt Engineering System**: Structured prompts for consistent AI responses
4. **Response Processing Engine**: Validates and structures AI responses
5. **Fallback Intelligence**: Local algorithms when AI service is unavailable
6. **Data Persistence Layer**: Stores insights in Supabase database
7. **Caching System**: Retrieves cached insights to optimize performance

### Key Dependencies
- **OpenRouter API**: External AI service (openai/gpt-oss-20b model)
- **Supabase Client**: Database operations and storage
- **Report Types**: TypeScript interfaces for data structures
- **Environment Variables**: API key configuration

## Configuration and Constants

### API Configuration
```typescript
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"
const OPENROUTER_API_KEY = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || ""
const AI_MODEL = "openai/gpt-oss-20b"
```

### Model Parameters
- **Temperature**: 0.7 (balanced creativity vs consistency)
- **Max Tokens**: 2048 (comprehensive responses)
- **Response Format**: JSON object (structured output)

## Data Structures and Interfaces

### Input Interface: `ReportAIInsightRequest`
```typescript
interface ReportAIInsightRequest {
  userId: string;
  reportType: 'spending' | 'income-expense' | 'savings' | 'trends' | 'goals' | 'predictions';
  timeframe: 'month' | 'quarter' | 'year';
  reportData: {
    summary?: any;
    anomalies?: any[];
    chartData?: any;
  };
}
```

### Output Interface: `ReportAIInsightResponse`
```typescript
interface ReportAIInsightResponse {
  summary: string;
  riskLevel: "low" | "medium" | "high";
  riskScore: number; // 0-100
  riskAnalysis: string;
  recommendations: Array<{
    title: string;
    description: string;
    priority: "high" | "medium" | "low";
    category: string;
    potentialSavings?: number;
    timeHorizon: string;
  }>;
  insights: Array<{
    type: 'savings-opportunity' | 'budget-recommendation' | 'spending-trend' | 'investment-advice';
    title: string;
    description: string;
    impact: 'low' | 'medium' | 'high';
    category: string;
    potentialSavings?: number;
    recommendation: string;
    timeHorizon: string;
    confidence: number;
  }>;
  actionableSteps: string[];
}
```

## Detailed Function Analysis

### 1. Report Context Builder

#### `buildReportContext(request: ReportAIInsightRequest): string`
**Purpose**: Transforms complex report data into AI-readable narrative format

**Process Breakdown**:

1. **Currency Formatting Setup**:
   ```typescript
   const fmt = (n: number) => `₱${n.toLocaleString('en-PH', {
     minimumFractionDigits: 2,
     maximumFractionDigits: 2
   })}`
   ```

2. **Report Header Construction**:
   ```typescript
   let context = `# Financial Report Analysis Context\n\n`;
   context += `Report Type: ${reportType}\n`;
   context += `Timeframe: ${timeframe}\n\n`;
   ```

3. **Summary Statistics Processing**:
   ```typescript
   if (reportData.summary) {
     context += `## Summary Statistics\n\n`;
     Object.entries(reportData.summary).forEach(([key, value]) => {
       if (typeof value === 'number') {
         context += `- ${key}: ${value}\n`;
       } else {
         context += `- ${key}: ${value}\n`;
       }
     });
     context += `\n`;
   }
   ```

4. **Anomaly Detection Integration**:
   ```typescript
   if (reportData.anomalies && reportData.anomalies.length > 0) {
     context += `## Detected Anomalies\n\n`;
     reportData.anomalies.forEach((anomaly, idx) => {
       context += `${idx + 1}. ${anomaly.title} (${anomaly.severity} severity)\n`;
       context += `   - ${anomaly.description}\n`;
       if (anomaly.amount) {
         context += `   - Amount: ${fmt(anomaly.amount)}\n`;
       }
       if (anomaly.category) {
         context += `   - Category: ${anomaly.category}\n`;
       }
     });
     context += `\n`;
   }
   ```

5. **Chart Data Analysis**:
   ```typescript
   if (reportData.chartData) {
     context += `## Chart Data Analysis\n\n`;
     
     // Category Spending Analysis
     if (reportData.chartData.categories) {
       context += `### Spending by Category:\n`;
       reportData.chartData.categories.forEach((cat: any) => {
         context += `- ${cat.name}: ${fmt(cat.amount)} (${cat.percentage.toFixed(1)}%)\n`;
       });
       context += `\n`;
     }

     // Monthly Income vs Expenses
     if (reportData.chartData.monthly) {
       context += `### Monthly Income vs Expenses:\n`;
       reportData.chartData.monthly.forEach((month: any) => {
         context += `- ${month.month}: Income ${fmt(month.income)}, ` +
                    `Expenses ${fmt(month.expenses)}, ` +
                    `Net ${fmt(month.income - month.expenses)}\n`;
       });
       context += `\n`;
     }

     // Savings Goals Progress
     if (reportData.chartData.funds) {
       context += `### Savings Goals:\n`;
       reportData.chartData.funds.forEach((fund: any) => {
         context += `- ${fund.name}: ${fmt(fund.amount)} / ${fmt(fund.target)} ` +
                    `(${fund.percentage.toFixed(1)}%)\n`;
       });
       context += `\n`;
     }

     // Goals Progress Tracking
     if (reportData.chartData.goals) {
       context += `### Goals Progress:\n`;
       reportData.chartData.goals.forEach((goal: any) => {
         context += `- ${goal.name}: ${fmt(goal.current)} / ${fmt(goal.target)} ` +
                    `(${goal.percentage.toFixed(1)}%)\n`;
       });
       context += `\n`;
     }
   }
   ```

**Output Format**: Structured markdown text with clear sections and formatted currency values

### 2. Main Report AI Insights Generator

#### `generateReportAIInsights(request: ReportAIInsightRequest): Promise<ReportAIInsightResponse>`
**Purpose**: Orchestrates the complete AI report analysis process

**Detailed Workflow**:

1. **API Key Validation**:
   ```typescript
   if (!OPENROUTER_API_KEY) {
     throw new Error("OpenRouter API key not configured");
   }
   ```

2. **Report Context Preparation**:
   ```typescript
   const reportContext = buildReportContext(request);
   ```

3. **System Prompt Engineering**:
   ```typescript
   const systemPrompt = `You are an expert financial analyst AI specializing in personal finance reporting, budgeting, and financial planning. Your role is to analyze financial report data and provide actionable insights, risk assessments, and strategic recommendations.

   Guidelines:
   - Analyze spending patterns, income trends, savings progress, and anomalies
   - Provide clear, actionable recommendations prioritized by impact
   - Assess financial risks and provide mitigation strategies
   - Identify savings opportunities and optimization strategies
   - Use Philippine Peso (₱) as the currency
   - Be concise but comprehensive in your analysis
   - Focus on practical, implementable advice
   - Consider both short-term and long-term financial health

   Response Format:
   You must respond with a valid JSON object containing the following structure:
   {
     "summary": "Brief 2-3 sentence overview of the financial report findings",
     "riskLevel": "low" | "medium" | "high",
     "riskScore": number (0-100),
     "riskAnalysis": "Detailed explanation of the risk level and contributing factors",
     "recommendations": [...],
     "insights": [...],
     "actionableSteps": [...]
   }`;
   ```

4. **User Prompt Construction**:
   ```typescript
   const userPrompt = `Analyze the following financial report data and provide comprehensive insights:\n\n${reportContext}\n\nProvide your analysis in the specified JSON format.`;
   ```

5. **OpenRouter API Request**:
   ```typescript
   const response = await fetch(OPENROUTER_API_URL, {
     method: "POST",
     headers: {
       "Content-Type": "application/json",
       Authorization: `Bearer ${OPENROUTER_API_KEY}`,
       "HTTP-Referer": typeof window !== "undefined" ? window.location.origin : "",
       "X-Title": "BudgetSense AI Reports",
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
   const aiResponse: ReportAIInsightResponse = JSON.parse(aiContent);

   // Validate response structure
   if (!aiResponse.summary || !aiResponse.riskLevel || !aiResponse.recommendations) {
     throw new Error("Invalid AI response structure");
   }
   ```

7. **Data Persistence**:
   ```typescript
   await storeReportInsights(request.userId, request.reportType, request.timeframe, aiResponse);
   ```

8. **Error Handling with Fallback**:
   ```typescript
   } catch (error) {
     console.error("Error generating report AI insights:", error);
     return generateFallbackReportInsights(request);
   }
   ```

### 3. Data Persistence System

#### `storeReportInsights(userId: string, reportType: string, timeframe: string, insights: ReportAIInsightResponse): Promise<void>`
**Purpose**: Stores AI-generated report insights in Supabase database

**Database Schema Integration**:
```typescript
await supabase.from("ai_reports").insert({
  user_id: userId,
  report_type: reportType,
  timeframe,
  insights: {
    summary: insights.summary,
    risk_level: insights.riskLevel,
    risk_score: insights.riskScore,
    risk_analysis: insights.riskAnalysis,
    actionable_steps: insights.actionableSteps,
  },
  recommendations: insights.recommendations,
  summary: insights.summary,
  ai_service: "openrouter",
  ai_model: AI_MODEL,
  confidence_level: 0.85,
  generated_at: new Date().toISOString(),
  expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
});
```

**Key Features**:
- **JSONB Storage**: Complex nested data stored efficiently
- **Expiration System**: 7-day automatic expiration (shorter than predictions)
- **Report Type Tracking**: Categorizes insights by report type and timeframe
- **Service Tracking**: Records AI service and model used
- **Confidence Scoring**: Fixed 0.85 confidence for AI-generated insights
- **Silent Failure**: Doesn't break flow if storage fails

### 4. Fallback Intelligence System

#### `generateFallbackReportInsights(request: ReportAIInsightRequest): ReportAIInsightResponse`
**Purpose**: Provides intelligent insights when AI service is unavailable

**Risk Assessment Algorithm**:
```typescript
let riskLevel: "low" | "medium" | "high" = "low";
let riskScore = 20;

if (reportData.anomalies && reportData.anomalies.length > 0) {
  const highSeverity = reportData.anomalies.filter((a: any) => a.severity === 'high').length;
  if (highSeverity > 0) {
    riskLevel = "high";
    riskScore = 75;
  } else if (reportData.anomalies.length > 2) {
    riskLevel = "medium";
    riskScore = 50;
  }
}
```

**Dynamic Summary Generation**:
```typescript
summary: `Your financial report shows ${reportData.anomalies?.length || 0} anomalies detected. ${
  riskLevel === "high"
    ? "Immediate attention is needed to address spending issues."
    : riskLevel === "medium"
    ? "Some areas need improvement to optimize your finances."
    : "Your finances are generally stable."
}`,
```

**Risk Analysis Engine**:
```typescript
riskAnalysis: `Based on your spending patterns and detected anomalies, your financial risk is ${riskLevel}. ${
  riskLevel === "high"
    ? "Focus on reducing unnecessary expenses and addressing budget overruns."
    : riskLevel === "medium"
    ? "Monitor your spending closely and implement budget controls."
    : "Continue maintaining good financial habits."
}`,
```

**Recommendation Engine**:
```typescript
recommendations: [
  {
    title: "Review Spending Patterns",
    description: "Analyze your top spending categories and identify areas for optimization.",
    priority: "high",
    category: "expenses",
    timeHorizon: "This week",
  },
  {
    title: "Set Budget Limits",
    description: "Establish clear budget limits for high-spending categories to prevent overspending.",
    priority: "high",
    category: "budget",
    timeHorizon: "Next month",
  },
  {
    title: "Track Daily Expenses",
    description: "Monitor expenses daily to stay within budget and catch anomalies early.",
    priority: "medium",
    category: "expenses",
    timeHorizon: "Ongoing",
  },
]
```

**Insights Generation**:
```typescript
insights: [
  {
    type: "spending-trend",
    title: "Spending Analysis",
    description: "Review your spending patterns to identify optimization opportunities.",
    impact: "medium",
    category: "Spending Analysis",
    recommendation: "Track expenses more closely and set category-specific budgets",
    timeHorizon: "1-2 months",
    confidence: 0.75,
  },
  {
    type: "budget-recommendation",
    title: "Budget Optimization",
    description: "Consider adjusting your budget allocations based on actual spending patterns.",
    impact: "medium",
    category: "Budget Planning",
    recommendation: "Review and adjust budget limits for top spending categories",
    timeHorizon: "Next month",
    confidence: 0.80,
  },
]
```

**Actionable Steps Generation**:
```typescript
actionableSteps: [
  "Review all detected anomalies and verify transactions",
  "Set up budget alerts for high-spending categories",
  "Track daily expenses to stay within budget limits",
  "Schedule a monthly financial review to assess progress",
]
```

### 5. Caching and Data Retrieval System

#### `fetchCachedReportInsights(userId: string, reportType: string, timeframe: string): Promise<ReportAIInsightResponse | null>`
**Purpose**: Retrieves cached report insights from database to optimize performance

**Database Query with Expiration Check**:
```typescript
const { data, error } = await supabase
  .from("ai_reports")
  .select("*")
  .eq("user_id", userId)
  .eq("report_type", reportType)
  .eq("timeframe", timeframe)
  .gt("expires_at", new Date().toISOString())
  .order("generated_at", { ascending: false })
  .limit(1)
  .single();
```

**Data Reconstruction from JSONB Fields**:
```typescript
if (error || !data) {
  return null;
}

// Extract data from JSONB fields
const insights = data.insights || {};

return {
  summary: insights.summary || data.summary || "",
  riskLevel: insights.risk_level || "medium",
  riskScore: insights.risk_score || 50,
  riskAnalysis: insights.risk_analysis || "",
  recommendations: data.recommendations || [],
  insights: [], // Would need to be stored separately if needed
  actionableSteps: insights.actionable_steps || [],
};
```

**Key Features**:
- **Expiration Filtering**: Only returns non-expired insights
- **Multi-field Matching**: Matches user, report type, and timeframe
- **Graceful Degradation**: Returns null if no valid cache found
- **Error Handling**: Silent failure with null return

## AI Prompt Engineering Strategy

### System Prompt Design
The system prompt is carefully crafted to:
1. **Establish Expertise**: Positions AI as financial report analyst specialist
2. **Define Scope**: Personal finance reporting, budgeting, and financial planning
3. **Set Guidelines**: Clear analysis and recommendation criteria
4. **Specify Currency**: Philippine Peso (₱) for localization
5. **Enforce Structure**: JSON response format requirement
6. **Prioritize Practicality**: Focus on implementable advice
7. **Balance Timeframes**: Both short-term and long-term considerations

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

## Report Type Specialization

### Supported Report Types
1. **Spending Reports**: Category-based spending analysis
2. **Income-Expense Reports**: Cash flow analysis and trends
3. **Savings Reports**: Savings goals and progress tracking
4. **Trends Reports**: Long-term financial pattern analysis
5. **Goals Reports**: Financial goal achievement analysis
6. **Predictions Reports**: Future financial projections

### Timeframe Analysis
1. **Monthly**: Short-term tactical insights
2. **Quarterly**: Medium-term trend analysis
3. **Yearly**: Long-term strategic planning

### Context Adaptation
The system adapts its analysis based on:
- **Report Type**: Different focus areas for each report type
- **Timeframe**: Appropriate recommendations for time horizon
- **Data Availability**: Flexible handling of missing data sections
- **Anomaly Severity**: Risk assessment based on detected issues

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
if (!aiResponse.summary || !aiResponse.riskLevel || !aiResponse.recommendations) {
  throw new Error("Invalid AI response structure");
}
```

### Cache Miss Handling
- **Graceful Degradation**: Generate new insights when cache is empty
- **Expiration Management**: Automatic cache invalidation
- **Performance Optimization**: Prefer cached results when available

## Performance Considerations

### API Optimization
- **Single Request**: All analysis in one API call
- **Token Efficiency**: Optimized prompts for token usage
- **Response Caching**: Database storage for reuse (7-day expiration)
- **Timeout Handling**: Graceful degradation on slow responses

### Database Efficiency
- **JSONB Storage**: Efficient nested data storage
- **Composite Indexes**: Optimized queries on user_id, report_type, timeframe
- **Automatic Cleanup**: 7-day expiration system (shorter than predictions)
- **Silent Failures**: Non-blocking storage operations

### Memory Management
- **Streaming Responses**: No large data accumulation
- **Garbage Collection**: Proper cleanup of temporary objects
- **Efficient Parsing**: Direct JSON parsing without intermediate steps

### Caching Strategy
- **Multi-dimensional Caching**: User + Report Type + Timeframe
- **Expiration Management**: 7-day cache lifetime
- **Cache-first Approach**: Check cache before generating new insights
- **Performance Metrics**: Reduced API calls and faster response times

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
- **Data Sanitization**: Clean report data before AI processing
- **Type Checking**: TypeScript interface validation
- **Range Validation**: Reasonable financial value checks
- **SQL Injection Prevention**: Parameterized queries

## Integration Points

### Report Generation Integration
```typescript
// Receives processed data from various report generators
interface ReportAIInsightRequest {
  reportData: {
    summary?: // From report summary calculations
    anomalies?: // From anomaly detection systems
    chartData?: // From chart data processors
  }
}
```

### Database Schema Dependencies
- **ai_reports**: Main storage table with JSONB fields
- **User Authentication**: user_id foreign key relationship
- **Expiration System**: automated cleanup based on expires_at
- **Report Classification**: report_type and timeframe indexing

### Frontend Integration
- **React Components**: Direct consumption of ReportAIInsightResponse
- **Loading States**: Async operation handling with caching
- **Error Boundaries**: Graceful error display
- **Caching Strategy**: Local state management with server-side cache

## Future Enhancement Opportunities

### AI Model Improvements
1. **Model Upgrades**: Newer, more capable models
2. **Fine-tuning**: Custom financial report analysis training
3. **Multi-model Ensemble**: Combining multiple AI services
4. **Specialized Models**: Domain-specific financial report AI

### Feature Enhancements
1. **Report Comparison**: AI-powered period-over-period analysis
2. **Trend Prediction**: Future report projections
3. **Benchmark Analysis**: Industry and peer comparisons
4. **Custom Metrics**: User-defined KPI analysis

### Performance Optimizations
1. **Response Streaming**: Real-time insight generation
2. **Predictive Caching**: Pre-generate insights for common reports
3. **Edge Computing**: Reduce latency with edge deployment
4. **Batch Processing**: Multiple report analysis optimization

### Security Enhancements
1. **End-to-end Encryption**: Enhanced data protection
2. **Zero-knowledge Architecture**: Server-side data isolation
3. **Audit Logging**: Comprehensive operation tracking
4. **Compliance Features**: Financial regulation adherence

This technical guide provides a complete understanding of how the report insights service operates, from report data preparation through AI analysis to final insight delivery, caching, and storage.