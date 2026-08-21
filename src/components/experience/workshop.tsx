"use client";

import { useMemo, useRef, useState } from "react";
import { Float, Grid, Html, RoundedBox, useCursor, useTexture } from "@react-three/drei";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { GalleryWall } from "./gallery-wall";
import { CncPlasmaTable, DraftingStudio, SignageFoundry } from "./industrial-stations";
import { NamibEnvironment } from "./namib-environment";
import type { GalleryImage } from "@/lib/gallery";
import { zoneById, type ZoneId } from "@/lib/zones";

type WorkshopProps = {
  activeZone: ZoneId;
  onZoneChange: (zone: ZoneId) => void;
  galleryImages: GalleryImage[];
  reducedMotion: boolean;
  mobile: boolean;
};

type HotspotProps = {
  zone: ZoneId;
  position: [number, number, number];
  activeZone: ZoneId;
  onZoneChange: (zone: ZoneId) => void;
};

function Hotspot({ zone, position, activeZone, onZoneChange }: HotspotProps) {
  const root = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const active = zone === activeZone;
  useCursor(hovered);

  useFrame((state) => {
    if (!root.current) return;
    const pulse = 1 + Math.sin(state.clock.elapsedTime * 2.2) * 0.055;
    root.current.scale.setScalar((active || hovered ? 1.16 : 1) * pulse);
  });

  const select = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    onZoneChange(zone);
  };

  return (
    <group ref={root} position={position}>
      <mesh
        onClick={select}
        onPointerOver={(event) => {
          event.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[0.14, 24, 24]} />
        <meshBasicMaterial color={active || hovered ? "#c8a4ff" : "#dcdcdc"} toneMapped={false} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.34, 0.014, 10, 48]} />
        <meshBasicMaterial
          color={active || hovered ? "#8c50f0" : "#737373"}
          transparent
          opacity={active || hovered ? 0.96 : 0.45}
          toneMapped={false}
        />
      </mesh>
      <mesh position={[0, -0.42, 0]}>
        <cylinderGeometry args={[0.012, 0.012, 0.76, 8]} />
        <meshBasicMaterial color={active || hovered ? "#8c50f0" : "#5f6366"} transparent opacity={0.7} />
      </mesh>
      <Html position={[0, 0.68, 0]} center distanceFactor={10}>
        <button
          type="button"
          className="station-label"
          data-active={active}
          onPointerEnter={() => setHovered(true)}
          onPointerLeave={() => setHovered(false)}
          onClick={() => onZoneChange(zone)}
        >
          <span className="station-label-dot" /> {zoneById(zone).label}
        </button>
      </Html>
    </group>
  );
}

function BrandMonolith({ reducedMotion }: { reducedMotion: boolean }) {
  const group = useRef<THREE.Group>(null);
  const markTexture = useTexture("/brand/mark-transparent.png");
  useFrame((state, delta) => {
    if (!group.current || reducedMotion) return;
    group.current.rotation.y += delta * 0.085;
    group.current.position.y = 2.55 + Math.sin(state.clock.elapsedTime * 0.58) * 0.09;
  });

  return (
    <Float speed={reducedMotion ? 0 : 1.05} rotationIntensity={0.08} floatIntensity={0.12}>
      <group ref={group} position={[0, 2.55, 0]} rotation={[-0.06, 0.24, 0.02]}>
        <mesh castShadow>
          <cylinderGeometry args={[1.72, 1.72, 0.34, 72]} />
          <meshPhysicalMaterial
            color="#25292c"
            metalness={0.93}
            roughness={0.18}
            clearcoat={0.85}
            clearcoatRoughness={0.2}
          />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.19]}>
          <torusGeometry args={[1.48, 0.055, 16, 72]} />
          <meshStandardMaterial color="#858b8e" metalness={0.98} roughness={0.19} />
        </mesh>
        {[0.2, 0.245, 0.29].map((z, index) => (
          <mesh key={z} position={[0, 0, z]}>
            <planeGeometry args={[2.72, 2.92]} />
            <meshStandardMaterial
              map={markTexture}
              emissiveMap={markTexture}
              emissive={index === 2 ? "#2f1459" : "#080808"}
              emissiveIntensity={index === 2 ? 0.8 : 0.08}
              transparent
              alphaTest={0.09}
              metalness={0.7}
              roughness={0.24}
            />
          </mesh>
        ))}
        <pointLight position={[0.7, -0.1, 0.6]} color="#8c50f0" intensity={28} distance={6} />
      </group>
    </Float>
  );
}

