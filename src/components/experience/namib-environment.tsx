"use client";

import { useMemo } from "react";
import { Html } from "@react-three/drei";
import * as THREE from "three";

function makeDuneGeometry(width: number, depth: number, offset: number) {
  const geometry = new THREE.PlaneGeometry(width, depth, 52, 30);
  geometry.rotateX(-Math.PI / 2);
  const positions = geometry.attributes.position;

  for (let index = 0; index < positions.count; index += 1) {
    const x = positions.getX(index);
    const z = positions.getZ(index);
    const ridge = Math.sin((x + offset) * 0.22 + Math.sin(z * 0.17)) * 0.75;
    const swell = Math.sin(z * 0.28 + offset) * 0.38;
    const wind = Math.sin(x * 0.55 + z * 0.14) * 0.11;
    positions.setY(index, ridge + swell + wind);
  }

  positions.needsUpdate = true;
  geometry.computeVertexNormals();
  return geometry;
}

function DuneField() {
  const rear = useMemo(() => makeDuneGeometry(46, 18, 0.4), []);
  const front = useMemo(() => makeDuneGeometry(46, 15, 2.8), []);

  return (
    <group position={[0, -0.48, -15.5]}>
      <mesh geometry={rear} position={[0, 0.2, -2]} receiveShadow>
        <meshStandardMaterial color="#775848" metalness={0.14} roughness={0.91} />
      </mesh>
      <mesh geometry={front} position={[0, -0.42, 3]} receiveShadow>
        <meshStandardMaterial color="#5b4741" metalness={0.18} roughness={0.88} />
      </mesh>
      <mesh position={[0, 4.6, -11.2]}>
        <planeGeometry args={[48, 12]} />
        <meshBasicMaterial color="#232631" />
      </mesh>
      <mesh position={[-11.8, 7.4, -10.7]}>
        <circleGeometry args={[1.45, 64]} />
        <meshBasicMaterial color="#b99674" transparent opacity={0.56} toneMapped={false} />
      </mesh>
      <pointLight position={[-11.8, 7.4, -9.8]} color="#d8aa78" intensity={42} distance={22} />
    </group>
  );
}

function CoastalMarkers() {
  return (
    <group position={[0, 0, -11.2]}>
      {[-12, -8, 8, 12].map((x, index) => (
        <group key={x} position={[x, 0, index % 2 === 0 ? 0.5 : -0.3]}>
          <mesh position={[0, 1.3, 0]}>
            <cylinderGeometry args={[0.035, 0.06, 2.6, 10]} />
            <meshStandardMaterial color="#777d80" metalness={0.92} roughness={0.28} />
          </mesh>
          <mesh position={[0, 2.64, 0]}>
            <sphereGeometry args={[0.08, 14, 14]} />
            <meshBasicMaterial color={index % 2 ? "#56b9ce" : "#8c50f0"} toneMapped={false} />
          </mesh>
          <pointLight
            position={[0, 2.62, 0]}
            color={index % 2 ? "#56b9ce" : "#8c50f0"}
            intensity={8}
            distance={3}
          />
        </group>
      ))}
      <Html transform position={[-9.4, 3.65, 0]} distanceFactor={11}>
        <div className="namib-marker pointer-events-none w-64">
          <p className="micro-label text-[#cdb093]">Atlantic edge · Namib Desert</p>
          <p className="mt-2 text-[0.7rem] leading-5 text-white/55">
            Designed in Swakopmund. Built for Namibia.
          </p>
        </div>
      </Html>
    </group>
  );
}

export function NamibEnvironment() {
  return (
    <>
      <DuneField />
      <CoastalMarkers />
    </>
  );
}
