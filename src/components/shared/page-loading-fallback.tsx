"use client";

import { Progress } from "@/components/ui/progress";
import { useEffect, useState } from "react";

export function PageLoadingFallback() {
  const [progress, setProgress] = useState(0);
  const [shouldHide, setShouldHide] = useState(false);

  useEffect(() => {
    let frame: number;
    let start: number | null = null;
    let timeoutId: NodeJS.Timeout;

    const animate = (timestamp: number) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;

      const target = Math.min(100, (elapsed / 8) * (1 - elapsed / 15000));
      setProgress(Math.max(0, target));

      if (target >= 100) {
        timeoutId = setTimeout(() => {
          setShouldHide(true);
        }, 300); // Small delay to show 100% briefly
      } else {
        frame = requestAnimationFrame(animate);
      }
    };

    frame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frame);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  if (shouldHide) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-white transition-opacity duration-300"
      aria-live="polite"
      aria-label="Loading page"
    >
      <div className="w-64">
        <Progress value={progress} className="w-full" />
      </div>
    </div>
  );
}
