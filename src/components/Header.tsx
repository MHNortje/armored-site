"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 w-full bg-[#232323] text-white shadow z-50">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        {/* Logo + Text */}
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logo.svg" // ✅ Always loads the clean pangolin logo
            alt="Armored Pangolin Logo"
            width={40}
            height={40}
          />
          <span className="font-[Varien] text-[rgb(220,220,220)] text-xl">
            Armored
          </span>
          <span className="font-[Corbel] text-[rgb(115,115,115)] text-xl">
            Pangolin
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex gap-8 text-[rgb(220,220,220)]">
          <Link href="#about" className="hover:text-white">About</Link>
          <Link href="#services" className="hover:text-white">Services</Link>
          <Link href="#contact" className="hover:text-white">Contact</Link>
        </nav>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden px-4 py-2 bg-white text-black rounded"
        >
          Menu
        </button>
      </div>

      {/* Mobile Dropdown */}
      {isOpen && (
        <div className="md:hidden bg-[#2d2d2d] px-6 py-4">
          <nav className="flex flex-col gap-4 text-[rgb(220,220,220)]">
            <Link href="#about" onClick={() => setIsOpen(false)}>About</Link>
            <Link href="#services" onClick={() => setIsOpen(false)}>Services</Link>
            <Link href="#contact" onClick={() => setIsOpen(false)}>Contact</Link>
          </nav>
        </div>
      )}
    </header>
  );
}
