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
  X,
  FileText,
  FileCode,
  MoreHorizontal,
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
} from "./_components";
import type { MessageType, MessageRole } from "./_components/types";
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { useAuth } from "@/components/auth/auth-context";
import { createClient } from "@/lib/supabase/client";
import { checkAIUsage, incrementAIUsage, AIUsageStatus } from "../_lib/ai-rate-limit-service";
import { toast } from "sonner";
import {
  sendMessageToAI,
  fetchChatHistory,
  clearChatHistory,
  fetchAvailableModels,
  AVAILABLE_MODELS,
  getDefaultModel,
  saveWelcomeMessage,
  type SendMessageResult,
} from "./_lib/chatbot-service";
import {
  exportChatToPDF,
  exportChatToCSV,
  type ChatMessageExportData,
} from "@/lib/export-utils";
import { generateWelcomeMessage, type UserProfile } from "./_lib/welcome-messages";
import { fetchUserProfile } from "./_lib/user-data-service";


export default function ChatbotPage() {
  const { user, isLoading: authLoading } = useAuth();
  const supabase = createClient();
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [input, setInput] = useState("");
  const [selectedModel, setSelectedModel] = useState(getDefaultModel().id);
  const [models, setModels] = useState(AVAILABLE_MODELS);
  const [clearChatModalOpen, setClearChatModalOpen] = useState(false);
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
  const [userProfile, setUserProfile] = useState<UserProfile | undefined>(undefined);
  
  // File upload state
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // AI Rate Limit State
  const [rateLimitStatus, setRateLimitStatus] = useState<AIUsageStatus | null>(null);

  // Fetch available models and chat history on mount
  useEffect(() => {
    const initializeChat = async () => {
      if (!user?.id) return;

      try {
        // Fetch user profile data
        const { data: profileData } = await fetchUserProfile(user.id);
        if (profileData) {
          const profile: UserProfile = {
            id: profileData.id,
            fullName: profileData.fullName,
            email: profileData.email,
            avatarUrl: profileData.avatarUrl,
            role: profileData.role,
            currencyPreference: profileData.currencyPreference,
            timezone: profileData.timezone,
            language: profileData.language,
            createdAt: profileData.createdAt,
          };
          setUserProfile(profile);
        }

        // Fetch available models
        const { data: availableModels, error: modelsError } = await fetchAvailableModels();
        if (!modelsError && availableModels.length > 0) {
          setModels(availableModels);
          // Only set default model if no model is currently selected
          if (!selectedModel || !availableModels.find(m => m.id === selectedModel)) {
            const defaultModel = availableModels.find((m) => m.isDefault) || availableModels[0];
            setSelectedModel(defaultModel.id);
          }
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
          const { question, suggestions, userProfile: profile } = generateWelcomeMessage(userProfile);
          
          const welcomeMessage: MessageType = {
            id: `welcome-${Date.now()}`,
            role: "assistant",
            content: question,
            timestamp: new Date().toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
            }),
            model: selectedModel,
            suggestions: suggestions,
          };
          
          setMessages([welcomeMessage]);
          setDynamicSuggestions(suggestions);
          
          // Save welcome message to database
          await saveWelcomeMessage(user.id, userProfile);
        }
      } catch (err) {
        // On error, show welcome message
        const { question, suggestions } = generateWelcomeMessage(userProfile);
        
        const welcomeMessage: MessageType = {
          id: `welcome-${Date.now()}`,
          role: "assistant",
          content: question,
          timestamp: new Date().toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
          }),
          model: selectedModel,
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

  // Fetch AI rate limit status
  useEffect(() => {
    const fetchRateLimitStatus = async () => {
      if (!user?.id) return;
      
      try {
        const { status } = await checkAIUsage(user.id, "chatbot");
        setRateLimitStatus(status);
      } catch (error) {
        console.error("Error fetching rate limit status:", error);
      }
    };

    fetchRateLimitStatus();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchRateLimitStatus, 30000);
    return () => clearInterval(interval);
  }, [user?.id]);

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

  // File upload handlers
  const handleFileSelect = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // GPT can scan virtually all file types - no type restrictions
    // Only limit by file size (max 25MB for better processing)
    if (file.size > 25 * 1024 * 1024) {
      setError('File size must be less than 25MB');
      return;
    }

    setAttachedFile(file);
    setError(null);
  }, [setError]);

  const handleRemoveFile = useCallback(() => {
    setAttachedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const handleSend = useCallback(async () => {
    if ((!input.trim() && !attachedFile) || isSending || !user?.id) return;

    // Check rate limit before sending
    const { allowed, error: limitError } = await checkAIUsage(user.id, "chatbot");
    if (!allowed) {
      toast.error("Daily limit reached", {
        description: limitError || "You've reached your daily limit for AI Chatbot. Try again tomorrow.",
      });
      return;
    }

    const trimmedInput = input.trim();
    
    // Convert file to base64 if it's an image
    let base64Data: string | undefined;
    if (attachedFile && attachedFile.type.startsWith('image/')) {
      try {
        base64Data = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result as string;
            // Remove data URL prefix to get just the base64
            const base64 = result.split(',')[1];
            resolve(base64);
          };
          reader.onerror = reject;
          reader.readAsDataURL(attachedFile);
        });
      } catch (error) {
        console.error('Error converting image to base64:', error);
        setError('Failed to process image');
        return;
      }
    }
    
    // Create user message with unique ID
    const userMessageId = `user-${Date.now()}-${Math.random()}`;
    const userMessage: MessageType = {
      id: userMessageId,
      role: "user",
      content: trimmedInput || (attachedFile ? `Uploaded: ${attachedFile.name}` : ""),
      timestamp: new Date().toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      }),
      attachment: attachedFile ? {
        name: attachedFile.name,
        type: attachedFile.type,
        size: attachedFile.size,
        url: base64Data,
      } : undefined,
    };

    // Optimistically add user message
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setAttachedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setIsSending(true);
    setError(null);

    // Increment usage
    try {
      const { success: incrementSuccess, status: newStatus } = await incrementAIUsage(user.id, "chatbot");
      if (incrementSuccess && newStatus) {
        setRateLimitStatus(newStatus);
      }
    } catch (error) {
      console.error("Error incrementing usage:", error);
    }

    // Persist user message to database
    try {
      await supabase.from("chatbot_messages").insert({
        user_id: user.id,
        role: userMessage.role,
        content: userMessage.content,
        model: null, // User messages don't have a model
        suggestions: [],
        attachment: userMessage.attachment || null,
        created_at: new Date().toISOString(),
      });
    } catch {
      // Silent fail - don't break the chat flow if persistence fails
    }

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
        const { question, suggestions } = generateWelcomeMessage(userProfile);
        
        const welcomeMessage: MessageType = {
          id: `welcome-${Date.now()}`,
          role: "assistant",
          content: question,
          timestamp: new Date().toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
          }),
          model: selectedModel,
          suggestions: suggestions,
        };
        
        setMessages([welcomeMessage]);
        setDynamicSuggestions(suggestions);
        
        // Save welcome message to database
        await saveWelcomeMessage(user.id, userProfile);
        setTypingMessageId(null);
        setError(null);
      } catch (err) {
        setError("Failed to clear chat history");
      }
    });
  }, [user]);

  const handleExportPDF = useCallback(() => {
    if (messages.length === 0) {
      alert("No messages to export");
      return;
    }

    const exportData: ChatMessageExportData[] = messages.map((msg) => ({
      timestamp: msg.timestamp || new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
      role: msg.role === "user" ? "You" : "BudgetSense AI",
      content: msg.content || "",
      model: msg.model || null,
      userName: userProfile?.fullName || undefined,
    }));

    exportChatToPDF(exportData, userProfile?.fullName || undefined);
  }, [messages, userProfile]);

  const handleExportCSV = useCallback(() => {
    if (messages.length === 0) {
      alert("No messages to export");
      return;
    }

    const exportData: ChatMessageExportData[] = messages.map((msg) => ({
      timestamp: msg.timestamp || new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
      role: msg.role === "user" ? "You" : "BudgetSense AI",
      content: msg.content || "",
      model: msg.model || null,
      userName: userProfile?.fullName || undefined,
    }));

    exportChatToCSV(exportData, userProfile?.fullName || undefined);
  }, [messages, userProfile]);

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
              <div className="h-8 w-px bg-slate-200 mx-1" />

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

              {/* Export Chat Dropdown */}
              <div className="relative group">
                <Button 
                  variant="ghost" 
                  size="sm"
                  disabled={isPending || messages.length === 0}
                  className="p-2 text-slate-400 hover:text-slate-600 disabled:opacity-50"
                >
                  <Download size={20} />
                  <MoreHorizontal size={12} />
                </Button>
                {/* Dropdown */}
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 p-1 hidden group-hover:block z-50">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full justify-start text-xs text-slate-600 hover:bg-slate-50" 
                    onClick={handleExportPDF}
                    disabled={messages.length === 0}
                  >
                    <span className="text-rose-500">PDF</span> Export as PDF
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full justify-start text-xs text-slate-600 hover:bg-slate-50" 
                    onClick={handleExportCSV}
                    disabled={messages.length === 0}
                  >
                    <span className="text-emerald-500">CSV</span> Export as CSV
                  </Button>
                </div>
              </div>
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
                      {/* File Attachment */}
                      {msg.attachment && (
                        <div className={`mb-2 p-2 rounded-lg ${msg.role === "user" ? "bg-emerald-600" : "bg-slate-100"}`}>
                          <div className="flex items-center gap-2">
                            <Paperclip size={16} className={msg.role === "user" ? "text-emerald-200" : "text-slate-500"} />
                            <span className={`text-sm truncate ${msg.role === "user" ? "text-white" : "text-slate-700"}`}>
                              {msg.attachment.name}
                            </span>
                            <span className={`text-xs ${msg.role === "user" ? "text-emerald-200" : "text-slate-500"}`}>
                              ({(msg.attachment.size / 1024).toFixed(1)} KB)
                            </span>
                          </div>
                        </div>
                      )}
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
              {/* Attached File Preview */}
              {attachedFile && (
                <div className="mb-2 flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2">
                  <div className="flex-shrink-0 w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                    {attachedFile.type.startsWith('image/') ? (
                      <img 
                        src={URL.createObjectURL(attachedFile)} 
                        alt="Preview" 
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : attachedFile.type.includes('pdf') ? (
                      <FileText size={16} className="text-emerald-600" />
                    ) : attachedFile.type.includes('word') || attachedFile.type.includes('document') ? (
                      <FileText size={16} className="text-emerald-600" />
                    ) : attachedFile.type.includes('excel') || attachedFile.type.includes('spreadsheet') ? (
                      <FileText size={16} className="text-emerald-600" />
                    ) : attachedFile.type.includes('powerpoint') || attachedFile.type.includes('presentation') ? (
                      <FileText size={16} className="text-emerald-600" />
                    ) : attachedFile.type.includes('text') || attachedFile.type.includes('code') ? (
                      <FileCode size={16} className="text-emerald-600" />
                    ) : (
                      <Paperclip size={16} className="text-emerald-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">{attachedFile.name}</p>
                    <p className="text-xs text-slate-500">{(attachedFile.size / 1024).toFixed(1)} KB</p>
                  </div>
                  <button
                    onClick={handleRemoveFile}
                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                    disabled={isSending}
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              <div className="relative flex items-end gap-2 bg-slate-50 border border-slate-200/60 rounded-3xl p-2 focus-within:border-slate-300 transition-all shadow-sm">
                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={isSending || uploadingFile}
                />

                {/* Attachment Button */}
                <button 
                  onClick={handleFileSelect}
                  disabled={isSending || uploadingFile}
                  className="p-2 text-slate-400 hover:text-emerald-500 rounded-full transition-colors flex-shrink-0 disabled:opacity-50"
                >
                  <Paperclip size={20} />
                </button>

                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={!rateLimitStatus?.canUseAI 
                    ? "Daily AI limit reached (25/day). Resets at midnight." 
                    : isSending 
                      ? "AI is thinking..." 
                      : attachedFile 
                        ? "Add a message about this file..." 
                        : "Message BudgetSense..."}
                  rows={1}
                  disabled={isSending || !rateLimitStatus?.canUseAI}
                  className="w-full bg-transparent border-none text-sm text-slate-600 placeholder-slate-400 focus:outline-none resize-none py-1.5 max-h-32 leading-relaxed disabled:opacity-50"
                />

                {/* Send Button */}
                <button
                  onClick={handleSend}
                  disabled={(!input.trim() && !attachedFile) || isSending || !rateLimitStatus?.canUseAI}
                  title={!rateLimitStatus?.canUseAI ? "Daily AI limit reached (25/day)" : ""}
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
    </div>
  );
}