function KeywordGantries() {
  const keywords = [
    { text: "ENGINEERING", position: [-5.8, 5.5, -4.6] as const, rotation: [0, 0.3, 0] as const },
    { text: "STEEL FABRICATION", position: [-7.8, 4.9, 4.7] as const, rotation: [0, 0.66, 0] as const },
    { text: "DESIGN", position: [5.6, 5.3, -4.5] as const, rotation: [0, -0.34, 0] as const },
    { text: "PERFECTION", position: [7.3, 5, 4.4] as const, rotation: [0, -0.65, 0] as const },
  ];

  return (
    <>
      {keywords.map((item, index) => (
        <group key={item.text} position={item.position} rotation={item.rotation}>
          <RoundedBox args={[4.3, 0.82, 0.12]} radius={0.06} smoothness={3} castShadow>
            <meshStandardMaterial
              color={index === 1 ? "#6f3cb7" : "#35393c"}
              metalness={0.94}
              roughness={0.28}
              emissive={index === 1 ? "#250d4e" : "#000000"}
              emissiveIntensity={index === 1 ? 0.9 : 0}
            />
          </RoundedBox>
          {[-1.87, 1.87].map((x) => (
            <mesh key={x} position={[x, 0, 0.09]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.045, 0.045, 0.05, 12]} />
              <meshStandardMaterial color="#b6babd" metalness={1} roughness={0.18} />
            </mesh>
          ))}
          <Html transform position={[0, 0, 0.08]} distanceFactor={8} center>
            <div className="pointer-events-none w-64 text-center font-mono text-[0.56rem] font-semibold tracking-[0.24em] text-white/85">
              {item.text}
            </div>
          </Html>
        </group>
      ))}
    </>
  );
}

function ContactStation() {
  const shape = useMemo(() => {
    const namibia = new THREE.Shape();
    namibia.moveTo(-0.52, 1.32);
    namibia.lineTo(0.38, 1.18);
    namibia.lineTo(0.5, 0.52);
    namibia.lineTo(0.32, 0.05);
    namibia.lineTo(0.42, -0.55);
    namibia.lineTo(0.1, -1.34);
    namibia.lineTo(-0.18, -1.48);
    namibia.lineTo(-0.31, -0.7);
    namibia.lineTo(-0.58, -0.2);
    namibia.lineTo(-0.45, 0.42);
    namibia.lineTo(-0.78, 0.98);
    namibia.closePath();
    return namibia;
  }, []);

  const geometry = useMemo(
    () => new THREE.ExtrudeGeometry(shape, { depth: 0.14, bevelEnabled: true, bevelSize: 0.04, bevelThickness: 0.04, bevelSegments: 3 }),
    [shape],
  );

  return (
    <group position={[8.1, 0, -7]}>
      <mesh geometry={geometry} position={[0, 1.75, 0]} rotation={[0, 0, -0.05]} castShadow>
        <meshStandardMaterial color="#767c80" metalness={0.92} roughness={0.26} />
      </mesh>
      <mesh position={[-0.54, 2.18, 0.22]}>
        <sphereGeometry args={[0.09, 20, 20]} />
        <meshBasicMaterial color="#b994ff" toneMapped={false} />
      </mesh>
      <pointLight position={[-0.54, 2.18, 0.45]} color="#8c50f0" intensity={16} distance={3} />
      <mesh position={[0, 0.08, 0]} receiveShadow>
        <cylinderGeometry args={[2.35, 2.6, 0.18, 64]} />
        <meshStandardMaterial color="#34383a" metalness={0.86} roughness={0.34} />
      </mesh>
      <mesh position={[0, 0.19, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.9, 0.025, 12, 64]} />
        <meshBasicMaterial color="#8c50f0" transparent opacity={0.62} toneMapped={false} />
      </mesh>
      <Html transform position={[0.75, 3.55, 0]} distanceFactor={10} center>
        <div className="glass-panel pointer-events-none w-72 rounded-2xl p-5 text-left">
          <p className="micro-label text-[#b994ff]">Made in Namibia</p>
          <p className="mt-3 text-sm font-semibold text-white/85">Swakopmund workshop</p>
          <p className="mt-2 text-xs leading-5 text-white/52">
            Unit 2 Marvin Park · Industrial Area<br />From the Atlantic coast to sites nationwide.
          </p>
        </div>
      </Html>
    </group>
  );
}

