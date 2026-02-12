"use client";

import { useCallback, useState, useRef, useEffect } from "react";
import { Check, Monitor, ChevronDown } from "lucide-react";
import type { AIModel } from "./types";

interface ModelSelectorDropdownProps {
  selectedModel: string;
  onSelectModel: (modelId: string) => void;
  models: AIModel[];
}

export function ModelSelectorDropdown({
  selectedModel,
  onSelectModel,
  models,
}: ModelSelectorDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentModel = models.find((m) => m.id === selectedModel) || models[0];

  const handleSelect = useCallback(
    (modelId: string) => {
      onSelectModel(modelId);
      setIsOpen(false);
    },
    [onSelectModel]
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg transition-colors text-xs font-medium text-slate-600 group"
      >
        <Monitor
          size={14}
          className="text-slate-400 group-hover:text-emerald-500 transition-colors"
        />
        <span>{currentModel.name}</span>
        <ChevronDown
          size={14}
          className={`text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-slate-200 rounded-lg shadow-lg z-50 overflow-hidden">
          {/* Header */}
          <div className="px-3 py-2 bg-slate-50 border-b border-slate-100">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Select Model
            </span>
          </div>

          {/* Model Options */}
          <div className="max-h-64 overflow-y-auto">
            {models.map((model) => {
              const isSelected = selectedModel === model.id;
              return (
                <button
                  key={model.id}
                  onClick={() => handleSelect(model.id)}
                  className={`w-full p-3 text-left transition-colors border-l-2 ${
                    isSelected
                      ? "border-emerald-500 bg-emerald-50/50"
                      : "border-transparent group"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Monitor
                        size={14}
                        className={`transition-colors ${
                          isSelected
                            ? "text-emerald-500"
                            : "text-slate-400 group-hover:text-emerald-500"
                        }`}
                      />
                      <div>
                        <div
                          className={`text-xs font-semibold transition-colors ${
                            isSelected
                              ? "text-slate-900"
                              : "text-slate-900 group-hover:text-emerald-500"
                          }`}
                        >
                          {model.name}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {model.description}
                        </div>
                      </div>
                    </div>
                    {isSelected && <Check size={16} className="text-emerald-500" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
