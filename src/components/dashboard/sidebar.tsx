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
        <aside className="w-56 lg:w-64 bg-white text-slate-600 flex-col border-r border-slate-200 hidden md:flex shrink-0 transition-all duration-300 z-30 animate-fade-in">
          {/* Navigation */}
          <nav className="flex flex-col flex-1 overflow-y-auto py-3 lg:py-4 px-2 gap-0.5 no-scrollbar">
            {DASHBOARD_NAV.map((group, index) => (
              <div key={group.label}>
                <div className="px-2 text-[9px] lg:text-[10px] font-medium text-slate-500 uppercase tracking-widest mb-1.5 lg:mb-2 mt-4 lg:mt-5 first:mt-0">
                  <Skeleton width={50} height={8} className="lg:w-[60px]" />
                </div>
                {group.items.map((item) => (
                  <div key={item.module}>
                    <div className="flex items-center gap-2.5 lg:gap-3 px-2.5 lg:px-3 py-1.5">
                      <Skeleton width={14} height={14} borderRadius={4} className="lg:w-4 lg:h-4" />
                      <Skeleton width={70} height={11} className="lg:w-20 lg:h-3" />
                    </div>
                  </div>
                ))}
                {/* Add divider after Platform group */}
                {index === 0 && (
                  <div className="mx-2 my-3 lg:my-4 h-px bg-slate-200" />
                )}
                {/* Add divider after Intelligence group */}
                {index === 1 && (
                  <div className="mx-2 my-3 lg:my-4 h-px bg-slate-200" />
                )}
              </div>
            ))}

            {/* AI Usage Skeleton */}
            <div className="mt-auto px-2 mb-3 lg:mb-4">
              <div className="bg-slate-50 rounded-lg border border-slate-200/60 p-2 lg:p-2.5">
                <div className="flex items-center gap-1.5 mb-1">
                  <Skeleton width={11} height={11} borderRadius={4} className="lg:w-3 lg:h-3" />
                  <div className="flex-1">
                    <Skeleton width={45} height={7} className="mb-0.5 lg:w-[50px] lg:h-2" />
                    <Skeleton width={60} height={7} className="lg:w-[70px] lg:h-2" />
                  </div>
                </div>
                <Skeleton height={4} borderRadius={3} className="mb-1 lg:h-[5px]" />
                <div className="flex justify-between mb-1">
                  <Skeleton width={45} height={7} className="lg:w-[50px] lg:h-2" />
                  <Skeleton width={35} height={7} className="lg:w-10 lg:h-2" />
                </div>
                <div className="pt-1 border-t border-slate-200/50 grid grid-cols-3 gap-0.5 lg:gap-1">
                  <div className="text-center">
                    <Skeleton width={10} height={6} className="mx-auto mb-0.5 lg:w-3 lg:h-[7px]" />
                    <Skeleton width={30} height={6} className="mx-auto lg:w-[35px] lg:h-[7px]" />
                  </div>
                  <div className="text-center border-l border-slate-200/50">
                    <Skeleton width={10} height={6} className="mx-auto mb-0.5 lg:w-3 lg:h-[7px]" />
                    <Skeleton width={25} height={6} className="mx-auto lg:w-[30px] lg:h-[7px]" />
                  </div>
                  <div className="text-center border-l border-slate-200/50">
                    <Skeleton width={10} height={6} className="mx-auto mb-0.5 lg:w-3 lg:h-[7px]" />
                    <Skeleton width={28} height={6} className="mx-auto lg:w-8 lg:h-[7px]" />
                  </div>
                </div>
              </div>
            </div>
          </nav>

          {/* User Profile Skeleton */}
          <div className="p-2.5 lg:p-3 border-t border-slate-200/50">
            <div className="flex items-center gap-2 lg:gap-2.5">
              <Skeleton width={26} height={26} circle className="lg:w-7 lg:h-7" />
              <div className="flex-1 overflow-hidden">
                <Skeleton width={90} height={11} className="mb-0.5 lg:w-[100px] lg:h-3" />
                <Skeleton width={110} height={9} className="lg:w-[120px] lg:h-[10px]" />
              </div>
              <Skeleton width={14} height={14} borderRadius={4} className="lg:w-4 lg:h-4" />
            </div>
          </div>
        </aside>
      </SkeletonTheme>
    );
  }

  return (
    <aside className="w-64 bg-white text-slate-600 flex-col border-r border-slate-200 hidden md:flex shrink-0 transition-all duration-300 z-30 overscroll-contain">
      {/* Navigation */}
      <nav className="flex flex-col flex-1 overflow-y-auto py-4 px-2 gap-0.5 no-scrollbar overscroll-contain">
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
