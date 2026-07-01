"use client";

/* =============================================================
   SCROLL REVEAL — apparition élégante au scroll (GSAP ScrollTrigger)
   Anime l'élément référencé (fade + translation) quand il entre
   dans le viewport. Nettoyage automatique via gsap.context().
   Usage :
     const ref = useScrollReveal<HTMLDivElement>();
     return <div ref={ref}>…</div>;
   ============================================================= */

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface RevealOptions {
  /** Décalage vertical initial en px (défaut 40). */
  y?: number;
  /** Durée en secondes (défaut 0.9). */
  duration?: number;
  /** Délai avant démarrage (défaut 0). */
  delay?: number;
}

export function useScrollReveal<T extends HTMLElement>(
  options: RevealOptions = {},
) {
  const ref = useRef<T>(null);
  const { y = 40, duration = 0.9, delay = 0 } = options;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReduced) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { autoAlpha: 0, y },
        {
          autoAlpha: 1,
          y: 0,
          duration,
          delay,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        },
      );
    }, el);

    return () => ctx.revert();
  }, [y, duration, delay]);

  return ref;
}
