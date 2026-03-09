"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

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
                "flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-colors",
                !disabled
                    ? "bg-slate-50 border border-slate-200 hover:bg-slate-100"
                    : "bg-slate-50 border border-slate-200 cursor-not-allowed opacity-70",
                className
            )}
        >
            <input
                type="checkbox"
                id={id}
                checked={checked}
                onChange={(e) => !disabled && onChange(e.target.checked)}
                disabled={disabled}
                className="h-5 w-5 accent-emerald-500 border-slate-300 rounded flex-shrink-0"
            />

            <div className={cn("flex items-center gap-2 select-none flex-1 font-medium text-sm", disabled ? "text-slate-400" : "text-slate-700")}>
                {icon && <span className={disabled ? "text-slate-400 opacity-70" : (checked ? "text-emerald-600" : "text-slate-500")}>{icon}</span>}
                {label}
            </div>
        </label>
    );
}
