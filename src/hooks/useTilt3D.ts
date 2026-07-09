"use client";

/* =============================================================
   USE TILT 3D — inclinaison 3D (parallaxe) fluide au survol.
   ------------------------------------------------------------
   Anime rotationX/rotationY de l'élément vers la position du
   curseur via gsap.quickTo (amorti « ultra-fluide »), avec une
   perspective pour un vrai relief. Retour à plat à la sortie.
   Garde-fous : ne s'active QUE sur pointeur fin (hover: hover)
   et hors prefers-reduced-motion (donc rien sur mobile/tactile).
   Usage : const ref = useTilt3D<HTMLElement>({ max: 8 });
   ============================================================= */

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

interface TiltOptions {
  /** Amplitude maximale de bascule en degrés (défaut 8). */
  max?: number;
  /** Perspective en px (plus petit = relief plus marqué). Défaut 700. */
  perspective?: number;
}

export function useTilt3D<T extends HTMLElement>(options: TiltOptions = {}) {
  const ref = useRef<T>(null);
  const { max = 8, perspective = 700 } = options;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Pointeur fin uniquement + respect de la préférence d'animation réduite.
    const capable =
      window.matchMedia("(hover: hover)").matches &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!capable) return;

    gsap.set(el, { transformPerspective: perspective, transformOrigin: "center" });
    const rotX = gsap.quickTo(el, "rotationX", { duration: 0.5, ease: "power3.out" });
    const rotY = gsap.quickTo(el, "rotationY", { duration: 0.5, ease: "power3.out" });

    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      // Position du curseur normalisée dans l'élément (−0.5..0.5).
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      rotY(px * max * 2);
      rotX(-py * max * 2);
    };
    const onLeave = () => {
      rotX(0);
      rotY(0);
    };

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      gsap.set(el, { clearProps: "transform,transformPerspective" });
    };
  }, [max, perspective]);

  return ref;
}
