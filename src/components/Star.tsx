"use client";

import { useRef, useState, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/** Healing-style colors: soft warm white, sage, lavender */
const COLORS = {
  dim: "#c0fafa",
  soft: "#faefc3",
  bright: "#e8f0f0",
  glow: "#66e8e8",
  halo: "#a8d0d0",
} as const;

interface StarProps {
  id: string;
  position: [number, number, number];
  isOpened: boolean;
  isMain: boolean;
  onClick: () => void;
  hovered: string | null;
  setHovered: (id: string | null) => void;
}

export function Star({
  id,
  position,
  isOpened,
  isMain,
  onClick,
  hovered,
  setHovered,
}: StarProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const [hover, setHover] = useState(false);
  const isHovered = hovered === id || hover;

  const size = isMain ? 0.045 : 0.022;
  const scaleVec = useMemo(() => new THREE.Vector3(1, 1, 1), []);
  const twinklePhase = useMemo(
    () => (id.charCodeAt(0) + id.charCodeAt(1)) * 0.02,
    [id],
  );

  useFrame((state) => {
    if (!meshRef.current) return;
    const scale = isOpened ? 1.35 : isHovered ? 1.25 : 1;
    scaleVec.set(scale, scale, scale);
    meshRef.current.scale.lerp(scaleVec, 0.06);
    if (glowRef.current) {
      glowRef.current.scale.lerp(scaleVec.clone().multiplyScalar(2.5), 0.04);
    }
    if (!isOpened && isMain) {
      const t = state.clock.elapsedTime * 0.35 + twinklePhase;
      const breath = 0.5 + 0.35 * Math.sin(t) + 0.15 * Math.sin(t * 2.1);
      const mat = meshRef.current.material as THREE.MeshBasicMaterial;
      if (mat.opacity !== undefined)
        mat.opacity = Math.max(0.4, Math.min(1, breath));
    }
  });

  const color = isOpened ? COLORS.bright : isMain ? COLORS.soft : COLORS.dim;

  return (
    <group position={position}>
      {/* Soft outer glow (healing halo) */}
      {(isOpened || isHovered) && (
        <mesh ref={glowRef} scale={[2.5, 2.5, 2.5]}>
          <sphereGeometry args={[size, 16, 16]} />
          <meshBasicMaterial
            color={COLORS.halo}
            transparent
            opacity={isOpened ? 0.2 : 0.1}
            depthWrite={false}
          />
        </mesh>
      )}
      {/* Small blinkle round core */}
      <mesh
        ref={meshRef}
        scale={[1, 1, 1]}
        onClick={(e) => {
          e.stopPropagation();
          if (isMain) onClick();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          if (isMain) {
            setHover(true);
            setHovered(id);
            document.body.style.cursor = "pointer";
          }
        }}
        onPointerOut={() => {
          setHover(false);
          if (hovered === id) setHovered(null);
          document.body.style.cursor = "default";
        }}
      >
        <sphereGeometry args={[size, 24, 24]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={isOpened ? 0.98 : 0.88}
        />
      </mesh>
    </group>
  );
}
