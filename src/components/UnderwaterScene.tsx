"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const DOLPHIN_COUNT = 3;
const FISH_SCHOOL_SIZE = 40;
const MAX_DEBRIS = 14;
const DEBRIS_DENSITY_MIN = 50;   // items/km²
const DEBRIS_DENSITY_MAX = 500; // items/km²

/** Normalized density 0–1 from marine debris density (50–500 items/km²); 0 = no data */
function densityNorm(marineDebris: number): number {
  if (marineDebris <= DEBRIS_DENSITY_MIN) return 0;
  return Math.min(1, (marineDebris - DEBRIS_DENSITY_MIN) / (DEBRIS_DENSITY_MAX - DEBRIS_DENSITY_MIN));
}

/** God rays: light shafts from the surface */
function GodRays() {
  const group = useRef<THREE.Group>(null);
  const rays = useMemo(() => {
    const r: { position: [number, number, number]; rotation: [number, number, number]; scale: [number, number, number] }[] = [];
    for (let i = 0; i < 7; i++) {
      r.push({
        position: [(Math.random() - 0.5) * 20, 8 + Math.random() * 4, (Math.random() - 0.5) * 12],
        rotation: [-0.4 - Math.random() * 0.3, (Math.random() - 0.5) * 0.6, (Math.random() - 0.5) * 0.4],
        scale: [0.15 + Math.random() * 0.2, 14 + Math.random() * 6, 0.08],
      });
    }
    return r;
  }, []);

  return (
    <group ref={group} position={[0, 0, -8]}>
      {rays.map((r, i) => (
        <mesh
          key={i}
          position={r.position}
          rotation={r.rotation}
          scale={r.scale}
          renderOrder={1}
        >
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial
            color="#7dd3fc"
            transparent
            opacity={0.12}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}

/** Simple dolphin: body + dorsal fin */
function Dolphin({
  seed,
  delay,
}: {
  seed: number;
  delay: number;
}) {
  const group = useRef<THREE.Group>(null);
  const path = useMemo(() => {
    const points: THREE.Vector3[] = [];
    for (let i = 0; i <= 32; i++) {
      const t = (i / 32) * Math.PI * 2;
      points.push(
        new THREE.Vector3(
          Math.sin(t + seed) * 12 - 4,
          Math.sin(t * 0.7 + seed * 2) * 2 - 1,
          Math.cos(t * 0.5 + seed) * 3 - 6
        )
      );
    }
    return new THREE.CatmullRomCurve3(points);
  }, [seed]);

  useFrame((state) => {
    if (!group.current) return;
    const t = (state.clock.elapsedTime * 0.08 + delay) % 1;
    const pos = path.getPoint(t);
    group.current.position.copy(pos);
    const tangent = path.getTangent(t);
    group.current.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 0, 1),
      tangent
    );
    group.current.rotateY(Math.PI);
  });

  return (
    <group ref={group}>
      <mesh castShadow>
        <sphereGeometry args={[0.5, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.85]} />
        <meshStandardMaterial color="#a8b5c4" roughness={0.6} metalness={0.1} />
      </mesh>
      <mesh position={[0, 0, 0.55]} castShadow>
        <sphereGeometry args={[0.35, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.9]} />
        <meshStandardMaterial color="#a8b5c4" roughness={0.6} metalness={0.1} />
      </mesh>
      <mesh position={[0, 0, 1]} castShadow>
        <sphereGeometry args={[0.2, 8, 6]} />
        <meshStandardMaterial color="#a8b5c4" roughness={0.6} metalness={0.1} />
      </mesh>
      <mesh position={[0, 0.35, 0.1]} rotation={[0.3, 0, 0]} castShadow>
        <boxGeometry args={[0.15, 0.4, 0.08]} />
        <meshStandardMaterial color="#a8b5c4" roughness={0.6} metalness={0.1} />
      </mesh>
    </group>
  );
}

/** School of fish */
function SchoolOfFish() {
  const group = useRef<THREE.Group>(null);
  const fish = useMemo(() => {
    return Array.from({ length: FISH_SCHOOL_SIZE }, (_, i) => ({
      offset: new THREE.Vector3(
        (i % 5 - 2) * 1.5,
        (i % 4 - 1.5) * 1.2,
        (i % 8 - 4) * 0.8
      ),
      phase: i * 0.4,
      scale: 0.08 + (i % 3) * 0.03,
    }));
  }, []);

  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime * 0.5;
    group.current.position.set(
      Math.sin(t * 0.3) * 3 - 2,
      Math.sin(t * 0.2) * 1.5 - 3,
      -5 + Math.cos(t * 0.25) * 2
    );
    group.current.rotation.y = t * 0.15;
  });

  return (
    <group ref={group}>
      {fish.map((f, i) => (
        <mesh key={i} position={f.offset} scale={f.scale}>
          <sphereGeometry args={[1, 6, 4]} />
          <meshStandardMaterial
            color={i % 3 === 0 ? "#94a3b8" : "#64748b"}
            roughness={0.8}
            metalness={0}
          />
        </mesh>
      ))}
    </group>
  );
}

