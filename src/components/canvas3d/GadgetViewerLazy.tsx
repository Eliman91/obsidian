"use client";

/* =============================================================
   Chargement du GadgetViewer (WebGL) UNIQUEMENT à l'approche du
   scroll (IntersectionObserver) + sans SSR.
   → Le lourd bundle Three.js n'est téléchargé que lorsque la
     section 3D arrive près du viewport, pas au chargement initial.
     Gain majeur de performance mobile (FCP/LCP).
   ============================================================= */

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

const GadgetViewer = dynamic(() => import("./GadgetViewer"), {
  ssr: false,
  loading: () => (
    <div className="flex h-screen w-full items-center justify-center">
      <span className="font-mono text-xs tracking-[0.3em] text-graphite uppercase">
        Initialisation du configurateur…
      </span>
    </div>
  ),
});

interface Props {
  modelUrl?: string;
  scrollLengthVh?: number;
  className?: string;
}

export default function GadgetViewerLazy({ scrollLengthVh = 3, ...props }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShow(true);
          io.disconnect();
        }
      },
      { rootMargin: "400px" }, // on précharge un peu avant l'arrivée
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  if (show) {
    return <GadgetViewer scrollLengthVh={scrollLengthVh} {...props} />;
  }

  // Réserve la hauteur pour éviter tout saut de mise en page (CLS = 0).
  return (
    <div ref={ref} style={{ height: `${scrollLengthVh * 100}vh` }} aria-hidden />
  );
}
