"use client";

import { usePathname } from "next/navigation";
import { Menu, ChevronRight, Calendar, Download } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";

const PAGE_TITLES: Record<string, { category: string; title: string }> = {
  "/dashboard": { category: "Platform", title: "Dashboard" },
  "/transactions": { category: "Platform", title: "Transactions" },
  "/budgets": { category: "Platform", title: "Budgets" },
  "/goals": { category: "Platform", title: "Financial Goals" },
  "/predictions": { category: "Platform", title: "AI Predictions" },
  "/reports": { category: "Platform", title: "Financial Reports" },
  "/chatbot": { category: "Intelligence", title: "BudgetSense AI" },
  "/family": { category: "Settings", title: "Family" },
  "/settings": { category: "Settings", title: "Settings" },
  "/accounts": { category: "Platform", title: "Accounts" },
};

interface HeaderProps {
  onMobileMenuOpen: () => void;
}

export function Header({ onMobileMenuOpen }: HeaderProps) {
  const pathname = usePathname();
  const pageMeta = PAGE_TITLES[pathname] || { category: "Platform", title: "Dashboard" };

  return (
    <header className="h-14 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-4 md:px-6 shrink-0 z-20 sticky top-0">
      <div className="flex items-center gap-2 md:gap-4">
        {/* Mobile menu */}
        <button
          className="md:hidden text-slate-500 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-50 cursor-pointer"
          onClick={onMobileMenuOpen}
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>

        {/* Breadcrumb */}
        <nav className="flex items-center text-xs text-slate-500 overflow-hidden">
          <Logo variant="icon" size="sm" className="h-4 w-auto shrink-0" />
          <ChevronRight size={12} className="mx-1 md:mx-2 text-slate-400 hidden sm:block" />
          <span className="hover:text-slate-800 cursor-pointer hidden sm:block">
            {pageMeta.category}
          </span>
          <ChevronRight size={12} className="mx-1 md:mx-2 text-slate-400" />
          <span className="font-medium text-slate-800 truncate">
            {pageMeta.title}
          </span>
        </nav>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        {/* Date Filters */}
        <div className="hidden lg:flex items-center bg-slate-50 border border-slate-200 rounded-lg p-0.5">
          <button className="px-2.5 py-1 text-[10px] font-medium text-slate-500 hover:text-slate-900 rounded-md hover:bg-white transition-all cursor-pointer">
            All
          </button>
          <button className="px-2.5 py-1 text-[10px] font-medium text-slate-900 bg-white shadow-sm border border-slate-200 rounded-md transition-all cursor-pointer">
            Month
          </button>
          <div className="h-3 w-px bg-slate-200 mx-1" />
          <button className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-medium text-slate-500 hover:text-slate-900 rounded-md hover:bg-white transition-all cursor-pointer">
            <Calendar size={12} />
          </button>
        </div>

        <div className="h-4 w-px bg-slate-200 mx-1 hidden sm:block" />

        {/* Export */}
        <Button variant="outline" size="sm" className="text-emerald-700 bg-emerald-50/50 border-emerald-200/60 hover:bg-emerald-50 hover:border-emerald-200">
          <Download size={16} />
          <span className="hidden md:inline text-[11px]">Export</span>
        </Button>
      </div>
    </header>
  );
}
