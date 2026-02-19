"use client";

import { PageLoadingFallback } from "./page-loading-fallback";
import { useAuth } from "@/components/auth/auth-context";
import { memo } from "react";

/**
 * Conditional page loader that only shows for non-authenticated users
 * Used in AppShell to provide loading states for landing/auth pages
 * but hides when user is authenticated (dashboard pages)
 */
export const ConditionalPageLoader = memo(function ConditionalPageLoader() {
  const { isAuthenticated } = useAuth();

  // Only show loader when user is NOT authenticated
  if (!isAuthenticated) {
    return <PageLoadingFallback />;
  }

  // Don't show anything when user is authenticated
  return null;
});
