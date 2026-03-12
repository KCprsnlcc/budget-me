"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import Lenis from "lenis";

type LenisContextType = Lenis | null;

const LenisContext = createContext<LenisContextType>(null);

function shouldPreventSmooth(node: Node | null): boolean {
  let current = node instanceof Element ? node : node?.parentElement ?? null;

  while (current && current !== document.documentElement) {

    if (current.hasAttribute("data-lenis-prevent")) {
      return true;
    }

    const role = current.getAttribute("role");
    if (role === "dialog" || role === "alertdialog") {
      return true;
    }

    if (current.getAttribute("aria-modal") === "true") {
      return true;
    }

    if (current.tagName === "DIALOG") {
      return true;
    }

    if (current.tagName === "SELECT" || current.tagName === "TEXTAREA") {
      return true;
    }

    const style = window.getComputedStyle(current);
    const overflowY = style.overflowY;
    if (
      (overflowY === "auto" || overflowY === "scroll") &&
      current.scrollHeight > current.clientHeight
    ) {
      return true;
    }

    current = current.parentElement;
  }

  return false;
}

export function LenisSmoothScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [lenis, setLenis] = useState<Lenis | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      return;
    }

    const lenisInstance = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      touchMultiplier: 2,
      prevent: (node: Element) => shouldPreventSmooth(node),
    });

    setLenis(lenisInstance);

    function raf(time: number) {
      lenisInstance.raf(time);
      rafRef.current = requestAnimationFrame(raf);
    }

    rafRef.current = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafRef.current);
      lenisInstance.destroy();
      setLenis(null);
    };
  }, []);

  return (
    <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>
  );
}

export function useLenis(): Lenis | null {
  return useContext(LenisContext);
}
