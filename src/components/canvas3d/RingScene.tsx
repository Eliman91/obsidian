"use client";

/* ==================================================================
   RING SCENE — la bague Pulse en 3D, qui tourne au scroll.
   ------------------------------------------------------------------
   Bague « spinner » stylisée fidèle au rendu produit :
     · bande en acier sombre poli (double face → paroi intérieure visible)
     · deux liserés turquoise émissifs (captés par le bloom)
     · deux arêtes chromées brillantes (avant / arrière de la bande)
   La rotation Y suit la progression de scroll de la section (0→1),
   fournie via une ref (pas de re-render React). Inclinaison douce
   vers la souris pour la vie. Éclairage procédural (aucun HDRI).
   ================================================================== */

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  AdaptiveDpr,
  AdaptiveEvents,
  Environment,
  Float,
  Lightformer,
} from "@react-three/drei";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import * as THREE from "three";

interface Mouse {
  x: number;
  y: number;
}

const TWO_PI = Math.PI * 2;
const RADIUS = 1.5; // rayon extérieur de la bande
const DEPTH = 0.82; // épaisseur de la bande (axe caméra)

/* ------------------------------------------------------------------
   BAGUE — géométrie composée, orientée « O » face caméra.
   La rotation Y de progression + tilt souris est appliquée ici.
   ------------------------------------------------------------------ */
function Ring({
  progress,
  mouse,
}: {
  progress: React.RefObject<number>;
  mouse: React.RefObject<Mouse>;
}) {
  const group = useRef<THREE.Group>(null);

  useFrame((state) => {
    const g = group.current;
    if (!g) return;
    const p = progress.current ?? 0;
    const m = mouse.current;
    // Rotation principale : 1,5 tour sur toute la section (effet « showcase »).
    const targetY = p * TWO_PI * 1.5 + m.x * 0.5;
    g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, targetY, 0.12);
    // Inclinaison 3/4 constante + micro-parallaxe verticale vers la souris.
    g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, -0.32 + m.y * 0.25, 0.08);
    // Respiration très légère sur l'échelle.
    const breathe = 1 + Math.sin(state.clock.elapsedTime * 1.1) * 0.012;
    g.scale.setScalar(breathe);
  });

  // Le maillage de la bande a son axe tourné sur Z pour présenter le « O ».
  return (
    <Float speed={1.1} rotationIntensity={0.12} floatIntensity={0.6}>
      <group ref={group}>
        {/* Bande principale — acier sombre poli, double face (paroi interne). */}
        <mesh rotation-x={Math.PI / 2}>
          <cylinderGeometry args={[RADIUS, RADIUS, DEPTH, 180, 1, true]} />
          <meshStandardMaterial
            color="#12191b"
            metalness={0.92}
            roughness={0.26}
            envMapIntensity={1.5}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Arêtes chromées avant / arrière (les reflets brillants du bord). */}
        {[DEPTH / 2, -DEPTH / 2].map((z) => (
          <mesh key={`rim-${z}`} position={[0, 0, z]}>
            <torusGeometry args={[RADIUS, 0.055, 24, 180]} />
            <meshStandardMaterial
              color="#d9dede"
              metalness={1}
              roughness={0.12}
              envMapIntensity={2}
            />
          </mesh>
        ))}

        {/* Deux liserés turquoise émissifs (rayonnent via le bloom). */}
        {[0.14, -0.14].map((z) => (
          <mesh key={`groove-${z}`} position={[0, 0, z]}>
            <torusGeometry args={[RADIUS + 0.006, 0.026, 20, 180]} />
            <meshStandardMaterial
              color="#14e0a3"
              emissive="#14e0a3"
              emissiveIntensity={2.4}
              metalness={0.4}
              roughness={0.4}
            />
          </mesh>
        ))}
      </group>
    </Float>
  );
}

/* Suivi souris (window) → parallaxe douce, sans bloquer les clics. */
function MouseRig({ mouse }: { mouse: React.RefObject<Mouse> }) {
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [mouse]);
  return null;
}

export default function RingScene({
  active = true,
  progress,
}: {
  active?: boolean;
  progress: React.RefObject<number>;
}) {
  const mouse = useRef<Mouse>({ x: 0, y: 0 });
  // dpr plafonné plus bas sur petits écrans (le trafic est mobile).
  const dpr = useMemo<[number, number]>(() => {
    if (typeof window !== "undefined" && window.innerWidth < 768) return [1, 1.5];
    return [1, 2];
  }, []);

  return (
    <Canvas
      className="!absolute inset-0"
      style={{ pointerEvents: "none" }}
      frameloop={active ? "always" : "never"}
      dpr={dpr}
      camera={{ position: [0, 0, 5], fov: 42 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
    >
      <Environment resolution={256} frames={1}>
        <Lightformer
          intensity={2.4}
          color="#14e0a3"
          position={[-4, 2, 4]}
          scale={[5, 2, 1]}
        />
        <Lightformer
          intensity={2.2}
          color="#0891b2"
          position={[4, -2, 3]}
          scale={[5, 2, 1]}
        />
        <Lightformer
          intensity={1.6}
          color="#ffffff"
          position={[0, 3, -4]}
          scale={[4, 4, 1]}
        />
        {/* Trait de lumière frontal → reflet net sur les arêtes chromées. */}
        <Lightformer
          intensity={1.3}
          color="#ffffff"
          position={[0, 0, 5]}
          scale={[1.5, 4, 1]}
        />
      </Environment>

      <ambientLight intensity={0.22} />

      <Ring progress={progress} mouse={mouse} />
      <MouseRig mouse={mouse} />

      <EffectComposer enableNormalPass={false}>
        <Bloom
          intensity={0.85}
          luminanceThreshold={0.2}
          luminanceSmoothing={0.4}
          mipmapBlur
          radius={0.7}
        />
      </EffectComposer>

      <AdaptiveDpr pixelated />
      <AdaptiveEvents />
    </Canvas>
  );
}
