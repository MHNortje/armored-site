"use client";
import { useEffect } from "react";
import Lenis from "lenis";

export default function LenisSmooth() {
  useEffect(() => {
    const lenis = new Lenis({ smoothWheel: true, smoothTouch: true });

    // RAF loop
    let rafId = requestAnimationFrame(function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    });

    // Make in-page anchors use Lenis
    const links = Array.from(document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]'));
    const onClick = (e: MouseEvent) => {
      const target = e.currentTarget as HTMLAnchorElement;
      const id = target.getAttribute("href")!;
      if (id.length > 1) {
        e.preventDefault();
        const el = document.querySelector(id);
        if (el) lenis.scrollTo(el, { offset: -80 }); // account for sticky header height
      }
    };
    links.forEach(a => a.addEventListener("click", onClick));

    return () => {
      cancelAnimationFrame(rafId);
      links.forEach(a => a.removeEventListener("click", onClick));
      lenis.destroy();
    };
  }, []);

  return null;
}
