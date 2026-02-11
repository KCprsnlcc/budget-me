"use client";

import { X } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { DASHBOARD_NAV } from "@/lib/constants";
import { NavItem } from "./nav-item";
import { AIUsageCard } from "./ai-usage-card";
import { UserProfileCard } from "./user-profile-card";

interface MobileSidebarProps {
  open: boolean;
  onClose: () => void;
}

export function MobileSidebar({ open, onClose }: MobileSidebarProps) {
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
        className={`fixed left-0 top-0 bottom-0 w-64 bg-white text-slate-600 flex flex-col border-r border-slate-200 z-50 transition-transform duration-300 md:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="h-14 flex items-center px-4 border-b border-slate-200/50 gap-3">
          <Logo variant="icon" size="sm" className="w-6 h-6" />
          <span className="font-medium text-slate-800 tracking-tight text-sm">
            BudgetMe
          </span>
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
                  onClick={onClose}
                />
              ))}
            </div>
          ))}

          {/* AI Usage */}
          <div className="mt-8 px-2">
            <AIUsageCard />
          </div>
        </nav>

        {/* User Profile */}
        <UserProfileCard />
      </aside>
    </>
  );
}
