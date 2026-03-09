"use client";

import { ADMIN_NAV } from "@/lib/constants";
import { NavItem } from "./nav-item";
import { UserProfileCard } from "@/components/dashboard/user-profile-card";
import { useAuth } from "@/components/auth/auth-context";
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink } from "lucide-react";

export function Sidebar() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  if (!user || loading) {
    return (
      <SkeletonTheme baseColor="#f1f5f9" highlightColor="#e2e8f0">
        <aside className="w-64 bg-white text-slate-600 flex-col border-r border-slate-200 hidden md:flex shrink-0 transition-all duration-300 z-30 animate-fade-in">
          <nav className="flex flex-col flex-1 overflow-y-auto py-4 px-2 gap-0.5 no-scrollbar">
            {ADMIN_NAV.map((group, index) => (
              <div key={group.label}>
                <div className="px-2 text-[10px] font-medium text-slate-500 uppercase tracking-widest mb-2 mt-5 first:mt-0">
                  <Skeleton width={60} height={8} />
                </div>
                {group.items.map((item) => (
                  <div key={item.module}>
                    <div className="flex items-center gap-3 px-3 py-1.5 rounded-md">
                      <Skeleton width={18} height={18} borderRadius={4} />
                      <Skeleton width={90} height={14} />
                    </div>
                  </div>
                ))}
                {index === 0 && (
                  <div className="mx-2 my-4 h-px bg-slate-200" />
                )}
              </div>
            ))}
          </nav>

          <div className="px-3 pb-3">
            <Skeleton width="100%" height={32} borderRadius={8} />
          </div>

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
      <nav className="flex flex-col flex-1 overflow-y-auto py-4 px-2 gap-0.5 no-scrollbar">
        {ADMIN_NAV.map((group, index) => (
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
              />
            ))}
            {(index === 0 || index === 1 || index === 2) && (
              <div className="mx-2 my-4 h-px bg-slate-200" />
            )}
          </div>
        ))}
      </nav>

      <div className="px-3 pb-3">
        <button
          onClick={() => router.push('/dashboard')}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-slate-600 bg-white hover:bg-slate-50 rounded-lg transition-colors border border-slate-200"
        >
          <ExternalLink size={14} />
          Visit User Dashboard
        </button>
      </div>

      <UserProfileCard />
    </aside>
  );
}
