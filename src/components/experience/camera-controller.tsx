"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { gsap } from "gsap";
import * as THREE from "three";
import { zoneById, type ZoneId } from "@/lib/zones";

type CameraControllerProps = {
  activeZone: ZoneId;
  reducedMotion: boolean;
};

type OrbitLikeControls = {
  target: THREE.Vector3;
  update: () => void;
};

export function CameraController({ activeZone, reducedMotion }: CameraControllerProps) {
  const camera = useThree((state) => state.camera);
  const controls = useThree((state) => state.controls) as unknown as
    | OrbitLikeControls
    | undefined;
  const lookTarget = useRef(new THREE.Vector3(...zoneById(activeZone).target));
  const basePosition = useRef(new THREE.Vector3(...zoneById(activeZone).camera));
  const desiredPosition = useRef(new THREE.Vector3());
  const desiredTarget = useRef(new THREE.Vector3());

  useEffect(() => {
    const zone = zoneById(activeZone);
    const duration = reducedMotion ? 0.01 : 1.65;
    const timeline = gsap.timeline({ defaults: { duration, ease: "power3.inOut" } });

    timeline.to(
      basePosition.current,
      { x: zone.camera[0], y: zone.camera[1], z: zone.camera[2] },
      0,
    );
    timeline.to(
      lookTarget.current,
      { x: zone.target[0], y: zone.target[1], z: zone.target[2] },
      0,
    );

    return () => {
      timeline.kill();
    };
  }, [activeZone, reducedMotion]);

  useFrame((state, delta) => {
    const parallaxX = controls || reducedMotion ? 0 : state.pointer.x * 0.5;
    const parallaxY = controls || reducedMotion ? 0 : state.pointer.y * 0.28;
    desiredPosition.current.copy(basePosition.current);
    desiredPosition.current.x += parallaxX;
    desiredPosition.current.y += parallaxY;
    camera.position.lerp(
      desiredPosition.current,
      1 - Math.exp(-delta * (reducedMotion ? 24 : 6.5)),
    );

    if (controls) {
      controls.target.lerp(lookTarget.current, 0.14);
      controls.update();
    } else {
      desiredTarget.current.copy(lookTarget.current);
      desiredTarget.current.x += state.pointer.x * 0.16;
      desiredTarget.current.y += state.pointer.y * 0.1;
      camera.lookAt(desiredTarget.current);
    }
  });

  return null;
}
