# Chatbot Service Technical Guide

## Overview
The Chatbot Service (`src/app/(dashboard)/chatbot/_lib/chatbot-service.ts`) is a comprehensive AI-powered conversational system that integrates multiple AI models through OpenRouter API to provide personalized financial assistance. This document provides a detailed technical breakdown of how the entire conversational AI system works, including model management, message processing, user context integration, and data persistence.

## Architecture Overview

### Core Components
1. **OpenRouter API Integration**: Multi-model AI service orchestration
2. **Model Management System**: Dynamic AI model selection and configuration
3. **Financial Context Engine**: User data integration for personalized responses
4. **Message Processing Pipeline**: Conversation flow and state management
5. **Attachment Handling System**: Image and file processing capabilities
6. **Data Persistence Layer**: Conversation history and message storage
7. **Export and Sharing System**: Multi-format conversation export

### Key Dependencies
- **OpenRouter API**: External multi-model AI service
- **Supabase Client**: Database operations and real-time storage
- **User Data Service**: Financial context integration
- **Welcome Messages**: Dynamic conversation starters
- **TypeScript Types**: Comprehensive type definitions

## Configuration and Constants

### API Configuration
```typescript
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"
const OPENROUTER_API_KEY = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || ""
```

### Available AI Models
```typescript
export const AVAILABLE_MODELS: AIModel[] = [
  {
    id: "openai/gpt-oss-20b",
    name: "GPT-OSS 20B",
    description: "Open Source 20B (Default)",
    isDefault: true,
    isFree: true,
  },
  {
    id: "openai/gpt-4o",
    name: "GPT-4o",
    description: "Latest GPT-4 model with vision support",
    isDefault: false,
    isFree: false,
    hasVision: true,
  },
  // ... additional models
]
```

### System Prompt Configuration
```typescript
const SYSTEM_PROMPT = `You are BudgetSense AI, a personal financial assistant integrated into the BudgetSense budgeting application. Your role is to help users understand their finances, analyze spending patterns, provide budgeting advice, and answer questions about their financial data.

Guidelines:
- Be concise but informative in your responses
- Use markdown formatting for better readability
- Provide actionable insights when possible
- Reference budgeting concepts like expenses, income, savings goals, and financial planning
- You have access to the user's complete financial profile including:
  * Personal information (name, email, phone, date of birth)
  * All financial accounts (bank accounts, credit cards, cash, etc.) with current balances
  * Transaction history and spending patterns
  * Active budgets and their progress
  * Financial goals and savings progress
  * Family members (if in a family group)
- When users ask about their accounts, balances, or profile information, reference the specific data provided in the context
- Maintain a friendly, professional tone
- Use "₱" (PHP) as the default currency symbol unless specified otherwise
- Format tables using markdown table syntax when presenting data
- You can analyze images uploaded by users, including receipts, bills, screenshots, and financial documents
- When analyzing images, extract relevant financial information like amounts, dates, vendors, and suggest budget categories
- Treat all uploaded files as private and confidential

Current context: You are chatting with a BudgetSense user who wants help with their personal finances.`
```

## Data Structures and Interfaces

### Core Message Interface
```typescript
interface MessageType {
  id: string;
  role: "assistant" | "user";
  content: string;
  timestamp: string;
  model?: string;
  suggestions?: string[];
  attachment?: {
    type: string;
    url: string;
    name: string;
    size: number;
  };
  created_at?: string;
  isContentLoaded?: boolean;
}
```

### AI Model Configuration
```typescript
interface AIModel {
  id: string;
  name: string;
  description: string;
  isDefault: boolean;
  isFree: boolean;
  hasVision?: boolean;
}
```

### Service Response Interfaces
```typescript
interface SendMessageResult {
  success: boolean;
  message?: MessageType;
  error?: string;
}

interface ExportResult {
  success: boolean;
  data?: string;
  filename?: string;
  error?: string;
}
```

## Detailed Function Analysis

### 1. Model Management System

#### `fetchAvailableModels(): Promise<{ data: AIModel[]; error: string | null }>`
**Purpose**: Provides available AI models for user selection

**Process**:
1. **Local Configuration**: Returns statically configured model list
2. **Future Enhancement**: Could fetch from OpenRouter API for dynamic models
3. **Error Handling**: Graceful fallback to empty array

