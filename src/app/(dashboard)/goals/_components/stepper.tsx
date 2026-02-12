"use client";

import { cn } from "@/lib/utils";

interface StepperProps {
  steps: string[];
  currentStep: number;
  className?: string;
}

export function Stepper({ steps, currentStep, className }: StepperProps) {
  return (
    <div className={cn("flex items-center justify-between px-5 py-4", className)}>
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === currentStep;
        const isCompleted = stepNumber < currentStep;
        
        return (
          <div key={step} className="flex items-center flex-1">
            <div className="flex items-center">
              <div
                className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-200",
                  isActive
                    ? "bg-emerald-500 text-white ring-4 ring-emerald-500/10"
                    : isCompleted
                    ? "bg-emerald-100 text-emerald-600"
                    : "bg-slate-100 text-slate-400"
                )}
              >
                {isCompleted ? "✓" : stepNumber}
              </div>
              <span
                className={cn(
                  "ml-2 text-xs font-medium transition-colors",
                  isActive ? "text-slate-900" : isCompleted ? "text-emerald-600" : "text-slate-400"
                )}
              >
                {step}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "flex-1 h-px mx-4 transition-colors",
                  isCompleted ? "bg-emerald-200" : "bg-slate-100"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
