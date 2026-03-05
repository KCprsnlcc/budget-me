"use client";

import { usePathname } from "next/navigation";
import { Menu, ChevronRight, LogOut, User, ChevronDown } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth/auth-context";
import { useState, useEffect, useRef, useTransition } from "react";
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

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
  const [loading, setLoading] = useState(true);

  // Simulate loading state on component mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 600); // 0.6 seconds loading time

    return () => clearTimeout(timer);
  }, []);

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

  if (!user || loading) {
    return (
      <SkeletonTheme baseColor="#f1f5f9" highlightColor="#e2e8f0">
        <header className="h-12 sm:h-14 bg-white border-b border-slate-100 flex items-center justify-between px-3 sm:px-4 md:px-6 shrink-0 z-20 sticky top-0 animate-fade-in">
          <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
            {/* Mobile menu */}
            <Skeleton width={28} height={28} borderRadius={8} className="sm:w-8 sm:h-8" />
            
            {/* Breadcrumb */}
            <nav className="flex items-center text-xs text-slate-500 overflow-hidden min-w-0 flex-1">
              <Skeleton width={14} height={14} className="h-3 sm:h-4 w-auto shrink-0" />
              <Skeleton width={10} height={10} className="mx-1 md:mx-2 text-slate-400 hidden sm:block" />
              <Skeleton width={80} height={12} className="hidden sm:block" />
              <Skeleton width={10} height={10} className="mx-1 md:mx-2 text-slate-400" />
              <Skeleton width={100} height={12} className="sm:w-32" />
            </nav>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 shrink-0">
            {/* User Menu Skeleton */}
            <Skeleton width={100} height={32} borderRadius={8} className="sm:w-32 sm:h-9" />
          </div>
        </header>
      </SkeletonTheme>
    );
  }

  return (
    <header className="h-12 sm:h-14 md:h-14 bg-white border-b border-slate-100 flex items-center justify-between px-3 sm:px-4 md:px-6 shrink-0 z-20 sticky top-0">
      <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
        {/* Mobile menu */}
        <button
          className="md:hidden text-slate-500 w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg hover:bg-slate-50 active:bg-slate-100 cursor-pointer transition-colors touch-manipulation"
          onClick={onMobileMenuOpen}
          aria-label="Open menu"
        >
          <Menu size={18} className="sm:w-5 sm:h-5" />
        </button>

        {/* Breadcrumb */}
        <nav className="flex items-center text-xs text-slate-500 overflow-hidden min-w-0 flex-1">
          <Logo variant="icon" size="sm" className="h-3 sm:h-4 w-auto shrink-0" />
          <ChevronRight size={10} className="mx-1 md:mx-2 text-slate-400 hidden sm:block sm:w-3 sm:h-3" />
          <span className="hover:text-slate-800 cursor-pointer hidden sm:block truncate transition-colors">
            {pageMeta.category}
          </span>
          <ChevronRight size={10} className="mx-1 md:mx-2 text-slate-400 sm:w-3 sm:h-3" />
          <span className="font-medium text-slate-800 truncate text-[11px] sm:text-xs">
            {pageMeta.title}
          </span>
        </nav>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 shrink-0">
        {/* User Menu */}
        {user && (
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg hover:bg-slate-50 active:bg-slate-100 transition-colors min-h-[40px] sm:min-h-[44px] cursor-pointer touch-manipulation"
              aria-label="User menu"
              aria-expanded={isUserMenuOpen}
            >
              <UserAvatar user={user} size="sm" className="w-7 h-7 sm:w-8 sm:h-8" />
              <div className="hidden md:block text-left">
                <div className="text-xs font-medium text-slate-700 truncate max-w-[100px] lg:max-w-[120px]">
                  {user.user_metadata?.full_name || user.email || "User"}
                </div>
                <div className="text-[10px] text-slate-500 truncate max-w-[100px] lg:max-w-[120px]">
                  {user.email}
                </div>
              </div>
              <ChevronDown size={12} className="text-slate-400 sm:w-[14px] sm:h-[14px]" />
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
                <div className="absolute right-0 top-full mt-1 w-44 sm:w-48 md:w-52 bg-white rounded-lg border border-slate-200 shadow-lg z-40 py-1">
                  <div className="px-2.5 sm:px-3 py-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <UserAvatar user={user} size="sm" className="w-7 h-7 sm:w-8 sm:h-8" />
                      <div className="text-left flex-1 min-w-0">
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
                    className="w-full flex items-center gap-2 px-2.5 sm:px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 active:bg-slate-100 transition-colors cursor-pointer min-h-[40px] sm:min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
                  >
                    {isSigningOut ? (
                      <SkeletonTheme baseColor="#f1f5f9" highlightColor="#e2e8f0">
                        <>
                          <Skeleton width={12} height={12} circle />
                          Signing out...
                        </>
                      </SkeletonTheme>
                    ) : (
                      <>
                        <LogOut size={13} className="sm:w-[14px] sm:h-[14px]" />
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
