import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center text-[10px] font-medium",
  {
    variants: {
      variant: {
        success:
          "text-emerald-700",
        warning:
          "text-amber-700",
        danger:
          "text-red-600",
        info:
          "text-blue-600",
        neutral:
          "text-slate-600",
        brand:
          "text-emerald-600",
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
