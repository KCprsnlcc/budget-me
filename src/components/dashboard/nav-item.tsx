"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ArrowLeftRight,
  PieChart,
  Flag,
  Wand2,
  BarChart3,
  MessageCircle,
  Bot,
  Users,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const ICON_MAP: Record<string, React.ElementType> = {
  LayoutDashboard,
  ArrowLeftRight,
  PieChart,
  Flag,
  Wand2,
  BarChart3,
  MessageCircle,
  Bot,
  Users,
  Settings,
};

interface NavItemProps {
  label: string;
  href: string;
  icon: string;
  badge?: string;
  dot?: boolean;
  onClick?: () => void;
}

export function NavItem({ label, href, icon, badge, dot, onClick }: NavItemProps) {
  const pathname = usePathname();
  const isActive = pathname === href;
  const Icon = ICON_MAP[icon];

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-2.5 sm:gap-3 px-2.5 sm:px-3 py-1.5 text-[13px] sm:text-sm font-medium rounded-md transition-colors group cursor-pointer min-h-[40px] sm:min-h-[44px] touch-manipulation",
        isActive
          ? "text-slate-800 bg-slate-50 border border-slate-200 shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
          : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 active:bg-slate-100"
      )}
    >
      {Icon && (
        <Icon
          size={16}
          strokeWidth={1.5}
          className={cn(
            "transition-colors sm:w-[18px] sm:h-[18px] shrink-0",
            isActive ? "text-emerald-500" : "group-hover:text-emerald-600"
          )}
        />
      )}
      <span className="flex-1 truncate">{label}</span>
      {badge && (
        <Badge variant="neutral" className="ml-auto text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0.5 text-emerald-600 uppercase !bg-transparent !border-transparent shrink-0">
          {badge}
        </Badge>
      )}
      {dot && (
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 ml-auto shadow-[0_0_8px_rgba(16,185,129,0.5)] shrink-0" />
      )}
    </Link>
  );
}
