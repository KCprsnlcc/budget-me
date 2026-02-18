"use client";

import { useState, useRef, useEffect } from "react";
import { Search, ChevronDown } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

interface DropdownOption {
  value: string;
  label: string;
  icon?: React.ComponentType<any>;
  color?: string;
}

interface FilterDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: DropdownOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  allowEmpty?: boolean;
  emptyLabel?: string;
  hideSearch?: boolean;
}

export function FilterDropdown({ 
  value, 
  onChange, 
  options, 
  placeholder = "Select option", 
  disabled = false,
  className,
  allowEmpty = true,
  emptyLabel = "All",
  hideSearch = true
}: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  const filteredOptions = hideSearch ? options : options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchTerm("");
  };

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      <Button
        type="button"
        variant="outline"
        className="w-full justify-between text-left font-normal h-10 px-3.5 py-2.5 text-[13px] border border-slate-200 rounded-lg bg-white text-slate-900 transition-all hover:border-slate-300 focus:outline-none focus:border-emerald-500 focus:ring-[3px] focus:ring-emerald-500/[0.06]"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
      >
        <span className={cn(!value && "text-slate-500", "flex items-center gap-2")}>
          {selectedOption?.icon && <selectedOption.icon size={16} />}
          {selectedOption?.label || (allowEmpty && !value ? emptyLabel : placeholder)}
        </span>
        <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
      </Button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg">
          {!hideSearch && (
            <div className="p-3 border-b border-slate-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:border-emerald-500"
                  autoFocus
                />
              </div>
            </div>
          )}

          <div className="max-h-60 overflow-y-auto">
            {allowEmpty && (
              <button
                type="button"
                className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50 transition-colors flex items-center gap-2"
                onClick={() => handleSelect("")}
              >
                {emptyLabel}
              </button>
            )}
            
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-sm text-slate-500 text-center">
                No options found
              </div>
            ) : (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={cn(
                    "w-full px-3 py-2 text-left text-sm hover:bg-slate-50 transition-colors flex items-center gap-2",
                    value === option.value && "bg-emerald-50 text-emerald-700"
                  )}
                  onClick={() => handleSelect(option.value)}
                >
                  {option.icon && <option.icon size={16} />}
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