/** Floating debris: plastic-bag-like and net-like; count scales with debris density (items/km²) */
function FloatingDebris({ marineDebris }: { marineDebris: number }) {
  const density = densityNorm(marineDebris);
  const count = marineDebris > 0 ? Math.max(1, Math.round(density * MAX_DEBRIS)) : 0;
  const bags = useMemo(() => {
    return Array.from({ length: MAX_DEBRIS }, (_, i) => ({
      position: [
        (Math.sin(i * 1.3) * 6 + (i % 3) * 2),
        (Math.cos(i * 0.7) * 3 - 2 - (i % 2) * 2),
        (Math.sin(i * 0.5) * 4 - 7 - (i % 4)),
      ] as [number, number, number],
      rotation: [
        (i % 5) * 0.2,
        (i % 4) * 0.5,
        (i % 3) * 0.3,
      ] as [number, number, number],
      scale: 0.4 + (i % 4) * 0.2,
      phase: i * 0.7,
    }));
  }, []);

  const nets = useMemo(() => {
    return Array.from({ length: 5 }, (_, i) => ({
      position: [
        (i - 2) * 3 + Math.sin(i) * 2,
        -1 - (i % 2) * 2,
        -6 - (i % 3) * 2,
      ] as [number, number, number],
      phase: i * 1.2,
    }));
  }, []);

  return (
    <>
      {bags.slice(0, Math.max(0, count - 2)).map((b, i) => (
        <DebrisBag
          key={`bag-${i}`}
          position={b.position}
          rotation={b.rotation}
          scale={b.scale}
          phase={b.phase}
        />
      ))}
      {count >= 3 &&
        nets.slice(0, Math.min(2, Math.floor((count - 3) / 3) + 1)).map((n, i) => (
          <GhostNet
            key={`net-${i}`}
            position={n.position}
            phase={n.phase}
          />
        ))}
    </>
  );
}

function DebrisBag({
  position,
  rotation,
  scale,
  phase,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
  phase: number;
}) {
  const mesh = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!mesh.current) return;
    const t = state.clock.elapsedTime + phase;
    mesh.current.position.y = position[1] + Math.sin(t * 0.3) * 0.15;
    mesh.current.rotation.z = rotation[2] + Math.sin(t * 0.2) * 0.2;
  });

  return (
    <mesh ref={mesh} position={position} rotation={rotation} scale={scale}>
      <planeGeometry args={[1.2, 1.6]} />
      <meshBasicMaterial
        color="#cbd5e1"
        transparent
        opacity={0.35}
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

function GhostNet({
  position,
  phase,
}: {
  position: [number, number, number];
  phase: number;
}) {
  const group = useRef<THREE.Group>(null);
  const lines = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const grid = 4;
    for (let i = 0; i <= grid; i++) {
      for (let j = 0; j <= grid; j++) {
        pts.push(new THREE.Vector3((i - grid / 2) * 0.4, (j - grid / 2) * 0.3, 0));
      }
    }
    const linePts: [THREE.Vector3, THREE.Vector3][] = [];
    for (let i = 0; i <= grid; i++) {
      for (let j = 0; j < grid; j++) {
        linePts.push([pts[i * (grid + 1) + j], pts[i * (grid + 1) + j + 1]]);
        linePts.push([pts[j * (grid + 1) + i], pts[(j + 1) * (grid + 1) + i]]);
      }
    }
    return linePts.flatMap(([a, b]) => [a.x, a.y, a.z, b.x, b.y, b.z]);
  }, []);

  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime * 0.2 + phase;
    group.current.rotation.z = Math.sin(t) * 0.1;
    group.current.position.y = position[1] + Math.sin(t * 0.5) * 0.1;
  });

  const lineGeometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(lines, 3));
    g.computeBoundingSphere();
    return g;
  }, [lines]);

  return (
    <group ref={group} position={position}>
      <lineSegments geometry={lineGeometry}>
        <lineBasicMaterial
          color="#94a3b8"
          transparent
          opacity={0.5}
          depthWrite={false}
        />
      </lineSegments>
    </group>
  );
}

interface UnderwaterSceneProps {
  marineDebris: number;
}

export default function UnderwaterScene({ marineDebris }: UnderwaterSceneProps) {
  const density = densityNorm(marineDebris);
  const fogDensity = 0.028 + density * 0.032;
  const fogColor = useMemo(() => {
    const r = 0.05 + density * 0.12;
    const g = 0.15 + density * 0.08;
    const b = 0.25 - density * 0.05;
    return new THREE.Color(r, g, b);
  }, [density]);

  return (
    <>
      <color attach="background" args={[0.02, 0.08, 0.18]} />
      <fogExp2 attach="fog" args={[fogColor, fogDensity]} />
      <ambientLight intensity={0.35} />
      <directionalLight
        position={[4, 14, 6]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={512}
        shadow-mapSize-height={512}
      />
      <pointLight position={[0, 8, -4]} intensity={0.4} color="#7dd3fc" />
      <GodRays />
      {Array.from({ length: DOLPHIN_COUNT }, (_, i) => (
        <Dolphin key={i} seed={i * 2.1} delay={i * 0.33} />
      ))}
      <SchoolOfFish />
      <FloatingDebris marineDebris={marineDebris} />
    </>
  );
}
