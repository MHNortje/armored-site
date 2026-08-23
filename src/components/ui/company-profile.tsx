"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowUpRight, X } from "lucide-react";
import { PersistentAudioControl } from "@/components/ui/persistent-audio";
import { ADVANTAGES, COMPANY, INDUSTRIES, PROCESS, SERVICES } from "@/lib/company";

type CompanyProfileProps = {
  onClose: () => void;
  onQuote: () => void;
};

export function CompanyProfile({ onClose, onQuote }: CompanyProfileProps) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="company-profile pointer-events-auto fixed inset-0 z-40 overflow-y-auto bg-[#171719]/96 backdrop-blur-2xl"
    >
      <motion.div
        initial={{ y: 28, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 18, opacity: 0 }}
        transition={{ duration: 0.24, ease: "easeOut" }}
      >
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-white/8 bg-[#171719]/82 px-5 py-4 backdrop-blur-xl sm:px-8 lg:px-12">
          <Image
            src="/brand/logo-lockup-transparent.png"
            alt="Armored Pangolin"
            width={1500}
            height={616}
            className="h-auto w-44 sm:w-56"
          />
          <div className="flex items-center gap-3">
            <PersistentAudioControl className="editorial-utility profile-audio-control" />
            <button type="button" onClick={onQuote} className="profile-quote-button profile-header-quote">
              Request a quote <ArrowUpRight className="h-4 w-4" />
            </button>
            <button type="button" onClick={onClose} className="profile-close" autoFocus aria-label="Close company profile">
              <X className="h-5 w-5" />
            </button>
          </div>
        </header>

        <section className="profile-hero">
          <Image
            src="/brand/workshop-hero-4k-v6.webp"
            alt="Armored Pangolin CNC fabrication workshop concept"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center opacity-52"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#171719] via-[#171719]/82 to-[#171719]/35" />
          <div className="relative z-10 mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28 lg:px-12 lg:py-36">
            <p className="micro-label text-[#c6a4ff]">Steel. Engineered in Swakopmund.</p>
            <h2 className="profile-display-title mt-5 max-w-4xl uppercase text-[#e3e3e3]">
              From concept<br />to steel.
            </h2>
            <p className="mt-7 max-w-2xl text-base leading-8 text-white/58 sm:text-lg">
              {COMPANY.introduction} Customers can arrive with a drawing, sketch, photograph, existing component or simply a problem that needs solving.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button type="button" onClick={onQuote} className="profile-quote-button">
                Tell us what you need <ArrowUpRight className="h-4 w-4" />
              </button>
              <span className="micro-label rounded-full border border-white/12 px-4 py-3 text-white/42">{COMPANY.region}</span>
            </div>
          </div>
        </section>

        <section className="profile-section">
          <div className="profile-section-heading">
            <p className="micro-label text-[#b994ff]">01 · Services</p>
            <h3 className="profile-services-title">
              <span>One workshop.</span>
              <span>A complete</span>
              <span>manufacturing</span>
              <span>conversation.</span>
            </h3>
          </div>
          <div className="profile-service-grid">
            {SERVICES.map((service, index) => (
              <article key={service.name} className="profile-service-card">
                <span className="micro-label text-white/24">0{index + 1}</span>
                <h4>{service.name}</h4>
                <p>{service.summary}</p>
                <ul>
                  {service.items.map((item) => <li key={item}>{item}</li>)}
                </ul>
                <Link href={`/${service.slug}/`} className="profile-service-link" onClick={onClose} data-ui-sound>
                  View service <ArrowUpRight aria-hidden="true" />
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section className="profile-concept-section">
          <p className="micro-label text-[#cdb093]">Have an idea but no drawings?</p>
          <h3>Bring the sketch, photograph or existing part.</h3>
          <p>
            We can help develop it into a practical, manufacturable solution—then prepare the drawings, cut the components and build the finished product.
          </p>
          <button type="button" onClick={onQuote} className="profile-quote-button">
            Discuss your project <ArrowUpRight className="h-4 w-4" />
          </button>
        </section>

        <section className="profile-section border-t border-white/8">
          <div className="profile-section-heading">
            <p className="micro-label text-[#b994ff]">02 · Process</p>
            <h3>Design. Cut. Bend. Machine. Weld. Build.</h3>
          </div>
          <ol className="profile-process">
            {PROCESS.map(([number, title, description]) => (
              <li key={number}>
                <span>{number}</span>
                <strong>{title}</strong>
                <p>{description}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="profile-section profile-dark-band">
          <div className="profile-section-heading">
            <p className="micro-label text-[#cdb093]">03 · Why Armored Pangolin</p>
            <h3>Practical. Precise. Built for purpose.</h3>
          </div>
          <div className="profile-advantages">
            {ADVANTAGES.map(([title, description]) => (
              <article key={title}>
                <h4>{title}</h4>
                <p>{description}</p>
              </article>
            ))}
          </div>
          <div className="mt-14 border-t border-white/9 pt-8">
            <p className="micro-label text-white/30">Industries we serve</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {INDUSTRIES.map((industry) => <span key={industry} className="profile-industry">{industry}</span>)}
            </div>
          </div>
        </section>

        <footer className="profile-footer">
          <div>
            <p className="micro-label text-[#b994ff]">Need something made?</p>
            <h3>Let&apos;s build something useful.</h3>
          </div>
          <div className="sm:text-right">
            <p className="text-sm text-white/58">Armored Pangolin / {COMPANY.registeredEntity}</p>
            <p className="mt-2 text-xs text-white/32">{COMPANY.location}</p>
            <button type="button" onClick={onQuote} className="profile-quote-button mt-6">
              Request a quotation <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>
        </footer>
      </motion.div>
    </motion.div>
  );
}
