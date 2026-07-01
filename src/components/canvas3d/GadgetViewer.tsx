"use client";

/* ==================================================================
   GADGET VIEWER — Le cœur du site
   Configurateur 3D d'un gadget de luxe :
     • @react-three/fiber + drei (chargement GLTF, HDRI studio, ombres)
     • GSAP ScrollTrigger : rotation / zoom / translation "style Apple"
       pilotés par le scroll (scrub fluide, synchro Lenis)
     • Loader de luxe (drei <Html> + useProgress) sous <Suspense>
     • Rendu à la demande (frameloop="demand") + AdaptiveDpr pour ne
       pas saturer le thread principal → Lighthouse friendly
   ================================================================== */

import { Suspense, useEffect, useRef } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import {
  AdaptiveDpr,
  AdaptiveEvents,
  Center,
  ContactShadows,
  Environment,
  Html,
  OrbitControls,
  useGLTF,
  useProgress,
} from "@react-three/drei";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import * as THREE from "three";

gsap.registerPlugin(ScrollTrigger);

interface GadgetViewerProps {
  /** URL d'un modèle .glb / .gltf (metafield Shopify `model_3d`). */
  modelUrl?: string;
  /** Hauteur de la piste de scroll en multiples de viewport (défaut 3). */
  scrollLengthVh?: number;
  className?: string;
}

/* ------------------------------------------------------------------
   LOADER DE LUXE — affiché tant que le modèle/HDRI se chargent.
   Rendu dans le Canvas via <Html> (fallback de <Suspense>).
   ------------------------------------------------------------------ */
function LuxeLoader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="flex flex-col items-center gap-4 select-none">
        <div className="relative h-16 w-16">
          <span className="absolute inset-0 rounded-full border border-titanium/15" />
          <span
            className="absolute inset-0 rounded-full border-2 border-transparent border-t-cyan animate-spin"
            style={{ boxShadow: "var(--shadow-glow-cyan)" }}
          />
        </div>
        <span className="font-mono text-xs tracking-[0.3em] text-graphite uppercase">
          {Math.round(progress)}%
        </span>
      </div>
    </Html>
  );
}

/* ------------------------------------------------------------------
   MODÈLE — GLTF si URL fournie, sinon gadget procédural chromé.
   Le fallback procédural rend le composant utilisable immédiatement,
   sans dépendre d'un asset externe.
   ------------------------------------------------------------------ */
function GltfModel({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} />;
}

function ProceduralGadget() {
  return (
    <mesh castShadow>
      <torusKnotGeometry args={[0.8, 0.28, 220, 32]} />
      <meshStandardMaterial
        color="#f5f5f7"
        metalness={1}
        roughness={0.15}
        envMapIntensity={1.4}
      />
    </mesh>
  );
}

/* ------------------------------------------------------------------
   SCÈNE — lumières, HDRI studio, ombres de contact, et branchement
   de l'animation GSAP pilotée par le scroll.
   ------------------------------------------------------------------ */
function Scene({
  modelUrl,
  triggerRef,
}: {
  modelUrl?: string;
  triggerRef: React.RefObject<HTMLElement | null>;
}) {
  const groupRef = useRef<THREE.Group>(null);
  // En frameloop="demand", on doit demander un rendu à chaque frame animée.
  const invalidate = useThree((s) => s.invalidate);

  useEffect(() => {
    const group = groupRef.current;
    const trigger = triggerRef.current;
    if (!group || !trigger) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReduced) {
      invalidate();
      return;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger,
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
          // À chaque avancée du scroll : on redemande un rendu WebGL.
          onUpdate: () => invalidate(),
        },
      });

      // Rotation continue (le gadget tourne sur lui-même façon Apple).
      tl.to(group.rotation, { y: Math.PI * 2 }, 0)
        // Léger basculement pour révéler le dessous.
        .to(group.rotation, { x: 0.5, ease: "power1.inOut" }, 0)
        // Translation latérale + zoom progressif.
        .fromTo(
          group.position,
          { x: 0, y: 0 },
          { x: 1.1, y: -0.15, ease: "power2.inOut" },
          0,
        )
        .fromTo(
          group.scale,
          { x: 1, y: 1, z: 1 },
          { x: 1.35, y: 1.35, z: 1.35, ease: "power2.inOut" },
          0,
        );
    }, group as unknown as Element);

    invalidate();
    return () => ctx.revert();
  }, [invalidate, triggerRef]);

  return (
    <>
      {/* Éclairage d'appoint : l'essentiel des reflets vient de l'HDRI. */}
      <ambientLight intensity={0.35} />
      <spotLight
        position={[6, 8, 4]}
        angle={0.3}
        penumbra={0.8}
        intensity={2.4}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <spotLight position={[-6, 2, -4]} intensity={1.2} color="#7000ff" />

      {/* HDRI studio : reflets réalistes sur métal / chrome. */}
      <Environment preset="studio" environmentIntensity={0.9} />

      <Center>
        <group ref={groupRef}>
          {modelUrl ? <GltfModel url={modelUrl} /> : <ProceduralGadget />}
        </group>
      </Center>

      {/* Ombre de contact douce pour ancrer l'objet. */}
      <ContactShadows
        position={[0, -1.4, 0]}
        opacity={0.5}
        scale={10}
        blur={2.6}
        far={4}
        color="#000000"
      />

      {/* Configurateur : rotation libre à la souris, sans pan ni zoom. */}
      <OrbitControls
        makeDefault
        enablePan={false}
        enableZoom={false}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 1.8}
        // OrbitControls invalide automatiquement en frameloop="demand".
      />

      {/* Optimisations perf : baisse la résolution pendant le mouvement. */}
      <AdaptiveDpr pixelated />
      <AdaptiveEvents />
    </>
  );
}

/* ------------------------------------------------------------------
   COMPOSANT PUBLIC
   Section haute (piste de scroll) contenant un Canvas "sticky".
   ------------------------------------------------------------------ */
export default function GadgetViewer({
  modelUrl,
  scrollLengthVh = 3,
  className,
}: GadgetViewerProps) {
  const sectionRef = useRef<HTMLDivElement>(null);

  return (
    <section
      ref={sectionRef}
      className={className}
      style={{ height: `${scrollLengthVh * 100}vh` }}
    >
      <div className="sticky top-0 h-screen w-full">
        <Canvas
          shadows
          frameloop="demand"
          dpr={[1, 2]}
          camera={{ position: [0, 0, 5], fov: 40 }}
          gl={{ antialias: true, powerPreference: "high-performance" }}
        >
          <Suspense fallback={<LuxeLoader />}>
            <Scene modelUrl={modelUrl} triggerRef={sectionRef} />
          </Suspense>
        </Canvas>
      </div>
    </section>
  );
}
