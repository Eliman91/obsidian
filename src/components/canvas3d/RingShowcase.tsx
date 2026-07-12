"use client";

/* ==================================================================
   RING SHOWCASE — section « façon Apple » : la bague Pulse tourne
   au fil du scroll, pendant que des phrases s'enchaînent par-dessus.
   ------------------------------------------------------------------
   Mécanique : une longue section (piste de scroll) contient une scène
   « collante » (position: sticky) qui reste à l'écran ; on calcule la
   progression (0→1) à partir de la position de la section et on la
   passe à la scène 3D (rotation) + aux textes (fondus enchaînés).
   Aucune dépendance de plus (sticky natif, pas de pin GSAP).

   Perf / accessibilité :
   · Rendu 3D monté après le premier affichage (requestIdleCallback).
   · frameloop coupé quand la section quitte l'écran (IntersectionObserver).
   · prefers-reduced-motion → repli statique léger (aucun WebGL).
   ================================================================== */

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Locale } from "@/lib/types";

const RingScene = dynamic(() => import("./RingScene"), { ssr: false });

const COPY: Record<
  Locale,
  { eyebrow: string; lines: string[]; cta: string; hint: string }
> = {
  fr: {
    eyebrow: "Le geste",
    lines: [
      "Un geste, et le mental se tait.",
      "La bande tourne. Sans fin.",
      "Acier inoxydable · Série numérotée.",
    ],
    cta: "Découvrir Pulse",
    hint: "Faites défiler",
  },
  en: {
    eyebrow: "The gesture",
    lines: [
      "One gesture, and the mind goes quiet.",
      "The band spins. Endlessly.",
      "Stainless steel · Numbered edition.",
    ],
    cta: "Discover Pulse",
    hint: "Scroll",
  },
};

/* Rampe : 0 avant a, monte a→b, plateau b→c, descend c→d, 0 après d. */
function ramp(p: number, a: number, b: number, c: number, d: number) {
  if (p <= a || p >= d) return 0;
  if (p < b) return (p - a) / (b - a);
  if (p <= c) return 1;
  return 1 - (p - c) / (d - c);
}

export function RingShowcase({ locale }: { locale: Locale }) {
  const c = COPY[locale];
  const pulseHref = `/${locale}/produit/obsidian-pulse`;

  const sectionRef = useRef<HTMLElement>(null);
  const progress = useRef(0);
  const lineRefs = useRef<(HTMLDivElement | null)[]>([]);
  const ctaRef = useRef<HTMLAnchorElement>(null);

  const [mounted, setMounted] = useState(false);
  const [active, setActive] = useState(true);
  const [reduced, setReduced] = useState(false);

  // Détecte reduced-motion + monte la 3D après le premier affichage.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setReduced(true);
      return;
    }
    const win = window as typeof window & {
      requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    let idleId: number;
    let toId: number;
    if (win.requestIdleCallback) {
      idleId = win.requestIdleCallback(() => setMounted(true), { timeout: 1600 });
    } else {
      toId = window.setTimeout(() => setMounted(true), 800);
    }
    return () => {
      if (win.cancelIdleCallback && idleId) win.cancelIdleCallback(idleId);
      if (toId) window.clearTimeout(toId);
    };
  }, []);

  // Progression au scroll (throttlée en rAF) → ref 3D + fondus des textes.
  useEffect(() => {
    if (reduced) return;
    const section = sectionRef.current;
    if (!section) return;

    let raf = 0;
    const update = () => {
      raf = 0;
      const rect = section.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const p = total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 0;
      progress.current = p;

      // Fondus enchaînés des 3 phrases.
      const ops = [
        ramp(p, -0.5, -0.2, 0.24, 0.36),
        ramp(p, 0.34, 0.44, 0.58, 0.68),
        ramp(p, 0.66, 0.76, 1.5, 1.6),
      ];
      lineRefs.current.forEach((el, i) => {
        if (el) el.style.opacity = String(ops[i]);
      });
      if (ctaRef.current) {
        ctaRef.current.style.opacity = String(ops[2]);
        ctaRef.current.style.pointerEvents = ops[2] > 0.6 ? "auto" : "none";
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    update();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [reduced, mounted]);

  // Coupe le rendu quand la section n'est pas visible.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || !mounted) return;
    const io = new IntersectionObserver(
      ([entry]) => setActive(entry.isIntersecting),
      { threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [mounted]);

  // ---- Repli statique (reduced-motion) : léger, sans WebGL. ----
  if (reduced) {
    return (
      <section className="mx-auto max-w-2xl px-6 py-24 text-center">
        <p className="mb-6 font-mono text-xs tracking-[0.4em] text-graphite uppercase">
          {c.eyebrow}
        </p>
        <h2 className="text-3xl font-semibold leading-tight text-holo md:text-4xl">
          {c.lines[0]}
        </h2>
        <p className="mt-4 text-lg text-graphite">{c.lines[1]}</p>
        <p className="mt-2 text-sm text-graphite">{c.lines[2]}</p>
        <Link
          href={pulseHref}
          className="glass ring-neon mt-10 inline-block rounded-[--radius-luxe] px-8 py-3 text-sm font-medium text-chrome"
        >
          {c.cta}
        </Link>
      </section>
    );
  }

  // ---- Version animée : piste de scroll + scène collante. ----
  return (
    <section ref={sectionRef} className="relative h-[200vh]">
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">
        {/* Scène 3D (fond de la scène collante). */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-[1200ms] ease-luxe"
          style={{ opacity: mounted ? 1 : 0 }}
        >
          {mounted && <RingScene active={active} progress={progress} />}
        </div>

        {/* Eyebrow fixe en haut. */}
        <p className="absolute top-16 z-10 font-mono text-xs tracking-[0.4em] text-graphite uppercase">
          {c.eyebrow}
        </p>

        {/* Phrases superposées (fondus pilotés au scroll). */}
        <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center px-6 text-center">
          {c.lines.map((line, i) => (
            <div
              key={line}
              ref={(el) => {
                lineRefs.current[i] = el;
              }}
              className="absolute max-w-2xl text-balance text-3xl font-semibold leading-tight text-holo md:text-5xl"
              style={{ opacity: i === 0 ? 1 : 0 }}
            >
              {line}
              {i === 2 && (
                <div className="mt-8">
                  <Link
                    ref={ctaRef}
                    href={pulseHref}
                    style={{ opacity: 0, pointerEvents: "none" }}
                    className="glass ring-neon glass-spot pointer-events-auto inline-block rounded-[--radius-luxe] px-8 py-3 text-sm font-medium text-chrome"
                  >
                    {c.cta}
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Indice de scroll (bas). */}
        <span className="absolute bottom-8 z-10 font-mono text-[10px] tracking-[0.3em] text-graphite/60 uppercase">
          {c.hint} ↓
        </span>
      </div>
    </section>
  );
}
