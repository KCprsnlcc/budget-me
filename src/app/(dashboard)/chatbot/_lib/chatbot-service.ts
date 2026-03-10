"use client";

import { createClient } from "@/lib/supabase/client";
import type { MessageType, AIModel, ExportFormat } from "../_components/types";
import { fetchUserFinancialContext, formatUserContextForAI } from "./user-data-service";

const supabase = createClient();

// OpenRouter API Configuration
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const OPENROUTER_API_KEY = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || "";

// Available models from OpenRouter
export const AVAILABLE_MODELS: AIModel[] = [
  {
    id: "openai/gpt-oss-20b",
    name: "GPT-OSS 20B",
    description: "Open Source 20B (Default)",
    isDefault: true,
    isFree: true,
  },
  {
    id: "openai/gpt-oss-120b",
    name: "GPT-OSS 120B",
    description: "Open Source 120B",
    isDefault: false,
    isFree: false,
  },
  {
    id: "openai/gpt-4o-mini",
    name: "GPT-4o Mini",
    description: "Fast & efficient with vision support",
    isDefault: false,
    isFree: false,
    hasVision: true,
  },
  {
    id: "openai/gpt-4o",
    name: "GPT-4o",
    description: "Latest GPT-4 model with vision support",
    isDefault: false,
    isFree: false,
    hasVision: true,
  },
  {
    id: "openai/o3-mini",
    name: "O3 Mini",
    description: "Reasoning model",
    isDefault: false,
    isFree: false,
  },
  {
    id: "openai/gpt-4.1-mini",
    name: "GPT-4.1 Mini",
    description: "Compact GPT-4.1",
    isDefault: false,
    isFree: false,
  },
  {
    id: "openai/gpt-4.1",
    name: "GPT-4.1",
    description: "Advanced GPT-4.1",
    isDefault: false,
    isFree: false,
  },
  {
    id: "openai/o4-mini-high",
    name: "O4 Mini High",
    description: "High-performance O4",
    isDefault: false,
    isFree: false,
  },
  {
    id: "openai/gpt-5-nano",
    name: "GPT-5 Nano",
    description: "Compact GPT-5",
    isDefault: false,
    isFree: false,
  },
  {
    id: "openai/gpt-5-mini",
    name: "GPT-5 Mini",
    description: "Efficient GPT-5",
    isDefault: false,
    isFree: false,
  },
  {
    id: "openai/gpt-5",
    name: "GPT-5",
    description: "Latest GPT-5 model",
    isDefault: false,
    isFree: false,
  },
];

// System prompt for BudgetSense AI
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

