"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

interface UserAvatarProps {
  user: User | null;
  size?: "sm" | "md" | "lg";
  className?: string;
  showName?: boolean;
}

const sizeClasses = {
  sm: "w-6 h-6 text-[8px]",
  md: "w-7 h-7 text-[10px]",
  lg: "w-8 h-8 text-xs",
};

export function UserAvatar({ user, size = "md", className = "", showName = false }: UserAvatarProps) {
  const [profile, setProfile] = useState<{ avatar_url?: string; full_name?: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("profiles")
          .select("avatar_url, full_name")
          .eq("id", user.id)
          .single();
        
        if (error) {
          console.error("Failed to fetch user profile:", error);
        } else {
          setProfile(data);
        }
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  if (!user) return null;

  const initials = profile?.full_name
    ? profile.full_name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user.email?.slice(0, 2).toUpperCase() || "U";

  const displayName = profile?.full_name || user.user_metadata?.full_name || user.email || "User";

  if (isLoading) {
    return (
      <div className={`${sizeClasses[size]} rounded-full bg-slate-100 animate-pulse ${className}`} />
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative">
        {profile?.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt={`${displayName}'s avatar`}
            className={`${sizeClasses[size]} rounded-full object-cover border border-slate-200`}
            onError={(e) => {
              // Fallback to initials if image fails to load
              const target = e.target as HTMLImageElement;
              target.style.display = "none";
              if (target.nextElementSibling) {
                (target.nextElementSibling as HTMLElement).style.display = "flex";
              }
            }}
          />
        ) : null}
        <div
          className={`${sizeClasses[size]} rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 text-slate-600 font-medium ${
            profile?.avatar_url ? "hidden" : "flex"
          }`}
        >
          {initials}
        </div>
      </div>
      {showName && (
        <div className="text-left">
          <p className="text-xs font-medium text-slate-700 truncate">
            {displayName}
          </p>
          <p className="text-[10px] text-slate-500 truncate">
            {user.email}
          </p>
        </div>
      )}
    </div>
  );
}
