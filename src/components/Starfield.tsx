"use client";

import { useRef, useState, useCallback, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { Star } from "./Star";
import { ConstellationLines } from "./ConstellationLines";
import { BackgroundStarfield } from "./BackgroundStarfield";
import type { StarsConfig, StarData, Phase } from "@/lib/types";

interface StarfieldProps {
  config: StarsConfig;
  openedIds: Set<string>;
  openStar: (id: string) => void;
  phase: Phase;
  formationProgress: number;
  onLetterOpen: (star: StarData) => void;
  letterOpen: boolean;
  focusedStarId: string | null;
}

function SceneContent({
  config,
  openedIds,
  phase,
  formationProgress,
  onLetterOpen,
  letterOpen,
}: StarfieldProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [hoveredStar, setHoveredStar] = useState<string | null>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    if (phase === "exploring" || phase === "letter-open") {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.05;
    }
    // During formation/complete, hold rotation so constellation is readable
  });

  const starPositions = useMemo(() => {
    const map: Record<string, [number, number, number]> = {};
    for (const s of config.stars) {
      map[s.id] = s.position;
    }
    return map;
  }, [config.stars]);

  const handleStarClick = useCallback(
    (star: StarData) => {
      if (letterOpen) return;
      onLetterOpen(star);
    },
    [letterOpen, onLetterOpen],
  );

  return (
    <>
      <ambientLight intensity={0.45} />
      <pointLight position={[2, 2, 2]} intensity={0.5} color="#b8c8d4" />
      <pointLight position={[-2, -1, 1]} intensity={0.25} color="#8b9a9e" />

      {/* Background starfield: fixed in space, renders first (behind constellation) */}
      <BackgroundStarfield />

      <group ref={groupRef}>
        {config.stars.map((star) => (
          <Star
            key={star.id}
            id={star.id}
            position={star.position}
            isOpened={openedIds.has(star.id)}
            isMain={true}
            onClick={() => handleStarClick(star)}
            hovered={hoveredStar}
            setHovered={setHoveredStar}
          />
        ))}
        {config.backgroundStars.map((bg) => (
          <Star
            key={bg.id}
            id={bg.id}
            position={bg.position}
            isOpened={false}
            isMain={false}
            onClick={() => {}}
            hovered={null}
            setHovered={() => {}}
          />
        ))}
        <ConstellationLines
          edges={config.edges}
          starPositions={starPositions}
          openedIds={openedIds}
          formationProgress={formationProgress}
          visible={phase === "formation" || phase === "complete"}
        />
      </group>

      <OrbitControls
        enableZoom={true}
        enablePan={phase === "complete" || phase === "exploring"}
        minDistance={2}
        maxDistance={12}
        maxPolarAngle={Math.PI * 0.9}
        minPolarAngle={0.1}
        enableDamping
        dampingFactor={0.05}
      />
    </>
  );
}

export function Starfield(props: StarfieldProps) {
  return (
    <div className="absolute inset-0 w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        <color attach="background" args={["#0a0e12"]} />
        <fog attach="fog" args={["#0a0e12", 6, 18]} />
        <SceneContent {...props} />
      </Canvas>
    </div>
  );
}
