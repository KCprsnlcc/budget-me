"use client";

import { useState, useCallback, useRef, useEffect } from "react";
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
  PieChart,
  Lightbulb,
  CheckSquare,
  Copy,
  Check,
  Share,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TypingEffect } from "@/components/ui/typing-effect";
import {
  ModelSelectorDropdown,
  ClearChatModal,
  ExportChatModal,
} from "./_components";
import type { MessageType, ExportFormat, MessageRole } from "./_components/types";
import { AI_MODELS, DEFAULT_SUGGESTIONS } from "./_components/types";
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

const INITIAL_MESSAGES: MessageType[] = [
  {
    id: "1",
    role: "assistant",
    content: `Hello John! 👋\n\nI'm your personal financial assistant. I've analyzed your recent transactions and I noticed your **food spending** is trending down this month.\n\nHow can I help you today?`,
    timestamp: "10:30 AM",
    model: "gpt-oss-20b",
  },
  {
    id: "2",
    role: "user",
    content: "Can you show me my recent subscription charges?",
    timestamp: "10:32 AM",
  },
  {
    id: "3",
    role: "assistant",
    content: `Here are your recent subscription charges I found in your transactions history:\n\n| Service | Date | Amount |\n|---------|------|--------|\n| Netflix | Oct 21, 2024 | $15.99 |\n| Spotify | Oct 18, 2024 | $9.99 |\n| Adobe Creative | Oct 15, 2024 | $54.99 |\n\n**Total: $80.97 / month**`,
    timestamp: "10:32 AM",
    model: "gpt-oss-20b",
  },
];

const SUBSCRIPTION_DATA = [
  { service: "Netflix", date: "Oct 21, 2024", amount: "$15.99", icon: "play", color: "red" },
  { service: "Spotify", date: "Oct 18, 2024", amount: "$9.99", icon: "music", color: "green" },
  { service: "Adobe Creative", date: "Oct 15, 2024", amount: "$54.99", icon: "palette", color: "blue" },
];