**Model Categories**:
- **Free Models**: `gpt-oss-20b` (default)
- **Vision Models**: `gpt-4o`, `gpt-4o-mini` with image analysis
- **Advanced Models**: `gpt-5`, `o3-mini`, `o4-mini-high`
- **Reasoning Models**: Specialized for complex analysis

#### `getDefaultModel(): AIModel`
**Purpose**: Returns the default model for new conversations

**Selection Logic**:
```typescript
return AVAILABLE_MODELS.find((m) => m.isDefault) || AVAILABLE_MODELS[0];
```

### 2. Core Message Processing Engine

#### `sendMessageToAI(messages: MessageType[], modelId: string, userId: string): Promise<SendMessageResult>`
**Purpose**: Orchestrates the complete AI conversation process

**Detailed Workflow**:

1. **API Key Validation**:
   ```typescript
   if (!OPENROUTER_API_KEY) {
     return {
       success: false,
       error: "OpenRouter API key not configured. Please add NEXT_PUBLIC_OPENROUTER_API_KEY to your environment.",
     };
   }
   ```

2. **Vision Capability Validation**:
   ```typescript
   const hasImageAttachment = messages.some(msg => 
     msg.attachment && msg.attachment.type.startsWith('image/')
   );
   
   const selectedModel = AVAILABLE_MODELS.find(model => model.id === modelId);
   if (hasImageAttachment && selectedModel && !selectedModel.hasVision) {
     return {
       success: false,
       error: `The selected model (${selectedModel.name}) doesn't support image analysis. Please switch to a model with vision support like GPT-4o or GPT-4o Mini, or remove the image and send a text message instead.`,
     };
   }
   ```

3. **Financial Context Integration**:
   ```typescript
   let userContext = "";
   try {
     const { data: userData, error: userDataError } = await fetchUserFinancialContext(userId);
     if (!userDataError && userData) {
       userContext = "\n\n" + formatUserContextForAI(userData);
     }
   } catch {
     // Silent fail - continue without user context
   }
   
   const enhancedSystemPrompt = SYSTEM_PROMPT + userContext;
   ```

4. **Message Format Processing**:
   ```typescript
   const apiMessages = [
     { role: "system", content: enhancedSystemPrompt },
     ...messages.map((msg) => {
       // Handle image attachments with vision models
       if (msg.attachment && msg.attachment.type.startsWith('image/') && msg.attachment.url) {
         return {
           role: msg.role,
           content: [
             {
               type: "text",
               text: msg.content,
             },
             {
               type: "image_url",
               image_url: {
                 url: `data:${msg.attachment.type};base64,${msg.attachment.url}`,
               },
             },
           ],
         };
       }
   
       // Regular text message
       return {
         role: msg.role,
         content: msg.content,
       };
     }),
   ];
   ```

5. **OpenRouter API Request**:
   ```typescript
   const response = await fetch(OPENROUTER_API_URL, {
     method: "POST",
     headers: {
       "Content-Type": "application/json",
       Authorization: `Bearer ${OPENROUTER_API_KEY}`,
       "HTTP-Referer": typeof window !== "undefined" ? window.location.origin : "",
       "X-Title": "BudgetSense AI",
     },
     body: JSON.stringify({
       model: modelId,
       messages: apiMessages,
       temperature: 0.7,
       max_tokens: 2048,
       stream: false,
     }),
   });
   ```

6. **Comprehensive Error Handling**:
   ```typescript
   if (!response.ok) {
     const errorData = await response.json().catch(() => ({}));
     const errorMessage = errorData.error?.message || errorData.message || `API error: ${response.status}`;
   
     // Handle specific error cases
     if (response.status === 401) {
       return { success: false, error: "Invalid API key. Please check your OpenRouter API key configuration." };
     }
     if (response.status === 400) {
       if (hasImageAttachment && (errorMessage.includes('image') || errorMessage.includes('vision'))) {
         return { success: false, error: "The selected model doesn't support image analysis. Please delete this message with the image and try again with a model that supports images, or remove the image and send a text message instead." };
       }
       return { success: false, error: `Invalid request format: ${errorMessage}` };
     }
     if (response.status === 429) {
       return { success: false, error: "Rate limit exceeded. Please wait a moment before sending another message." };
     }
     if (response.status === 402) {
       return { success: false, error: "Insufficient credits. This model requires payment. Please switch to a free model or add credits to your OpenRouter account." };
     }
   
     return { success: false, error: errorMessage };
   }
   ```

7. **Response Processing and Validation**:
   ```typescript
   const data = await response.json();
   const aiContent = data.choices?.[0]?.message?.content;
   
   if (!aiContent) {
     return { success: false, error: "No response from AI model. Please try again." };
   }
   
   const aiMessage: MessageType = {
     id: `ai-${Date.now()}`,
     role: "assistant",
     content: aiContent.trim(),
     timestamp: new Date().toLocaleTimeString("en-US", {
       hour: "numeric",
       minute: "2-digit",
     }),
     model: modelId,
   };
   ```

8. **Data Persistence**:
   ```typescript
   try {
     await persistMessage(userId, aiMessage);
   } catch {
     // Silent fail - message still works even if persistence fails
   }
   
   return { success: true, message: aiMessage };
   ```

### 3. Data Persistence System

#### `persistMessage(userId: string, message: MessageType): Promise<void>`
**Purpose**: Stores conversation messages in Supabase database

**Graceful Degradation Strategy**:
```typescript
try {
  // Check if chatbot_messages table exists
  const { error: tableCheckError } = await supabase
    .from("chatbot_messages")
    .select("id")
    .limit(1);

  // If table doesn't exist, skip persistence
  if (tableCheckError?.message?.includes("does not exist")) {
    return;
  }

  // Persist the message
  await supabase.from("chatbot_messages").insert({
    user_id: userId,
    role: message.role,
    content: message.content,
    model: message.model,
    created_at: new Date().toISOString(),
  });
} catch {
  // Silent fail - don't break the chat flow if persistence fails
}
```

**Database Schema Integration**:
```sql
CREATE TABLE chatbot_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  model TEXT,
  suggestions JSONB,
  attachment JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `saveWelcomeMessage(userId: string, userProfile?: UserProfile): Promise<{ success: boolean; error?: string }>`
