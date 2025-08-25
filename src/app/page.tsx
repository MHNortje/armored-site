"use client";

import { motion } from "framer-motion";
import HeroScene from "../components/HeroScene";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export default function Home() {
  return (
    <main>
      <HeroScene />

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
          a family of brands&mdash;starting with <strong>Armored Productions</strong>&mdash;and
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
          <h2 className="text-2xl font-bold">Let&rsquo;s build something armored.</h2>
          <p className="mt-2 text-black/70">
            Tell me about your project and timeline&mdash;I&rsquo;ll get back to you quickly.
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
