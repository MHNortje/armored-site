"use client";

import { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import { CameraController } from "./camera-controller";
import { Workshop } from "./workshop";
import type { GalleryImage } from "@/lib/gallery";
import type { ZoneId } from "@/lib/zones";

type SceneCanvasProps = {
  activeZone: ZoneId;
  onZoneChange: (zone: ZoneId) => void;
  galleryImages: GalleryImage[];
  reducedMotion: boolean;
};

function useMobileCanvas() {
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)");
    const update = () => setMobile(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return mobile;
}

export function SceneCanvas({
  activeZone,
  onZoneChange,
  galleryImages,
  reducedMotion,
}: SceneCanvasProps) {
  const mobile = useMobileCanvas();

  return (
    <Canvas
      shadows={!mobile}
      dpr={[1, mobile ? 1.25 : 1.75]}
      camera={{ position: [11, 6.8, 14.2], fov: mobile ? 54 : 45, near: 0.1, far: 90 }}
      gl={{
        antialias: !mobile,
        alpha: false,
        powerPreference: "high-performance",
      }}
      onCreated={({ gl }) => {
        gl.outputColorSpace = THREE.SRGBColorSpace;
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.08;
      }}
      fallback={
        <div className="absolute inset-0 grid place-items-center bg-[#232323] p-8 text-center text-[#dcdcdc]">
          This device cannot display the 3D workshop. Use the navigation to explore the content.
        </div>
      }
    >
      <color attach="background" args={["#232323"]} />
      <fog attach="fog" args={["#232323", 20, 49]} />
      <Suspense fallback={null}>
        {mobile && (
          <OrbitControls
            makeDefault
            enablePan={false}
            enableZoom={false}
            enableDamping
            dampingFactor={0.08}
            minPolarAngle={Math.PI * 0.25}
            maxPolarAngle={Math.PI * 0.48}
            rotateSpeed={0.38}
          />
        )}
        <CameraController activeZone={activeZone} reducedMotion={reducedMotion} />
        <Workshop
          activeZone={activeZone}
          onZoneChange={onZoneChange}
          galleryImages={galleryImages}
          reducedMotion={reducedMotion}
          mobile={mobile}
        />
        {!mobile && (
          <EffectComposer multisampling={0} enableNormalPass={false}>
            <Bloom
              mipmapBlur
              intensity={0.82}
              luminanceThreshold={0.68}
              luminanceSmoothing={0.42}
            />
            <Vignette eskil={false} offset={0.16} darkness={0.56} />
          </EffectComposer>
        )}
      </Suspense>
    </Canvas>
  );
}
