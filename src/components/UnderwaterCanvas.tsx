"use client";

import { Canvas } from "@react-three/fiber";
import UnderwaterScene from "./UnderwaterScene";

interface UnderwaterCanvasProps {
  marineDebris: number;
}

export default function UnderwaterCanvas({ marineDebris }: UnderwaterCanvasProps) {
  return (
    <Canvas
      camera={{ position: [0, 0, 10], fov: 55, near: 0.1, far: 80 }}
      gl={{ alpha: true, antialias: true }}
      dpr={[1, 2]}
      style={{ width: "100%", height: "100%", display: "block" }}
    >
      <UnderwaterScene marineDebris={marineDebris} />
    </Canvas>
  );
}
