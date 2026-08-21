"use client";

import { useMemo, useRef, useState } from "react";
import { Line, RoundedBox, Sparkles, useCursor, useTexture } from "@react-three/drei";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import type { ZoneId } from "@/lib/zones";

type StationProps = {
  active: boolean;
  reducedMotion: boolean;
  onSelect: (zone: ZoneId) => void;
};

function SteelBeam({
  position,
  scale,
  color = "#5c6267",
}: {
  position: [number, number, number];
  scale: [number, number, number];
  color?: string;
}) {
  return (
    <RoundedBox position={position} args={scale} radius={0.055} smoothness={3} castShadow receiveShadow>
      <meshStandardMaterial color={color} metalness={0.9} roughness={0.29} />
    </RoundedBox>
  );
}

function Bolt({ position }: { position: [number, number, number] }) {
  return (
    <mesh position={position} rotation={[Math.PI / 2, 0, 0]} castShadow>
      <cylinderGeometry args={[0.07, 0.07, 0.045, 12]} />
      <meshStandardMaterial color="#b8bdc0" metalness={1} roughness={0.18} />
    </mesh>
  );
}

export function CncPlasmaTable({ active, reducedMotion, onSelect }: StationProps) {
  const root = useRef<THREE.Group>(null);
  const gantry = useRef<THREE.Group>(null);
  const carriage = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  useCursor(hovered);

  const cableCurve = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(-1.65, 2.43, -0.08),
        new THREE.Vector3(-0.8, 2.93, -0.08),
        new THREE.Vector3(0.4, 2.93, -0.08),
        new THREE.Vector3(1.15, 2.52, -0.08),
      ]),
    [],
  );

  useFrame((state, delta) => {
    if (root.current) {
      const target = hovered || active ? 1.025 : 1;
      root.current.scale.setScalar(THREE.MathUtils.damp(root.current.scale.x, target, 7, delta));
    }
    if (carriage.current && !reducedMotion) {
      carriage.current.position.x = Math.sin(state.clock.elapsedTime * 0.52) * 1.25;
    }
    if (gantry.current && !reducedMotion) {
      gantry.current.position.z = Math.cos(state.clock.elapsedTime * 0.37) * 0.72;
    }
  });

  const choose = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    onSelect("cnc");
  };

  return (
    <group
      ref={root}
      position={[-6.9, 0, 0]}
      onClick={choose}
      onPointerOver={(event) => {
        event.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
    >
      <group position={[0, 0.1, 0]}>
        {[-1.95, 1.95].flatMap((x) =>
          [-1.2, 1.2].map((z) => (
            <group key={`${x}-${z}`}>
              <SteelBeam position={[x, 0.55, z]} scale={[0.24, 1.1, 0.24]} color="#464b4f" />
              <mesh position={[x, 0.035, z]}>
                <cylinderGeometry args={[0.2, 0.24, 0.08, 16]} />
                <meshStandardMaterial color="#202224" metalness={0.82} roughness={0.44} />
              </mesh>
            </group>
          )),
        )}
        <SteelBeam position={[0, 0.82, -1.2]} scale={[4.25, 0.3, 0.28]} />
        <SteelBeam position={[0, 0.82, 1.2]} scale={[4.25, 0.3, 0.28]} />
        <SteelBeam position={[-1.94, 0.82, 0]} scale={[0.28, 0.3, 2.55]} />
        <SteelBeam position={[1.94, 0.82, 0]} scale={[0.28, 0.3, 2.55]} />

        <RoundedBox position={[0, 1.02, 0]} args={[3.75, 0.34, 2.22]} radius={0.08} smoothness={3} receiveShadow>
          <meshStandardMaterial color="#24282b" metalness={0.76} roughness={0.42} />
        </RoundedBox>
        <mesh position={[0, 1.22, 0]} receiveShadow>
          <boxGeometry args={[3.48, 0.14, 1.95]} />
          <meshStandardMaterial color="#34393c" metalness={0.88} roughness={0.35} />
        </mesh>
        {Array.from({ length: 17 }).map((_, index) => (
          <mesh key={index} position={[-1.6 + index * 0.2, 1.37, 0]} castShadow>
            <boxGeometry args={[0.065, 0.22, 1.82]} />
            <meshStandardMaterial
              color={index % 3 === 0 ? "#8a8f92" : "#686e72"}
              metalness={0.96}
              roughness={0.24}
            />
          </mesh>
        ))}

        {[-1.82, 1.82].map((x) => (
          <group key={x}>
            <mesh position={[x, 1.55, 0]} castShadow>
              <boxGeometry args={[0.12, 0.1, 2.54]} />
              <meshStandardMaterial color="#c5cacc" metalness={0.98} roughness={0.16} />
            </mesh>
            {[-0.92, 0, 0.92].map((z) => (
              <RoundedBox key={z} position={[x, 1.62, z]} args={[0.25, 0.13, 0.32]} radius={0.035} smoothness={2} castShadow>
                <meshStandardMaterial color="#4d5356" metalness={0.9} roughness={0.25} />
              </RoundedBox>
            ))}
          </group>
        ))}

        <mesh position={[0.35, 1.52, 0.15]} rotation={[0, 0.08, 0]} castShadow>
          <boxGeometry args={[1.95, 0.08, 1.05]} />
          <meshStandardMaterial color="#858a8d" metalness={0.95} roughness={0.3} />
        </mesh>
        <Line
          points={[
            [-0.45, 1.58, -0.24],
            [0.05, 1.58, -0.5],
            [0.75, 1.58, -0.1],
            [0.2, 1.58, 0.5],
            [-0.45, 1.58, -0.24],
          ]}
          color="#8c50f0"
          lineWidth={1.4}
        />

        <group ref={gantry}>
          {[-1.98, 1.98].map((x) => (
            <group key={x}>
              <SteelBeam position={[x, 1.85, 0]} scale={[0.3, 1.65, 0.36]} color="#747a7e" />
              {[1.18, 1.64, 2.1, 2.56].map((y) => (
                <Bolt key={y} position={[x, y, -0.195]} />
              ))}
            </group>
          ))}
          <SteelBeam position={[0, 2.64, 0]} scale={[4.28, 0.38, 0.42]} color="#c3c7c9" />
          <mesh position={[0, 2.64, -0.23]}>
            <boxGeometry args={[3.5, 0.12, 0.04]} />
            <meshBasicMaterial color={hovered || active ? "#8c50f0" : "#6c7174"} toneMapped={false} />
          </mesh>

          <mesh>
            <tubeGeometry args={[cableCurve, 42, 0.065, 9, false]} />
            <meshStandardMaterial color="#151719" metalness={0.35} roughness={0.75} />
          </mesh>
          {Array.from({ length: 15 }).map((_, index) => {
            const point = cableCurve.getPoint(index / 14);
            return (
              <mesh key={index} position={point} rotation={[0, 0, 0.2]}>
                <boxGeometry args={[0.19, 0.11, 0.21]} />
                <meshStandardMaterial color="#24272a" metalness={0.7} roughness={0.48} />
              </mesh>
            );
          })}

          <mesh position={[-1.83, 2.5, 0.22]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.16, 0.16, 0.18, 24]} />
            <meshStandardMaterial color="#2b2f32" metalness={0.84} roughness={0.31} />
          </mesh>
          <mesh position={[-1.83, 2.5, 0.325]}>
            <torusGeometry args={[0.095, 0.022, 8, 24]} />
            <meshBasicMaterial color="#8c50f0" toneMapped={false} />
          </mesh>

          <group ref={carriage} position={[0, 2.42, 0.42]}>
          <RoundedBox args={[0.58, 0.54, 0.64]} radius={0.08} smoothness={3} castShadow>
            <meshStandardMaterial color="#d2d5d6" metalness={0.9} roughness={0.22} />
          </RoundedBox>
          <mesh position={[0, -0.62, 0]} castShadow>
            <cylinderGeometry args={[0.18, 0.11, 0.85, 24]} />
            <meshStandardMaterial color="#9da3a6" metalness={0.95} roughness={0.2} />
          </mesh>
          <mesh position={[0, -1.08, 0]}>
            <cylinderGeometry args={[0.045, 0.025, 0.18, 16]} />
            <meshStandardMaterial color="#d8a765" metalness={0.91} roughness={0.2} />
          </mesh>
          <pointLight
            position={[0, -1.13, 0]}
            color="#9c5cff"
            intensity={active || hovered ? 65 : 16}
            distance={4.5}
          />
          {!reducedMotion && (active || hovered) && (
            <Sparkles
              position={[0, -1.16, 0]}
              count={22}
              scale={[1.25, 0.22, 1.25]}
              size={2.3}
              speed={1.35}
              color="#d8b3ff"
              noise={1.2}
            />
          )}
          </group>
        </group>

        <group position={[2.7, 1.15, 0.72]} rotation={[0, -0.22, 0]}>
          <SteelBeam position={[0, 0, 0]} scale={[0.84, 1.9, 0.72]} color="#383d40" />
          <mesh position={[0, 0.34, 0.375]}>
            <planeGeometry args={[0.6, 0.56]} />
            <meshStandardMaterial
              color="#10151b"
              emissive={hovered || active ? "#4b2584" : "#17202b"}
              emissiveIntensity={1.8}
            />
          </mesh>
          {[[-0.19, -0.15], [0, -0.15], [0.19, -0.15]].map(([x, y], index) => (
            <mesh key={index} position={[x, y, 0.385]}>
              <cylinderGeometry args={[0.045, 0.045, 0.035, 14]} />
              <meshStandardMaterial color={index === 2 ? "#bd4d44" : "#9fa5a8"} metalness={0.7} roughness={0.32} />
            </mesh>
          ))}
        </group>
      </group>
    </group>
  );
}

