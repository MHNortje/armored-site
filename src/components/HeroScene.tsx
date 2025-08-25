"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Center, useGLTF, Html, Environment } from "@react-three/drei";
import { Suspense, useRef } from "react";
import { Group } from "three";
import { motion, useReducedMotion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

// 3D model component
function ArmoredModel({ rotate = true }: { rotate?: boolean }) {
  // Make sure your file exists at /public/models/armored.glb
  const { scene } = useGLTF("/models/armored.glb");
  const ref = useRef<Group>(null);

  // Gentle spin
  useFrame((_, delta) => {
    if (rotate && ref.current) ref.current.rotation.y += delta * 0.35; // ~20deg/sec
  });

  return (
    // Center normalizes and centers the model regardless of its pivot/bounds
    <Center ref={ref} disableZ>
      {/* Drop the scene in as-is; untextured is fine for now */}
      <primitive object={scene} />
    </Center>
  );
}

// Preload to avoid a pop-in
useGLTF.preload("/models/armored.glb");

export default function HeroScene() {
  const reduce = useReducedMotion();

  return (
    <section
      id="home"
      className="scroll-mt-24 flex min-h-screen flex-col items-center justify-center px-6 text-center bg-[rgb(45,45,45)] text-white"
    >
      {/* 3D canvas */}
      <div className="w-full max-w-4xl">
        <Canvas
          dpr={[1, 2]}
          className="rounded-xl"
          // Height controls how big the logo feels; tweak if you want larger/smaller
          style={{ height: "520px" }} // mobile will shrink naturally; adjust as you like
          camera={{ position: [0, 0, 6], fov: 35 }}
        >
          <color attach="background" args={["rgb(45,45,45)"]} />
          <hemisphereLight intensity={0.6} groundColor={"#222"} />
          <directionalLight position={[5, 5, 5]} intensity={1.1} />
          <directionalLight position={[-5, -2, -4]} intensity={0.4} />

          <Suspense
            fallback={
              <Html center>
                <div className="rounded-md bg-white/10 px-3 py-2 text-sm text-white">
                  Loading…
                </div>
              </Html>
            }
          >
            <ArmoredModel rotate={!reduce} />
            {/* Soft environment reflections (subtle; you can remove if you prefer flat) */}
            <Environment preset="city" />
          </Suspense>
        </Canvas>
      </div>

      {/* Tagline */}
      <motion.p
        className="mt-6 text-xl text-gray-300"
        initial="hidden"
        animate="show"
        variants={fadeUp}
        transition={{ delay: 0.1 }}
      >
        Innovations &bull; Productions &bull; Beyond
      </motion.p>

      {/* CTA */}
      <motion.a
        href="#about"
        className="mt-8 inline-block rounded-full bg-white px-6 py-3 font-semibold text-black transition hover:bg-gray-300"
        initial="hidden"
        animate="show"
        variants={fadeUp}
        transition={{ delay: 0.2 }}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.98 }}
      >
        Learn More
      </motion.a>
    </section>
  );
}
