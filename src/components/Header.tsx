"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();

  const links = [
    { href: "#about", label: "About" },
    { href: "#services", label: "Services" },
    { href: "#contact", label: "Contact" },
  ];

  return (
    <header className="fixed top-0 left-0 w-full bg-[rgb(35,35,35)]/90 backdrop-blur-sm border-b border-white/10 z-50">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        {/* Logo + Brand */}
        <div className="flex items-center gap-2">
          <Image
            src="/Main_Logo-01.svg" // ✅ make sure this file is in /public
            alt="Armored Logo"
            width={28}
            height={28}
            priority
          />
          <span className="font-bold text-lg text-white">Armored</span>
        </div>

        {/* Nav Links */}
        <nav className="flex gap-6 text-sm font-medium">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`transition ${
                pathname === link.href
                  ? "text-purple-400 font-semibold" // Active link highlight
                  : "text-gray-300 hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
