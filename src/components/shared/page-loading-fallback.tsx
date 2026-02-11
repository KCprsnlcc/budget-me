"use client";

import { Progress } from "@/components/ui/progress";
import { useEffect, useState } from "react";

export function PageLoadingFallback() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Start at 0 and quickly ramp to ~90% while Suspense resolves
    // This gives visual feedback that something is happening
    // The component unmounts when the real page is ready (Suspense resolves)
    let frame: number;
    let start: number | null = null;

    const animate = (timestamp: number) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;

      // Ease-out curve: fast start, slows as it approaches 90%
      // Never reaches 100% — that happens when Suspense resolves and this unmounts
      const target = Math.min(90, (elapsed / 10) * (1 - elapsed / 20000));
      setProgress(Math.max(0, target));

      if (target < 90) {
        frame = requestAnimationFrame(animate);
      }
    };

    frame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-white"
      aria-live="polite"
      aria-label="Loading page"
    >
      <div className="w-64">
        <Progress value={progress} className="w-full" />
      </div>
    </div>
  );
}
