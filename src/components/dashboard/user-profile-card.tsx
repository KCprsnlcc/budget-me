"use client";

import { LogOut } from "lucide-react";
import { useAuth } from "@/components/auth/auth-context";
import { UserAvatar } from "@/components/shared/user-avatar";
import { useTransition } from "react";
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

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
            <SkeletonTheme baseColor="#f1f5f9" highlightColor="#e2e8f0">
              <Skeleton width={16} height={16} circle />
            </SkeletonTheme>
          ) : (
            <LogOut size={18} />
          )}
        </button>
      </div>
    </div>
  );
}
