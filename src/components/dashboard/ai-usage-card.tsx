import { useState, useEffect } from "react";
import { BarChart3, Clock } from "lucide-react";
import { ProgressBar } from "@/components/ui/progress-bar";
import { getAIUsageStatus, formatTimeRemaining, AIUsageStatus } from "@/app/(dashboard)/_lib/ai-rate-limit-service";
import { useAuth } from "@/components/auth/auth-context";

export function AIUsageCard() {
  const { user } = useAuth();
  const [status, setStatus] = useState<AIUsageStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState("00:00:00");
  useEffect(() => {
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

    fetchStatus();

    // Refresh every 30 seconds
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
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
      <div className="bg-slate-50 rounded-lg border border-slate-200/60 p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="text-emerald-600">
              <BarChart3 size={14} />
            </div>
            <div>
              <div className="text-[9px] font-bold text-slate-900 uppercase tracking-wider">
                AI Usage
              </div>
            </div>
          </div>
        </div>
        <div className="text-[9px] text-slate-400">Unable to load usage data</div>
        <div className="mt-2 pt-2 border-t border-slate-200/50 grid grid-cols-3 gap-1 text-[8px] text-slate-400">
          <div className="text-center">
            <span className="block font-medium text-slate-600">-</span>
            <span>Predictions</span>
          </div>
          <div className="text-center border-l border-slate-200/50">
            <span className="block font-medium text-slate-600">-</span>
            <span>Insights</span>
          </div>
          <div className="text-center border-l border-slate-200/50">
            <span className="block font-medium text-slate-600">-</span>
            <span>Chatbot</span>
          </div>
        </div>
      </div>
    );
  }

  const isAtLimit = status.remaining === 0;
  const isLow = status.remaining <= 5 && status.remaining > 0;
  const progressColor = isAtLimit ? "danger" : isLow ? "warning" : "brand";

  return (
    <div className={`bg-slate-50 rounded-lg border p-3 ${isAtLimit ? 'border-red-200 bg-red-50/30' : isLow ? 'border-amber-200 bg-amber-50/30' : 'border-slate-200/60'}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={`${isAtLimit ? 'text-red-500' : isLow ? 'text-amber-500' : 'text-emerald-600'}`}>
            <BarChart3 size={14} />
          </div>
          <div>
            <div className="text-[9px] font-bold text-slate-900 uppercase tracking-wider">
              AI Usage
            </div>
            <div className={`text-[9px] ${isAtLimit ? 'text-red-500 font-medium' : isLow ? 'text-amber-600' : 'text-slate-500'}`}>
              {status.totalUsed} / {status.totalLimit} daily limit
            </div>
          </div>
        </div>
        {!isAtLimit && (
          <div className="text-[9px] font-medium text-emerald-600 px-1.5 py-0.5 rounded">
            {status.remaining} left
          </div>
        )}
      </div>
      
      <ProgressBar 
        value={status.totalUsed} 
        max={status.totalLimit} 
        color={progressColor as "brand" | "warning" | "danger"} 
        className="mb-2" 
      />
      
      <div className="flex justify-between items-center text-[9px]">
        <span className={`flex items-center gap-1 ${isAtLimit ? 'text-red-400' : 'text-slate-400'}`}>
          <Clock size={9} />
          {isAtLimit ? 'Limit reached' : 'Resets in'}
        </span>
        <span className={`font-mono font-medium ${isAtLimit ? 'text-red-500' : isLow ? 'text-amber-600' : 'text-emerald-600'}`}>
          {timeRemaining}
        </span>
      </div>
      
      {/* Feature breakdown - subtle */}
      <div className="mt-2 pt-2 border-t border-slate-200/50 grid grid-cols-3 gap-1 text-[8px] text-slate-400">
        <div className="text-center">
          <span className="block font-medium text-slate-600">{status.predictionsUsed}</span>
          <span>Predictions</span>
        </div>
        <div className="text-center border-l border-slate-200/50">
          <span className="block font-medium text-slate-600">{status.insightsUsed}</span>
          <span>Insights</span>
        </div>
        <div className="text-center border-l border-slate-200/50">
          <span className="block font-medium text-slate-600">{status.chatbotUsed}</span>
          <span>Chatbot</span>
        </div>
      </div>
    </div>
  );
}
