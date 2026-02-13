"use client";

import { usePathname } from "next/navigation";
import { Menu, ChevronRight, Calendar, Download, LogOut, User, ChevronDown } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth/auth-context";
import { useState, useEffect, useRef, useTransition } from "react";

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
  const { user, signOut } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSigningOut, startSignOut] = useTransition();
  const userMenuRef = useRef<HTMLDivElement>(null);
  const pageMeta = PAGE_TITLES[pathname] || { category: "Platform", title: "Dashboard" };

  // Close dropdown when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsUserMenuOpen(false);
      }
    };

    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isUserMenuOpen]);

  
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

        {/* User Menu */}
        {user && (
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors min-h-[44px] cursor-pointer"
              aria-label="User menu"
              aria-expanded={isUserMenuOpen}
            >
              <UserAvatar user={user} size="md" />
              <div className="hidden md:block text-left">
                <div className="text-xs font-medium text-slate-700 truncate max-w-[120px]">
                  {user.user_metadata?.full_name || user.email || "User"}
                </div>
                <div className="text-[10px] text-slate-500 truncate max-w-[120px]">
                  {user.email}
                </div>
              </div>
              <ChevronDown size={14} className="text-slate-400" />
            </button>

            {/* Dropdown */}
            {isUserMenuOpen && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setIsUserMenuOpen(false)}
                />
                {/* Menu */}
                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg border border-slate-200 shadow-lg z-40 py-1">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <UserAvatar user={user} size="sm" />
                      <div className="text-left">
                        <div className="text-xs font-medium text-slate-700 truncate">
                          {user.user_metadata?.full_name || user.email || "User"}
                        </div>
                        <div className="text-[10px] text-slate-500 truncate">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      startSignOut(async () => {
                        await signOut();
                      });
                    }}
                    disabled={isSigningOut}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSigningOut ? (
                      <>
                        <div className="w-3 h-3 border border-slate-600 border-t-transparent rounded-full animate-spin" />
                        Signing out...
                      </>
                    ) : (
                      <>
                        <LogOut size={14} />
                        Sign out
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
