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
    id: "deepseek/deepseek-r1-zero:free",
    name: "DeepSeek R1 Zero",
    description: "Reasoning model (Free)",
    isDefault: true,
    isFree: true,
  },
  {
    id: "google/gemini-2.0-flash-exp:free",
    name: "Gemini 2.0 Flash",
    description: "Fast & capable (Free)",
    isDefault: false,
    isFree: true,
  },
  {
    id: "meta-llama/llama-3.2-11b-vision-instruct:free",
    name: "Llama 3.2 11B",
    description: "Vision + text (Free)",
    isDefault: false,
    isFree: true,
  },
  {
    id: "nvidia/llama-3.1-nemotron-ultra-253b-v1:free",
    name: "Nemotron Ultra",
    description: "253B parameters (Free)",
    isDefault: false,
    isFree: true,
  },
  {
    id: "anthropic/claude-3.5-sonnet",
    name: "Claude 3.5 Sonnet",
    description: "Advanced reasoning",
    isDefault: false,
    isFree: false,
  },
  {
    id: "openai/gpt-4o",
    name: "GPT-4o",
    description: "Fastest & most capable",
    isDefault: false,
    isFree: false,
  },
  {
    id: "openai/gpt-4-turbo",
    name: "GPT-4 Turbo",
    description: "Latest GPT-4 model",
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
- If users ask about specific transactions or data, acknowledge you have access to their financial information
- Maintain a friendly, professional tone
- Use "₱" (PHP) as the default currency symbol unless specified otherwise
- Format tables using markdown table syntax when presenting data

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
      ...messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
    ];

    // Make API request to OpenRouter
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
      const errorMessage = errorData.error?.message || `API error: ${response.status}`;
      
      // Handle specific error cases
      if (response.status === 401) {
        return {
          success: false,
          error: "Invalid API key. Please check your OpenRouter API key configuration.",
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
    // Check if chat_messages table exists by attempting a minimal query
    const { error: tableCheckError } = await supabase
      .from("chat_messages")
      .select("id")
      .limit(1);

    // If table doesn't exist, skip persistence
    if (tableCheckError?.message?.includes("does not exist")) {
      return;
    }

    // Persist the message
    await supabase.from("chat_messages").insert({
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

// Fetch chat history from database
export async function fetchChatHistory(userId: string): Promise<{ data: MessageType[]; error: string | null }> {
  try {
    // Check if chat_messages table exists
    const { data, error } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: true })
      .limit(100);

    if (error?.message?.includes("does not exist")) {
      // Table doesn't exist, return empty array
      return { data: [], error: null };
    }

    if (error) {
      return { data: [], error: error.message };
    }

    const messages: MessageType[] = (data || []).map((row) => ({
      id: row.id,
      role: row.role as "assistant" | "user",
      content: row.content,
      timestamp: new Date(row.created_at).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      }),
      model: row.model,
    }));

    return { data: messages, error: null };
  } catch (err) {
    return { data: [], error: null }; // Graceful degradation
  }
}

// Clear all chat messages for user
export async function clearChatHistory(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if chat_messages table exists
    const { error: tableCheckError } = await supabase
      .from("chat_messages")
      .select("id")
      .limit(1);

    if (tableCheckError?.message?.includes("does not exist")) {
      // Table doesn't exist, consider it successful
      return { success: true };
    }

    const { error } = await supabase
      .from("chat_messages")
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
      case "json": {
        const data = JSON.stringify(
          {
            exported_at: new Date().toISOString(),
            model: modelName,
            message_count: messages.length,
            messages: messages.map((msg) => ({
              role: msg.role,
              content: msg.content,
              timestamp: msg.timestamp,
              model: msg.model,
            })),
          },
          null,
          2
        );
        downloadFile(`${filename}.json`, data, "application/json");
        return { success: true, filename: `${filename}.json`, data };
      }

      case "markdown": {
        let md = `# BudgetSense Chat Export\n\n`;
        md += `**Exported:** ${new Date().toLocaleString()}\n\n`;
        md += `**Model:** ${modelName}\n\n`;
        md += `**Messages:** ${messages.length}\n\n`;
        md += `---\n\n`;

        messages.forEach((msg) => {
          const role = msg.role === "assistant" ? "🤖 BudgetSense AI" : "👤 You";
          md += `### ${role} - ${msg.timestamp || "Unknown time"}\n\n`;
          md += `${msg.content}\n\n`;
          md += `---\n\n`;
        });

        downloadFile(`${filename}.md`, md, "text/markdown");
        return { success: true, filename: `${filename}.md`, data: md };
      }

      case "pdf": {
        // For PDF, we'll generate HTML and open print dialog
        const html = generatePDFHtml(messages, modelName);
        const printWindow = window.open("", "_blank");
        if (printWindow) {
          printWindow.document.write(html);
          printWindow.document.close();
          printWindow.print();
        }
        return { success: true, filename: `${filename}.pdf` };
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
