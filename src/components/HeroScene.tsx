"use client";
import { Canvas, useFrame } from "@react-three/fiber";
import { Center, Environment, OrbitControls, useGLTF } from "@react-three/drei";
import { Suspense, useRef } from "react";
import * as THREE from "three";

function ArmoredModel() {
  // Load your GLB
  const { scene } = useGLTF("/models/armored.glb");

  // This group will be our pivot (world origin)
  const pivot = useRef<THREE.Group>(null!);

  // Gentle idle rotation around the *centered* pivot
  useFrame(({ clock }) => {
    if (pivot.current) pivot.current.rotation.y = clock.getElapsedTime() * 0.2;
  });

  return (
    // Rotate the OUTER group (pivot at 0,0,0)
    <group ref={pivot}>
      {/* Center recenters the visual bounds of the model at the origin */}
      <Center>
        <primitive object={scene} />
      </Center>
    </group>
  );
}
useGLTF.preload("/models/armored.glb");

export default function HeroScene() {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas camera={{ position: [0, 0, 6], fov: 45 }} gl={{ antialias: true, alpha: true }}>
        <Suspense fallback={null}>
          {/* Lights */}
          <ambientLight intensity={0.7} />
          <directionalLight position={[3, 3, 5]} intensity={1.2} />
          <directionalLight position={[-3, -2, -4]} intensity={0.5} />

          {/* Model with correct pivot */}
          <ArmoredModel />

          {/* Soft reflections */}
          <Environment preset="sunset" />

          {/* Keep for debugging; you can remove later */}
          <OrbitControls enableZoom={false} />
        </Suspense>
      </Canvas>
    </div>
  );
}
