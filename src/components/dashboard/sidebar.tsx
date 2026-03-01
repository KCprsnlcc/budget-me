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
                  <Skeleton width={60} height={8} />
                </div>
                {group.items.map((item) => (
                  <div key={item.module}>
                    <div className="flex items-center gap-3 px-3 py-1.5">
                      <Skeleton width={16} height={16} borderRadius={4} />
                      <Skeleton width={80} height={12} />
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

            {/* AI Usage Skeleton */}
            <div className="mt-auto px-2 mb-4">
              <div className="bg-slate-50 rounded-lg border border-slate-200/60 p-2.5">
                <div className="flex items-center gap-1.5 mb-1">
                  <Skeleton width={12} height={12} borderRadius={4} />
                  <div className="flex-1">
                    <Skeleton width={50} height={8} className="mb-0.5" />
                    <Skeleton width={70} height={8} />
                  </div>
                </div>
                <Skeleton height={5} borderRadius={3} className="mb-1" />
                <div className="flex justify-between mb-1">
                  <Skeleton width={50} height={8} />
                  <Skeleton width={40} height={8} />
                </div>
                <div className="pt-1 border-t border-slate-200/50 grid grid-cols-3 gap-1">
                  <div className="text-center">
                    <Skeleton width={12} height={7} className="mx-auto mb-0.5" />
                    <Skeleton width={35} height={7} className="mx-auto" />
                  </div>
                  <div className="text-center border-l border-slate-200/50">
                    <Skeleton width={12} height={7} className="mx-auto mb-0.5" />
                    <Skeleton width={30} height={7} className="mx-auto" />
                  </div>
                  <div className="text-center border-l border-slate-200/50">
                    <Skeleton width={12} height={7} className="mx-auto mb-0.5" />
                    <Skeleton width={32} height={7} className="mx-auto" />
                  </div>
                </div>
              </div>
            </div>
          </nav>

          {/* User Profile Skeleton */}
          <div className="p-3 border-t border-slate-200/50">
            <div className="flex items-center gap-2.5">
              <Skeleton width={28} height={28} circle />
              <div className="flex-1 overflow-hidden">
                <Skeleton width={100} height={12} className="mb-0.5" />
                <Skeleton width={120} height={10} />
              </div>
              <Skeleton width={16} height={16} borderRadius={4} />
            </div>
          </div>
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
