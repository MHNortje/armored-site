"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export default function Hero() {
  const reduce = useReducedMotion();

  return (
    <section
      id="home"
      className="scroll-mt-24 flex min-h-screen flex-col items-center justify-center px-6 text-center bg-[rgb(45,45,45)] text-white"
    >
      {/* Logo with fade-in and float */}
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

      {/* Tagline */}
      <motion.p
        className="mt-4 text-xl text-gray-300"
        initial="hidden"
        animate="show"
        variants={fadeUp}
        transition={{ delay: 0.1 }}
      >
        Innovations • Productions • Beyond
      </motion.p>

      {/* Call to action */}
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
  );
}
