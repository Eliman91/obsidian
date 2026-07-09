"use client";

/* ==================================================================
   HERO SCENE — fond 3D interactif du hero (WebGL / R3F).
   ------------------------------------------------------------------
   · Champ de particules teal/violet dérivant en profondeur
   · Cœur « Obsidian » : cristal noir poli à reflets chrome/violet,
     en lévitation, qui s'incline vers la souris
   · Profondeur au scroll : la scène recule sur l'axe Z
   · Éclairage 100 % procédural (Lightformers) → aucun HDRI externe
     à télécharger (CSP-safe, robuste sur la page qui vend)
   · Perf : frameloop piloté (pause hors-écran), AdaptiveDpr, dpr
     plafonné, respect de prefers-reduced-motion (géré en amont).
   Le Canvas est en pointer-events:none : il ne bloque jamais les
   clics du hero ; la souris est suivie via un écouteur window.
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

/* Ref partagée du pointeur (−1..1) + progression de scroll (0..1). */
interface Motion {
  mx: number;
  my: number;
  scroll: number;
}

/* ------------------------------------------------------------------
   CHAMP DE PARTICULES — nuage de points teal/violet.
   Rotation lente continue + parallaxe douce vers la souris.
   ------------------------------------------------------------------ */
function ParticleField({ motion }: { motion: React.RefObject<Motion> }) {
  const ref = useRef<THREE.Points>(null);
  const COUNT = 2600;

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(COUNT * 3);
    const col = new Float32Array(COUNT * 3);
    const teal = new THREE.Color("#14e0a3");
    const violet = new THREE.Color("#0891b2");
    const c = new THREE.Color();
    for (let i = 0; i < COUNT; i++) {
      // Répartition dans un volume large et profond.
      pos[i * 3] = (Math.random() - 0.5) * 22;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 14;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 14 - 3;
      c.copy(teal).lerp(violet, Math.random());
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }
    return [pos, col];
  }, []);

  useFrame((_, delta) => {
    const p = ref.current;
    if (!p) return;
    const m = motion.current;
    // Rotation continue très lente + inclinaison vers la souris.
    p.rotation.y += delta * 0.03;
    p.rotation.x = THREE.MathUtils.lerp(p.rotation.x, m.my * 0.15, 0.04);
    p.rotation.z = THREE.MathUtils.lerp(p.rotation.z, m.mx * 0.08, 0.04);
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.035}
        sizeAttenuation
        vertexColors
        transparent
        opacity={0.85}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/* ------------------------------------------------------------------
   CŒUR OBSIDIAN — cristal facetté noir poli à reflets colorés.
   Lévitation (Float) + inclinaison vers la souris.
   ------------------------------------------------------------------ */
function ObsidianCore({ motion }: { motion: React.RefObject<Motion> }) {
  const group = useRef<THREE.Group>(null);
  const heart = useRef<THREE.Mesh>(null);

  // Géométrie des arêtes mémoïsée (évite de la recréer à chaque frame).
  const edges = useMemo(
    () => new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(1.17, 0)),
    [],
  );

  useFrame((state) => {
    const g = group.current;
    if (!g) return;
    const m = motion.current;
    // Inclinaison fluide vers la souris (amortie).
    g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, m.mx * 0.6, 0.05);
    g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, -m.my * 0.5, 0.05);
    // Cœur lumineux : pulsation lente (respiration).
    const h = heart.current;
    if (h) {
      const pulse = 0.5 + Math.sin(state.clock.elapsedTime * 1.5) * 0.5;
      const s = 0.5 + pulse * 0.12;
      h.scale.setScalar(s);
      (h.material as THREE.MeshBasicMaterial).opacity = 0.2 + pulse * 0.35;
    }
  });

  return (
    <Float speed={1.4} rotationIntensity={0.35} floatIntensity={0.9}>
      <group ref={group}>
        {/* Cristal d'obsidienne : matériau physique — transmission (réfraction
            comme du verre), clearcoat poli, irisation futuriste. */}
        <mesh>
          <icosahedronGeometry args={[1.15, 0]} />
          <meshPhysicalMaterial
            color="#08110e"
            metalness={0.1}
            roughness={0.06}
            transmission={0.55}
            thickness={2}
            ior={2.1}
            clearcoat={1}
            clearcoatRoughness={0.08}
            iridescence={0.7}
            iridescenceIOR={1.5}
            envMapIntensity={2}
            flatShading
          />
        </mesh>
        {/* Arêtes cyan lumineuses (captées par le bloom). */}
        <lineSegments geometry={edges}>
          <lineBasicMaterial color="#14e0a3" transparent opacity={0.5} />
        </lineSegments>
        {/* Cœur lumineux interne qui pulse (rayonne via le bloom). */}
        <mesh ref={heart} scale={0.55}>
          <icosahedronGeometry args={[1.15, 0]} />
          <meshBasicMaterial
            color="#2af0c0"
            transparent
            opacity={0.3}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      </group>
    </Float>
  );
}