function WorkshopShell({ mobile }: { mobile: boolean }) {
  return (
    <>
      <mesh position={[0, -0.12, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[46, 46]} />
        <meshStandardMaterial color="#25282a" metalness={0.44} roughness={0.7} />
      </mesh>
      <Grid
        position={[0, -0.01, 0]}
        args={[44, 44]}
        cellSize={0.5}
        cellThickness={0.38}
        cellColor="#484d50"
        sectionSize={4}
        sectionThickness={0.95}
        sectionColor="#7442c5"
        fadeDistance={mobile ? 24 : 38}
        fadeStrength={1.6}
        infiniteGrid
      />
      {[-10, 0, 10].map((z) => (
        <group key={z} position={[0, 7, z]}>
          <mesh castShadow>
            <boxGeometry args={[25, 0.18, 0.24]} />
            <meshStandardMaterial color="#5d6265" metalness={0.94} roughness={0.28} />
          </mesh>
          {[-12, 12].map((x) => (
            <group key={x} position={[x, -3.5, 0]}>
              <mesh castShadow>
                <boxGeometry args={[0.24, 7, 0.24]} />
                <meshStandardMaterial color="#5d6265" metalness={0.94} roughness={0.28} />
              </mesh>
              {[-2.4, 0, 2.4].map((y) => (
                <mesh key={y} position={[0, y, 0.17]} rotation={[Math.PI / 2, 0, 0]}>
                  <cylinderGeometry args={[0.055, 0.055, 0.05, 12]} />
                  <meshStandardMaterial color="#b3b7b9" metalness={1} roughness={0.18} />
                </mesh>
              ))}
            </group>
          ))}
        </group>
      ))}
    </>
  );
}

export function Workshop({
  activeZone,
  onZoneChange,
  galleryImages,
  reducedMotion,
  mobile,
}: WorkshopProps) {
  return (
    <>
      <hemisphereLight args={["#b9cbd2", "#231d20", 1.45]} />
      <directionalLight
        position={[6, 13, 8]}
        intensity={2.65}
        color="#f1e9df"
        castShadow={!mobile}
        shadow-mapSize-width={mobile ? 512 : 2048}
        shadow-mapSize-height={mobile ? 512 : 2048}
        shadow-camera-far={48}
        shadow-camera-left={-14}
        shadow-camera-right={14}
        shadow-camera-top={14}
        shadow-camera-bottom={-14}
        shadow-bias={-0.00012}
      />
      <spotLight position={[-8, 8, 6]} color="#8c50f0" intensity={210} angle={0.42} penumbra={0.78} distance={31} />
      <spotLight position={[10, 9, -7]} color="#55a5c0" intensity={145} angle={0.4} penumbra={0.82} distance={30} />
      <spotLight position={[-11, 9, -11]} color="#d0a06f" intensity={110} angle={0.48} penumbra={0.9} distance={32} />

      <NamibEnvironment />
      <WorkshopShell mobile={mobile} />
      <KeywordGantries />
      <BrandMonolith reducedMotion={reducedMotion} />
      <CncPlasmaTable active={activeZone === "cnc"} reducedMotion={reducedMotion} onSelect={onZoneChange} />
      <DraftingStudio active={activeZone === "drafting"} reducedMotion={reducedMotion} onSelect={onZoneChange} />
      <SignageFoundry active={activeZone === "signage"} reducedMotion={reducedMotion} onSelect={onZoneChange} />
      <GalleryWall images={galleryImages} />
      <ContactStation />

      <Hotspot zone="overview" position={[0, 0.28, 2.2]} activeZone={activeZone} onZoneChange={onZoneChange} />
      <Hotspot zone="cnc" position={[-6.9, 1.58, 1.38]} activeZone={activeZone} onZoneChange={onZoneChange} />
      <Hotspot zone="drafting" position={[0, 3.8, -6.45]} activeZone={activeZone} onZoneChange={onZoneChange} />
      <Hotspot zone="signage" position={[7.1, 4.95, 0.8]} activeZone={activeZone} onZoneChange={onZoneChange} />
      <Hotspot zone="showcase" position={[0, 5.8, 8.5]} activeZone={activeZone} onZoneChange={onZoneChange} />
      <Hotspot zone="contact" position={[8.1, 3.35, -7]} activeZone={activeZone} onZoneChange={onZoneChange} />
    </>
  );
}
