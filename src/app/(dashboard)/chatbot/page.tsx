"use client";

import { useState, useCallback, useRef, useEffect, useTransition } from "react";
import {
  Send,
  Bot,
  User,
  Monitor,
  ChevronDown,
  Trash2,
  Download,
  Paperclip,
  ShieldCheck,
  Lightbulb,
  Copy,
  Check,
  Share,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TypingEffect } from "@/components/ui/typing-effect";
import { TypingMarkdown } from "@/components/ui/typing-markdown";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  ModelSelectorDropdown,
  ClearChatModal,
  ExportChatModal,
} from "./_components";
import type { MessageType, ExportFormat, MessageRole } from "./_components/types";
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { useAuth } from "@/components/auth/auth-context";
import {
  sendMessageToAI,
  fetchChatHistory,
  clearChatHistory,
  exportChat,
  fetchAvailableModels,
  AVAILABLE_MODELS,
  getDefaultModel,
  saveWelcomeMessage,
  type SendMessageResult,
} from "./_lib/chatbot-service";
import { generateWelcomeMessage } from "./_lib/welcome-messages";


export default function ChatbotPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [input, setInput] = useState("");
  const [selectedModel, setSelectedModel] = useState(getDefaultModel().id);
  const [models, setModels] = useState(AVAILABLE_MODELS);
  const [clearChatModalOpen, setClearChatModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [typingMessageId, setTypingMessageId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentModel = models.find((m) => m.id === selectedModel) || models[0];

  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [dynamicSuggestions, setDynamicSuggestions] = useState<string[]>([]);

  // Fetch available models and chat history on mount
  useEffect(() => {
    const initializeChat = async () => {
      if (!user?.id) return;

      try {
        // Fetch available models
        const { data: availableModels, error: modelsError } = await fetchAvailableModels();
        if (!modelsError && availableModels.length > 0) {
          setModels(availableModels);
          // Set default model
          const defaultModel = availableModels.find((m) => m.isDefault) || availableModels[0];
          setSelectedModel(defaultModel.id);
        }

        // Fetch chat history from Supabase
        const { data: history, error: historyError } = await fetchChatHistory(user.id);
        if (!historyError && history && history.length > 0) {
          // Filter out any messages with empty content
          const validMessages = history.filter(msg => msg.content && msg.content.trim() !== "");
          setMessages(validMessages);
          
          // Set suggestions from the first assistant message if it has them
          const firstAssistantMessage = validMessages.find(msg => msg.role === "assistant");
          if (firstAssistantMessage?.suggestions && firstAssistantMessage.suggestions.length > 0) {
            setDynamicSuggestions(firstAssistantMessage.suggestions);
          } else {
            setDynamicSuggestions([]);
          }
        } else {
          // No chat history, show and save personalized welcome message with dynamic suggestions
          const userName = user.user_metadata?.full_name || user.email?.split('@')[0];
          const { question, suggestions } = generateWelcomeMessage(userName);
          
          const welcomeMessage: MessageType = {
            id: `welcome-${Date.now()}`,
            role: "assistant",
            content: question,
            timestamp: new Date().toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
            }),
            model: getDefaultModel().id,
            suggestions: suggestions,
          };
          
          setMessages([welcomeMessage]);
          setDynamicSuggestions(suggestions);
          
          // Save welcome message to database
          await saveWelcomeMessage(user.id, userName);
        }
      } catch (err) {
        // On error, show welcome message
        const userName = user.user_metadata?.full_name || user.email?.split('@')[0];
        const { question, suggestions } = generateWelcomeMessage(userName);
        
        const welcomeMessage: MessageType = {
          id: `welcome-${Date.now()}`,
          role: "assistant",
          content: question,
          timestamp: new Date().toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
          }),
          model: getDefaultModel().id,
          suggestions: suggestions,
        };
        
        setMessages([welcomeMessage]);
        setDynamicSuggestions(suggestions);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading && user) {
      initializeChat();
    }
  }, [authLoading, user]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 128)}px`;
    }
  }, [input]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || isSending || !user?.id) return;

    const trimmedInput = input.trim();
    
    // Create user message with unique ID
    const userMessageId = `user-${Date.now()}-${Math.random()}`;
    const userMessage: MessageType = {
      id: userMessageId,
      role: "user",
      content: trimmedInput,
      timestamp: new Date().toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      }),
    };

    // Optimistically add user message
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsSending(true);
    setError(null);

    try {
      // Prepare messages for API (including current context)
      const contextMessages = [...messages, userMessage].slice(-10); // Keep last 10 messages for context
      
      const result: SendMessageResult = await sendMessageToAI(
        contextMessages,
        selectedModel,
        user.id
      );

      if (!result.success) {
        setError(result.error || "Failed to get AI response");
        // Remove the user message on error so they can retry
        setMessages((prev) => prev.filter((m) => m.id !== userMessageId));
        return;
      }

      if (result.message) {
        setMessages((prev) => [...prev, result.message!]);
        setTypingMessageId(result.message.id);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to send message";
      setError(errorMessage);
      // Remove the user message on error so they can retry
      setMessages((prev) => prev.filter((m) => m.id !== userMessageId));
    } finally {
      setIsSending(false);
    }
  }, [input, isSending, user, messages, selectedModel]);

  const handleSuggestionClick = useCallback((suggestion: string) => {
    setInput(suggestion);
    textareaRef.current?.focus();
  }, []);

  const handleClearChat = useCallback(async () => {
    if (!user?.id) return;

    startTransition(async () => {
      try {
        const { success, error: clearError } = await clearChatHistory(user.id);
        if (!success && clearError) {
          setError(clearError);
          return;
        }
        
        // Reset with new randomized welcome message and suggestions
        const userName = user.user_metadata?.full_name || user.email?.split('@')[0];
        const { question, suggestions } = generateWelcomeMessage(userName);
        
        const welcomeMessage: MessageType = {
          id: `welcome-${Date.now()}`,
          role: "assistant",
          content: question,
          timestamp: new Date().toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
          }),
          model: getDefaultModel().id,
          suggestions: suggestions,
        };
        
        setMessages([welcomeMessage]);
        setDynamicSuggestions(suggestions);
        
        // Save welcome message to database
        await saveWelcomeMessage(user.id, userName);
        setTypingMessageId(null);
        setError(null);
      } catch (err) {
        setError("Failed to clear chat history");
      }
    });
  }, [user]);

  const handleExport = useCallback(async (format: ExportFormat) => {
    if (messages.length === 0) return;

    startTransition(async () => {
      try {
        const result = await exportChat(messages, format, currentModel.name);
        if (!result.success && result.error) {
          setError(result.error);
        } else {
          setError(null);
        }
      } catch (err) {
        setError("Failed to export chat");
      }
    });
  }, [messages, currentModel.name]);

  const handleCopyMessage = useCallback((content: string, messageId: string) => {
    navigator.clipboard.writeText(content);
    setCopiedMessageId(messageId);
    setTimeout(() => setCopiedMessageId(null), 2000);
  }, []);

  const handleShareMessage = useCallback((content: string) => {
    if (navigator.share) {
      navigator.share({
        title: 'BudgetSense AI Response',
        text: content,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(content);
    }
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const handleModelChange = useCallback((modelId: string) => {
    setSelectedModel(modelId);
    setError(null);
  }, []);

  const dismissError = useCallback(() => {
    setError(null);
  }, []);

  const renderMessageContent = (content: string | undefined, role: MessageRole, messageId: string) => {
    const isTyping = role === "assistant" && typingMessageId === messageId;
    
    // Handle undefined content
    const safeContent = content || "";
    
    // Custom components for markdown rendering
    const components = {
      // Style tables
      table: ({ children }: any) => (
        <div className="overflow-hidden bg-white border border-slate-200 rounded-2xl shadow-sm my-4">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              {children}
            </table>
          </div>
        </div>
      ),
      thead: ({ children }: any) => (
        <thead className="bg-slate-50/50 border-b border-slate-100">
          {children}
        </thead>
      ),
      th: ({ children, align }: any) => (
        <th 
          className={`px-5 py-3 font-semibold text-slate-500 uppercase tracking-wider ${
            align === "right" ? "text-right" : "text-left"
          }`}
        >
          {children}
        </th>
      ),
      tbody: ({ children }: any) => (
        <tbody className="divide-y divide-slate-50">
          {children}
        </tbody>
      ),
      tr: ({ children }: any) => (
        <tr className="hover:bg-slate-50 transition-colors">
          {children}
        </tr>
      ),
      td: ({ children, align }: any) => (
        <td 
          className={`px-5 py-3 ${
            align === "right" ? "text-right text-slate-900 font-semibold" : "text-slate-500"
          }`}
        >
          {children}
        </td>
      ),
      // Style headers
      h1: ({ children }: any) => (
        <h1 className={`text-xl font-bold mt-6 mb-4 ${role === "assistant" ? "text-slate-900" : "text-white"}`}>
          {children}
        </h1>
      ),
      h2: ({ children }: any) => (
        <h2 className={`text-lg font-bold mt-5 mb-3 ${role === "assistant" ? "text-slate-900" : "text-white"}`}>
          {children}
        </h2>
      ),
      h3: ({ children }: any) => (
        <h3 className={`text-base font-bold mt-4 mb-2 ${role === "assistant" ? "text-slate-900" : "text-white"}`}>
          {children}
        </h3>
      ),
      h4: ({ children }: any) => (
        <h4 className={`text-sm font-semibold mt-3 mb-2 ${role === "assistant" ? "text-slate-900" : "text-white"}`}>
          {children}
        </h4>
      ),
      // Style lists
      ul: ({ children }: any) => (
        <ul className="space-y-1 mb-4">
          {children}
        </ul>
      ),
      ol: ({ children }: any) => (
        <ol className="space-y-1 mb-4 list-decimal list-inside">
          {children}
        </ol>
      ),
      li: ({ children }: any) => (
        <li className={`flex items-start gap-2 ${role === "assistant" ? "text-slate-700" : "text-white"}`}>
          {children}
        </li>
      ),
      // Style paragraphs
      p: ({ children }: any) => (
        <p className={`mb-2 ${role === "assistant" ? "text-slate-700" : "text-white"}`}>
          {children}
        </p>
      ),
      // Style blockquotes
      blockquote: ({ children }: any) => (
        <blockquote className={`border-l-4 border-slate-300 pl-4 py-2 my-4 ${role === "assistant" ? "text-slate-600" : "text-slate-300"}`}>
          {children}
        </blockquote>
      ),
      // Style code
      code: ({ inline, children }: any) => (
        <code className={`${inline ? 'bg-slate-100 px-1 py-0.5 rounded text-slate-800 text-xs' : 'block bg-slate-900 text-slate-100 p-4 rounded-lg text-sm my-4'}`}>
          {children}
        </code>
      ),
      // Style bold text
      strong: ({ children }: any) => (
        <strong className={`font-semibold ${role === "assistant" ? "text-slate-900" : "text-white"}`}>
          {children}
        </strong>
      ),
      // Style links
      a: ({ href, children }: any) => (
        <a href={href} className="text-emerald-500 hover:text-emerald-600 underline">
          {children}
        </a>
      ),
    };

    return (
      <div className={`text-sm leading-relaxed ${role === "assistant" ? "text-slate-700" : "text-white"}`}>
        {isTyping ? (
          <TypingMarkdown 
            content={safeContent} 
            speed={7} 
            delay={200}
            components={components}
            onComplete={() => setTypingMessageId(null)}
          />
        ) : (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={components}
          >
            {safeContent}
          </ReactMarkdown>
        )}
      </div>
    );
  };

  // Loading state
  if (loading || authLoading) {
    return (
      <SkeletonTheme baseColor="#f1f5f9" highlightColor="#e2e8f0">
        <div className="max-w-7xl mx-auto h-[calc(100vh-140px)] min-h-[600px] space-y-6 animate-fade-in">
          {/* Messenger Container Skeleton */}
          <Card className="flex h-full overflow-hidden rounded-xl border border-slate-200/60 shadow-sm">
            {/* Main Chat Area Skeleton */}
            <main className="flex-1 flex flex-col min-w-0 bg-white relative">
              {/* Header Skeleton */}
              <header className="h-16 flex items-center justify-between px-6 bg-white/80 backdrop-blur-sm flex-shrink-0 z-10 border-b border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 flex items-center justify-center">
                      <Skeleton width={28} height={28} borderRadius={4} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Skeleton width={120} height={14} />
                        <Skeleton width={30} height={12} borderRadius={2} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Model Selector Skeleton */}
                  <Skeleton width={140} height={32} borderRadius={4} />
                  <div className="h-8 w-px bg-slate-200 mx-1" />
                  {/* Clear Chat Button Skeleton */}
                  <Skeleton width={40} height={40} borderRadius={8} />
                  {/* Export Chat Button Skeleton */}
                  <Skeleton width={40} height={40} borderRadius={8} />
                </div>
              </header>

              {/* Messages Area Skeleton */}
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                {/* Welcome Message Skeleton */}
                <div className="mx-auto max-w-3xl flex justify-start">
                  <div className="flex gap-3">
                    <Skeleton width={32} height={32} borderRadius={50} />
                    <div className="flex-1 space-y-2">
                      <Skeleton width="80%" height={14} />
                      <Skeleton width="100%" height={14} />
                      <Skeleton width="90%" height={14} />
                      <Skeleton width="70%" height={14} />
                    </div>
                  </div>
                </div>

                {/* User Message Skeleton */}
                <div className="mx-auto max-w-3xl flex justify-end">
                  <div className="max-w-[85%] space-y-2">
                    <Skeleton width="100%" height={14} />
                  </div>
                  <Skeleton width={32} height={32} borderRadius={50} />
                </div>

                {/* Assistant Response Skeleton */}
                <div className="mx-auto max-w-3xl flex justify-start">
                  <div className="flex gap-3">
                    <Skeleton width={32} height={32} borderRadius={50} />
                    <div className="flex-1 space-y-2">
                      <Skeleton width="100%" height={14} />
                      <Skeleton width="90%" height={14} />
                      <Skeleton width="85%" height={14} />
                      <Skeleton width="80%" height={14} />
                      <Skeleton width="75%" height={14} />
                      <Skeleton width="70%" height={14} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Input Area Skeleton */}
              <div className="p-3 bg-white border-t border-slate-100 relative z-20 flex-shrink-0">
                <div className="mx-auto max-w-3xl">
                  <div className="relative flex items-end gap-2 bg-slate-50 border border-slate-200/60 rounded-3xl p-2">
                    {/* Attachment Button Skeleton */}
                    <Skeleton width={40} height={40} borderRadius={50} />
                    
                    {/* Textarea Skeleton */}
                    <div className="flex-1">
                      <Skeleton height={32} borderRadius={4} />
                    </div>

                    {/* Send Button Skeleton */}
                    <Skeleton width={40} height={40} borderRadius={50} />
                  </div>

                  <div className="mt-2 flex items-center justify-center gap-1.5">
                    <Skeleton width={100} height={10} />
                    <Skeleton width={10} height={10} />
                    <Skeleton width={60} height={10} />
                    <Skeleton width={50} height={10} />
                  </div>
                </div>
              </div>
            </main>
          </Card>
        </div>
      </SkeletonTheme>
    );
  }

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-140px)] min-h-[600px] space-y-6 animate-fade-in">
      {/* Messenger Container */}
      <Card className="flex h-full overflow-hidden rounded-xl border border-slate-200/60 shadow-sm">
        {/* Main Chat Area */}
        <main className="flex-1 flex flex-col min-w-0 bg-white relative">
          {/* Header */}
          <header className="h-16 flex items-center justify-between px-6 bg-white/80 backdrop-blur-sm flex-shrink-0 z-10 border-b border-slate-100">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 flex items-center justify-center text-emerald-500">
                  <Bot size={28} />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                    BudgetSense AI
                    <Badge
                      variant="brand"
                      className="px-2 py-0.5 text-emerald-600 text-[10px]  tracking-wide uppercase bg-transparent border-0 rounded-none"
                    >
                      Beta
                    </Badge>
                  </h2>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Model Selector Dropdown */}
              <ModelSelectorDropdown
                selectedModel={selectedModel}
                onSelectModel={handleModelChange}
                models={models}
              />

              <div className="h-8 w-px bg-slate-200 mx-1" />

              {/* Clear Chat Button */}
              <button
                onClick={() => setClearChatModalOpen(true)}
                disabled={isPending}
                className="p-2 text-slate-400 hover:text-red-500 rounded-lg transition-colors disabled:opacity-50"
                title="Clear Chat"
              >
                <Trash2 size={20} />
              </button>

              {/* Export Chat Button */}
              <button
                onClick={() => setExportModalOpen(true)}
                disabled={isPending || messages.length === 0}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg transition-colors disabled:opacity-50"
                title="Export Chat"
              >
                <Download size={20} />
              </button>
            </div>
          </header>

          {/* Error Banner */}
          {error && (
            <div className="bg-red-50 border-b border-red-100 px-6 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-red-700">
                <AlertCircle size={16} />
                <span className="text-sm">{error}</span>
              </div>
              <button 
                onClick={dismissError}
                className="text-red-500 hover:text-red-700 text-sm font-medium"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Messages Container */}
          <div
            id="chat-messages"
            className="flex-1 overflow-y-auto p-6 space-y-8 relative scroll-smooth bg-white scrollbar-thin"
          >
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <Bot size={48} className="mb-4 text-slate-300" />
                <p className="text-sm">Start a conversation with BudgetSense AI</p>
              </div>
            ) : (
              messages.filter(msg => msg.content && msg.content.trim() !== "").map((msg, index) => (
                <div
                  key={msg.id}
                  className={`mx-auto max-w-3xl ${
                    msg.role === "user" ? "flex justify-end" : "flex justify-start"
                  }`}
                >
                  {/* Message Content */}
                  <div className={`${msg.role === "user" ? "max-w-[85%]" : "space-y-3 flex-1"} relative group`}>
                    {/* Message Bubble */}
                    <div
                      className={`${
                        msg.role === "assistant"
                          ? "rounded-[2rem] rounded-tl-sm text-slate-800 transition-all"
                          : "bg-emerald-500 text-white rounded-[2rem] rounded-tr-sm px-6 py-3.5 shadow-sm"
                      }`}
                    >
                      {renderMessageContent(msg.content, msg.role, msg.id)}
                    </div>

                    {/* Copy Button as Footer */}
                    <div className={`flex gap-2 ${msg.role === "assistant" ? "opacity-100 justify-start" : "opacity-0 justify-end"} group-hover:opacity-100 transition-all duration-200`}>
                      {/* Share Button - Only for Assistant Messages */}
                      {msg.role === "assistant" && msg.content && (
                        <button
                          onClick={() => handleShareMessage(msg.content)}
                          className="p-1.5 hover:opacity-80 transition-opacity"
                          title="Share message"
                        >
                          <Share size={14} className="text-slate-400" />
                        </button>
                      )}
                      
                      <button 
                        onClick={() => handleCopyMessage(msg.content || "", msg.id)}
                        className="p-1.5 hover:opacity-80 transition-opacity"
                        title="Copy message"
                      >
                        {copiedMessageId === msg.id ? (
                          <Check size={14} className="text-emerald-500" />
                        ) : (
                          <Copy size={14} className="text-slate-400" />
                        )}
                      </button>
                    </div>

                    {/* Suggestion Chips - Only for first assistant message with dynamic suggestions */}
                    {msg.role === "assistant" && index === 0 && dynamicSuggestions.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {dynamicSuggestions.map((suggestion, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="px-5 py-2.5 bg-white border border-slate-200 hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5 rounded-full text-xs text-slate-600 transition-all shadow-sm flex items-center gap-2 group cursor-pointer"
                          >
                            <Lightbulb size={14} className="text-slate-400" />
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
            <div className="h-4" />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-slate-100 relative z-20 flex-shrink-0">
            <div className="mx-auto max-w-3xl">
              <div className="relative flex items-end gap-2 bg-slate-50 border border-slate-200/60 rounded-3xl p-2 focus-within:border-slate-300 transition-all shadow-sm">
                {/* Attachment Button */}
                <button className="p-2 text-slate-400 hover:text-emerald-500 rounded-full transition-colors flex-shrink-0">
                  <Paperclip size={20} />
                </button>

                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={isSending ? "AI is thinking..." : "Message BudgetSense..."}
                  rows={1}
                  disabled={isSending}
                  className="w-full bg-transparent border-none text-sm text-slate-600 placeholder-slate-400 focus:outline-none resize-none py-1.5 max-h-32 leading-relaxed disabled:opacity-50"
                />

                {/* Send Button */}
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isSending}
                  className="p-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-full transition-all shadow-sm hover:shadow-md flex-shrink-0"
                >
                  {isSending ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <Send size={20} />
                  )}
                </button>
              </div>

              <div className="mt-2 flex items-center justify-center gap-1.5 text-[10px] text-slate-400 font-medium">
                <span className="flex items-center gap-1">
                  <ShieldCheck size={10} />
                  Private & Secure
                </span>
                <div>|</div>
                <span>Powered by</span>
                <img 
                  src="/logos/OpenAI-black-monoblossom.svg" 
                  alt="OpenAI" 
                  className="h-3 w-auto opacity-70"
                />
                <span>OpenAI</span>
              </div>
            </div>
          </div>
        </main>
      </Card>

      {/* Modals */}
      <ClearChatModal
        open={clearChatModalOpen}
        onClose={() => setClearChatModalOpen(false)}
        onConfirm={handleClearChat}
        isLoading={isPending}
      />

      <ExportChatModal
        open={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        onExport={handleExport}
        isLoading={isPending}
      />
    </div>
  );
}
