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
                    ? "bg-gray-50 border border-gray-200 hover:bg-gray-100"
                    : "bg-gray-50 border border-gray-200 cursor-not-allowed opacity-70",
                className
            )}
        >
            <input
                type="checkbox"
                id={id}
                checked={checked}
                onChange={(e) => !disabled && onChange(e.target.checked)}
                disabled={disabled}
                className="h-5 w-5 accent-emerald-500 border-gray-300 rounded flex-shrink-0"
            />

            <div className={cn("flex items-center gap-2 select-none flex-1 font-medium text-sm", disabled ? "text-gray-400" : "text-gray-700")}>
                {icon && <span className={disabled ? "text-gray-400 opacity-70" : (checked ? "text-emerald-600" : "text-gray-500")}>{icon}</span>}
                {label}
            </div>
        </label>
    );
}
