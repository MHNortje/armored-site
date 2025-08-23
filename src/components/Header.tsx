"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import clsx from "clsx";

const sections = [
  { id: "#home", label: "Home" },
  { id: "#about", label: "About" },
  { id: "#services", label: "Services" },
  { id: "#contact", label: "Contact" },
];

export default function Header() {
  const [active, setActive] = useState("#home");
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  // Highlight active section + subtle shadow when scrolled
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target?.id) setActive(`#${visible.target.id}`);
      },
      { rootMargin: "-40% 0px -60% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] }
    );
    sections.forEach((s) => {
      const el = document.getElementById(s.id.slice(1));
      if (el) io.observe(el);
    });

    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);

    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // Close menu when route/hash changes via anchor click
  useEffect(() => {
    const onHash = () => setOpen(false);
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  return (
    <header
      className={clsx(
        "sticky top-0 z-50 border-b border-white/10 bg-black/60 backdrop-blur transition-shadow",
        scrolled && "shadow-[0_4px_20px_rgba(0,0,0,0.35)]"
      )}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 py-3">
        {/* Brand */}
        <a href="#home" className="flex items-center gap-2">
          <Image src="/Main_Logo-01.svg" alt="Armored" width={28} height={28} />
          <span className="hidden sm:block font-semibold tracking-tight text-white">
            Armored
          </span>
        </a>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-1 text-sm">
          {sections.map((s) => {
            const isActive = active === s.id;
            return (
              <li key={s.id}>
                <a
                  href={s.id}
                  className={clsx(
                    "group relative rounded-full px-3 py-1 transition",
                    "text-white/70 hover:text-white",
                    isActive && "bg-white text-black"
                  )}
                >
                  {s.label}
                  {!isActive && (
                    <span className="pointer-events-none absolute inset-x-2 -bottom-0.5 block h-px origin-left scale-x-0 bg-white/70 transition-transform duration-200 group-hover:scale-x-100" />
                  )}
                </a>
              </li>
            );
          })}
        </ul>

        {/* Mobile hamburger */}
        <button
          type="button"
          className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-white/80 hover:text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/40"
          aria-label="Open menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? (
            // X icon
            <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          ) : (
            // Hamburger icon
            <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M3 12h18M3 18h18" />
            </svg>
          )}
        </button>
      </nav>

      {/* Mobile menu (collapsible) */}
      <div
        className={clsx(
          "md:hidden overflow-hidden border-t border-white/10 bg-black/70 backdrop-blur transition-[max-height,opacity] duration-300",
          open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <ul className="mx-auto flex max-w-6xl flex-col gap-2 px-4 sm:px-6 py-3">
          {sections.map((s) => {
            const isActive = active === s.id;
            return (
              <li key={s.id}>
                <a
                  href={s.id}
                  onClick={() => setOpen(false)}
                  className={clsx(
                    "block rounded-lg px-3 py-2 text-base transition",
                    isActive ? "bg-white text-black" : "text-white/80 hover:text-white hover:bg-white/10"
                  )}
                >
                  {s.label}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </header>
  );
}