Current context: You are chatting with a BudgetSense user who wants help with their personal finances.`;

export interface ChatSession {
  id: string;
  userId: string;
  messages: MessageType[];
  createdAt: string;
  updatedAt: string;
}

export interface SendMessageResult {
  success: boolean;
  message?: MessageType;
  error?: string;
}

export interface ExportResult {
  success: boolean;
  data?: string;
  filename?: string;
  error?: string;
}

// Fetch available models (returns local config, could be enhanced to fetch from OpenRouter)
export async function fetchAvailableModels(): Promise<{ data: AIModel[]; error: string | null }> {
  try {
    // Return the locally configured models
    // In a production environment, this could fetch from OpenRouter API
    return { data: AVAILABLE_MODELS, error: null };
  } catch (err) {
    return { data: [], error: "Failed to load AI models" };
  }
}

// Send message to OpenRouter API
export async function sendMessageToAI(
  messages: MessageType[],
  modelId: string,
  userId: string
): Promise<SendMessageResult> {
  try {
    // Validate API key
    if (!OPENROUTER_API_KEY) {
      return {
        success: false,
        error: "OpenRouter API key not configured. Please add NEXT_PUBLIC_OPENROUTER_API_KEY to your environment.",
      };
    }

    // Check if any message has image attachments
    const hasImageAttachment = messages.some(msg => msg.attachment && msg.attachment.type.startsWith('image/'));
    
    // Check if the selected model supports vision
    const selectedModel = AVAILABLE_MODELS.find(model => model.id === modelId);
    if (hasImageAttachment && selectedModel && !selectedModel.hasVision) {
      return {
        success: false,
        error: `The selected model (${selectedModel.name}) doesn't support image analysis. Please switch to a model with vision support like GPT-4o or GPT-4o Mini, or remove the image and send a text message instead.`,
      };
    }

    // Fetch user's financial context from Supabase
    let userContext = "";
    try {
      const { data: userData, error: userDataError } = await fetchUserFinancialContext(userId);
      if (!userDataError && userData) {
        userContext = "\n\n" + formatUserContextForAI(userData);
      }
    } catch {
      // Silent fail - continue without user context
    }

    // Build system prompt with user context
    const enhancedSystemPrompt = SYSTEM_PROMPT + userContext;

    // Build messages array for API
    const apiMessages = [
      { role: "system", content: enhancedSystemPrompt },
      ...messages.map((msg) => {
        // If message has image attachment, use content array format
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

    // Make API request to OpenRouter
    console.log('Sending to AI:', {
      model: modelId,
      messageCount: apiMessages.length,
      hasImages: apiMessages.some(msg => Array.isArray(msg.content))
    });

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

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('OpenRouter API Error:', errorData);
      
      // Check for image analysis errors
      const hasImageAttachment = apiMessages.some(msg => Array.isArray(msg.content));
      const errorMessage = errorData.error?.message || errorData.message || `API error: ${response.status}`;
      
      // Handle specific error cases
      if (response.status === 401) {
        return {
          success: false,
          error: "Invalid API key. Please check your OpenRouter API key configuration.",
        };
      }
      if (response.status === 400) {
        // Check if this is an image analysis error
        if (hasImageAttachment && (errorMessage.includes('image') || errorMessage.includes('vision') || errorMessage.includes('multimodal'))) {
          return {
            success: false,
            error: "The selected model doesn't support image analysis. Please delete this message with the image and try again with a model that supports images, or remove the image and send a text message instead.",
          };
        }
        return {
          success: false,
          error: `Invalid request format: ${errorMessage}`,
        };
      }
      if (response.status === 429) {
        return {
          success: false,
          error: "Rate limit exceeded. Please wait a moment before sending another message.",
        };
      }
      if (response.status === 402) {
        return {
          success: false,
          error: "Insufficient credits. This model requires payment. Please switch to a free model or add credits to your OpenRouter account.",
        };
      }
      
      return {
        success: false,
        error: errorMessage,
      };
    }

    const data = await response.json();
    const aiContent = data.choices?.[0]?.message?.content;

    if (!aiContent) {
      return {
        success: false,
        error: "No response from AI model. Please try again.",
      };
    }

    // Create AI message
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

    // Persist to database if table exists (graceful degradation)
    try {
      await persistMessage(userId, aiMessage);
    } catch {
      // Silent fail - message still works even if persistence fails
    }

    return {
      success: true,
      message: aiMessage,
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Failed to communicate with AI service";
    return {
      success: false,
      error: errorMessage,
    };
  }
}

// Persist message to database (best effort)
async function persistMessage(userId: string, message: MessageType): Promise<void> {
  try {
    // Check if chatbot_messages table exists by attempting a minimal query
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
}

// Save welcome message to database
export async function saveWelcomeMessage(userId: string, userProfile?: { fullName?: string | null; email?: string; avatarUrl?: string | null; role?: string; currencyPreference?: string }): Promise<{ success: boolean; error?: string }> {
  try {
    // Import the welcome message generator
    const { generateWelcomeMessage } = await import('./welcome-messages');
    const { question, suggestions } = generateWelcomeMessage(userProfile as any);
    
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

    // Save message with suggestions
    await supabase.from("chatbot_messages").insert({
      user_id: userId,
      role: welcomeMessage.role,
      content: welcomeMessage.content,
      model: welcomeMessage.model,
      suggestions: suggestions,
      created_at: new Date().toISOString(),
    });
    
    return { success: true };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Failed to save welcome message";
    return { success: false, error: errorMessage };
  }
}

// Fetch chat history from database with pagination
/**
 * Fetches content for specific messages by their IDs.
 * Used for lazy loading message content when messages come into view.
 * 
 * @param messageIds - Array of message IDs to fetch content for
 * @returns Promise with message content mapped by ID
 */
export async function fetchMessageContent(
  messageIds: string[]
): Promise<{ data: Record<string, string>; error: string | null }> {
  try {
    if (messageIds.length === 0) {
      return { data: {}, error: null };
    }

    const { data, error } = await supabase
      .from("chatbot_messages")
      .select("id, content")
      .in("id", messageIds);

    if (error) {
      return { data: {}, error: error.message };
    }

    // Map content by message ID
    const contentMap: Record<string, string> = {};
    (data || []).forEach((row) => {
      contentMap[row.id] = row.content || "";
    });

    return { data: contentMap, error: null };
  } catch (err) {
    return { data: {}, error: err instanceof Error ? err.message : "Failed to fetch message content" };
  }
}

/**
 * Fetches chat history with optimized loading strategy.
 * 
 * OPTIMIZATION: This function now supports two loading modes:
 * 1. Metadata-only mode: Loads only essential fields (id, role, timestamp, model) for initial page load
 * 2. Full content mode: Loads complete message content when needed
 * 
 * @param userId - The user ID to fetch chat history for
 * @param limit - Number of messages to fetch
 * @param before - Timestamp to fetch messages before (for pagination)
 * @param metadataOnly - If true, only loads essential fields without content
 * @returns Promise with message data, error status, and hasMore flag
 */
export async function fetchChatHistory(
  userId: string, 
  limit: number = 20, 
  before?: string,
  metadataOnly: boolean = false
): Promise<{ data: MessageType[]; error: string | null; hasMore: boolean }> {
  try {
    // Select fields based on loading mode
    const selectFields = metadataOnly 
      ? "id, role, created_at, model, suggestions, attachment"
      : "*";

    // Check if chatbot_messages table exists
    let query = supabase
      .from("chatbot_messages")
      .select(selectFields)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit + 1); // Fetch one extra to check if there are more

    // If before timestamp is provided, fetch messages before that timestamp
    if (before) {
      query = query.lt("created_at", before);
    }

    const { data, error } = await query;

    if (error?.message?.includes("does not exist")) {
      // Table doesn't exist, return empty array
      return { data: [], error: null, hasMore: false };
    }

    if (error) {
      return { data: [], error: error.message, hasMore: false };
    }

    // Check if there are more messages
    const hasMore = (data || []).length > limit;
    const messages = (data || []).slice(0, limit);

    const mappedMessages: MessageType[] = messages.map((row) => ({
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
      created_at: row.created_at, // Keep for pagination
      isContentLoaded: !metadataOnly, // Track if content is loaded
    }));

    // Reverse to show oldest first
    return { data: mappedMessages.reverse(), error: null, hasMore };
  } catch (err) {
    return { data: [], error: null, hasMore: false }; // Graceful degradation
  }
}

// Clear all chat messages for user
export async function clearChatHistory(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if chatbot_messages table exists
    const { error: tableCheckError } = await supabase
      .from("chatbot_messages")
      .select("id")
      .limit(1);

    if (tableCheckError?.message?.includes("does not exist")) {
      // Table doesn't exist, consider it successful
      return { success: true };
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
}

// Export chat in various formats
export async function exportChat(
  messages: MessageType[],
  format: ExportFormat,
  modelName: string
): Promise<ExportResult> {
  try {
    const timestamp = new Date().toISOString().split("T")[0];
    const filename = `budgetsense-chat-${timestamp}`;

    switch (format) {
      case "pdf": {
        // Generate HTML for PDF-like formatting
        const html = generatePDFHtml(messages, modelName);
        downloadFile(`${filename}.pdf`, html, "text/html");
        return { success: true, filename: `${filename}.pdf` };
      }

      case "csv": {
        // Generate CSV format
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

      default:
        return { success: false, error: "Unsupported export format" };
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Export failed";
    return { success: false, error: errorMessage };
  }
}

// Helper function to download file
function downloadFile(filename: string, content: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Generate HTML for PDF export
function generatePDFHtml(messages: MessageType[], modelName: string): string {
  const messageHtml = messages
    .map((msg) => {
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
    })
    .join("");

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
        .header h1 { 
          color: #059669; 
          font-size: 24px; 
          margin: 0 0 8px 0;
          font-weight: 700;
        }
        .header p { 
          color: #64748b; 
          font-size: 12px; 
          margin: 4px 0;
        }
        .no-print {
          background: #f1f5f9;
          padding: 16px;
          border-radius: 8px;
          margin-bottom: 20px;
          text-align: center;
        }
        .no-print button {
          background: #059669;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
        }
        .no-print button:hover {
          background: #047857;
        }
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
}

// Validate API key format
export function isValidAPIKey(key: string): boolean {
  return key.startsWith("sk-or-") && key.length > 20;
}

// Get default model
export function getDefaultModel(): AIModel {
  return AVAILABLE_MODELS.find((m) => m.isDefault) || AVAILABLE_MODELS[0];
}
