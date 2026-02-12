import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  variant?: "light" | "dark" | "icon";
  className?: string;
  size?: "sm" | "md" | "lg";
}

const LOGO_MAP = {
  light: "/logos/BudgetMe-logo.svg",
  dark: "/logos/BudgetMe-logo.svg",
  icon: "/logos/BudgetMe-logo.svg",
} as const;

const SIZE_MAP = {
  sm: { width: 100, height: 28, className: "h-7 w-auto" },
  md: { width: 140, height: 40, className: "h-10 w-auto" },
  lg: { width: 180, height: 56, className: "h-14 w-auto" },
} as const;

export function Logo({ variant = "light", className, size = "md" }: LogoProps) {
  const sizeConfig = SIZE_MAP[size];

  return (
    <Image
      src={LOGO_MAP[variant]}
      alt="BudgetMe"
      width={sizeConfig.width}
      height={sizeConfig.height}
      className={cn(sizeConfig.className, className)}
      priority
    />
  );
}
