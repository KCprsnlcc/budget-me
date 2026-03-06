"use client";

import { X } from "lucide-react";
import { ADMIN_NAV } from "@/lib/constants";
import { NavItem } from "./nav-item";
import { Logo } from "@/components/shared/logo";
import { UserProfileCard } from "@/components/dashboard/user-profile-card";

interface MobileSidebarProps {
  open: boolean;
  onClose: () => void;
}

export function MobileSidebar({ open, onClose }: MobileSidebarProps) {
  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
        onClick={onClose}
      />

      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white text-slate-600 flex flex-col border-r border-slate-200 z-50 md:hidden animate-slide-in-left">
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <Logo variant="icon" size="md" />
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 cursor-pointer"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex flex-col flex-1 overflow-y-auto py-4 px-2 gap-0.5">
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
                  onClick={onClose}
                />
              ))}
              {(index === 0 || index === 1 || index === 2) && (
                <div className="mx-2 my-4 h-px bg-slate-200" />
              )}
            </div>
          ))}
        </nav>

        <UserProfileCard />
      </aside>
    </>
  );
}