**Purpose**: Creates personalized welcome messages for new users

**Process**:
1. **Dynamic Message Generation**:
   ```typescript
   const { generateWelcomeMessage } = await import('./welcome-messages');
   const { question, suggestions } = generateWelcomeMessage(userProfile);
   ```

2. **Message Structure Creation**:
   ```typescript
   const welcomeMessage = {
     id: `welcome-${Date.now()}`,
     role: "assistant" as const,
     content: question,
     timestamp: new Date().toLocaleTimeString("en-US", {
       hour: "numeric",
       minute: "2-digit",
     }),
     model: getDefaultModel().id,
   };
   ```

3. **Database Storage with Suggestions**:
   ```typescript
   await supabase.from("chatbot_messages").insert({
     user_id: userId,
     role: welcomeMessage.role,
     content: welcomeMessage.content,
     model: welcomeMessage.model,
     suggestions: suggestions,
     created_at: new Date().toISOString(),
   });
   ```

### 4. Advanced Message Retrieval System

#### `fetchChatHistory(userId: string, limit: number = 20, before?: string, metadataOnly: boolean = false): Promise<{ data: MessageType[]; error: string | null; hasMore: boolean }>`
**Purpose**: Optimized conversation history retrieval with lazy loading

**Performance Optimization Strategy**:

1. **Metadata-Only Loading**:
   ```typescript
   const selectFields = metadataOnly
     ? "id, role, created_at, model, suggestions, attachment"
     : "*";
   ```

2. **Pagination with Lookahead**:
   ```typescript
   let query = supabase
     .from("chatbot_messages")
     .select(selectFields)
     .eq("user_id", userId)
     .order("created_at", { ascending: false })
     .limit(limit + 1); // Fetch one extra to check if there are more
   
   if (before) {
     query = query.lt("created_at", before);
   }
   ```

3. **Graceful Table Existence Handling**:
   ```typescript
   if (error?.message?.includes("does not exist")) {
     return { data: [], error: null, hasMore: false };
   }
   ```

4. **Efficient Data Mapping**:
   ```typescript
   const mappedMessages: MessageType[] = messages.map((row: any) => ({
     id: row.id,
     role: row.role as "assistant" | "user",
     content: metadataOnly ? "" : row.content, // Empty content in metadata-only mode
     timestamp: new Date(row.created_at).toLocaleTimeString("en-US", {
       hour: "numeric",
       minute: "2-digit",
     }),
     model: row.model,
     suggestions: row.suggestions || [],
     attachment: row.attachment || undefined,
     created_at: row.created_at,
     isContentLoaded: !metadataOnly, // Track if content is loaded
   }));
   ```

