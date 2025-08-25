"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { motion } from "framer-motion";

// Load the 3D hero on the client only
const HeroScene = dynamic(() => import("../components/HeroScene"), { ssr: false });

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: 0.08 * i, ease: "easeOut" },
  }),
};

// Simple inline “check” icon (no dependency)
function Check() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      className="inline-block -mt-[2px] mr-2"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

export default function Home() {
  return (
    <main className="bg-[rgb(45,45,45)] text-neutral-200">
      {/* ===== HERO ===== */}
      <section
        id="home"
        className="scroll-mt-24 relative mx-auto w-full max-w-6xl px-6 pt-10 sm:pt-16"
      >
        {/* Rounded stage for the 3D model */}
        <div className="relative overflow-hidden rounded-xl border border-white/10 bg-neutral-900/40">
          {/* Soft vignette */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.06),transparent_60%)]" />
          <HeroScene />
        </div>

        {/* Tagline under hero */}
        <motion.p
          className="mx-auto mt-6 max-w-2xl text-center text-neutral-300"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUp}
        >
          Innovations • Productions • Beyond
        </motion.p>

        <motion.div
          className="mt-7 flex items-center justify-center"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUp}
          custom={1}
        >
          <a
            href="#about"
            className="rounded-full bg-white px-6 py-3 font-semibold text-black transition hover:bg-white/90"
          >
            Learn More
          </a>
        </motion.div>
      </section>

      {/* ===== ABOUT ===== */}
      <section
        id="about"
        className="scroll-mt-24 mx-auto mt-20 max-w-6xl px-6 py-10"
      >
        {/* Title strip with subtle accent line */}
        <div className="mb-6 flex items-center gap-3">
          <h2 className="text-3xl font-bold text-white">About Us</h2>
          <div className="h-[1px] flex-1 bg-white/10" />
        </div>

        {/* Lead + Highlights */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Lead text */}
          <motion.div
            className="lg:col-span-2"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeUp}
          >
            <p className="leading-relaxed text-neutral-300">
              <span className="font-semibold text-white">Armored Pangolin</span> is more than a company name –
              it’s a creative force, a brand family, and a vision for the future.
              Founded in 2025, we blend visual communication with technical precision:
              photography and cinematics, bold identities and motion, through to
              detailed technical drawings and product visualization.
            </p>

            <p className="mt-4 leading-relaxed text-neutral-300">
              We bring together multiple sub-companies under one identity:
              <span className="ml-2 font-semibold text-white">Armored Productions</span> (photo/video/story),
              <span className="ml-2 font-semibold text-white">Armored Innovations</span> (technical design & product),
              and <span className="ml-2 font-semibold text-white">Armored Graphics & Animation</span> (brand, motion, visuals).
            </p>

            <p className="mt-4 leading-relaxed text-neutral-300">
              Like the pangolin—armored, unique, and resilient—we protect and elevate
              the value of our clients’ visions through <span className="font-semibold text-white">Creativity with Impact</span>,
              <span className="font-semibold text-white"> Innovation with Purpose</span>, and
              <span className="font-semibold text-white"> Strength in Detail</span>.
            </p>

            <p className="mt-4 font-semibold text-white">
              Armored Pangolin — Where Creativity Meets Strength.
            </p>
          </motion.div>

          {/* Highlight cards */}
          <div className="grid gap-4">
            {[
              {
                title: "Creativity with Impact",
                desc: "Work that inspires, captivates, and communicates.",
              },
              {
                title: "Innovation with Purpose",
                desc: "Solutions that combine artistry and technology.",
              },
              {
                title: "Strength in Detail",
                desc: "Precision across design, animation, and drafting.",
              },
            ].map((it, i) => (
              <motion.div
                key={it.title}
                className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur transition hover:bg-white/10"
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.3 }}
                variants={fadeUp}
                custom={i}
              >
                <div className="text-sm text-white/70">Principle</div>
                <div className="mt-1 text-lg font-semibold text-white">{it.title}</div>
                <div className="mt-1 text-neutral-300">{it.desc}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SERVICES ===== */}
      <section
        id="services"
        className="scroll-mt-24 mx-auto mt-8 max-w-6xl px-6 pb-24"
      >
        <div className="mb-6 flex items-center gap-3">
          <h2 className="text-3xl font-bold text-white">Our Services</h2>
          <div className="h-[1px] flex-1 bg-white/10" />
        </div>

        <motion.p
          className="max-w-3xl text-neutral-300"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUp}
        >
          At <span className="font-semibold text-white">Armored Pangolin</span>, we bring creativity, technology, and precision together.
          Our services span across multiple creative and technical fields — ensuring that no matter your vision, we have
          the tools and expertise to bring it to life.
        </motion.p>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {[
            {
              title: "Photography & Videography",
              bullets: [
                "Professional photography for events, products, portraits, and branding.",
                "Cinematic videography—from promo videos to full-scale productions.",
                "Drone work for unique angles and perspectives.",
                "Editing, color grading, and post-production polish.",
              ],
            },
            {
              title: "Graphic Design & Branding",
              bullets: [
                "Logo design and full brand identity packages.",
                "Marketing materials: brochures, posters, and digital content.",
                "Social visuals tailored for impact.",
                "Custom illustration and concept art.",
              ],
            },
            {
              title: "Animation & Visual Effects",
              bullets: [
                "Logo animations and cinematic brand intros.",
                "Motion graphics for products and digital platforms.",
                "Special effects and compositing.",
                "Story-driven animated content.",
              ],
            },
            {
              title: "Technical Drawings & Manufacturing Support",
              bullets: [
                "Detailed CAD and manufacturing drawings.",
                "3D modeling and product visualization.",
                "Prototyping support and documentation.",
                "Collaboration with manufacturers to ship real products.",
              ],
            },
          ].map((svc, i) => (
            <motion.div
              key={svc.title}
              className="group rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur ring-0 transition hover:translate-y-[-2px] hover:bg-white/10 hover:ring-1 hover:ring-white/15"
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
              variants={fadeUp}
              custom={i}
            >
              <div className="mb-3 flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-white/10" />
                <h3 className="text-xl font-semibold text-white">{svc.title}</h3>
              </div>
              <ul className="space-y-2 text-neutral-300">
                {svc.bullets.map((b) => (
                  <li key={b} className="leading-relaxed">
                    <Check />
                    {b}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </section>
    </main>
  );
}
