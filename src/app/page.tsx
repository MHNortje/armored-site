"use client";

import { motion, type Variants } from "framer-motion";
import dynamic from "next/dynamic";

// Load the 3D scene only on the client (avoids SSR canvas errors)
const HeroScene = dynamic(() => import("../components/HeroScene"), { ssr: false });

// Reusable fade-up animation (typed as Variants)
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    // Use cubic-bezier array to satisfy strict typing instead of a string like "easeOut"
    transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] },
  },
};

export default function Home() {
  return (
    <main className="bg-[rgb(45,45,45)] text-zinc-100">
      {/* HERO */}
      <section
        id="home"
        className="relative flex min-h-[72vh] items-center justify-center overflow-hidden"
      >
        {/* 3D background */}
        <div className="absolute inset-0 -z-10">
          <HeroScene />
        </div>

        {/* Center content */}
        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
          <motion.p
            className="text-lg sm:text-xl text-zinc-300"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.4 }}
            variants={fadeUp}
            transition={{ delay: 0.1 }}
          >
            Innovations • Productions • Beyond
          </motion.p>

          <motion.a
            href="#about"
            className="mt-8 inline-block rounded-full bg-white px-6 py-3 font-semibold text-black transition hover:bg-zinc-200"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.4 }}
            variants={fadeUp}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.98 }}
          >
            Learn More
          </motion.a>
        </div>

        {/* soft vignette */}
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.06),transparent_60%)]" />
      </section>

      {/* ABOUT */}
      <section id="about" className="mx-auto max-w-5xl px-6 py-24">
        <motion.h2
          className="text-3xl font-bold tracking-tight"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUp}
        >
          About Us
        </motion.h2>

        <motion.div
          className="mt-6 space-y-4 leading-relaxed text-zinc-300"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUp}
          transition={{ delay: 0.1 }}
        >
          <p>
            <strong>Armored Pangolin</strong> is more than a company name – it’s a creative
            force, a brand family, and a vision for the future. Founded in 2025, Armored
            Pangolin was built on over a decade of specialized skills in design, creativity,
            and technical innovation.
          </p>
          <p>
            We bring together multiple sub-companies under one strong identity:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Armored Productions</strong> – Photography, videography, and
              storytelling through powerful visuals.
            </li>
            <li>
              <strong>Armored Innovations</strong> – Technical design, product development,
              and cutting-edge creative solutions.
            </li>
            <li>
              <strong>Armored Graphics &amp; Animation</strong> – Graphic design, logo
              animation, motion graphics, and visual effects.
            </li>
          </ul>
          <p>
            At the core of our work lies a passion for <em>visual communication</em> and{" "}
            <em>technical precision</em>. From capturing timeless photography to producing
            dynamic videos, from bold identities to technical manufacturing drawings – we
            combine creativity with engineering to turn ideas into reality.
          </p>
          <p>We are driven by three principles:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Creativity with Impact</strong> – Work that inspires, captivates, and
              communicates.
            </li>
            <li>
              <strong>Innovation with Purpose</strong> – Solutions that combine artistry and
              technology.
            </li>
            <li>
              <strong>Strength in Detail</strong> – A commitment to precision.
            </li>
          </ul>
          <p className="font-semibold">
            Armored Pangolin – Where Creativity Meets Strength.
          </p>
        </motion.div>
      </section>

      {/* SERVICES */}
      <section id="services" className="mx-auto max-w-5xl px-6 pb-28">
        <motion.h2
          className="text-3xl font-bold tracking-tight"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUp}
        >
          Our Services
        </motion.h2>

        <motion.p
          className="mt-3 text-zinc-300"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUp}
          transition={{ delay: 0.1 }}
        >
          At <strong>Armored Pangolin</strong>, we bring creativity, technology, and
          precision together. Our services span across multiple creative and technical
          fields, ensuring that no matter your vision, we have the tools and expertise to
          bring it to life.
        </motion.p>

        <div className="mt-8 grid gap-5">
          {/* Card 1 */}
          <motion.div
            className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeUp}
          >
            <h3 className="text-xl font-semibold">Photography &amp; Videography</h3>
            <ul className="mt-3 list-disc pl-6 text-zinc-300 space-y-1">
              <li>Professional photography for events, products, portraits, and branding.</li>
              <li>Cinematic videography from promos to full-scale productions.</li>
              <li>Drone photography &amp; video for unique perspectives.</li>
              <li>Editing, color grading, and post-production polish.</li>
            </ul>
          </motion.div>

          {/* Card 2 */}
          <motion.div
            className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeUp}
            transition={{ delay: 0.05 }}
          >
            <h3 className="text-xl font-semibold">Graphic Design &amp; Branding</h3>
            <ul className="mt-3 list-disc pl-6 text-zinc-300 space-y-1">
              <li>Logo design and full brand identity packages.</li>
              <li>Marketing materials: brochures, posters, and digital content.</li>
              <li>Social media visuals tailored for impact.</li>
              <li>Custom illustration and concept art.</li>
            </ul>
          </motion.div>

          {/* Card 3 */}
          <motion.div
            className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeUp}
            transition={{ delay: 0.1 }}
          >
            <h3 className="text-xl font-semibold">Animation &amp; Visual Effects</h3>
            <ul className="mt-3 list-disc pl-6 text-zinc-300 space-y-1">
              <li>Logo animations and brand intros.</li>
              <li>Motion graphics for video and digital platforms.</li>
              <li>Special effects and compositing.</li>
              <li>Story-driven animated content.</li>
            </ul>
          </motion.div>

          {/* Card 4 */}
          <motion.div
            className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeUp}
            transition={{ delay: 0.15 }}
          >
            <h3 className="text-xl font-semibold">
              Technical Drawings &amp; Manufacturing Support
            </h3>
            <ul className="mt-3 list-disc pl-6 text-zinc-300 space-y-1">
              <li>Detailed CAD and technical drawings for manufacturing.</li>
              <li>3D modeling and product visualization.</li>
              <li>Prototyping support through accurate design documentation.</li>
              <li>
                Collaboration with manufacturers to bring designs to reality.
              </li>
            </ul>
          </motion.div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="mx-auto max-w-4xl px-6 pb-28">
        <motion.div
          className="rounded-2xl bg-white p-8 text-center text-black"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUp}
        >
          <h2 className="text-2xl font-bold">Let’s build something armored.</h2>
          <p className="mt-2 text-black/70">
            Tell me about your project and timeline—I'll get back to you quickly.
          </p>
          <a
            href="mailto:hello@armoredpangolin.com"
            className="mt-6 inline-block rounded-full bg-black px-6 py-3 font-semibold text-white hover:bg-black/80"
          >
            Contact Us
          </a>
        </motion.div>
      </section>
    </main>
  );
}
