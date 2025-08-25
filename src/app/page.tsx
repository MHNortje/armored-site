// src/app/page.tsx
"use client";

import HeroScene from "../components/HeroScene";

export default function HomePage() {
  return (
    <main>
      {/* HERO — 3D only (no flat SVG) */}
      <HeroScene />

      {/* ABOUT */}
      <section
        id="about"
        className="scroll-mt-24 mx-auto max-w-4xl px-6 py-28 text-gray-200"
      >
        <h2 className="text-3xl font-bold text-white">About Armored Pangolin</h2>
        <p className="mt-4 leading-relaxed">
          We build premium digital experiences and creative products—starting with
          <strong> Armored Productions</strong> and expanding into specialized verticals like
          <em> Innovations</em> and more.
        </p>
      </section>

      {/* SERVICES */}
      <section
        id="services"
        className="scroll-mt-24 mx-auto max-w-5xl px-6 py-28 text-gray-200"
      >
        <h2 className="text-3xl font-bold text-white">Services</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { title: "Brand & Design", desc: "Identity, art direction, and visuals that stand out." },
            { title: "Web Experiences", desc: "High-performance sites with smooth interactions." },
            { title: "3D & Motion", desc: "Logo animations, 3D renders, and cinematics." },
          ].map((card) => (
            <div
              key={card.title}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur"
            >
              <h3 className="text-xl font-semibold text-white">{card.title}</h3>
              <p className="mt-2">{card.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CONTACT */}
      <section
        id="contact"
        className="scroll-mt-24 mx-auto max-w-4xl px-6 pb-32 text-gray-900"
      >
        <div className="rounded-2xl bg-white p-8 text-center">
          <h2 className="text-2xl font-bold">Let’s build something armored.</h2>
          <p className="mt-2 text-black/70">
            Tell me about your project and timeline—I’ll get back to you quickly.
          </p>
          <a
            href="mailto:hello@armoredpangolin.com"
            className="mt-6 inline-block rounded-full bg-black px-6 py-3 font-semibold text-white hover:bg-black/80"
          >
            Contact Us
          </a>
        </div>
      </section>
    </main>
  );
}
