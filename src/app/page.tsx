"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import HeroScene from "../components/HeroScene"; // make sure this file exists

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export default function Home() {
  const reduce = useReducedMotion();

  return (
    <main className="bg-black text-white">
      {/* HERO */}
      <section
        id="home"
        className="relative overflow-hidden scroll-mt-24 flex min-h-screen flex-col items-center justify-center px-6 text-center"
      >
        {/* 3D scene behind content */}
        <HeroScene />

        {/* subtle glow behind logo */}
        <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center">
          <div className="h-72 w-72 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(148,163,184,0.12),transparent_60%)] blur-2xl" />
        </div>

        {/* animated logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.div
            animate={reduce ? {} : { y: [0, -12, 0] }}
            transition={reduce ? {} : { duration: 6, repeat: Infinity, ease: "easeInOut" }}
          >
            <Image
              src="/Main_Logo-01.svg"
              alt="Armored Logo"
              width={260}
              height={260}
              priority
            />
          </motion.div>
        </motion.div>

        <motion.p
          className="mt-4 text-xl text-gray-400"
          initial="hidden"
          animate="show"
          variants={fadeUp}
          transition={{ delay: 0.1 }}
        >
          Innovations • Productions • Beyond
        </motion.p>

        <motion.a
          href="#about"
          className="mt-8 inline-block rounded-full bg-white px-6 py-3 font-semibold text-black transition hover:bg-gray-300"
          initial="hidden"
          animate="show"
          variants={fadeUp}
          transition={{ delay: 0.2 }}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.98 }}
        >
          Learn More
        </motion.a>
      </section>

      {/* ABOUT */}
      <section id="about" className="scroll-mt-24 mx-auto max-w-4xl px-6 py-28">
        <motion.h2
          className="text-3xl font-bold"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUp}
        >
          About Armored
        </motion.h2>

        <motion.p
          className="mt-4 leading-relaxed text-gray-300"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUp}
          transition={{ delay: 0.1 }}
        >
          We build premium digital experiences and creative products. Armored is
          a family of brands—starting with <strong>Armored Productions</strong>—and
          expanding into specialized verticals like <em>Innovations</em> and more.
        </motion.p>
      </section>

      {/* SERVICES */}
      <section id="services" className="scroll-mt-24 mx-auto max-w-5xl px-6 py-28">
        <motion.h2
          className="text-3xl font-bold"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUp}
        >
          Services
        </motion.h2>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { title: "Brand & Design", desc: "Identity, art direction, and visuals that stand out." },
            { title: "Web Experiences", desc: "High-performance sites with smooth interactions." },
            { title: "3D & Motion", desc: "Logo animations, 3D renders, and cinematics." },
          ].map((card, i) => (
            <motion.div
              key={card.title}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur"
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
              variants={fadeUp}
              transition={{ delay: 0.05 * i }}
            >
              <h3 className="text-xl font-semibold">{card.title}</h3>
              <p className="mt-2 text-gray-300">{card.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="scroll-mt-24 mx-auto max-w-4xl px-6 pb-32">
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
            href="mailto:hello@armored.example"
            className="mt-6 inline-block rounded-full bg-black px-6 py-3 font-semibold text-white hover:bg-black/80"
          >
            Contact Us
          </a>
        </motion.div>
      </section>
    </main>
  );
}
