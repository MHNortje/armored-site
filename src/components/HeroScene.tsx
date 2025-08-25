"use client";

import { Suspense, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, OrbitControls } from "@react-three/drei";

/**
 * 3D logo model that gently rotates.
 */
function PangolinModel() {
  const { scene } = useGLTF("/models/armored.glb", true);

  const model = useMemo(() => scene.clone(), [scene]);

  useFrame((_, delta) => {
    model.rotation.y += delta * 0.25; // rotation speed
  });

  return (
    <primitive
      object={model}
      scale={2.2}            // bigger model
      position={[0, -0.2, 0]}
      rotation={[0, 0, 0]}
    />
  );
}

export default function HeroScene() {
  return (
    <div className="relative mx-auto w-full max-w-5xl">
      <Canvas
        dpr={[1, 2]}
        className="rounded-xl"
        style={{ height: "680px" }}
        camera={{ position: [0, 0, 4.2], fov: 30 }}
      >
        {/* Dark gray background (r35 g35 b35) */}
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

useGLTF.preload("/models/armored.glb");
