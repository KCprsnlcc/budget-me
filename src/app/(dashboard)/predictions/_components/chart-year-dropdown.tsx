"use client";

import { useState, useRef, useEffect } from "react";
import { Calendar, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChartYearDropdownProps {
  value: string;
  onChange: (value: string) => void;
  years: number[];
}

export function ChartYearDropdown({ value, onChange, years }: ChartYearDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (yearValue: string) => {
    onChange(yearValue);
    setIsOpen(false);
  };

  const displayText = value === "" || value === "all" ? "All Years" : value;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 sm:gap-1.5 px-2 py-1 rounded hover:bg-slate-50 transition-colors cursor-pointer"
      >
        <Calendar size={12} className="sm:w-3.5 sm:h-3.5 text-slate-500" />
        <span className="text-[9px] sm:text-[10px] font-medium text-slate-500">{displayText}</span>
        <ChevronDown size={10} className="sm:w-3 sm:h-3 text-slate-400" />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[100px]">
          <button
            type="button"
            className="w-full px-3 py-2 text-left text-[10px] sm:text-xs hover:bg-gray-50 transition-colors flex items-center gap-2 text-gray-600"
            onClick={() => handleSelect("")}
          >
            <Calendar size={14} className="text-gray-400" />
            All Years
          </button>
          {years.map((year) => (
            <button
              key={year}
              type="button"
              className={cn(
                "w-full px-3 py-2 text-left text-[10px] sm:text-xs hover:bg-gray-50 transition-colors flex items-center gap-2",
                value === year.toString() 
                  ? "bg-white text-emerald-700 border-l-2 border-emerald-500" 
                  : "text-gray-600"
              )}
              onClick={() => handleSelect(year.toString())}
            >
              <Calendar size={14} className={value === year.toString() ? "text-emerald-500" : "text-gray-400"} />
              {year}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
