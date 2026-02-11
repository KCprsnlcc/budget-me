"use client";

import { useEffect, useState, useRef } from "react";
import { Progress } from "@/components/ui/progress";
import { useHydration } from "@/components/shared/loading-context";

export function PageLoader() {
  const { isHydrated, markHydrated } = useHydration();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(true);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    if (isHydrated) return;

    let start: number | null = null;

    const animate = (timestamp: number) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;

      // Ease-out curve toward 90% — never hits 100 until hydration completes
      const target = Math.min(90, (elapsed / 10) * (1 - elapsed / 20000));
      setProgress(Math.max(0, target));

      if (target < 90) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(frameRef.current);
  }, [isHydrated]);

  // When component mounts, React has hydrated — mark hydration complete
  useEffect(() => {
    // Use requestIdleCallback (or setTimeout fallback) to ensure the page
    // has actually rendered before we dismiss the loader
    const finish = () => {
      setProgress(100);
      // Allow the progress bar to visually fill before fading out
      setTimeout(() => {
        setVisible(false);
        markHydrated();
      }, 350);
    };

    if ("requestIdleCallback" in window) {
      (window as Window).requestIdleCallback(finish);
    } else {
      setTimeout(finish, 100);
    }
  }, [markHydrated]);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-white transition-opacity duration-300"
      style={{ opacity: progress >= 100 ? 0 : 1 }}
      aria-live="polite"
      aria-label="Loading application"
    >
      <div className="w-64">
        <Progress value={progress} className="w-full" />
      </div>
    </div>
  );
}
