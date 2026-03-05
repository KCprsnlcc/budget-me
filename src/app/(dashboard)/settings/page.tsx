"use client";

import { useState, useEffect } from "react";
import { User, Wallet, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProfileTab, AccountsTab, PreferencesTab } from "./_components";
import type { SettingsTab } from "./_components/types";
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const TABS: { id: SettingsTab; label: string; icon: React.ElementType }[] = [
  { id: "profile", label: "Profile", icon: User },
  { id: "accounts", label: "Financial Accounts", icon: Wallet },
  { id: "preferences", label: "Preferences", icon: SlidersHorizontal },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Simulate initial page load
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Show initial skeleton loader
  if (isInitialLoading) {
    return (
      <SkeletonTheme baseColor="#f1f5f9" highlightColor="#e2e8f0">
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
          {/* Page Header Skeleton */}
          <div>
            <Skeleton width={120} height={28} className="mb-2" />
            <Skeleton width={300} height={16} />
          </div>

          {/* Settings Tabs Container Skeleton */}
          <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm overflow-hidden">
            {/* Tab Navigation Skeleton */}
            <div className="flex border-b border-slate-100">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="px-6 py-4 flex items-center gap-2">
                  <Skeleton width={18} height={18} />
                  <Skeleton width={120} height={14} />
                </div>
              ))}
            </div>

            {/* Tab Content Skeleton */}
            <div className="p-6 space-y-8">
              {/* Profile Picture Section Skeleton */}
              <div className="flex items-center gap-6 pb-6 border-b border-slate-100">
                <Skeleton circle width={80} height={80} />
                <div className="flex-1">
                  <Skeleton width={150} height={14} className="mb-2" />
                  <Skeleton width={200} height={10} />
                </div>
              </div>

              {/* Form Fields Skeleton */}
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton width={80} height={12} />
                      <Skeleton height={40} borderRadius={8} />
                    </div>
                  ))}
                  <div className="space-y-2 md:col-span-2">
                    <Skeleton width={100} height={12} />
                    <Skeleton height={40} borderRadius={8} />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <Skeleton width={120} height={12} />
                  <div className="flex items-center gap-3">
                    <Skeleton width={70} height={36} borderRadius={6} />
                    <Skeleton width={110} height={36} borderRadius={6} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SkeletonTheme>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-semibold text-slate-900 tracking-tight">Settings</h2>
        <p className="text-sm text-slate-500 mt-1 font-light">Manage your profile, accounts, and preferences.</p>
      </div>

      {/* Settings Tabs Container */}
      <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm overflow-hidden">
        {/* Tab Navigation */}
        <div className="flex border-b border-slate-100 overflow-x-auto no-scrollbar">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "px-6 py-4 text-sm font-medium whitespace-nowrap flex items-center gap-2 transition-colors cursor-pointer",
                  isActive
                    ? "text-slate-900 border-b-2 border-emerald-500"
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                )}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Panels */}
        <div className="min-h-[400px]">
          {activeTab === "profile" && <ProfileTab />}
          {activeTab === "accounts" && <AccountsTab />}
          {activeTab === "preferences" && <PreferencesTab />}
        </div>
      </div>
    </div>
  );
}
