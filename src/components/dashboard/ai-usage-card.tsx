import { useState, useEffect } from "react";
import { BarChart3, Clock } from "lucide-react";
import { ProgressBar } from "@/components/ui/progress-bar";
import { getAIUsageStatus, formatTimeRemaining, AIUsageStatus } from "@/app/(dashboard)/_lib/ai-rate-limit-service";
import { useAuth } from "@/components/auth/auth-context";
import { createClient } from "@/lib/supabase/client";

export function AIUsageCard() {
  const { user } = useAuth();
  const [status, setStatus] = useState<AIUsageStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState("00:00:00");
  
  useEffect(() => {
    const supabase = createClient();
    
    const fetchStatus = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        const newStatus = await getAIUsageStatus(user.id);
        setStatus(newStatus);
      } catch (error) {
        console.error("Error fetching AI usage:", error);
      } finally {
        setLoading(false);
      }
    };

    // Initial fetch
    fetchStatus();

    // Subscribe to realtime changes for this user's usage
    const channel = supabase
      .channel('ai-usage-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ai_usage_rate_limits',
          filter: `user_id=eq.${user?.id}`,
        },
        () => {
          // Refetch when data changes
          fetchStatus();
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  // Update countdown timer
  useEffect(() => {
    if (!status) return;

    const updateTimer = () => {
      setTimeRemaining(formatTimeRemaining(status.nextResetAt));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [status]);

  if (loading) {
    return null;
  }

  if (!status) {
    return (
      <div className="bg-slate-50 rounded-lg border border-slate-200/60 p-2.5 sm:p-3">
        <div className="flex items-center justify-between mb-1.5 sm:mb-2">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="text-emerald-600">
              <BarChart3 size={12} className="sm:w-[14px] sm:h-[14px]" />
            </div>
            <div>
              <div className="text-[8px] sm:text-[9px] font-bold text-slate-900 uppercase tracking-wider">
                AI Usage
              </div>
            </div>
          </div>
        </div>
        <div className="text-[8px] sm:text-[9px] text-slate-400">Unable to load usage data</div>
        <div className="mt-1.5 sm:mt-2 pt-1.5 sm:pt-2 border-t border-slate-200/50 grid grid-cols-3 gap-0.5 sm:gap-1 text-[7px] sm:text-[8px] text-slate-400">
          <div className="text-center">
            <span className="block font-medium text-slate-600">-</span>
            <span className="hidden sm:inline">Predictions</span>
            <span className="sm:hidden">Pred</span>
          </div>
          <div className="text-center border-l border-slate-200/50">
            <span className="block font-medium text-slate-600">-</span>
            <span className="hidden sm:inline">Insights</span>
            <span className="sm:hidden">Ins</span>
          </div>
          <div className="text-center border-l border-slate-200/50">
            <span className="block font-medium text-slate-600">-</span>
            <span className="hidden sm:inline">Chatbot</span>
            <span className="sm:hidden">Chat</span>
          </div>
        </div>
      </div>
    );
  }

  const isAtLimit = status.remaining === 0;
  const isLow = status.remaining <= 5 && status.remaining > 0;
  const progressColor = isAtLimit ? "danger" : isLow ? "warning" : "brand";

  return (
    <div className={`bg-slate-50 rounded-lg border p-2.5 sm:p-3 md:p-3 ${isAtLimit ? 'border-red-200 bg-red-50/30' : isLow ? 'border-amber-200 bg-amber-50/30' : 'border-slate-200/60'}`}>
      <div className="flex items-center justify-between mb-1.5 sm:mb-2">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className={`${isAtLimit ? 'text-red-500' : isLow ? 'text-amber-500' : 'text-emerald-600'}`}>
            <BarChart3 size={12} className="sm:w-[14px] sm:h-[14px] md:w-[14px] md:h-[14px]" />
          </div>
          <div>
            <div className="text-[8px] sm:text-[9px] md:text-[9px] font-bold text-slate-900 uppercase tracking-wider">
              AI Usage
            </div>
            <div className={`text-[8px] sm:text-[9px] md:text-[9px] ${isAtLimit ? 'text-red-500 font-medium' : isLow ? 'text-amber-600' : 'text-slate-500'}`}>
              {status.totalUsed} / {status.totalLimit} daily limit
            </div>
          </div>
        </div>
        {!isAtLimit && (
          <div className="text-[8px] sm:text-[9px] md:text-[9px] font-medium text-emerald-600 px-1 sm:px-1.5 py-0.5 rounded">
            {status.remaining} left
          </div>
        )}
      </div>
      
      <ProgressBar 
        value={status.totalUsed} 
        max={status.totalLimit} 
        color={progressColor as "brand" | "warning" | "danger"} 
        className="mb-1.5 sm:mb-2" 
      />
      
      <div className="flex justify-between items-center text-[8px] sm:text-[9px] md:text-[9px]">
        <span className={`flex items-center gap-0.5 sm:gap-1 ${isAtLimit ? 'text-red-400' : 'text-slate-400'}`}>
          <Clock size={8} className="sm:w-[9px] sm:h-[9px] md:w-[9px] md:h-[9px]" />
          {isAtLimit ? 'Limit reached' : 'Resets in'}
        </span>
        <span className={`font-mono font-medium ${isAtLimit ? 'text-red-500' : isLow ? 'text-amber-600' : 'text-emerald-600'}`}>
          {timeRemaining}
        </span>
      </div>
      
      {/* Feature breakdown - subtle */}
      <div className="mt-1.5 sm:mt-2 pt-1.5 sm:pt-2 border-t border-slate-200/50 grid grid-cols-3 gap-0.5 sm:gap-1 text-[7px] sm:text-[8px] md:text-[8px] text-slate-400">
        <div className="text-center">
          <span className="block font-medium text-slate-600">{status.predictionsUsed}</span>
          <span className="hidden sm:inline md:inline">Predictions</span>
          <span className="sm:hidden md:hidden">Pred</span>
        </div>
        <div className="text-center border-l border-slate-200/50">
          <span className="block font-medium text-slate-600">{status.insightsUsed}</span>
          <span className="hidden sm:inline md:inline">Insights</span>
          <span className="sm:hidden md:hidden">Ins</span>
        </div>
        <div className="text-center border-l border-slate-200/50">
          <span className="block font-medium text-slate-600">{status.chatbotUsed}</span>
          <span className="hidden sm:inline md:inline">Chatbot</span>
          <span className="sm:hidden md:hidden">Chat</span>
        </div>
      </div>
    </div>
  );
}
