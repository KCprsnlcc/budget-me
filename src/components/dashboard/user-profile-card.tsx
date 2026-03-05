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
    <div className="p-3 sm:p-4 border-t border-slate-200/50 shrink-0">
      <div className="flex items-center gap-2.5 sm:gap-3">
        <UserAvatar user={user} size="lg" className="w-8 h-8 sm:w-9 sm:h-9 shrink-0" />
        <div className="flex-1 overflow-hidden min-w-0">
          <div className="text-[13px] sm:text-sm font-medium text-slate-700 truncate">
            {user.user_metadata?.full_name || user.email || "User"}
          </div>
          <div className="text-[10px] sm:text-[11px] text-slate-500 truncate">
            {user.email}
          </div>
        </div>
        <button
          onClick={() => startSignOut(async () => await signOut())}
          disabled={isSigningOut}
          className="text-slate-400 hover:text-slate-600 active:text-slate-700 transition-colors cursor-pointer min-w-[40px] min-h-[40px] sm:min-w-[44px] sm:min-h-[44px] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed rounded-lg hover:bg-slate-50 active:bg-slate-100 touch-manipulation shrink-0"
          aria-label="Sign out"
        >
          {isSigningOut ? (
            <SkeletonTheme baseColor="#f1f5f9" highlightColor="#e2e8f0">
              <Skeleton width={16} height={16} circle className="sm:w-[18px] sm:h-[18px]" />
            </SkeletonTheme>
          ) : (
            <LogOut size={16} className="sm:w-[18px] sm:h-[18px]" />
          )}
        </button>
      </div>
    </div>
  );
}
