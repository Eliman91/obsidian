"use client";

/* =============================================================
   SMOOTH SCROLL — Lenis + synchro GSAP ScrollTrigger
   Monte une instance Lenis globale et branche sa boucle sur le
   ticker GSAP, pour que ScrollTrigger reste parfaitement synchro
   (indispensable pour le scroll cinématique "style Apple").
   À appeler UNE seule fois, haut dans l'arbre (ex. layout client).
   ============================================================= */

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function useSmoothScroll(): void {
  useEffect(() => {
    // Respecte la préférence système "réduire les animations".
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReduced) return;

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    // À chaque scroll Lenis, on demande à ScrollTrigger de se recalculer.
    lenis.on("scroll", ScrollTrigger.update);

    // On pilote Lenis avec le ticker GSAP (une seule boucle RAF partagée).
    const onTick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(onTick);
      lenis.destroy();
    };
  }, []);
}
