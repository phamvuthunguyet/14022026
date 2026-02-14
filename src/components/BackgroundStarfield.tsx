"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

function createCircleTexture(): THREE.CanvasTexture | null {
  if (typeof document === "undefined") return null;
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  const gradient = ctx.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2,
  );
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.4, "rgba(255,255,255,0.8)");
  gradient.addColorStop(0.6, "rgba(255,255,255,0.3)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

const COUNT = 5000;
const SPREAD_NEAR = 2;
const SPREAD_FAR = 8;

function seed(id: number) {
  const x = Math.sin(id * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

/** Light white/blue tints */
const TINTS: [number, number, number][] = [
  [0.95, 0.96, 1.0],
  [0.92, 0.94, 1.0],
  [0.96, 0.94, 1.0],
  [1.0, 0.98, 1.0],
  [0.9, 0.92, 0.98],
];

export function BackgroundStarfield() {
  const pointsRef = useRef<THREE.Points>(null);
  const circleTexture = useMemo(() => createCircleTexture(), []);
  const geometry = useMemo(() => {
    const positions = new Float32Array(COUNT * 3);
    const colors = new Float32Array(COUNT * 3);

    for (let i = 0; i < COUNT; i++) {
      const r =
        SPREAD_NEAR + (SPREAD_FAR - SPREAD_NEAR) * Math.cbrt(seed(i + 1));
      const theta = seed(i + 2) * Math.PI * 2;
      const phi = Math.acos(2 * seed(i + 3) - 1);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);

      const tint = TINTS[Math.floor(seed(i + 5) * TINTS.length)];
      const brightness = 0.6 + 0.4 * seed(i + 6);
      colors[i * 3] = tint[0] * brightness;
      colors[i * 3 + 1] = tint[1] * brightness;
      colors[i * 3 + 2] = tint[2] * brightness;
    }

    const geom = new THREE.BufferGeometry();
    geom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geom.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return geom;
  }, []);

  const materialRef = useRef<THREE.PointsMaterial>(null);
  useFrame((state) => {
    if (materialRef.current) {
      const t = state.clock.elapsedTime * 0.8;
      materialRef.current.opacity = 0.5 + 0.4 * Math.sin(t);
    }
  });

  return (
    <points ref={pointsRef} geometry={geometry} frustumCulled={false}>
      <pointsMaterial
        ref={materialRef}
        map={circleTexture ?? undefined}
        size={0.04}
        sizeAttenuation
        vertexColors
        transparent
        opacity={0.85}
        depthWrite={false}
        depthTest={true}
      />
    </points>
  );
}
