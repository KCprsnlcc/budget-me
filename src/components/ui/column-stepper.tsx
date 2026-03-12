"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepDescription {
  [key: string]: string;
}

interface ColumnStepperProps {
  steps: string[];
  currentStep: number;
  descriptions?: StepDescription;
  className?: string;
}

const DEFAULT_DESCRIPTIONS: StepDescription = {
  "Welcome": "Get started with BudgetMe",
  "Account Type": "Choose your account category",
  "Details": "Enter account information",
  "Review": "Confirm and create",
};

export function ColumnStepper({ steps, currentStep, descriptions = DEFAULT_DESCRIPTIONS, className }: ColumnStepperProps) {
  return (
    <div className={cn("relative", className)}>
      {}
      <div className="absolute left-[15px] top-5 bottom-12 w-0.5 bg-gray-200" />

      {}
      <div className="space-y-9 relative z-10">
        {steps.map((label, idx) => {
          const stepNum = idx + 1;
          const isCompleted = currentStep > stepNum;
          const isCurrent = currentStep === stepNum;

          return (
            <div key={label} className="flex gap-4">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ring-4 ring-white text-[13px] font-bold",
                  isCompleted
                    ? "bg-[#10B981] text-white"
                    : isCurrent
                    ? "bg-white border-2 border-blue-600 text-blue-600"
                    : "bg-white border border-gray-200 text-gray-300"
                )}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4" strokeWidth={3} />
                ) : (
                  stepNum
                )}
              </div>
              <div className="pt-1">
                <h4
                  className={cn(
                    "text-[14px] leading-none",
                    isCompleted || isCurrent ? "font-medium text-gray-900" : "font-medium text-gray-400"
                  )}
                >
                  {label}
                </h4>
                <p
                  className={cn(
                    "text-[13px] mt-1 leading-relaxed",
                    isCompleted || isCurrent ? "text-gray-500" : "text-gray-300"
                  )}
                >
                  {descriptions[label] || ""}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
