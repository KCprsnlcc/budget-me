"use client";

import { DollarSign, Info } from "lucide-react";
import { Label } from "@/components/ui/label";
import { LANGUAGES } from "./constants";

export function PreferencesTab() {
  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-300">
      {/* Currency Section */}
      <div className="bg-white border border-slate-200/60 shadow-sm rounded-xl p-5 hover:shadow-md transition-all cursor-pointer">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg text-slate-600">
              <DollarSign size={20} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Philippine Peso</h3>
              <p className="text-[10px] text-slate-500">₱ PHP</p>
            </div>
          </div>
          <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-100 text-emerald-700 rounded-full border border-emerald-200">
            Fixed
          </span>
        </div>
        <div className="flex items-start gap-2 p-3 rounded-lg bg-slate-50 border border-slate-100">
          <Info size={14} className="text-slate-400 flex-shrink-0 mt-0.5" />
          <span className="text-[11px] text-slate-500">
            Currency is standardized to PHP for all users to ensure consistency.
          </span>
        </div>
      </div>

      
      {/* Info Card */}
      <div className="bg-white border border-slate-200/60 shadow-sm rounded-xl p-5 hover:shadow-md transition-all cursor-pointer">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg text-blue-500">
            <Info size={18} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-1">About Data Privacy</h3>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Your settings are automatically saved. We prioritize your data privacy and security.
              Currently running BudgetMe Prototype v1.0.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
