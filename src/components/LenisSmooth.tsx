"use client";

import { useEffect } from "react";
import Lenis from "lenis";

export default function LenisSmooth() {
  useEffect(() => {
    // Create Lenis with default options (works across versions)
    const lenis = new Lenis({
      // If you later want to tweak, these are safe:
      // duration: 1.2,
      // lerp: 0.1,
      // direction: "vertical",
      // gestureDirection: "vertical",
      // smooth: true,
    });

    // Drive Lenis with our own RAF
    let rafId = requestAnimationFrame(function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    });

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  return null;
}
