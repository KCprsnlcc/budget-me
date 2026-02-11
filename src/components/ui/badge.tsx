import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded px-2 py-0.5 text-[10px] font-medium",
  {
    variants: {
      variant: {
        success:
          "bg-emerald-500/10 text-emerald-700 border border-emerald-500/20",
        warning:
          "bg-amber-500/10 text-amber-700 border border-amber-500/20",
        danger:
          "bg-red-500/10 text-red-600 border border-red-500/20",
        info:
          "bg-blue-500/10 text-blue-600 border border-blue-500/20",
        neutral:
          "bg-slate-100 text-slate-600 border border-slate-200",
        brand:
          "bg-gradient-to-r from-emerald-500/10 to-teal-500/10 text-emerald-600 border border-emerald-500/20",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, className }))} {...props} />
  );
}