export function DraftingStudio({ active, reducedMotion, onSelect }: StationProps) {
  const root = useRef<THREE.Group>(null);
  const scanner = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  useCursor(hovered);

  useFrame((state, delta) => {
    if (root.current) {
      const target = hovered || active ? 1.025 : 1;
      root.current.scale.setScalar(THREE.MathUtils.damp(root.current.scale.x, target, 7, delta));
    }
    if (scanner.current && !reducedMotion) {
      scanner.current.position.x = Math.sin(state.clock.elapsedTime * 0.7) * 2.02;
    }
  });

  const blueprintLines = useMemo(() => {
    const lines: Array<Array<[number, number, number]>> = [];
    for (let index = -3; index <= 3; index += 1) {
      lines.push([
        [-2.15, index * 0.34, 0.012],
        [2.15, index * 0.34, 0.012],
      ]);
    }
    for (let index = -5; index <= 5; index += 1) {
      lines.push([
        [index * 0.39, -1.05, 0.012],
        [index * 0.39, 1.05, 0.012],
      ]);
    }
    return lines;
  }, []);

  return (
    <group
      ref={root}
      position={[0, 0, -7]}
      onClick={(event) => {
        event.stopPropagation();
        onSelect("drafting");
      }}
      onPointerOver={(event) => {
        event.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
    >
      <group position={[0, 0.06, 0]}>
        {[-1.75, 1.75].map((x) => (
          <group key={x}>
            <SteelBeam position={[x, 0.88, 0.42]} scale={[0.22, 1.75, 0.24]} color="#555b5f" />
            <SteelBeam position={[x * 0.72, 0.18, 0.42]} scale={[1.3, 0.18, 0.3]} color="#3e4346" />
            <mesh position={[x, 1.53, 0.42]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[0.24, 0.24, 0.26, 20]} />
              <meshStandardMaterial color="#8c50f0" metalness={0.8} roughness={0.27} />
            </mesh>
          </group>
        ))}
        <SteelBeam position={[0, 0.8, 0.42]} scale={[3.45, 0.18, 0.24]} color="#4c5255" />

        <group position={[0, 2.16, 0]} rotation={[-0.72, 0, 0]}>
          <RoundedBox args={[5.1, 3.15, 0.2]} radius={0.08} smoothness={3} castShadow>
            <meshStandardMaterial color="#bfc3c4" metalness={0.82} roughness={0.28} />
          </RoundedBox>
          <mesh position={[0, 0, 0.115]}>
            <planeGeometry args={[4.68, 2.72]} />
            <meshStandardMaterial
              color="#172436"
              emissive={active || hovered ? "#241846" : "#0c1320"}
              emissiveIntensity={0.75}
              roughness={0.62}
            />
          </mesh>
          {blueprintLines.map((points, index) => (
            <Line key={index} points={points} color="#5f7ba1" transparent opacity={0.28} lineWidth={0.45} />
          ))}
          <Line
            points={[
              [-1.7, -0.62, 0.025],
              [-0.85, 0.58, 0.025],
              [0.12, 0.14, 0.025],
              [0.98, 0.74, 0.025],
              [1.65, -0.42, 0.025],
              [0.7, -0.68, 0.025],
              [-0.25, -0.22, 0.025],
              [-1.7, -0.62, 0.025],
            ]}
            color="#b994ff"
            lineWidth={1.6}
          />
          <Line points={[[-1.7, 0.92, 0.026], [1.65, 0.92, 0.026]]} color="#d8dee6" lineWidth={0.8} />
          <Line points={[[-1.7, 0.82, 0.026], [-1.7, 1.02, 0.026]]} color="#d8dee6" lineWidth={0.8} />
          <Line points={[[1.65, 0.82, 0.026], [1.65, 1.02, 0.026]]} color="#d8dee6" lineWidth={0.8} />
          <mesh ref={scanner} position={[0, 0, 0.032]}>
            <planeGeometry args={[0.025, 2.66]} />
            <meshBasicMaterial color="#a876ff" transparent opacity={active || hovered ? 0.9 : 0.35} toneMapped={false} />
          </mesh>
          <mesh position={[0, -1.48, 0.16]} castShadow>
            <boxGeometry args={[5.38, 0.17, 0.16]} />
            <meshStandardMaterial color="#6d7376" metalness={0.95} roughness={0.22} />
          </mesh>
          <mesh position={[-1.3, -1.4, 0.3]} rotation={[0, 0, -0.45]} castShadow>
            <boxGeometry args={[1.8, 0.08, 0.08]} />
            <meshStandardMaterial color="#dedede" metalness={0.7} roughness={0.32} />
          </mesh>
        </group>

        <group position={[2.48, 2.9, 0.55]}>
          <mesh rotation={[0, 0, 0.7]} castShadow>
            <cylinderGeometry args={[0.055, 0.055, 1.7, 14]} />
            <meshStandardMaterial color="#8a9093" metalness={0.95} roughness={0.2} />
          </mesh>
          <mesh position={[-0.54, 0.55, 0]} rotation={[0, 0, -0.86]} castShadow>
            <cylinderGeometry args={[0.055, 0.055, 1.45, 14]} />
            <meshStandardMaterial color="#8a9093" metalness={0.95} roughness={0.2} />
          </mesh>
          <mesh position={[-1.1, 0.95, 0]} rotation={[0, 0, 0.2]} castShadow>
            <coneGeometry args={[0.32, 0.58, 24, 1, true]} />
            <meshStandardMaterial color="#34383a" metalness={0.85} roughness={0.28} side={THREE.DoubleSide} />
          </mesh>
          <spotLight position={[-1.13, 0.82, 0]} target-position={[-1.2, -1.1, 0]} color="#d9d6ca" intensity={24} distance={6} angle={0.52} penumbra={0.75} />
        </group>

        <group position={[3.55, 0, 0.42]}>
          <RoundedBox position={[0, 1.08, 0]} args={[2.45, 0.18, 1.35]} radius={0.08} smoothness={3} castShadow>
            <meshStandardMaterial color="#262a2d" metalness={0.77} roughness={0.35} />
          </RoundedBox>
          <mesh position={[0, 1.18, 0.57]}>
            <boxGeometry args={[2.25, 0.025, 0.025]} />
            <meshBasicMaterial color="#8c50f0" toneMapped={false} />
          </mesh>
          <RoundedBox position={[0.76, 0.54, -0.08]} args={[0.82, 1.08, 1.05]} radius={0.06} smoothness={3} castShadow>
            <meshStandardMaterial color="#34383b" metalness={0.82} roughness={0.34} />
          </RoundedBox>
          {[0.78, 0.48, 0.18].map((y) => (
            <group key={y} position={[0.76, y, 0.46]}>
              <mesh>
                <boxGeometry args={[0.65, 0.2, 0.035]} />
                <meshStandardMaterial color="#24282b" metalness={0.72} roughness={0.4} />
              </mesh>
              <mesh position={[0, 0, 0.025]}>
                <boxGeometry args={[0.24, 0.025, 0.02]} />
                <meshBasicMaterial color="#7950b5" toneMapped={false} />
              </mesh>
            </group>
          ))}

          <mesh position={[0.08, 2.13, -0.18]} castShadow>
            <boxGeometry args={[1.85, 1.08, 0.14]} />
            <meshStandardMaterial color="#171a1d" metalness={0.7} roughness={0.3} />
          </mesh>
          <mesh position={[0.08, 2.13, -0.095]}>
            <planeGeometry args={[1.62, 0.85]} />
            <meshStandardMaterial
              color="#10151d"
              emissive={active || hovered ? "#462578" : "#172137"}
              emissiveIntensity={1.45}
              roughness={0.28}
            />
          </mesh>
          <mesh position={[0.08, 1.46, -0.18]}>
            <cylinderGeometry args={[0.08, 0.14, 0.48, 20]} />
            <meshStandardMaterial color="#73797c" metalness={0.94} roughness={0.2} />
          </mesh>
          <mesh position={[0.08, 1.24, -0.18]}>
            <cylinderGeometry args={[0.42, 0.42, 0.06, 32]} />
            <meshStandardMaterial color="#373b3e" metalness={0.9} roughness={0.3} />
          </mesh>

          <group position={[-0.35, 1.24, 0.28]} rotation={[-0.12, 0, 0]}>
            <RoundedBox args={[1.25, 0.06, 0.42]} radius={0.045} smoothness={2}>
              <meshStandardMaterial color="#15191b" metalness={0.7} roughness={0.42} />
            </RoundedBox>
            {Array.from({ length: 28 }).map((_, index) => (
              <mesh
                key={index}
                position={[-0.52 + (index % 10) * 0.115, 0.045, -0.13 + Math.floor(index / 10) * 0.13]}
              >
                <boxGeometry args={[0.085, 0.025, 0.075]} />
                <meshStandardMaterial color={index % 9 === 0 ? "#8c50f0" : "#5f6569"} metalness={0.45} roughness={0.45} />
              </mesh>
            ))}
          </group>
          <RoundedBox position={[0.62, 1.26, 0.28]} args={[0.18, 0.1, 0.28]} radius={0.07} smoothness={3}>
            <meshStandardMaterial color="#4d5357" metalness={0.72} roughness={0.38} />
          </RoundedBox>

          <group position={[-0.22, 0.56, 1.42]}>
            <RoundedBox position={[0, 0.55, 0]} args={[1.08, 0.18, 0.92]} radius={0.16} smoothness={4} castShadow>
              <meshStandardMaterial color="#202326" metalness={0.5} roughness={0.58} />
            </RoundedBox>
            <RoundedBox position={[0, 1.35, 0.32]} args={[1.05, 1.35, 0.16]} radius={0.15} smoothness={4} castShadow>
              <meshStandardMaterial color="#25282b" metalness={0.48} roughness={0.55} />
            </RoundedBox>
            <mesh position={[0, 0.05, 0]}>
              <cylinderGeometry args={[0.09, 0.09, 0.82, 16]} />
              <meshStandardMaterial color="#7d8387" metalness={0.96} roughness={0.2} />
            </mesh>
            <mesh position={[0, -0.34, 0]}>
              <cylinderGeometry args={[0.46, 0.46, 0.08, 5]} />
              <meshStandardMaterial color="#484d50" metalness={0.88} roughness={0.28} />
            </mesh>
            {Array.from({ length: 5 }).map((_, index) => {
              const angle = (index / 5) * Math.PI * 2;
              return (
                <mesh key={index} position={[Math.cos(angle) * 0.56, -0.4, Math.sin(angle) * 0.56]} rotation={[Math.PI / 2, 0, 0]}>
                  <torusGeometry args={[0.07, 0.025, 8, 18]} />
                  <meshStandardMaterial color="#303437" metalness={0.78} roughness={0.4} />
                </mesh>
              );
            })}
          </group>
        </group>
      </group>
    </group>
  );
}

export function SignageFoundry({ active, reducedMotion, onSelect }: StationProps) {
  const root = useRef<THREE.Group>(null);
  const logo = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const logoTexture = useTexture("/brand/logo-lockup-transparent.png");
  useCursor(hovered);

  useFrame((state, delta) => {
    if (root.current) {
      const target = hovered || active ? 1.025 : 1;
      root.current.scale.setScalar(THREE.MathUtils.damp(root.current.scale.x, target, 7, delta));
    }
    if (logo.current && !reducedMotion) {
      logo.current.position.z = 0.42 + Math.sin(state.clock.elapsedTime * 0.72) * 0.025;
    }
  });

  return (
    <group
      ref={root}
      position={[7.1, 0, 0]}
      rotation={[0, -0.38, 0]}
      onClick={(event) => {
        event.stopPropagation();
        onSelect("signage");
      }}
      onPointerOver={(event) => {
        event.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
    >
      <group position={[0, 0.12, 0]}>
        <SteelBeam position={[0, 0.2, 0]} scale={[6.2, 0.32, 1.65]} color="#44494c" />
        {[-2.7, 2.7].map((x) => (
          <SteelBeam key={x} position={[x, 1.95, -0.32]} scale={[0.28, 3.55, 0.28]} color="#52585b" />
        ))}
        <RoundedBox position={[0, 2.45, 0]} args={[5.8, 4.25, 0.42]} radius={0.1} smoothness={4} castShadow>
          <meshStandardMaterial color="#292d30" metalness={0.82} roughness={0.34} />
        </RoundedBox>
        <mesh position={[0, 2.45, 0.23]}>
          <planeGeometry args={[5.42, 3.86]} />
          <meshStandardMaterial color="#1c1f22" metalness={0.48} roughness={0.62} />
        </mesh>
        {[-2.5, 2.5].flatMap((x) =>
          [0.72, 4.18].map((y) => (
            <mesh key={`${x}-${y}`} position={[x, y, 0.34]} rotation={[Math.PI / 2, 0, 0]} castShadow>
              <cylinderGeometry args={[0.085, 0.085, 0.12, 16]} />
              <meshStandardMaterial color="#bcc1c3" metalness={1} roughness={0.17} />
            </mesh>
          )),
        )}

        <group ref={logo} position={[0, 2.48, 0.42]}>
          {[0, 0.055, 0.11].map((z, index) => (
            <mesh key={z} position={[0, 0, z]}>
              <planeGeometry args={[4.9, 2.02]} />
              <meshStandardMaterial
                map={logoTexture}
                emissiveMap={logoTexture}
                emissive={index === 2 && (active || hovered) ? "#3e1b70" : "#090909"}
                emissiveIntensity={index === 2 ? 0.85 : 0.18}
                transparent
                alphaTest={0.08}
                metalness={index === 2 ? 0.62 : 0.92}
                roughness={index === 2 ? 0.25 : 0.4}
              />
            </mesh>
          ))}
          <pointLight position={[0, 0, -0.05]} color="#8c50f0" intensity={active || hovered ? 34 : 11} distance={6} />
        </group>

        {[-1.85, -0.62, 0.62, 1.85].map((x) => (
          <group key={x} position={[x, 0.52, 0.38]}>
            <mesh castShadow>
              <boxGeometry args={[0.86, 0.34, 0.18]} />
              <meshStandardMaterial color="#d0d3d4" metalness={0.94} roughness={0.22} />
            </mesh>
            <mesh position={[0, 0, 0.1]}>
              <planeGeometry args={[0.64, 0.12]} />
              <meshBasicMaterial color={x === 0.62 ? "#8c50f0" : "#6b7276"} toneMapped={false} />
            </mesh>
          </group>
        ))}
        <mesh position={[0, 4.72, 0.15]}>
          <boxGeometry args={[5.2, 0.045, 0.06]} />
          <meshBasicMaterial color={active || hovered ? "#9b64f6" : "#5a5f62"} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}
