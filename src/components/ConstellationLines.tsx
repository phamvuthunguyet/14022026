"use client";

import { useMemo } from "react";
import * as THREE from "three";

interface ConstellationLinesProps {
  edges: [string, string][];
  starPositions: Record<string, [number, number, number]>;
  openedIds: Set<string>;
  formationProgress: number;
  visible: boolean;
}

function SingleLine({
  start,
  end,
  opacity,
}: {
  start: [number, number, number];
  end: [number, number, number];
  opacity: number;
}) {
  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array([...start, ...end]);
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.computeBoundingSphere();
    return g;
  }, [start, end]);
  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial color="#c4d4ff" transparent opacity={opacity} />
    </lineSegments>
  );
}

export function ConstellationLines({
  edges,
  starPositions,
  openedIds,
  formationProgress,
  visible,
}: ConstellationLinesProps) {
  const { linesToShow, lineOpacity } = useMemo<{
    linesToShow: [string, string][];
    lineOpacity: number;
  }>(() => {
    const toShow: [string, string][] = [];
    for (const [a, b] of edges) {
      if (openedIds.has(a) && openedIds.has(b)) toShow.push([a, b]);
    }
    const opacity = visible ? 0.4 + formationProgress * 0.6 : 0.3;
    return { linesToShow: toShow, lineOpacity: Math.min(1, opacity) };
  }, [edges, openedIds, formationProgress, visible]);

  const segments = useMemo(() => {
    const out: {
      start: [number, number, number];
      end: [number, number, number];
    }[] = [];
    for (const [idA, idB] of linesToShow) {
      const posA = starPositions[idA];
      const posB = starPositions[idB];
      if (posA && posB) out.push({ start: posA, end: posB });
    }
    return out;
  }, [linesToShow, starPositions]);

  if (segments.length === 0) return null;

  return (
    <group>
      {segments.map(({ start, end }, i) => (
        <SingleLine key={i} start={start} end={end} opacity={lineOpacity} />
      ))}
    </group>
  );
}
