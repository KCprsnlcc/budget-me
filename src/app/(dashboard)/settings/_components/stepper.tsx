"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  label: string;
  number: number;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
  variant?: "default" | "compact";
}

export function Stepper({ steps, currentStep, variant = "default" }: StepperProps) {
  const isCompact = variant === "compact";

  return (
    <div className={cn(
      "flex items-center justify-center",
      isCompact ? "py-3 px-4 border-b border-slate-100" : "py-6 mb-4"
    )}>
      {steps.map((step, index) => {
        const isCompleted = currentStep > step.number;
        const isActive = currentStep === step.number;
        const isLast = index === steps.length - 1;

        return (
          <div key={step.number} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              {/* Step Dot */}
              <div
                className={cn(
                  "flex items-center justify-center rounded-full font-semibold transition-all duration-300",
                  isCompact ? "w-[26px] h-[26px] text-[10px]" : "w-8 h-8 text-xs",
                  isCompleted && "bg-emerald-500 text-white",
                  isActive && "bg-emerald-500 text-white",
                  !isCompleted && !isActive && "bg-slate-200 text-slate-500"
                )}
              >
                {isCompleted ? (
                  <Check className={isCompact ? "w-3 h-3" : "w-4 h-4"} />
                ) : (
                  step.number
                )}
              </div>
              {/* Step Label */}
              <span
                className={cn(
                  "font-medium uppercase tracking-wider transition-colors duration-300",
                  isCompact ? "text-[8px]" : "text-xs",
                  (isActive || isCompleted) && "text-emerald-500",
                  !isActive && !isCompleted && "text-slate-500"
                )}
              >
                {step.label}
              </span>
            </div>
            {/* Connector */}
            {!isLast && (
              <div
                className={cn(
                  "transition-colors duration-300 mx-1",
                  isCompact
                    ? "w-9 h-[1.5px] mb-4"
                    : "w-16 h-0.5 -mt-3",
                  isCompleted ? "bg-emerald-500" : "bg-slate-200"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