#### `fetchMessageContent(messageIds: string[]): Promise<{ data: Record<string, string>; error: string | null }>`
**Purpose**: Lazy loading of message content for performance optimization

**Batch Content Retrieval**:
```typescript
const { data, error } = await supabase
  .from("chatbot_messages")
  .select("id, content")
  .in("id", messageIds);

// Map content by message ID
const contentMap: Record<string, string> = {};
(data || []).forEach((row) => {
  contentMap[row.id] = row.content || "";
});

return { data: contentMap, error: null };
```

**Use Case**: Load message content only when messages come into viewport for improved initial page load performance.

### 5. Conversation Management

#### `clearChatHistory(userId: string): Promise<{ success: boolean; error?: string }>`
**Purpose**: Secure deletion of user conversation history

**Safe Deletion Process**:
```typescript
try {
  // Check if chatbot_messages table exists
  const { error: tableCheckError } = await supabase
    .from("chatbot_messages")
    .select("id")
    .limit(1);

  if (tableCheckError?.message?.includes("does not exist")) {
    return { success: true }; // Consider successful if table doesn't exist
  }

  const { error } = await supabase
    .from("chatbot_messages")
    .delete()
    .eq("user_id", userId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
} catch (err) {
  const errorMessage = err instanceof Error ? err.message : "Failed to clear chat history";
  return { success: false, error: errorMessage };
}
```

### 6. Export and Sharing System

#### `exportChat(messages: MessageType[], format: ExportFormat, modelName: string): Promise<ExportResult>`
**Purpose**: Multi-format conversation export with rich formatting

**Supported Formats**:

1. **PDF Export** (HTML-based):
   ```typescript
   case "pdf": {
     const html = generatePDFHtml(messages, modelName);
     downloadFile(`${filename}.pdf`, html, "text/html");
     return { success: true, filename: `${filename}.pdf` };
   }
   ```

