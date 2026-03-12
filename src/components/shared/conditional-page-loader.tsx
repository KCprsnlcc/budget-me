"use client";

import { PageLoadingFallback } from "./page-loading-fallback";
import { useAuth } from "@/components/auth/auth-context";
import { memo } from "react";

export const ConditionalPageLoader = memo(function ConditionalPageLoader() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <PageLoadingFallback />;
  }

  return null;
});
