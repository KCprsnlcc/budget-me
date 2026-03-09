"use client";

import { Check } from "lucide-react";

interface StepperProps {
  steps: string[];
  currentStep: number;
}

export function Stepper({ steps, currentStep }: StepperProps) {
  return (
    <div className="px-5 py-4 bg-white border-b border-gray-100">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isCompleted = stepNumber < currentStep;

          return (
            <div key={step} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isCompleted
                      ? "bg-emerald-500 text-white"
                      : isActive
                      ? "bg-emerald-500 text-white ring-4 ring-emerald-100"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {isCompleted ? <Check size={14} /> : stepNumber}
                </div>
                <span
                  className={`text-[10px] font-medium mt-1.5 uppercase tracking-wider ${
                    isActive ? "text-gray-900" : "text-gray-400"
                  }`}
                >
                  {step}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`h-px flex-1 mx-2 transition-all ${
                    isCompleted ? "bg-emerald-500" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
