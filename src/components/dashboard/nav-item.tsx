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
        "flex items-center gap-3 px-3 py-1.5 text-sm font-medium rounded-md transition-colors group cursor-pointer",
        isActive
          ? "text-slate-800 bg-slate-50 border border-slate-200 shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
          : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
      )}
    >
      {Icon && (
        <Icon
          size={18}
          strokeWidth={1.5}
          className={cn(
            "transition-colors",
            isActive ? "text-emerald-500" : "group-hover:text-emerald-600"
          )}
        />
      )}
      {label}
      {badge && (
        <Badge variant="brand" className="ml-auto text-[10px] px-1.5 py-0.5">
          {badge}
        </Badge>
      )}
      {dot && (
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 ml-auto shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
      )}
    </Link>
  );
}
