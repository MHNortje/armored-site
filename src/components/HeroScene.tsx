"use client";

import React, { Suspense, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";

export default function HeroScene() {
  return (
    <div className="relative w-full">
      <Canvas
        dpr={[1, 2]}
        className="rounded-none"
        style={{ height: "80vh" }}
        camera={{ position: [0, 0, 4.2], fov: 30 }}
      >
        <color attach="background" args={["rgb(35,35,35)"]} />

        <ambientLight intensity={0.7} />
        <directionalLight position={[3, 5, 2]} intensity={1.1} />
        <directionalLight position={[-3, -2, -2]} intensity={0.3} />

        <Suspense fallback={null}>
          <PangolinModel />
        </Suspense>

        <OrbitControls
          enablePan={false}
          minDistance={3}
          maxDistance={6}
          maxPolarAngle={Math.PI * 0.66}
          minPolarAngle={Math.PI * 0.34}
        />
      </Canvas>
    </div>
  );
}

function PangolinModel() {
  const { scene } = useGLTF("/models/armored.glb", true);
  const model = useMemo(() => scene.clone(), [scene]);

  useFrame((_, delta) => {
    model.rotation.y += delta * 0.25;
  });

  return <primitive object={model} scale={3.2} position={[0, -0.2, 0]} />;
}
