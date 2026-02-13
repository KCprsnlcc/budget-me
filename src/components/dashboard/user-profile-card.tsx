"use client";

import { LogOut } from "lucide-react";
import { useAuth } from "@/components/auth/auth-context";
import { UserAvatar } from "@/components/shared/user-avatar";
import { useTransition } from "react";

export function UserProfileCard() {
  const { user, signOut } = useAuth();
  const [isSigningOut, startSignOut] = useTransition();

  if (!user) return null;

  return (
    <div className="p-4 border-t border-slate-200/50">
      <div className="flex items-center gap-3">
        <UserAvatar user={user} size="lg" />
        <div className="flex-1 overflow-hidden">
          <div className="text-sm font-medium text-slate-700 truncate">
            {user.user_metadata?.full_name || user.email || "User"}
          </div>
          <div className="text-[11px] text-slate-500 truncate">
            {user.email}
          </div>
        </div>
        <button
          onClick={() => startSignOut(async () => await signOut())}
          disabled={isSigningOut}
          className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Sign out"
        >
          {isSigningOut ? (
            <div className="w-4 h-4 border border-slate-600 border-t-transparent rounded-full animate-spin" />
          ) : (
            <LogOut size={18} />
          )}
        </button>
      </div>
    </div>
  );
}
