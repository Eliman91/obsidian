"use client";

/* =============================================================
   HERO CTA — bouton « Explorer la collection » premium.
   Relief 3D au survol (useTilt3D) + reflet qui suit le curseur
   (classe glass-spot, pilotée par le listener global GlassSpotlight).
   On n'utilise PAS hover:scale ici : le transform est géré par GSAP.
   ============================================================= */

import type { ReactNode } from "react";
import { useTilt3D } from "@/hooks/useTilt3D";

export function HeroCTA({
  href,
  children,
  className = "",
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  const ref = useTilt3D<HTMLAnchorElement>({ max: 8 });

  return (
    <a
      ref={ref}
      href={href}
      className={`glass glass-spot ring-neon relative z-10 rounded-[--radius-luxe] px-8 py-3 text-sm font-medium text-chrome ${className}`}
    >
      {children}
    </a>
  );
}
