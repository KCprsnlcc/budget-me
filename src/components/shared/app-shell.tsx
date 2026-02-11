"use client";

import { PageLoader } from "@/components/shared/page-loader";
import { HydrationProvider } from "@/components/shared/loading-context";
import { LenisSmoothScrollProvider } from "@/components/shared/lenis-provider";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <HydrationProvider>
      <LenisSmoothScrollProvider>
        <PageLoader />
        {children}
      </LenisSmoothScrollProvider>
    </HydrationProvider>
  );
}
