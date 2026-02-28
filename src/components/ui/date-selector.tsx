"use client";

import { useState, useEffect, useRef } from "react";
import { Calendar, ChevronDown } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

interface DateSelectorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function DateSelector({ 
  value, 
  onChange, 
  placeholder = "Select date", 
  disabled = false,
  className 
}: DateSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showMonthSelector, setShowMonthSelector] = useState(false);
  const [showYearSelector, setShowYearSelector] = useState(false);
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

  useEffect(() => {
    if (value) {
      setSelectedDate(new Date(value + "T00:00:00"));
    } else {
      setSelectedDate(null);
    }
  }, [value]);

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const handleDateSelect = (day: number) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    setSelectedDate(newDate);
    onChange(formatDate(newDate));
    setIsOpen(false);
  };

  const handlePreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];
    const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

    // Add empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-6"></div>);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isSelected = selectedDate && 
        selectedDate.getDate() === day &&
        selectedDate.getMonth() === currentMonth.getMonth() &&
        selectedDate.getFullYear() === currentMonth.getFullYear();
      
      const isToday = new Date().getDate() === day &&
        new Date().getMonth() === currentMonth.getMonth() &&
        new Date().getFullYear() === currentMonth.getFullYear();

      days.push(
        <button
          key={day}
          type="button"
          onClick={() => handleDateSelect(day)}
          className={cn(
            "h-6 w-6 rounded text-xs font-medium transition-colors hover:bg-slate-100",
            isSelected && "bg-emerald-500 text-white hover:bg-emerald-600",
            isToday && !isSelected && "bg-slate-100 text-slate-900",
            !isSelected && !isToday && "text-slate-700"
          )}
        >
          {day}
        </button>
      );
    }

    return { weekDays, days };
  };

  const handleMonthSelect = (month: number) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), month, 1));
    setShowMonthSelector(false);
  };

  const handleYearSelect = (year: number) => {
    setCurrentMonth(new Date(year, currentMonth.getMonth(), 1));
    setShowYearSelector(false);
  };

  const getMonths = () => [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  const getYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear - 50; i <= currentYear + 10; i++) {
      years.push(i);
    }
    return years;
  };

  const { weekDays, days } = renderCalendar();
  const monthYear = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      <Button
        type="button"
        variant="outline"
        className="w-full justify-between text-left font-normal h-10 px-3 py-2"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
      >
        <span className={cn(!value && "text-slate-500")}>
          {selectedDate ? selectedDate.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
          }) : placeholder}
        </span>
        <Calendar className="ml-2 h-4 w-4 opacity-50" />
      </Button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-slate-200 rounded-lg shadow-sm p-3">
          {showMonthSelector ? (
            // Month Selector
            <div className="grid grid-cols-3 gap-1">
              {getMonths().map((month, index) => (
                <button
                  key={month}
                  type="button"
                  onClick={() => handleMonthSelect(index)}
                  className={cn(
                    "px-2 py-1 text-xs rounded hover:bg-slate-100 transition-colors",
                    currentMonth.getMonth() === index && "bg-emerald-500 text-white hover:bg-emerald-600"
                  )}
                >
                  {month}
                </button>
              ))}
            </div>
          ) : showYearSelector ? (
            // Year Selector
            <div className="grid grid-cols-4 gap-1 max-h-32 overflow-y-auto">
              {getYears().map((year) => (
                <button
                  key={year}
                  type="button"
                  onClick={() => handleYearSelect(year)}
                  className={cn(
                    "px-2 py-1 text-xs rounded hover:bg-slate-100 transition-colors",
                    currentMonth.getFullYear() === year && "bg-emerald-500 text-white hover:bg-emerald-600"
                  )}
                >
                  {year}
                </button>
              ))}
            </div>
          ) : (
            // Calendar View
            <div className="space-y-2">
              {/* Header */}
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={handlePreviousMonth}
                  className="p-1 hover:bg-slate-100 rounded text-slate-600"
                >
                  ◀
                </button>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setShowMonthSelector(true)}
                    className="text-sm font-medium text-slate-900 hover:text-emerald-600 transition-colors"
                  >
                    {currentMonth.toLocaleDateString('en-US', { month: 'short' })}
                  </button>
                  <span className="text-slate-400 text-sm">,</span>
                  <button
                    type="button"
                    onClick={() => setShowYearSelector(true)}
                    className="text-sm font-medium text-slate-900 hover:text-emerald-600 transition-colors"
                  >
                    {currentMonth.getFullYear()}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="p-1 hover:bg-slate-100 rounded text-slate-600"
                >
                  ▶
                </button>
              </div>

              {/* Week Days */}
              <div className="grid grid-cols-7 gap-1">
                {weekDays.map((day, index) => (
                  <div key={`weekday-${index}`} className="h-6 flex items-center justify-center text-[10px] font-medium text-slate-400">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-1">
                {days}
              </div>

              {/* Today Button */}
              <div className="pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    const today = new Date();
                    setCurrentMonth(today);
                    handleDateSelect(today.getDate());
                  }}
                  className="w-full py-1 text-xs text-emerald-600 hover:text-emerald-700 transition-colors"
                >
                  Today
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
