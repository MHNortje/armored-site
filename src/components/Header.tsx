"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const SECTIONS = [
  { href: "#about", label: "About" },
  { href: "#services", label: "Services" },
  { href: "#contact", label: "Contact" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string>("#home");

  // Scroll spy
  useEffect(() => {
    const ids = ["home", "about", "services", "contact"];
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target?.id) setActive(`#${visible.target.id}`);
      },
      { rootMargin: "-30% 0px -60% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const linkCls = (hash: string) =>
    active === hash ? "text-purple-400 font-semibold" : "text-gray-200 hover:text-white";

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[rgb(45,45,45)]/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        {/* Logo only */}
        <a href="#home" className="flex items-center" aria-label="Armored Pangolin Home">
          <Image
            src="/logo.svg"   // <-- your only logo in /public
            alt="Armored Pangolin"
            width={40}
            height={40}
            priority
          />
        </a>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm">
          {SECTIONS.map((s) => (
            <a key={s.href} href={s.href} className={linkCls(s.href)}>
              {s.label}
            </a>
          ))}
        </nav>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden rounded-md border border-white/20 px-3 py-1 text-sm text-gray-200"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          Menu
        </button>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="md:hidden border-t border-white/10 bg-[rgb(45,45,45)]">
          <nav className="mx-auto flex max-w-6xl flex-col px-6 py-3 gap-3">
            {SECTIONS.map((s) => (
              <a
                key={s.href}
                href={s.href}
                className={linkCls(s.href)}
                onClick={() => setOpen(false)}
              >
                {s.label}
              </a>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
