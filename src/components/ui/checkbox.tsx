"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface CheckboxProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    id?: string;
    disabled?: boolean;
    label: ReactNode;
    icon?: ReactNode;
    className?: string;
}

export function Checkbox({
    checked,
    onChange,
    id,
    disabled = false,
    label,
    icon,
    className
}: CheckboxProps) {
    return (
        <label
            htmlFor={id}
            className={cn(
                "flex items-center gap-3 w-full px-3 py-2.5 min-h-10 text-[13px] border rounded-lg transition-all",
                !disabled
                    ? "cursor-pointer bg-white border-slate-200 hover:border-slate-300 focus-within:border-emerald-500 focus-within:ring-[3px] focus-within:ring-emerald-500/[0.06]"
                    : "bg-slate-50 border-slate-200 cursor-not-allowed opacity-70",
                checked && !disabled ? "bg-emerald-50/30 border-emerald-200" : "",
                className
            )}
        >
            <div className={cn(
                "w-4 h-4 flex-shrink-0 rounded border flex items-center justify-center transition-colors",
                checked
                    ? "bg-emerald-500 border-emerald-500 text-white"
                    : "bg-white border-slate-300",
                disabled && checked ? "bg-emerald-400 border-emerald-400" : "",
                disabled && !checked ? "bg-slate-100 border-slate-200" : "",
                !disabled && !checked ? "group-hover:border-emerald-400" : ""
            )}>
                <Check size={12} strokeWidth={3} className={cn("transition-transform duration-200", checked ? "scale-100" : "scale-0")} />
            </div>

            <input
                type="checkbox"
                id={id}
                checked={checked}
                onChange={(e) => !disabled && onChange(e.target.checked)}
                disabled={disabled}
                className="sr-only"
            />

            <div className={cn("flex items-center gap-2 select-none flex-1 font-medium", disabled ? "text-slate-400" : "text-slate-700")}>
                {icon && <span className={disabled ? "text-slate-400 opacity-70" : (checked ? "text-emerald-600" : "text-slate-500")}>{icon}</span>}
                {label}
            </div>
        </label>
    );
}
