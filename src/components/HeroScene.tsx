"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Center, useGLTF, Html, Environment } from "@react-three/drei";
import { Suspense, useRef } from "react";
import { Group } from "three";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

// 3D model (always rotates)
function ArmoredModel() {
  const { scene } = useGLTF("/models/armored.glb"); // make sure this exists
  const pivot = useRef<Group>(null);

  useFrame((_, d) => {
    if (pivot.current) pivot.current.rotation.y += d * 0.45; // faster, always on
  });

  return (
    // Outer group is the rotation pivot; Center re-centers the model visually
    <group ref={pivot} scale={[1.8, 1.8, 1.8]}> {/* 🔥 make it a LOT bigger */}
      <Center disableZ>
        <primitive object={scene} />
      </Center>
    </group>
  );
}
useGLTF.preload("/models/armored.glb");

export default function HeroScene() {
  return (
    <section
      id="home"
      className="scroll-mt-24 flex min-h-screen flex-col items-center justify-center px-6 text-center bg-[rgb(45,45,45)] text-white"
    >
      {/* 3D only (no flat SVG) */}
      <div className="w-full max-w-5xl"> {/* wider container */}
        <Canvas
          dpr={[1, 2]}
          className="rounded-xl"
          style={{ height: "680px" }}        {/* 🔥 much taller = bigger model */}
          camera={{ position: [0, 0, 4.2], fov: 30 }}  {/* closer + narrower FOV */}
        >
          <color attach="background" args={["rgb(45,45,45)"]} />
          <hemisphereLight intensity={0.7} groundColor={"#222"} />
          <directionalLight position={[6, 8, 6]} intensity={1.2} />
          <directionalLight position={[-6, -4, -6]} intensity={0.5} />
          <Suspense
            fallback={
              <Html center>
                <div className="rounded-md bg-white/10 px-3 py-2 text-sm text-white">
                  Loading…
                </div>
              </Html>
            }
          >
            <ArmoredModel />
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
