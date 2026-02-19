"use client";

import { ConditionalPageLoader } from "@/components/shared/conditional-page-loader";
import { LenisSmoothScrollProvider } from "@/components/shared/lenis-provider";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <LenisSmoothScrollProvider>
      <ConditionalPageLoader />
      {children}
    </LenisSmoothScrollProvider>
  );
}