export default function ChatbotPage() {
  const [messages, setMessages] = useState<MessageType[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [selectedModel, setSelectedModel] = useState("gpt-oss-20b");
  const [clearChatModalOpen, setClearChatModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [typingMessageId, setTypingMessageId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Simulate loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 900); // 0.9 seconds loading time

    return () => clearTimeout(timer);
  }, []);

  const currentModel = AI_MODELS.find((m) => m.id === selectedModel) || AI_MODELS[0];

  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

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

  const handleSend = useCallback(() => {
    if (!input.trim()) return;

    const newMessage: MessageType = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date().toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInput("");

    // Simulate AI response with typing effect
    setTimeout(() => {
      const aiResponseId = (Date.now() + 1).toString();
      const aiResponse: MessageType = {
        id: aiResponseId,
        role: "assistant",
        content: "I understand. Let me analyze that for you and provide personalized insights based on your financial data.",
        timestamp: new Date().toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        }),
        model: selectedModel,
      };
      setMessages((prev) => [...prev, aiResponse]);
      setTypingMessageId(aiResponseId);
    }, 1000);
  }, [input, selectedModel]);

  const handleSuggestionClick = useCallback((suggestion: string) => {
    setInput(suggestion);
    textareaRef.current?.focus();
  }, []);

  const handleClearChat = useCallback(() => {
    setMessages([]);
    setTypingMessageId(null);
  }, []);

  const handleExport = useCallback((format: ExportFormat) => {
    // eslint-disable-next-line no-console
    console.log(`Exporting chat as ${format}`);
    // Implementation would go here
  }, []);

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

  const renderMessageContent = (content: string, role: MessageRole, messageId: string) => {
    const isTyping = role === "assistant" && typingMessageId === messageId;
    
    // Check if content contains table data
    if (content.includes("| Service |")) {
      const parts = content.split("| Service |");
      const textPart = parts[0];
      const lines = content.split("\n");
      const tableStart = lines.findIndex((line) => line.includes("| Service |"));
      const tableEnd = lines.findIndex((line, i) => i > tableStart && !line.startsWith("|"));
      const endIdx = tableEnd === -1 ? lines.length : tableStart;

      return (
        <div className="space-y-4">
          {textPart.trim() && (
            <div className={`text-sm leading-relaxed ${role === "assistant" ? "text-slate-700" : "text-white"}`}>
              {isTyping ? (
                <TypingEffect 
                  text={textPart.trim()} 
                  speed={15} 
                  delay={200}
                  onComplete={() => setTypingMessageId(null)}
                />
              ) : (
                textPart.trim()
              )}
            </div>
          )}
          <div className="overflow-hidden bg-white border border-slate-200 rounded-2xl shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-slate-50/50 border-b border-slate-100">
                  <tr>
                    <th className="px-5 py-3 text-left font-semibold text-slate-500 uppercase tracking-wider">
                      Service
                    </th>
                    <th className="px-5 py-3 text-left font-semibold text-slate-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-5 py-3 text-right font-semibold text-slate-500 uppercase tracking-wider">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {SUBSCRIPTION_DATA.map((item) => (
                    <tr key={item.service} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3 text-slate-700 font-medium flex items-center gap-2">
                        <div
                          className={`w-6 h-6 rounded bg-${item.color}-50 text-${item.color}-500 flex items-center justify-center`}
                        >
                          {item.icon === "play" && <div className="w-3 h-3 rounded-full border-2 border-current" />}
                          {item.icon === "music" && <div className="text-[8px]">♪</div>}
                          {item.icon === "palette" && <div className="w-3 h-3 rounded bg-current" />}
                        </div>
                        {item.service}
                      </td>
                      <td className="px-5 py-3 text-slate-500">{item.date}</td>
                      <td className="px-5 py-3 text-right text-slate-900 font-semibold">
                        {item.amount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-2.5 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
              <span className="text-[10px] text-slate-400 font-medium px-2">
                Total: $80.97 / month
              </span>
              <button className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-medium text-slate-500 hover:text-emerald-500 hover:bg-white border border-transparent hover:border-slate-200 rounded transition-all">
                Copy Table
              </button>
            </div>
          </div>
          {lines.slice(endIdx).join("\n").trim() && (
            <div className={`text-sm leading-relaxed font-medium ${role === "assistant" ? "text-slate-700" : "text-white"}`}>
              {lines.slice(endIdx).join("\n").trim()}
            </div>
          )}
        </div>
      );
    }

    // Regular content with bold text support
    return (
      <div className={`text-sm leading-relaxed whitespace-pre-wrap ${role === "assistant" ? "text-slate-700" : "text-white"}`}>
        {isTyping ? (
          <TypingEffect 
            text={content} 
            speed={15} 
            delay={200}
            onComplete={() => setTypingMessageId(null)}
          />
        ) : (
          content.split("**").map((part, index) =>
            index % 2 === 1 ? (
              <strong key={index} className={`font-semibold ${role === "assistant" ? "text-slate-900" : "text-white"}`}>
                {part}
              </strong>
            ) : (
              <span key={index}>{part}</span>
            )
          )
        )}
      </div>
    );
  };

  // Loading state
  if (loading) {
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
                onSelectModel={setSelectedModel}
                models={AI_MODELS}
              />

              <div className="h-8 w-px bg-slate-200 mx-1" />

              {/* Clear Chat Button */}
              <button
                onClick={() => setClearChatModalOpen(true)}
                className="p-2 text-slate-400 hover:text-red-500 rounded-lg transition-colors"
                title="Clear Chat"
              >
                <Trash2 size={20} />
              </button>

              {/* Export Chat Button */}
              <button
                onClick={() => setExportModalOpen(true)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
                title="Export Chat"
              >
                <Download size={20} />
              </button>
            </div>
          </header>

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
              messages.map((msg, index) => (
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
                      {msg.role === "assistant" && (
                        <button
                          onClick={() => handleShareMessage(msg.content)}
                          className="p-1.5 hover:opacity-80 transition-opacity"
                          title="Share message"
                        >
                          <Share size={14} className="text-slate-400" />
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleCopyMessage(msg.content, msg.id)}
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

                    {/* Suggestion Chips - Only for first assistant message */}
                    {msg.role === "assistant" && index === 0 && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {DEFAULT_SUGGESTIONS.map((suggestion) => {
                          const Icon =
                            suggestion.icon === "pie-chart"
                              ? PieChart
                              : suggestion.icon === "lightbulb"
                                ? Lightbulb
                                : CheckSquare;
                          return (
                            <button
                              key={suggestion.id}
                              onClick={() => handleSuggestionClick(suggestion.label)}
                              className="px-5 py-2.5 bg-white border border-slate-200 hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5 rounded-full text-xs text-slate-600 transition-all shadow-sm flex items-center gap-2 group cursor-pointer"
                            >
                              <Icon
                                size={14}
                                className="text-slate-400"
                              />
                              {suggestion.label}
                            </button>
                          );
                        })}
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
                  placeholder="Message BudgetSense..."
                  rows={1}
                  className="w-full bg-transparent border-none text-sm text-slate-600 placeholder-slate-400 focus:outline-none resize-none py-1.5 max-h-32 leading-relaxed"
                />

                {/* Send Button */}
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="p-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-full transition-all shadow-sm hover:shadow-md flex-shrink-0"
                >
                  <Send size={20} />
                </button>
              </div>

              <div className="mt-2 flex items-center justify-center gap-1.5 text-[10px] text-slate-400 font-medium">
                <span className="flex items-center gap-1">
                  <ShieldCheck size={10} />
                  Private & Secure
                </span>
                <div>|</div>
                <span>Powered by</span>
                <span className="opacity-70">OpenAI</span>
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
      />

      <ExportChatModal
        open={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        onExport={handleExport}
      />
    </div>
  );
}