2. **CSV Export** (Structured data):
   ```typescript
   case "csv": {
     let csv = "Role,Timestamp,Content,Model\n";
     messages.forEach((msg) => {
       const role = msg.role === "assistant" ? "BudgetSense AI" : "You";
       const content = `"${msg.content.replace(/"/g, '""')}"`; // Escape quotes
       const timestamp = msg.timestamp || "";
       const model = msg.model || "";
       csv += `${role},"${timestamp}",${content},"${model}"\n`;
     });
     
     downloadFile(`${filename}.csv`, csv, "text/csv");
     return { success: true, filename: `${filename}.csv`, data: csv };
   }
   ```

#### `generatePDFHtml(messages: MessageType[], modelName: string): string`
**Purpose**: Creates print-ready HTML for PDF export

**Advanced HTML Generation**:

1. **Message Bubble Styling**:
   ```typescript
   const messageHtml = messages.map((msg) => {
     const isAI = msg.role === "assistant";
     const bgColor = isAI ? "#f8fafc" : "#10b981";
     const textColor = isAI ? "#1e293b" : "#ffffff";
     const align = isAI ? "left" : "right";
     const role = isAI ? "BudgetSense AI" : "You";

     return `
       <div style="margin-bottom: 16px; text-align: ${align};">
         <div style="display: inline-block; max-width: 80%; text-align: left;">
           <div style="font-size: 11px; color: #64748b; margin-bottom: 4px; font-weight: 600;">
             ${role} · ${msg.timestamp || ""}
           </div>
           <div style="background: ${bgColor}; color: ${textColor}; padding: 12px 16px; border-radius: 12px; 
                       font-size: 13px; line-height: 1.5; white-space: pre-wrap; border: 1px solid ${isAI ? "#e2e8f0" : "transparent"};">
             ${msg.content.replace(/\n/g, "<br>")}
           </div>
         </div>
       </div>
     `;
   }).join("");
   ```

2. **Complete HTML Document**:
   ```typescript
   return `
     <!DOCTYPE html>
     <html>
     <head>
       <title>BudgetSense Chat Export</title>
       <style>
         @media print {
           body { margin: 20px; }
           .no-print { display: none; }
         }
         body { 
           font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
           max-width: 800px; 
           margin: 40px auto; 
           padding: 20px;
           background: white;
         }
         .header { 
           text-align: center; 
           border-bottom: 2px solid #e2e8f0; 
           padding-bottom: 20px; 
           margin-bottom: 30px;
         }
         // ... additional styles
       </style>
     </head>
     <body>
       <div class="no-print">
         <p style="margin: 0 0 12px 0; color: #475569;">Press the button below or use Ctrl+P (Cmd+P on Mac) to save as PDF</p>
         <button onclick="window.print()">🖨️ Print to PDF</button>
       </div>
       <div class="header">
         <h1>BudgetSense AI Conversation</h1>
         <p>Exported on ${new Date().toLocaleString()}</p>
         <p>Model: ${modelName}</p>
         <p>${messages.length} messages</p>
       </div>
       <div class="messages">
         ${messageHtml}
       </div>
     </body>
     </html>
   `;
   ```

#### `downloadFile(filename: string, content: string, mimeType: string): void`
**Purpose**: Browser-based file download implementation

**Download Process**:
```typescript
const blob = new Blob([content], { type: mimeType });
const url = URL.createObjectURL(blob);
const link = document.createElement("a");
link.href = url;
link.download = filename;
document.body.appendChild(link);
link.click();
document.body.removeChild(link);
URL.revokeObjectURL(url);
```

## Financial Context Integration

### User Data Service Integration
The chatbot service integrates with `user-data-service.ts` to provide personalized financial context:

```typescript
const { data: userData, error: userDataError } = await fetchUserFinancialContext(userId);
if (!userDataError && userData) {
  userContext = "\n\n" + formatUserContextForAI(userData);
}
```

### Context Data Structure
The financial context includes:
- **Personal Information**: Name, email, phone, date of birth
- **Financial Accounts**: All accounts with current balances
- **Transaction History**: Recent spending patterns
- **Active Budgets**: Budget progress and status
- **Financial Goals**: Goal progress and targets
- **Family Members**: Family group information (if applicable)

### Context Formatting
The `formatUserContextForAI()` function transforms raw financial data into natural language that the AI can understand and reference in responses.

## Image and Attachment Processing

### Vision Model Integration
```typescript
// Check for image attachments
const hasImageAttachment = messages.some(msg => 
  msg.attachment && msg.attachment.type.startsWith('image/')
);

// Validate model capabilities
const selectedModel = AVAILABLE_MODELS.find(model => model.id === modelId);
if (hasImageAttachment && selectedModel && !selectedModel.hasVision) {
  return { success: false, error: "Model doesn't support image analysis" };
}
```

### Image Message Format
```typescript
if (msg.attachment && msg.attachment.type.startsWith('image/') && msg.attachment.url) {
  return {
    role: msg.role,
    content: [
      {
        type: "text",
        text: msg.content,
      },
      {
        type: "image_url",
        image_url: {
          url: `data:${msg.attachment.type};base64,${msg.attachment.url}`,
        },
      },
    ],
  };
}
```

### Supported Image Types
- **Receipts**: Extract amounts, vendors, dates
- **Bills**: Identify payment amounts and due dates
- **Screenshots**: Analyze financial app interfaces
- **Documents**: Process financial statements and reports

## Error Handling and Resilience

### Comprehensive Error Categories

1. **API Configuration Errors**:
   ```typescript
   if (!OPENROUTER_API_KEY) {
     return { success: false, error: "OpenRouter API key not configured" };
   }
   ```

2. **Model Capability Errors**:
   ```typescript
   if (hasImageAttachment && !selectedModel.hasVision) {
     return { success: false, error: "Model doesn't support image analysis" };
   }
   ```

3. **Network and API Errors**:
   ```typescript
   if (response.status === 401) return { success: false, error: "Invalid API key" };
   if (response.status === 429) return { success: false, error: "Rate limit exceeded" };
   if (response.status === 402) return { success: false, error: "Insufficient credits" };
   ```

4. **Response Validation Errors**:
   ```typescript
   if (!aiContent) {
     return { success: false, error: "No response from AI model. Please try again." };
   }
   ```

### Graceful Degradation Strategy
- **Database Failures**: Continue conversation without persistence
- **Context Failures**: Proceed without financial context
- **Export Failures**: Provide error feedback with retry options
- **Model Failures**: Suggest alternative models

## Performance Optimizations

### Lazy Loading Strategy
1. **Metadata-First Loading**: Load message structure without content
2. **Content on Demand**: Fetch message content when needed
3. **Pagination**: Efficient handling of long conversations
4. **Caching**: Browser-side message caching

### Memory Management
```typescript
// Efficient message mapping
const mappedMessages: MessageType[] = messages.map((row: any) => ({
  id: row.id,
  role: row.role as "assistant" | "user",
  content: metadataOnly ? "" : row.content,
  // ... other properties
  isContentLoaded: !metadataOnly,
}));
```

### API Optimization
- **Single Request Processing**: Complete conversation context in one API call
- **Token Efficiency**: Optimized prompt engineering
- **Response Streaming**: Future enhancement for real-time responses
- **Request Batching**: Efficient handling of multiple operations

## Security Considerations

### API Key Management
```typescript
// Environment variable configuration
const OPENROUTER_API_KEY = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || "";

