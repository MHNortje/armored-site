"use client";

import { Suspense } from "react";
import { Html, Image as DreiImage } from "@react-three/drei";
import type { GalleryImage } from "@/lib/gallery";

type GalleryWallProps = {
  images: GalleryImage[];
};

const positions: [number, number, number][] = [
  [-5.1, 3.65, 0.16],
  [0, 3.65, 0.16],
  [5.1, 3.65, 0.16],
  [-5.1, 1.05, 0.16],
  [0, 1.05, 0.16],
  [5.1, 1.05, 0.16],
];

function EmptyFrame({ position, number }: { position: [number, number, number]; number: number }) {
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[4.35, 2.15, 0.16]} />
        <meshStandardMaterial color="#2d2d2d" metalness={0.88} roughness={0.38} />
      </mesh>
      <mesh position={[0, 0, 0.09]}>
        <planeGeometry args={[4, 1.82, 8, 4]} />
        <meshBasicMaterial color="#4e4e4e" wireframe transparent opacity={0.42} />
      </mesh>
      <Html transform position={[0, 0, 0.13]} distanceFactor={9} center>
        <div className="pointer-events-none w-36 text-center">
          <p className="micro-label text-white/30">Project frame {String(number).padStart(2, "0")}</p>
        </div>
      </Html>
    </group>
  );
}

export function GalleryWall({ images }: GalleryWallProps) {
  const visible = images.slice(0, positions.length);

  return (
    <group position={[0, 0, 8.2]}>
      <mesh position={[0, 2.35, 0]} receiveShadow>
        <boxGeometry args={[16.4, 6.5, 0.35]} />
        <meshStandardMaterial color="#292929" metalness={0.72} roughness={0.5} />
      </mesh>
      <mesh position={[0, 5.88, 0.2]}>
        <boxGeometry args={[16.4, 0.08, 0.08]} />
        <meshBasicMaterial color="#8c50f0" toneMapped={false} />
      </mesh>

      {positions.map((position, index) => {
        const image = visible[index];
        if (!image) return <EmptyFrame key={`empty-${index}`} position={position} number={index + 1} />;

        return (
          <group key={image.id} position={position}>
            <mesh castShadow>
              <boxGeometry args={[4.35, 2.15, 0.16]} />
              <meshStandardMaterial color="#737373" metalness={0.92} roughness={0.26} />
            </mesh>
            <Suspense fallback={null}>
              <DreiImage
                url={image.url}
                position={[0, 0, 0.1]}
                scale={[4, 1.82]}
                transparent
              />
            </Suspense>
          </group>
        );
      })}

      <Html transform position={[-7.55, 5.85, 0.32]} distanceFactor={9}>
        <div className="pointer-events-none w-52 -translate-y-full">
          <p className="micro-label text-[#b994ff]">Selected work · Live archive</p>
        </div>
      </Html>
    </group>
  );
}
