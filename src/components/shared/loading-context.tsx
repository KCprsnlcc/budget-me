"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

type HydrationState = {
  isHydrated: boolean;
  markHydrated: () => void;
};

const HydrationContext = createContext<HydrationState | undefined>(undefined);

export function HydrationProvider({ children }: { children: ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false);

  const markHydrated = useCallback(() => {
    setIsHydrated(true);
  }, []);

  return (
    <HydrationContext.Provider value={{ isHydrated, markHydrated }}>
      {children}
    </HydrationContext.Provider>
  );
}

export function useHydration() {
  const context = useContext(HydrationContext);
  if (!context) throw new Error("useHydration must be used within HydrationProvider");
  return context;
}
