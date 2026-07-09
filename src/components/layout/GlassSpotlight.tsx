"use client";

/* =============================================================
   GLASS SPOTLIGHT — réflexion lumineuse qui suit le curseur.
   ------------------------------------------------------------
   Un seul écouteur global (délégation) : au survol d'un élément
   `.glass-spot`, on pilote ses variables CSS --spot-x/-y/-o pour
   faire naître une lumière cyan sous le pointeur.
   Mises à jour throttlées via requestAnimationFrame → fluide et
   léger. Désactivé sur écran tactile (aucun curseur à suivre).
   Ne rend aucun DOM.
   ============================================================= */

import { useEffect } from "react";

export function GlassSpotlight() {
  useEffect(() => {
    // Pas de curseur sur tactile → on n'installe rien.
    if (window.matchMedia("(hover: none)").matches) return;

    let raf = 0;
    let current: HTMLElement | null = null;
    let lastX = 0;
    let lastY = 0;

    function onMove(event: PointerEvent) {
      const target = event.target as Element | null;
      const el = (target?.closest?.(".glass-spot") as HTMLElement | null) ?? null;

      // Changement d'élément survolé : on éteint l'ancien.
      if (el !== current) {
        if (current) current.style.setProperty("--spot-o", "0");
        current = el;
      }
      if (!el) return;

      lastX = event.clientX;
      lastY = event.clientY;
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        if (!current) return;
        const rect = current.getBoundingClientRect();
        current.style.setProperty("--spot-x", `${lastX - rect.left}px`);
        current.style.setProperty("--spot-y", `${lastY - rect.top}px`);
        current.style.setProperty("--spot-o", "1");
      });
    }

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, []);

  return null;
}
