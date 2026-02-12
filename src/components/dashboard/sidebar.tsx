"use client";

import { DASHBOARD_NAV } from "@/lib/constants";
import { NavItem } from "./nav-item";
import { AIUsageCard } from "./ai-usage-card";
import { UserProfileCard } from "./user-profile-card";

export function Sidebar() {
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
