import { BarChart3 } from "lucide-react";
import { ProgressBar } from "@/components/ui/progress-bar";

export function AIUsageCard() {
  return (
    <div className="bg-slate-50 rounded-xl border border-slate-200/60 p-3">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <div className="text-emerald-600">
            <BarChart3 size={14} />
          </div>
          <div>
            <div className="text-[9px] font-bold text-slate-900 uppercase tracking-wider">
              AI Usage
            </div>
            <div className="text-[9px] text-slate-500">8 / 25 daily limit</div>
          </div>
        </div>
      </div>
      <ProgressBar value={8} max={25} color="brand" className="mb-2" />
      <div className="flex justify-between items-center text-[9px]">
        <span className="text-slate-400">Daily refresh in</span>
        <span className="text-emerald-600 font-mono font-medium">14:52:10</span>
      </div>
    </div>
  );
}
