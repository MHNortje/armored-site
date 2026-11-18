"use client";

import { useEffect, useRef } from "react";
import styles from "./welding-trail.module.css";

type Spark = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  age: number;
  life: number;
  colour: string;
  width: number;
};

type WeldLine = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  age: number;
  life: number;
  touch: boolean;
};

/** Decorative only: native scrolling, pointer capture and gestures stay with the page. */
export function WeldingTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d", { alpha: true });
    if (!canvas || !context) return;

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let width = 0;
    let height = 0;
    let frame = 0;
    let previousFrame = 0;
    let previousPoint: { x: number; y: number; time: number } | null = null;
    let sparks: Spark[] = [];
    let weldLines: WeldLine[] = [];
    let glow: { x: number; y: number; age: number; touch: boolean } | null = null;

    const clear = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      previousFrame = 0;
      previousPoint = null;
      sparks = [];
      weldLines = [];
      glow = null;
      context.clearRect(0, 0, width, height);
    };

    const resize = () => {
      clear();
      width = window.innerWidth;
      height = window.innerHeight;
      // Keep the transparent overlay inexpensive even on 4K / high-DPI screens.
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5, Math.sqrt(4_000_000 / (width * height)));
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const draw = (time: number) => {
      // Thirty frames per second is enough for a short, quiet ember trail.
      if (time - previousFrame < 30) {
        frame = requestAnimationFrame(draw);
        return;
      }
      const elapsed = previousFrame ? Math.min(time - previousFrame, 60) : 30;
      previousFrame = time;
      context.clearRect(0, 0, width, height);
      const seconds = elapsed / 1000;

      // A cooling red weld seam stays briefly behind the moving arc.
      weldLines = weldLines.filter((line) => {
        line.age += elapsed;
        if (line.age >= line.life) return false;
        const fade = (1 - line.age / line.life) ** 1.4;
        context.lineCap = "round";
        context.beginPath();
        context.moveTo(line.x1, line.y1);
        context.lineTo(line.x2, line.y2);
        context.strokeStyle = "#c53b2e";
        context.lineWidth = line.touch ? 5 : 7;
        context.globalAlpha = fade * 0.18;
        context.stroke();
        context.strokeStyle = "#ff7155";
        context.lineWidth = line.touch ? 1.6 : 2;
        context.globalAlpha = fade * 0.82;
        context.stroke();
        return true;
      });

      sparks = sparks.filter((spark) => {
        spark.age += elapsed;
        if (spark.age >= spark.life) return false;
        const x = spark.x;
        const y = spark.y;
        spark.vy += 105 * seconds;
        spark.x += spark.vx * seconds;
        spark.y += spark.vy * seconds;
        spark.vx *= 0.96;
        context.globalAlpha = (1 - spark.age / spark.life) ** 1.2;
        context.strokeStyle = spark.colour;
        context.lineWidth = spark.width;
        context.lineCap = "round";
        context.beginPath();
        context.moveTo(x - (spark.x - x) * 0.8, y - (spark.y - y) * 0.8);
        context.lineTo(spark.x, spark.y);
        context.stroke();
        return true;
      });

      if (glow) {
        glow.age += elapsed;
        const fade = Math.max(0, 1 - glow.age / 180);
        if (fade > 0) {
          const radius = glow.touch ? 10 : 13;
          const light = context.createRadialGradient(glow.x, glow.y, 0, glow.x, glow.y, radius);
          light.addColorStop(0, "rgba(245, 234, 255, 0.9)");
          light.addColorStop(0.25, "rgba(177, 124, 255, 0.44)");
          light.addColorStop(1, "rgba(140, 80, 240, 0)");
          context.globalAlpha = fade;
          context.fillStyle = light;
          context.fillRect(glow.x - radius, glow.y - radius, radius * 2, radius * 2);
        } else {
          glow = null;
        }
      }

      context.globalAlpha = 1;
      // No permanent animation loop while the visitor is reading or the pointer is still.
      if (sparks.length || weldLines.length || glow) frame = requestAnimationFrame(draw);
      else { frame = 0; previousFrame = 0; }
    };

    const emit = (x: number, y: number, touch: boolean, target: EventTarget | null) => {
      if (motion.matches || document.hidden) return;
      if (target instanceof Element && target.closest("input, textarea, select, [contenteditable='true'], [data-no-welding-trail]")) {
        previousPoint = null;
        return;
      }

      const now = performance.now();
      const last = previousPoint;
      if (!last) { previousPoint = { x, y, time: now }; return; }
      const distance = Math.hypot(x - last.x, y - last.y);
      if (distance < 4 || now - last.time < (touch ? 28 : 18)) return;
      previousPoint = { x, y, time: now };
      // Do not draw a streak across the page after a pause or a new gesture.
      if (distance > 180 || now - last.time > 160) return;

      weldLines.push({ x1: last.x, y1: last.y, x2: x, y2: y, age: 0, life: touch ? 560 : 700, touch });
      weldLines = weldLines.slice(-(touch ? 36 : 50));

      const samples = Math.min(touch ? 2 : 3, Math.max(1, Math.ceil(distance / 12)));
      for (let sample = 1; sample <= samples; sample++) {
        const fraction = sample / samples;
        const originX = last.x + (x - last.x) * fraction;
        const originY = last.y + (y - last.y) * fraction;
        for (let ember = 0; ember < (touch ? 3 : 4); ember++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 16 + Math.random() * (touch ? 34 : 50);
          sparks.push({
            x: originX, y: originY,
            vx: Math.cos(angle) * speed - (x - last.x) * 0.12,
            vy: Math.sin(angle) * speed - 18,
            age: 0,
            life: 280 + Math.random() * (touch ? 260 : 360),
            colour: ["#ffe0a3", "#e9b569", "#b994ff"][Math.floor(Math.random() * 3)],
            width: 1.2 + Math.random() * 0.9,
          });
        }
      }
      sparks = sparks.slice(-(touch ? 64 : 96));
      glow = { x, y, age: 0, touch };
      if (!frame) frame = requestAnimationFrame(draw);
    };

    const pointerMove = (event: PointerEvent) => {
      // Touch has a separate passive fallback because scrolling cancels pointer events.
      if (event.pointerType !== "touch" && event.isPrimary) emit(event.clientX, event.clientY, false, event.target);
    };
    const touchStart = () => { previousPoint = null; };
    const touchMove = (event: TouchEvent) => {
      if (event.touches.length !== 1) { previousPoint = null; return; }
      const touch = event.touches[0];
      emit(touch.clientX, touch.clientY, true, event.target);
    };
    const pointerLeave = (event: PointerEvent) => { if (!event.relatedTarget) previousPoint = null; };

    resize();
    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("blur", clear);
    document.addEventListener("visibilitychange", clear);
    motion.addEventListener("change", clear);
    // Capture observes gestures even when the gallery or model owns the drag.
    const passive = { passive: true, capture: true };
    document.addEventListener("pointermove", pointerMove, passive);
    document.addEventListener("pointerout", pointerLeave, passive);
    document.addEventListener("touchstart", touchStart, passive);
    document.addEventListener("touchmove", touchMove, passive);
    document.addEventListener("touchend", touchStart, passive);
    document.addEventListener("touchcancel", touchStart, passive);

    return () => {
      clear();
      window.removeEventListener("resize", resize);
      window.removeEventListener("blur", clear);
      document.removeEventListener("visibilitychange", clear);
      motion.removeEventListener("change", clear);
      document.removeEventListener("pointermove", pointerMove, true);
      document.removeEventListener("pointerout", pointerLeave, true);
      document.removeEventListener("touchstart", touchStart, true);
      document.removeEventListener("touchmove", touchMove, true);
      document.removeEventListener("touchend", touchStart, true);
      document.removeEventListener("touchcancel", touchStart, true);
    };
  }, []);

  return <canvas ref={canvasRef} className={styles.trail} aria-hidden="true" />;
}
