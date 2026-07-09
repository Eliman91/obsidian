"use client";

/* ==================================================================
   HERO SCENE LAZY — garde-fou de performance autour de HeroScene.
   ------------------------------------------------------------------
   · Ne monte la 3D QUE sur desktop à pointeur fin, hors reduced-motion
     (sur mobile/tactile/reduced-motion → rien, l'aurore CSS suffit).
   · Montée différée après le premier affichage (requestIdleCallback)
     → ne pèse pas sur le LCP du hero.
   · Coupe le rendu (frameloop) quand le hero quitte l'écran
     (IntersectionObserver) → 0 GPU/batterie pendant le shopping.
   · Fondu d'apparition au montage.
   ================================================================== */

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

const HeroScene = dynamic(() => import("./HeroScene"), { ssr: false });

export function HeroSceneLazy() {
  const ref = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [active, setActive] = useState(true);

  // Décide si l'on active la 3D + monte après le premier affichage.
  useEffect(() => {
    const capable =
      window.matchMedia("(min-width: 768px) and (hover: hover)").matches &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!capable) return;

    const win = window as typeof window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    let idleId: number;
    let timeoutId: number;
    if (win.requestIdleCallback) {
      idleId = win.requestIdleCallback(() => setMounted(true), { timeout: 1400 });
    } else {
      timeoutId = window.setTimeout(() => setMounted(true), 700);
    }
    return () => {
      if (win.cancelIdleCallback && idleId) win.cancelIdleCallback(idleId);
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, []);

  // Pause le rendu quand le hero n'est plus visible.
  useEffect(() => {
    const el = ref.current;
    if (!el || !mounted) return;
    const io = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting), {
      threshold: 0,
    });
    io.observe(el);
    return () => io.disconnect();
  }, [mounted]);

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-[1200ms] ease-luxe"
      style={{ opacity: mounted ? 1 : 0 }}
    >
      {mounted && <HeroScene active={active} />}
    </div>
  );
}
