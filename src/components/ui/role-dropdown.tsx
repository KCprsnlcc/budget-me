"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

interface RoleOption {
  value: string;
  label: string;
  icon?: React.ComponentType<any>;
  color?: string;
}

interface RoleDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: RoleOption[];
  disabled?: boolean;
  className?: string;
}

export function RoleDropdown({ 
  value, 
  onChange, 
  options, 
  disabled = false,
  className
}: RoleDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      <Button
        type="button"
        variant="outline"
        className="w-full justify-between text-left font-normal h-8 px-3 py-1 text-xs border border-slate-200 rounded-lg bg-white text-slate-600 transition-all hover:border-slate-300 focus:outline-none focus:border-slate-500 focus:ring-[3px] focus:ring-slate-500/[0.06]"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
      >
        <span className="flex items-center gap-2">
          {selectedOption?.icon && <selectedOption.icon size={14} />}
          {selectedOption?.label || "Select role"}
        </span>
        <ChevronDown className="ml-2 h-3 w-3 opacity-50" />
      </Button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg">
          <div className="max-h-60 overflow-y-auto">
            {options.length === 0 ? (
              <div className="px-3 py-2 text-xs text-slate-500 text-center">
                No options found
              </div>
            ) : (
              options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={cn(
                    "w-full px-3 py-2 text-left text-xs hover:bg-slate-50 transition-colors flex items-center gap-2",
                    value === option.value && "bg-slate-100 text-slate-700"
                  )}
                  onClick={() => handleSelect(option.value)}
                >
                  {option.icon && <option.icon size={14} />}
                  <span>{option.label}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
