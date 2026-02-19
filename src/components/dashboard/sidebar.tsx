"use client";

import { DASHBOARD_NAV } from "@/lib/constants";
import { NavItem } from "./nav-item";
import { AIUsageCard } from "./ai-usage-card";
import { UserProfileCard } from "./user-profile-card";
import { useAuth } from "@/components/auth/auth-context";
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { useState, useEffect } from "react";

export function Sidebar() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  // Simulate loading state on component mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800); // 0.8 seconds loading time

    return () => clearTimeout(timer);
  }, []);

  if (!user || loading) {
    return (
      <SkeletonTheme baseColor="#f1f5f9" highlightColor="#e2e8f0">
        <aside className="w-64 bg-white text-slate-600 flex-col border-r border-slate-200 hidden md:flex shrink-0 transition-all duration-300 z-30 animate-fade-in">
          {/* Navigation */}
          <nav className="flex flex-col flex-1 overflow-y-auto py-4 px-2 gap-0.5 no-scrollbar">
            {DASHBOARD_NAV.map((group, index) => (
              <div key={group.label}>
                <div className="px-2 text-[10px] font-medium text-slate-500 uppercase tracking-widest mb-2 mt-5 first:mt-0">
                  <Skeleton width={80} height={12} />
                </div>
                {group.items.map((item) => (
                  <div key={item.module} className="mb-2">
                    <div className="flex items-center gap-3 px-3 py-1.5">
                      <Skeleton width={18} height={18} borderRadius={4} />
                      <Skeleton width={100} height={14} />
                    </div>
                  </div>
                ))}
                {/* Add divider after Platform group */}
                {index === 0 && (
                  <div className="mx-2 my-4 h-px bg-slate-200" />
                )}
                {/* Add divider after Intelligence group */}
                {index === 1 && (
                  <div className="mx-2 my-4 h-px bg-slate-200" />
                )}
              </div>
            ))}

            {/* AI Usage */}
            <div className="mt-auto px-2 mb-4">
              {loading ? (
                <div className="bg-slate-50 rounded-xl border border-slate-200/60 p-3">
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-2">
                      <div className="text-emerald-600">
                        <Skeleton width={14} height={14} borderRadius={4} />
                      </div>
                      <div>
                        <div className="text-[9px] font-bold text-slate-900 uppercase tracking-wider">
                          <Skeleton width={60} height={12} />
                        </div>
                        <div className="text-[9px] text-slate-500">
                          <Skeleton width={80} height={10} />
                        </div>
                      </div>
                    </div>
                  </div>
                  <Skeleton height={8} borderRadius={4} className="mb-2" />
                  <div className="flex justify-between items-center text-[9px]">
                    <Skeleton width={100} height={10} />
                    <Skeleton width={60} height={10} />
                  </div>
                </div>
              ) : (
                <AIUsageCard />
              )}
            </div>
          </nav>

          {/* User Profile */}
          {loading ? (
            <div className="p-4 border-t border-slate-200/50">
              <div className="flex items-center gap-3">
                <Skeleton width={32} height={32} borderRadius={50} />
                <div className="flex-1 overflow-hidden">
                  <div className="text-sm font-medium text-slate-700 truncate mb-1">
                    <Skeleton width={120} height={16} />
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">
                    <Skeleton width={150} height={12} />
                  </div>
                </div>
                <button
                  disabled={true}
                  className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Sign out"
                >
                  <Skeleton width={18} height={18} borderRadius={4} />
                </button>
              </div>
            </div>
          ) : (
            <UserProfileCard />
          )}
        </aside>
      </SkeletonTheme>
    );
  }

  return (
    <aside className="w-64 bg-white text-slate-600 flex-col border-r border-slate-200 hidden md:flex shrink-0 transition-all duration-300 z-30">
      {/* Navigation */}
      <nav className="flex flex-col flex-1 overflow-y-auto py-4 px-2 gap-0.5 no-scrollbar">
        {DASHBOARD_NAV.map((group, index) => (
          <div key={group.label}>
            <div className="px-2 text-[10px] font-medium text-slate-500 uppercase tracking-widest mb-2 mt-5 first:mt-0">
              {group.label}
            </div>
            {group.items.map((item) => (
              <NavItem
                key={item.module}
                label={item.label}
                href={item.href}
                icon={item.icon}
                badge={item.badge}
                dot={item.dot}
              />
            ))}
            {/* Add divider after Platform group */}
            {index === 0 && (
              <div className="mx-2 my-4 h-px bg-slate-200" />
            )}
            {/* Add divider after Intelligence group */}
            {index === 1 && (
              <div className="mx-2 my-4 h-px bg-slate-200" />
            )}
          </div>
        ))}

        {/* AI Usage */}
        <div className="mt-auto px-2 mb-4">
          <AIUsageCard />
        </div>
      </nav>

      {/* User Profile */}
      <UserProfileCard />
    </aside>
  );
}
