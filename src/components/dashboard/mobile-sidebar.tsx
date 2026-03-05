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
          className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        data-lenis-prevent
        className={`fixed left-0 top-0 bottom-0 w-64 bg-white text-slate-600 flex flex-col border-r border-slate-200 z-50 transition-transform duration-300 md:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="h-14 flex items-center px-4 border-b border-slate-200/50">
          <Logo variant="landing" size="md" />
          <button
            className="ml-auto text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
            onClick={onClose}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 no-scrollbar">
          {DASHBOARD_NAV.map((group) => (
            <div key={group.label}>
              <div className="px-2 text-[10px] font-medium text-slate-500 uppercase tracking-widest mb-2 mt-5 first:mt-0">
                {loading ? <Skeleton width={80} height={12} /> : group.label}
              </div>
              {group.items.map((item) => (
                loading ? (
                  <div key={item.module} className="mb-2">
                    <div className="flex items-center gap-3 px-3 py-1.5">
                      <Skeleton width={18} height={18} borderRadius={4} />
                      <Skeleton width={100} height={14} />
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
          <div className="mt-8 px-2">
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
    </>
  );
}
