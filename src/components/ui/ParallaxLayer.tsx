"use client";

/* =============================================================
   PARALLAX LAYER — dérive une couche au scroll (GSAP ScrollTrigger).
   ------------------------------------------------------------
   Enveloppe un bloc (ex. un texte du hero) et le translate
   verticalement à mesure qu'on scrolle le 1er écran. Des vitesses
   différentes entre couches créent l'illusion de profondeur (Z).
   Synchronisé au scroll Lenis (déjà branché globalement).
   Reduced-motion : rend les enfants statiques.
   ============================================================= */

import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function ParallaxLayer({
  speed = 0.5,
  className = "",
  children,
}: {
  /** Vitesse de dérive : >0 = monte au scroll. ~0.4 (lent) à ~1.2 (rapide). */
  speed?: number;
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      gsap.to(el, {
        yPercent: -speed * 100,
        ease: "none",
        scrollTrigger: {
          // Dérive pilotée par le scroll du 1er écran (en px).
          start: 0,
          end: () => window.innerHeight,
          scrub: true,
          invalidateOnRefresh: true,
        },
      });
    }, el);

    return () => ctx.revert();
  }, [speed]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
