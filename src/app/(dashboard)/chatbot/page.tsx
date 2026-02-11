"use client";

import { useState } from "react";
import { Send, Sparkles, User, Bot, Lightbulb } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const INITIAL_MESSAGES = [
  {
    role: "assistant" as const,
    content:
      "Hello John! I'm BudgetSense, your AI financial assistant. I can help you analyze spending patterns, suggest savings opportunities, and answer questions about your finances. What would you like to know?",
  },
  {
    role: "user" as const,
    content: "How much did I spend on dining out this month?",
  },
  {
    role: "assistant" as const,
    content:
      "This month, you've spent **$420** on Food & Dining, which is 70% of your $600 budget. You have $180 remaining. Compared to last month ($478), you're spending 12% less. Your top dining expenses were:\n\n• Restaurant visits: $245\n• Coffee shops: $89\n• Food delivery: $86\n\nWould you like me to suggest ways to reduce your dining expenses further?",
  },
];

const SUGGESTIONS = [
  "What's my savings rate this month?",
  "Show my top 5 expenses",
  "How can I reduce spending?",
  "Predict next month's expenses",
];

export default function ChatbotPage() {
  const [messages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState("");

  return (
    <div className="max-w-4xl mx-auto h-full flex flex-col animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100">
            <Sparkles size={20} className="text-emerald-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              BudgetSense AI
              <Badge variant="brand">Beta</Badge>
            </h2>
            <p className="text-xs text-slate-400">Your personal financial assistant</p>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <Card className="flex-1 flex flex-col overflow-hidden max-h-[calc(100vh-16rem)]">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
              <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center ${msg.role === "assistant" ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-600"}`}>
                {msg.role === "assistant" ? <Bot size={16} /> : <User size={16} />}
              </div>
              <div className={`max-w-[70%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${msg.role === "assistant" ? "bg-slate-50 text-slate-700 rounded-bl-sm" : "bg-emerald-500 text-white rounded-br-sm"}`}>
                {msg.content.split("\n").map((line, j) => (
                  <p key={j} className={j > 0 ? "mt-2" : ""}>
                    {line.split("**").map((part, k) =>
                      k % 2 === 1 ? (
                        <strong key={k}>{part}</strong>
                      ) : (
                        <span key={k}>{part}</span>
                      )
                    )}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Suggestions */}
        <div className="px-5 py-3 border-t border-slate-100">
          <div className="flex items-center gap-1.5 mb-2">
            <Lightbulb size={12} className="text-amber-500" />
            <span className="text-[10px] font-medium text-slate-400">Suggested questions</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                className="px-3 py-1.5 text-[11px] font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded-full hover:bg-white hover:border-slate-300 transition-all cursor-pointer"
                onClick={() => setInput(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="px-5 py-4 border-t border-slate-200 flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your finances..."
            className="flex-1 px-4 py-2.5 border border-slate-200 rounded-full text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
          />
          <button className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center hover:bg-emerald-600 transition-colors cursor-pointer shrink-0">
            <Send size={16} />
          </button>
        </div>
      </Card>
    </div>
  );
}
