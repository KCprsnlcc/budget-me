import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const fillVariants = cva("h-full rounded-full transition-all duration-500", {
  variants: {
    color: {
      success: "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]",
      warning: "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.4)]",
      danger: "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)]",
      info: "bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.4)]",
      brand: "bg-emerald-500",
    },
  },
  defaultVariants: {
    color: "brand",
  },
});

interface ProgressBarProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "color"> {
  value: number;
  max?: number;
  color?: "success" | "warning" | "danger" | "info" | "brand" | null;
}

export function ProgressBar({
  value,
  max = 100,
  color,
  className,
  ...props
}: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div
      className={cn(
        "w-full h-1.5 bg-slate-100 rounded-full overflow-hidden",
        className
      )}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      {...props}
    >
      <div
        className={cn(fillVariants({ color }))}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}
