"use client";

import { memo } from "react";
import { Check } from "lucide-react";

interface StepperProps {
  currentStep: number;
  totalSteps: number;
  labels: string[];
}

export const Stepper = memo(function Stepper({ currentStep, totalSteps, labels }: StepperProps) {
  return (
    <div
      className="flex items-center justify-center px-5 py-3.5 bg-white border-b border-slate-100"
      aria-label="Progress"
    >
      {labels.map((label, idx) => {
        const stepNum = idx + 1;
        const isActive = stepNum === currentStep;
        const isCompleted = stepNum < currentStep;

        return (
          <div key={label} className="flex items-center">
            {idx > 0 && (
              <div
                className={`w-9 h-[1.5px] mx-1.5 mb-[18px] flex-shrink-0 transition-colors duration-300 ${
                  isCompleted ? "bg-emerald-500" : "bg-slate-200"
                }`}
              />
            )}
            <div className="flex flex-col items-center">
              <div
                className={`w-[26px] h-[26px] rounded-full flex items-center justify-center text-[10px] font-semibold border-[1.5px] transition-all duration-300 relative z-[2] flex-shrink-0 ${
                  isActive
                    ? "border-emerald-500 bg-emerald-500 text-white shadow-[0_0_0_3px_rgba(16,185,129,0.1)]"
                    : isCompleted
                    ? "border-emerald-500 bg-emerald-500 text-white"
                    : "border-slate-300 bg-white text-slate-400"
                }`}
                aria-current={isActive ? "step" : undefined}
              >
                {isCompleted ? <Check size={12} /> : stepNum}
              </div>
              <span
                className={`text-[9px] font-semibold mt-1 text-center uppercase tracking-[0.05em] transition-colors duration-200 ${
                  isActive
                    ? "text-emerald-500"
                    : isCompleted
                    ? "text-slate-600"
                    : "text-slate-400"
                }`}
              >
                {label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
});