/* ------------------------------------------------------------------
   RIG — écoute souris + scroll (window), pilote la profondeur Z.
   ------------------------------------------------------------------ */
function Rig({ motion }: { motion: React.RefObject<Motion> }) {
  const { camera } = useThree();

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      motion.current.mx = (e.clientX / window.innerWidth) * 2 - 1;
      motion.current.my = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    const onScroll = () => {
      // Progression sur le premier écran (0 en haut → 1 après un viewport).
      motion.current.scroll = Math.min(
        1,
        window.scrollY / Math.max(1, window.innerHeight),
      );
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
    };
  }, [motion]);

  useFrame(() => {
    const m = motion.current;
    // Profondeur au scroll : la caméra recule + léger panoramique souris.
    const targetZ = 6 + m.scroll * 4;
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.06);
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, m.mx * 0.6, 0.05);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, m.my * 0.4, 0.05);
    camera.lookAt(0, 0, 0);
  });

  return null;
}

/* ------------------------------------------------------------------
   COMPOSANT PUBLIC — Canvas de fond (absolute, pointer-events:none).
   `active` coupe le rendu quand le hero n'est plus à l'écran.
   ------------------------------------------------------------------ */
export default function HeroScene({ active = true }: { active?: boolean }) {
  const motion = useRef<Motion>({ mx: 0, my: 0, scroll: 0 });

  return (
    <Canvas
      className="!absolute inset-0"
      style={{ pointerEvents: "none" }}
      frameloop={active ? "always" : "never"}
      dpr={[1, 1.6]}
      camera={{ position: [0, 0, 6], fov: 45 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
    >
      {/* Éclairage procédural (aucun HDRI externe). */}
      <Environment resolution={256} frames={1}>
        <Lightformer
          intensity={2.2}
          color="#14e0a3"
          position={[-4, 2, 3]}
          scale={[4, 1.5, 1]}
        />
        <Lightformer
          intensity={2.4}
          color="#0891b2"
          position={[4, -1, 2]}
          scale={[4, 1.5, 1]}
        />
        <Lightformer
          intensity={1.1}
          color="#ffffff"
          position={[0, 4, -3]}
          scale={[3, 3, 1]}
        />
      </Environment>

      <ambientLight intensity={0.25} />

      <ParticleField motion={motion} />
      <ObsidianCore motion={motion} />
      <Rig motion={motion} />

      {/* Bloom cinématique : les zones lumineuses (arêtes, cœur, particules)
          rayonnent. mipmapBlur = halo doux et large, peu coûteux. */}
      <EffectComposer enableNormalPass={false}>
        <Bloom
          intensity={0.9}
          luminanceThreshold={0.15}
          luminanceSmoothing={0.4}
          mipmapBlur
          radius={0.75}
        />
      </EffectComposer>

      <AdaptiveDpr pixelated />
      <AdaptiveEvents />
    </Canvas>
  );
}
