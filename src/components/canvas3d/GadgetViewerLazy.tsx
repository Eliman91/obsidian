"use client";

/* =============================================================
   Chargement paresseux du GadgetViewer (WebGL) sans SSR.
   `ssr: false` n'est autorisé que dans un composant client → ce
   wrapper isole cette contrainte. Le lourd bundle Three.js n'est
   donc téléchargé que côté navigateur, après le contenu critique.
   ============================================================= */

import dynamic from "next/dynamic";

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

export default GadgetViewer;
