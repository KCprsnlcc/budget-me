"use client";

import { useState } from "react";
import { User, Wallet, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProfileTab, AccountsTab, PreferencesTab } from "./_components";
import type { SettingsTab } from "./_components/types";

const TABS: { id: SettingsTab; label: string; icon: React.ElementType }[] = [
  { id: "profile", label: "Profile", icon: User },
  { id: "accounts", label: "Financial Accounts", icon: Wallet },
  { id: "preferences", label: "Preferences", icon: SlidersHorizontal },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");

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
