"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Progress } from "@/components/ui/progress";
import { useHydration } from "@/components/shared/loading-context";

type Phase = "loading" | "filling" | "fading" | "done";

const FILL_DURATION = 600; // ms — matches progress indicator's duration-600
const FADE_DURATION = 400; // ms — slower cinematic fade-out

export function PageLoader() {
  const { isHydrated, markHydrated } = useHydration();
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<Phase>("loading");
  const frameRef = useRef<number>(0);
  const prefersReducedMotion = useRef(false);

  // Detect prefers-reduced-motion on mount
  useEffect(() => {
    prefersReducedMotion.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
  }, []);

  // Phase 1: Animate progress from 0 → 90% with ease-out curve
  useEffect(() => {
    if (phase !== "loading") return;

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
  }, [phase]);

  // Transition: mount settled → start filling to 100%
  const startFilling = useCallback(() => {
    if (prefersReducedMotion.current) {
      // Skip all animations for reduced-motion users
      setPhase("done");
      markHydrated();
      return;
    }
    setProgress(100);
    setPhase("filling");
  }, [markHydrated]);

  // When component mounts, React has hydrated — wait for idle then fill
  useEffect(() => {
    if ("requestIdleCallback" in window) {
      const id = (window as Window).requestIdleCallback(startFilling);
      return () => (window as Window).cancelIdleCallback(id);
    } else {
      const id = setTimeout(startFilling, 100);
      return () => clearTimeout(id);
    }
  }, [startFilling]);

  // Phase 2 → 3: After fill animation completes, start fade-out
  useEffect(() => {
    if (phase !== "filling") return;
    const id = setTimeout(() => setPhase("fading"), FILL_DURATION);
    return () => clearTimeout(id);
  }, [phase]);

  // Phase 3 → 4: After fade-out completes, remove from DOM & mark hydrated
  useEffect(() => {
    if (phase !== "fading") return;
    const id = setTimeout(() => {
      setPhase("done");
      markHydrated();
    }, FADE_DURATION);
    return () => clearTimeout(id);
  }, [phase, markHydrated]);

  if (phase === "done") return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-white"
      style={{
        opacity: phase === "fading" ? 0 : 1,
        transition: `opacity ${FADE_DURATION}ms ease-in-out`,
      }}
      aria-live="polite"
      aria-label="Loading application"
    >
      <div className="w-64">
        <Progress value={progress} className="w-full" />
      </div>
    </div>
  );
}
