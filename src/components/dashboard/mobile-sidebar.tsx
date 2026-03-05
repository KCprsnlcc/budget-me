"use client";

import { X } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { DASHBOARD_NAV } from "@/lib/constants";
import { NavItem } from "./nav-item";
import { AIUsageCard } from "./ai-usage-card";
import { UserProfileCard } from "./user-profile-card";
import { useAuth } from "@/components/auth/auth-context";
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { useState, useEffect } from "react";

interface MobileSidebarProps {
  open: boolean;
  onClose: () => void;
}

export function MobileSidebar({ open, onClose }: MobileSidebarProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  // Simulate loading state on component mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800); // Same as sidebar for synchronization

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        data-lenis-prevent
        className={`fixed left-0 top-0 bottom-0 w-[280px] sm:w-72 bg-white text-slate-600 flex flex-col border-r border-slate-200 z-50 transition-transform duration-300 md:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="h-12 sm:h-14 flex items-center px-3 sm:px-4 border-b border-slate-200/50 shrink-0">
          <Logo variant="landing" size="md" className="h-5 sm:h-6" />
          <button
            className="ml-auto text-slate-400 hover:text-slate-600 active:text-slate-700 p-1.5 sm:p-2 cursor-pointer transition-colors rounded-lg hover:bg-slate-50 active:bg-slate-100 min-w-[40px] min-h-[40px] sm:min-w-[44px] sm:min-h-[44px] flex items-center justify-center touch-manipulation"
            onClick={onClose}
            aria-label="Close menu"
          >
            <X size={18} className="sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 sm:py-4 px-2 no-scrollbar overscroll-contain">
          {DASHBOARD_NAV.map((group) => (
            <div key={group.label}>
              <div className="px-2 text-[9px] sm:text-[10px] font-medium text-slate-500 uppercase tracking-widest mb-1.5 sm:mb-2 mt-4 sm:mt-5 first:mt-0">
                {loading ? <Skeleton width={70} height={10} className="sm:w-20" /> : group.label}
              </div>
              {group.items.map((item) => (
                loading ? (
                  <div key={item.module} className="mb-1.5 sm:mb-2">
                    <div className="flex items-center gap-2.5 sm:gap-3 px-2.5 sm:px-3 py-1.5">
                      <Skeleton width={16} height={16} borderRadius={4} className="sm:w-[18px] sm:h-[18px]" />
                      <Skeleton width={90} height={12} className="sm:w-24" />
                    </div>
                  </div>
                ) : (
                  <NavItem
                    key={item.module}
                    label={item.label}
                    href={item.href}
                    icon={item.icon}
                    badge={item.badge}
                    dot={item.dot}
                    onClick={onClose}
                  />
                )
              ))}
            </div>
          ))}

          {/* AI Usage */}
          <div className="mt-6 sm:mt-8 px-2">
            {loading ? (
              <div className="bg-slate-50 rounded-lg border border-slate-200/60 p-2.5 sm:p-3">
                <div className="flex items-center justify-between mb-2 sm:mb-2.5">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <div className="text-emerald-600">
                      <Skeleton width={12} height={12} borderRadius={4} className="sm:w-[14px] sm:h-[14px]" />
                    </div>
                    <div>
                      <div className="text-[8px] sm:text-[9px] font-bold text-slate-900 uppercase tracking-wider">
                        <Skeleton width={50} height={10} className="sm:w-[60px]" />
                      </div>
                      <div className="text-[8px] sm:text-[9px] text-slate-500">
                        <Skeleton width={70} height={9} className="sm:w-20" />
                      </div>
                    </div>
                  </div>
                </div>
                <Skeleton height={6} borderRadius={4} className="mb-1.5 sm:mb-2 sm:h-2" />
                <div className="flex justify-between items-center text-[8px] sm:text-[9px]">
                  <Skeleton width={80} height={9} className="sm:w-24" />
                  <Skeleton width={50} height={9} className="sm:w-[60px]" />
                </div>
              </div>
            ) : (
              <AIUsageCard />
            )}
          </div>
        </nav>

        {/* User Profile */}
        {loading ? (
          <div className="p-3 sm:p-4 border-t border-slate-200/50 shrink-0">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <Skeleton width={28} height={28} borderRadius={50} className="sm:w-8 sm:h-8" />
              <div className="flex-1 overflow-hidden">
                <div className="text-sm font-medium text-slate-700 truncate mb-1">
                  <Skeleton width={100} height={14} className="sm:w-32" />
                </div>
                <div className="text-[11px] text-slate-500 truncate">
                  <Skeleton width={120} height={11} className="sm:w-40" />
                </div>
              </div>
              <button
                disabled={true}
                className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer min-w-[40px] min-h-[40px] sm:min-w-[44px] sm:min-h-[44px] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Sign out"
              >
                <Skeleton width={16} height={16} borderRadius={4} className="sm:w-[18px] sm:h-[18px]" />
              </button>
            </div>
          </div>
        ) : (
          <UserProfileCard />
        )}
      </aside>
    </>
  );
}
