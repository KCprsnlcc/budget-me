"use client";

import { PageLoader } from "@/components/shared/page-loader";
import { HydrationProvider } from "@/components/shared/loading-context";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <HydrationProvider>
      <PageLoader />
      {children}
    </HydrationProvider>
  );
}
