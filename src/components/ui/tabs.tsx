"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface Tab {
  id: string;
  label: string;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  onTabChange?: (tabId: string) => void;
  className?: string;
  children: (activeTab: string) => React.ReactNode;
}

export function Tabs({
  tabs,
  defaultTab,
  onTabChange,
  className,
  children,
}: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    onTabChange?.(tabId);
  };

  return (
    <div className={className}>
      <div className="flex border-b border-slate-200 gap-6" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={cn(
              "py-3 text-sm font-medium border-b-2 transition-all cursor-pointer",
              activeTab === tab.id
                ? "text-emerald-500 border-emerald-500"
                : "text-slate-500 border-transparent hover:text-slate-700"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="mt-4" role="tabpanel">
        {children(activeTab)}
      </div>
    </div>
  );
}