// Request headers for security
headers: {
  "Content-Type": "application/json",
  Authorization: `Bearer ${OPENROUTER_API_KEY}`,
  "HTTP-Referer": typeof window !== "undefined" ? window.location.origin : "",
  "X-Title": "BudgetSense AI",
}
```

### Data Privacy Protection
1. **User Isolation**: All operations scoped to specific user ID
2. **Secure Storage**: Encrypted database storage
3. **No External Retention**: AI service doesn't store conversation data
4. **Audit Trail**: Complete operation logging

### Input Validation
```typescript
// Message content validation
if (!aiContent) {
  return { success: false, error: "No response from AI model" };
}

// Model capability validation
if (hasImageAttachment && !selectedModel.hasVision) {
  return { success: false, error: "Model doesn't support image analysis" };
}
```

### Content Security
- **Markdown Sanitization**: Safe rendering of AI responses
- **File Type Validation**: Secure attachment handling
- **Size Limits**: Prevent abuse through large uploads
- **Content Filtering**: AI safety measures

## Integration Points

### Frontend Integration
```typescript
// React component integration
const { sendMessage, isLoading, error } = useChatbot();

// Message state management
const [messages, setMessages] = useState<MessageType[]>([]);
const [selectedModel, setSelectedModel] = useState<AIModel>(getDefaultModel());
```

### Database Schema Dependencies
```sql
-- Main messages table
CREATE TABLE chatbot_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  model TEXT,
  suggestions JSONB,
  attachment JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_chatbot_messages_user_id ON chatbot_messages(user_id);
CREATE INDEX idx_chatbot_messages_created_at ON chatbot_messages(created_at DESC);
```

### External Service Dependencies
- **OpenRouter API**: Multi-model AI service
- **User Data Service**: Financial context integration
- **Welcome Messages Service**: Dynamic conversation starters
- **Supabase**: Database and real-time capabilities

## Future Enhancement Opportunities

### AI Capabilities
1. **Advanced Vision**: Enhanced image analysis capabilities
2. **Voice Integration**: Speech-to-text and text-to-speech
3. **Multi-modal**: Combined text, image, and voice processing
4. **Custom Training**: Fine-tuned models for financial advice

### Performance Improvements
1. **Response Streaming**: Real-time message generation
2. **Predictive Caching**: Pre-load likely responses
3. **Edge Computing**: Reduce latency with edge deployment
4. **Compression**: Optimize message storage and transfer

### Feature Enhancements
1. **Conversation Branching**: Multiple conversation threads
2. **Message Reactions**: User feedback on AI responses
3. **Collaborative Chat**: Family group conversations
4. **Integration Webhooks**: Connect with external financial services

### Security Enhancements
1. **End-to-end Encryption**: Enhanced message security
2. **Zero-knowledge Architecture**: Server-side data isolation
3. **Advanced Audit**: Comprehensive operation tracking
4. **Compliance Features**: Financial regulation adherence

### User Experience Improvements
1. **Smart Suggestions**: Context-aware conversation starters
2. **Message Templates**: Pre-built financial queries
3. **Conversation Search**: Find specific messages and topics
4. **Offline Support**: Limited functionality without internet

This technical guide provides a complete understanding of how the chatbot service operates, from multi-model AI integration through conversation management to advanced export capabilities and security measures.