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
        
        // First check if user is authenticated
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          console.log("No active session, skipping profile fetch");
          setIsLoading(false);
          return;
        }
        
        console.log("Fetching profile for user ID:", user.id);
        const { data, error } = await supabase
          .from("profiles")
          .select("avatar_url, full_name")
          .eq("id", user.id)
          .maybeSingle(); // Use maybeSingle() to handle missing profiles gracefully
        
        if (error) {
          console.error("Failed to fetch user profile:", {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
          });
          // Don't set profile, will fall back to user metadata
        } else {
          console.log("Profile fetched successfully:", data);
          setProfile(data);
        }
      } catch (error) {
        console.error("Unexpected error fetching user profile:", error instanceof Error ? error.message : error);
        // Don't set profile, will fall back to user metadata
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
  
  // Use avatar from profile (database) first, then fallback to user_metadata
  const avatarUrl = profile?.avatar_url || user.user_metadata?.avatar_url;

  if (isLoading) {
    return (
      <div className={`${sizeClasses[size]} rounded-full bg-slate-100 animate-pulse ${className}`} />
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={`${displayName}'s avatar`}
            className={`${sizeClasses[size]} rounded-full object-cover border border-slate-200`}
            loading="lazy"
            decoding="async"
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
            avatarUrl ? "hidden" : "flex"
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
