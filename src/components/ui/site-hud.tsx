"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, ArrowUpRight, ExternalLink, MapPin, Maximize2, Menu, X } from "lucide-react";
import { CompanyProfile } from "@/components/ui/company-profile";
import { PersistentAudioControl } from "@/components/ui/persistent-audio";
import { COMPANY, INDUSTRIES, PROCESS, SERVICES } from "@/lib/company";
import type { GalleryImage } from "@/lib/gallery";

type SiteHudProps = {
  galleryImages: GalleryImage[];
};

const fallbackWork = [
  {
    eyebrow: "Concept visualisation · Custom braaier",
    title: "A braaier built for the Namib coast.",
    src: "/brand/concept-namibian-braaier-hd.webp",
    position: "center",
  },
  {
    eyebrow: "Concept visualisation · Lodge signage",
    title: "A landmark arrival for the lodge.",
    src: "/brand/concept-lodge-sign-hd.webp",
    position: "center",
  },
  {
    eyebrow: "Concept visualisation · Fabricated frame",
    title: "Structural steel, squared and ready.",
    src: "/brand/concept-steel-frame-hd.webp",
    position: "center",
  },
  {
    eyebrow: "Concept visualisation · Truck trailer",
    title: "A trailer engineered for hard kilometres.",
    src: "/brand/concept-truck-trailer-hd.webp",
    position: "center",
  },
  {
    eyebrow: "Concept visualisation · Vehicle canopy",
    title: "A canopy made for remote work.",
    src: "/brand/concept-vehicle-canopy-hd.webp",
    position: "center",
  },
  {
    eyebrow: "Concept visualisation · Structural warehouse",
    title: "An I-beam warehouse built to endure.",
    src: "/brand/concept-ibeam-warehouse-hd.webp",
    position: "center",
  },
];

function BrandLockup() {
  return (
    <a href="#top" className="editorial-brand" aria-label="Armored Pangolin home">
      <Image
        src="/brand/logo-lockup-transparent.png"
        alt="Armored Pangolin"
        width={1500}
        height={616}
        className="h-auto w-full"
        priority
      />
    </a>
  );
}

type ShowcaseItem = {
  id: string;
  name: string;
  eyebrow: string;
  src: string;
  position: string;
};

const galleryCardVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? "24%" : "-24%",
    rotate: direction > 0 ? 2.5 : -2.5,
    scale: 0.94,
    opacity: 0,
  }),
  center: { x: 0, rotate: 0, scale: 1, opacity: 1 },
  exit: (direction: number) => ({
    x: direction > 0 ? "-24%" : "24%",
    rotate: direction > 0 ? -2.5 : 2.5,
    scale: 0.94,
    opacity: 0,
  }),
};

function wrapIndex(index: number, length: number) {
  return (index + length) % length;
}

function ShowcaseCarousel({ galleryImages }: SiteHudProps) {
  const items: ShowcaseItem[] = galleryImages.length > 0
    ? galleryImages.map((image) => ({
        id: image.id,
        name: image.name,
        eyebrow: "Armored Pangolin project",
        src: image.url,
        position: "center",
      }))
    : fallbackWork.map((item, index) => ({
        id: `capability-${index}`,
        name: item.title,
        eyebrow: item.eyebrow,
        src: item.src,
        position: item.position,
      }));

  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const cardDragged = useRef(false);
  const total = items.length;
  const activeItem = items[activeIndex];
  const lightboxItem = lightboxIndex === null ? null : items[lightboxIndex];

  const move = (step: number) => {
    if (total < 2) return;
    setDirection(step);
    setActiveIndex((current) => wrapIndex(current + step, total));
  };

  const moveLightbox = (step: number) => {
    if (lightboxIndex === null || total < 2) return;
    const next = wrapIndex(lightboxIndex + step, total);
    setDirection(step);
    setActiveIndex(next);
    setLightboxIndex(next);
  };

  useEffect(() => {
    if (lightboxIndex === null) return;

    const previousOverflow = document.body.style.overflow;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLightboxIndex(null);
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        setDirection(-1);
        setActiveIndex((current) => wrapIndex(current - 1, total));
        setLightboxIndex((current) => current === null ? null : wrapIndex(current - 1, total));
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        setDirection(1);
        setActiveIndex((current) => wrapIndex(current + 1, total));
        setLightboxIndex((current) => current === null ? null : wrapIndex(current + 1, total));
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [lightboxIndex, total]);

  return (
    <>
      <div
        className="editorial-showcase"
        role="region"
        aria-label="Project showcase gallery"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft") move(-1);
          if (event.key === "ArrowRight") move(1);
        }}
      >
        <div className="editorial-showcase-stage">
          <span className="editorial-showcase-stack editorial-showcase-stack-back" aria-hidden="true" />
          <span className="editorial-showcase-stack editorial-showcase-stack-middle" aria-hidden="true" />
          <AnimatePresence initial={false} custom={direction} mode="popLayout">
            <motion.button
              type="button"
              key={activeItem.id}
              className="editorial-showcase-card"
              custom={direction}
              variants={galleryCardVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
              drag={total > 1 ? "x" : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.14}
              whileDrag={{ scale: 0.985, cursor: "grabbing" }}
              onDragStart={() => { cardDragged.current = false; }}
              onDrag={(_, info) => {
                if (Math.abs(info.offset.x) > 8) cardDragged.current = true;
              }}
              onDragEnd={(_, info) => {
                const intention = info.offset.x + info.velocity.x * 0.12;
                if (intention < -75) move(1);
                if (intention > 75) move(-1);
                window.setTimeout(() => { cardDragged.current = false; }, 0);
              }}
              onClick={() => {
                if (!cardDragged.current) setLightboxIndex(activeIndex);
              }}
              aria-label={`Open ${activeItem.name} in the image viewer`}
            >
              <Image
                src={activeItem.src}
                alt={activeItem.name}
                fill
                draggable={false}
                data-subtle-parallax
                sizes="(max-width: 767px) 94vw, 72vw"
                className="editorial-showcase-image"
                style={{ objectPosition: activeItem.position }}
              />
              <span className="editorial-showcase-shade" aria-hidden="true" />
              <span className="editorial-showcase-open"><Maximize2 aria-hidden="true" /> Open image</span>
              <span className="editorial-showcase-copy">
                <span>{activeItem.eyebrow}</span>
                <strong>{activeItem.name}</strong>
              </span>
            </motion.button>
          </AnimatePresence>
        </div>

        <div className="editorial-showcase-controls">
          <button type="button" onClick={() => move(-1)} disabled={total < 2} aria-label="Previous project image">
            <ArrowLeft aria-hidden="true" />
          </button>
          <div>
            <span aria-live="polite">{String(activeIndex + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}</span>
            <i aria-hidden="true"><b style={{ width: `${((activeIndex + 1) / total) * 100}%` }} /></i>
          </div>
          <button type="button" onClick={() => move(1)} disabled={total < 2} aria-label="Next project image">
            <ArrowRight aria-hidden="true" />
          </button>
        </div>
        <p className="editorial-showcase-hint">Drag or swipe the card · Select it to view full size</p>
      </div>

      <AnimatePresence>
        {lightboxItem && (
          <motion.div
            className="editorial-lightbox-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.24 }}
            onClick={() => setLightboxIndex(null)}
          >
            <motion.div
              className="editorial-lightbox"
              role="dialog"
              aria-modal="true"
              aria-label={`${lightboxItem.name} image viewer`}
              initial={{ y: 20, scale: 0.98, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: 12, scale: 0.985, opacity: 0 }}
              transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="editorial-lightbox-header">
                <div>
                  <span>{String((lightboxIndex ?? 0) + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}</span>
                  <strong>{lightboxItem.name}</strong>
                </div>
                <button type="button" onClick={() => setLightboxIndex(null)} autoFocus aria-label="Close image viewer">
                  <X aria-hidden="true" />
                </button>
              </div>
              <div className="editorial-lightbox-media">
                <AnimatePresence initial={false} custom={direction} mode="wait">
                  <motion.div
                    key={lightboxItem.id}
                    custom={direction}
                    initial={{ x: direction > 0 ? 36 : -36, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: direction > 0 ? -36 : 36, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    drag={total > 1 ? "x" : false}
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.12}
                    onDragEnd={(_, info) => {
                      const intention = info.offset.x + info.velocity.x * 0.1;
                      if (intention < -60) moveLightbox(1);
                      if (intention > 60) moveLightbox(-1);
                    }}
                  >
                    <Image src={lightboxItem.src} alt={lightboxItem.name} fill draggable={false} sizes="96vw" className="object-contain" />
                  </motion.div>
                </AnimatePresence>
                {total > 1 && (
                  <>
                    <button type="button" className="editorial-lightbox-previous" onClick={() => moveLightbox(-1)} aria-label="Previous image">
                      <ArrowLeft aria-hidden="true" />
                    </button>
                    <button type="button" className="editorial-lightbox-next" onClick={() => moveLightbox(1)} aria-label="Next image">
                      <ArrowRight aria-hidden="true" />
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export function SiteHud({ galleryImages }: SiteHudProps) {
  const router = useRouter();
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const heroRef = useRef<HTMLElement>(null);
  const statementRef = useRef<HTMLElement>(null);
  const directions =
    "https://www.google.com/maps/search/?api=1&query=Unit+2+Marvin+Park+Industrial+Area+Swakopmund+Namibia";

  const openBrief = () => {
    setMobileNavOpen(false);
    router.push("/start-a-project");
  };

  useEffect(() => {
    if (!mobileNavOpen) return;

    const previousOverflow = document.body.style.overflow;
    const desktop = window.matchMedia("(min-width: 1024px)");
    const closeOnDesktop = () => {
      if (desktop.matches) setMobileNavOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileNavOpen(false);
    };

    document.body.style.overflow = "hidden";
    desktop.addEventListener("change", closeOnDesktop);
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      desktop.removeEventListener("change", closeOnDesktop);
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [mobileNavOpen]);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;

    const mobileHero = window.matchMedia("(max-width: 767px)");
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const placePlasmaEffect = () => {
      const sourceWidth = 1728;
      const sourceHeight = 910;
      const sourceX = 1359;
      const sourceY = 498;
      const screenX = 1353;
      const screenY = 549;
      const screenWidth = 331;
      const screenHeight = 196;
      const width = hero.clientWidth;
      const height = hero.clientHeight;
      const coverScale = Math.max(width / sourceWidth, height / sourceHeight);
      const renderedWidth = sourceWidth * coverScale;
      const renderedHeight = sourceHeight * coverScale;
      const objectX = mobileHero.matches ? 0.72 : 0.5;
      const offsetX = (width - renderedWidth) * objectX;
      const offsetY = (height - renderedHeight) * 0.5;

      hero.style.setProperty("--plasma-x", `${offsetX + sourceX * coverScale}px`);
      hero.style.setProperty("--plasma-y", `${offsetY + sourceY * coverScale}px`);
      hero.style.setProperty("--hero-screen-x", `${offsetX + screenX * coverScale}px`);
      hero.style.setProperty("--hero-screen-y", `${offsetY + screenY * coverScale}px`);
      hero.style.setProperty("--hero-screen-width", `${screenWidth * coverScale}px`);
      hero.style.setProperty("--hero-screen-height", `${screenHeight * coverScale}px`);
    };

    const placeCadScreen = () => {
      const statement = statementRef.current;
      if (!statement) return;

      const sourceWidth = 1672;
      const sourceHeight = 941;
      const screenX = 808;
      const screenY = 42;
      const screenWidth = 820;
      const screenHeight = 561;
      const width = statement.clientWidth;
      const height = statement.clientHeight;
      const coverScale = Math.max(width / sourceWidth, height / sourceHeight);
      const offsetX = (width - sourceWidth * coverScale) * 0.5;
      const offsetY = (height - sourceHeight * coverScale) * 0.5;

      statement.style.setProperty("--cad-screen-x", `${offsetX + screenX * coverScale}px`);
      statement.style.setProperty("--cad-screen-y", `${offsetY + screenY * coverScale}px`);
      statement.style.setProperty("--cad-screen-width", `${screenWidth * coverScale}px`);
      statement.style.setProperty("--cad-screen-height", `${screenHeight * coverScale}px`);
    };

    const resizeObserver = new ResizeObserver(() => {
      placePlasmaEffect();
      placeCadScreen();
    });
    resizeObserver.observe(hero);
    if (statementRef.current) resizeObserver.observe(statementRef.current);
    placePlasmaEffect();
    placeCadScreen();

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return () => resizeObserver.disconnect();
    }

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let pointerFrame = 0;
    let scrollFrame = 0;

    const renderPointer = () => {
      currentX += (targetX - currentX) * 0.055;
      currentY += (targetY - currentY) * 0.055;
      hero.style.setProperty("--pointer-x", currentX.toFixed(4));
      hero.style.setProperty("--pointer-y", currentY.toFixed(4));
      if (Math.abs(targetX - currentX) > 0.002 || Math.abs(targetY - currentY) > 0.002) {
        pointerFrame = window.requestAnimationFrame(renderPointer);
      } else {
        pointerFrame = 0;
      }
    };

    const schedulePointer = () => {
      if (!pointerFrame) pointerFrame = window.requestAnimationFrame(renderPointer);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!finePointer.matches || event.pointerType !== "mouse") return;
      const bounds = hero.getBoundingClientRect();
      targetX = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
      targetY = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;
      schedulePointer();
    };

    const onPointerLeave = () => {
      targetX = 0;
      targetY = 0;
      schedulePointer();
    };

    const renderScrollParallax = () => {
      document.querySelectorAll<HTMLElement>("[data-subtle-parallax]").forEach((element) => {
        const bounds = element.getBoundingClientRect();
        const distance = bounds.top + bounds.height / 2 - window.innerHeight / 2;
        const limit = mobileHero.matches ? 6 : 14;
        const shift = Math.max(-limit, Math.min(limit, distance * -0.018));
        element.style.setProperty("--parallax-y", `${shift.toFixed(2)}px`);
      });
      scrollFrame = 0;
    };

    const onScroll = () => {
      if (!scrollFrame) scrollFrame = window.requestAnimationFrame(renderScrollParallax);
    };

    if (finePointer.matches) {
      hero.addEventListener("pointermove", onPointerMove, { passive: true });
      hero.addEventListener("pointerleave", onPointerLeave);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    renderScrollParallax();

    return () => {
      hero.removeEventListener("pointermove", onPointerMove);
      hero.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener("scroll", onScroll);
      resizeObserver.disconnect();
      if (pointerFrame) window.cancelAnimationFrame(pointerFrame);
      if (scrollFrame) window.cancelAnimationFrame(scrollFrame);
    };
  }, []);

  return (
    <main className="editorial-site" id="top">
      <section ref={heroRef} className="editorial-hero" aria-labelledby="hero-title">
        <div className="editorial-hero-media">
          <Image
            src="/brand/workshop-hero-4k-v6.webp"
            alt="Armored Pangolin precision engineering workshop with a CNC plasma cutter, CAD station and the Namib coast"
            fill
            priority
            sizes="100vw"
            className="editorial-hero-image"
          />
          <div className="editorial-plasma-motion" aria-hidden="true">
            <span className="editorial-plasma-pass">
              <b />
              <i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i />
              <i /><i /><i /><i /><i /><i />
            </span>
            <span className="editorial-smoke-loop editorial-smoke-loop-plasma">
              <i /><i /><i /><i /><i /><i /><i />
            </span>
          </div>
          <span className="editorial-hero-screen-flicker" aria-hidden="true"><i /></span>
        </div>
        <div className="editorial-hero-shade" />
        <div className="editorial-wave-motion" aria-hidden="true"><i /><i /><i /></div>

        <header className="editorial-header">
          <BrandLockup />
          <nav className="editorial-nav" aria-label="Primary navigation">
            <a href="#capabilities">Capabilities</a>
            <a href="#process">Process</a>
            <a href="#work">Work</a>
            <a href="#contact">Contact</a>
          </nav>
          <div className="editorial-header-actions">
            <PersistentAudioControl />
            <button type="button" onClick={() => setProfileOpen(true)} className="editorial-utility editorial-profile-trigger">
              Company profile
            </button>
            <button
              type="button"
              className="editorial-utility editorial-mobile-nav-toggle"
              aria-label="Open navigation menu"
              aria-expanded={mobileNavOpen}
              aria-controls="mobile-navigation"
              onClick={() => setMobileNavOpen(true)}
            >
              <Menu aria-hidden="true" />
              <span>Menu</span>
            </button>
          </div>
        </header>

        <AnimatePresence>
          {mobileNavOpen && (
            <motion.div
              className="editorial-mobile-nav-layer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              <button
                type="button"
                className="editorial-mobile-nav-backdrop"
                onClick={() => setMobileNavOpen(false)}
                aria-label="Close navigation menu"
              />
              <motion.nav
                id="mobile-navigation"
                className="editorial-mobile-nav-panel"
                aria-label="Mobile navigation"
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="editorial-mobile-nav-heading">
                  <span>Navigate</span>
                  <button type="button" onClick={() => setMobileNavOpen(false)} autoFocus aria-label="Close navigation menu">
                    <X aria-hidden="true" />
                  </button>
                </div>
                <div className="editorial-mobile-nav-links">
                  {[
                    ["Capabilities", "#capabilities"],
                    ["Process", "#process"],
                    ["Selected work", "#work"],
                    ["Contact", "#contact"],
                  ].map(([label, href], index) => (
                    <a key={href} href={href} onClick={() => setMobileNavOpen(false)}>
                      <span>0{index + 1}</span>{label}<ArrowRight aria-hidden="true" />
                    </a>
                  ))}
                </div>
                <div className="editorial-mobile-nav-actions">
                  <button type="button" className="editorial-button editorial-button-solid" onClick={openBrief}>
                    Start a project <ArrowUpRight aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className="editorial-button editorial-button-outline"
                    onClick={() => {
                      setMobileNavOpen(false);
                      setProfileOpen(true);
                    }}
                  >
                    Company profile
                  </button>
                </div>
              </motion.nav>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="editorial-hero-copy">
          <p className="editorial-kicker">Swakopmund · Namibia · Engineering & fabrication</p>
          <h1 id="hero-title">
            <span>ME<span className="editorial-letter-gap">T</span>AL</span>
            <span className="editorial-manufacturing-line">MANUFAC<span className="editorial-letter-gap">T</span>URING.</span>
          </h1>
          <p className="editorial-hero-intro">
            From first sketch to finished steel, Armored Pangolin combines technical design, CNC manufacturing and practical fabrication in one Swakopmund workshop.
          </p>
          <div className="editorial-actions">
            <a href="#capabilities" className="editorial-button editorial-button-solid">
              Explore capabilities <ArrowRight aria-hidden="true" />
            </a>
            <button type="button" onClick={openBrief} className="editorial-button editorial-button-outline">
              Start a project
            </button>
          </div>
        </div>

        <div className="editorial-principles" aria-label="Armored Pangolin principles">
          <span>Engineering</span>
          <span>Steel fabrication</span>
          <span>Design</span>
          <span>Perfection</span>
        </div>
      </section>

      <section className="editorial-intro editorial-shell" aria-labelledby="intro-title">
        <div className="editorial-section-index">
          <span>01</span>
          <p>Built here.<br />Ready for Namibia.</p>
        </div>
        <div>
          <p className="editorial-kicker">From concept to steel</p>
          <h2 id="intro-title">One team carries the idea from digital design to the workshop floor.</h2>
          <p className="editorial-body-copy">
            {COMPANY.introduction} The result is less uncertainty, clearer communication and work designed around how it will actually be manufactured.
          </p>
        </div>
      </section>

      <section id="capabilities" className="editorial-section editorial-section-dark">
        <div className="editorial-shell">
          <div className="editorial-section-heading">
            <div>
              <p className="editorial-kicker">02 · Capabilities</p>
              <h2>Precision across the complete manufacturing conversation.</h2>
            </div>
            <p>
              Industrial, commercial and custom work for clients who value considered engineering, dependable execution and a professional finish.
            </p>
          </div>
          <div className="editorial-services">
            {SERVICES.map((service, index) => (
              <Link key={service.name} href={`/${service.slug}/`} className="editorial-service" aria-label={`Read about ${service.name}`} data-ui-sound>
                <span>0{index + 1}</span>
                <h3>{service.name}</h3>
                <p>{service.summary}</p>
                <ul>
                  {service.items.map((item) => <li key={item}>{item}</li>)}
                </ul>
                <span className="editorial-service-link">View service <ArrowUpRight aria-hidden="true" /></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="editorial-machinery editorial-machine-feature" aria-labelledby="machinery-title">
        <div className="editorial-shell editorial-machinery-heading">
          <p className="editorial-kicker">Workshop capability</p>
          <h2 id="machinery-title">Formed accurately.<br />Fabricated properly.</h2>
        </div>
        <article className="editorial-machine-layout">
          <div className="editorial-machinery-image editorial-press-image">
            <div className="editorial-machinery-media" data-subtle-parallax>
              <Image
                src="/brand/press-brake-workshop-v2-hd.webp"
                alt="Industrial press brake and precision bending tooling inside a Swakopmund fabrication workshop"
                fill
                sizes="(max-width: 767px) 100vw, 68vw"
                className="object-cover"
              />
              <span className="editorial-press-cycle" aria-hidden="true"><i /></span>
              <span className="editorial-press-screen-glow" aria-hidden="true"><i /></span>
            </div>
            <span className="editorial-machine-status">Controlled bend cycle</span>
          </div>
          <div className="editorial-machinery-copy">
            <span>01 · Forming</span>
            <h3 className="editorial-display-machine-title">Press-brake bending</h3>
            <p>Repeatable folds, controlled geometry and production-ready components developed from the drawing through to the finished bend.</p>
          </div>
        </article>
      </section>

      <section ref={statementRef} className="editorial-statement" aria-labelledby="statement-title">
        <div className="editorial-statement-media" data-subtle-parallax>
          <Image
            src="/brand/cad-engineering-workstation-v1-hd.webp"
            alt="High-end CAD engineering workstation displaying a production-ready folded steel assembly"
            fill
            sizes="100vw"
            className="object-cover object-center"
          />
          <span className="editorial-cad-flicker" aria-hidden="true" />
        </div>
        <div className="editorial-statement-shade" />
        <div className="editorial-shell editorial-statement-copy">
          <p className="editorial-kicker">Design that survives production</p>
          <h2 id="statement-title">Resolve it in 3D.<br />Build it in steel.</h2>
          <p>Practical engineering, production-ready drawings and direct access to the people responsible for making the work real.</p>
        </div>
      </section>

      <section className="editorial-machine-feature editorial-machine-feature-welding" aria-labelledby="welding-title">
        <article className="editorial-machine-layout editorial-machine-layout-reverse">
          <div className="editorial-machinery-image editorial-welding-image">
            <div className="editorial-machinery-media" data-subtle-parallax>
              <Image
                src="/brand/welding-workshop-v2-hd.webp"
                alt="Close three-quarter view of a professional welding and fit-up bay inside a Swakopmund workshop"
                fill
                sizes="(max-width: 767px) 100vw, 68vw"
                className="object-cover"
              />
              <span className="editorial-weld-effects" aria-hidden="true">
                <b />
                <i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i />
                <i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i />
                <i /><i /><i /><i /><i /><i /><i /><i />
              </span>
              <span className="editorial-smoke-loop editorial-smoke-loop-welding" aria-hidden="true">
                <i /><i /><i /><i /><i /><i /><i />
              </span>
            </div>
            <span className="editorial-machine-status">Active fabrication bay</span>
          </div>
          <div className="editorial-machinery-copy">
            <span>02 · Fabrication</span>
            <h3 id="welding-title" className="editorial-display-machine-title">
              <span>Welding &</span>
              <span>Fabrication</span>
            </h3>
            <p>Considered preparation, accurate assembly and dependable welding for industrial frames, supports, modifications and custom steelwork.</p>
          </div>
        </article>
      </section>

      <section id="process" className="editorial-section editorial-process-section">
        <div className="editorial-shell">
          <div className="editorial-section-heading editorial-section-heading-light">
            <div>
              <p className="editorial-kicker">03 · Process</p>
              <h2>A disciplined route from problem to finished product.</h2>
            </div>
            <p>Every stage stays connected to the manufacturing outcome.</p>
          </div>
          <ol className="editorial-process-list">
            {PROCESS.map(([index, name, detail]) => (
              <li key={index}>
                <span>{index}</span>
                <strong>{name}</strong>
                <p>{detail}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="work" className="editorial-section editorial-section-dark">
        <div className="editorial-shell">
          <div className="editorial-section-heading">
            <div>
              <p className="editorial-kicker">04 · Selected work</p>
              <h2>The standard should be visible in the finish.</h2>
            </div>
            <p>Recent project photographs uploaded by the Armored Pangolin team appear here automatically.</p>
          </div>
          <ShowcaseCarousel galleryImages={galleryImages} />
        </div>
      </section>

      <section className="editorial-section editorial-namibia">
        <div className="editorial-shell editorial-namibia-layout">
          <div>
            <p className="editorial-kicker">05 · Namibia</p>
            <h2>Coastal precision.<br />National capability.</h2>
            <p className="editorial-body-copy">
              Built in Swakopmund between the Namib and the Atlantic, our work supports operations where durability, access and practical thinking matter.
            </p>
            <a href={directions} target="_blank" rel="noreferrer" className="editorial-text-link">
              <MapPin aria-hidden="true" /> {COMPANY.location} <ExternalLink aria-hidden="true" />
            </a>
          </div>
          <div>
            <p className="editorial-kicker">Industries served</p>
            <ul className="editorial-industries">
              {INDUSTRIES.map((industry) => <li key={industry}>{industry}</li>)}
            </ul>
          </div>
        </div>
      </section>

      <footer id="contact" className="editorial-footer">
        <div className="editorial-shell editorial-footer-layout">
          <div>
            <p className="editorial-kicker">Start the conversation</p>
            <h2>Bring us the difficult brief.</h2>
            <p className="editorial-footer-location">{COMPANY.location}</p>
            <div className="editorial-contact-list">
              <a href="tel:+264815519040"><span>Morne Nortje</span> +264 81 551 9040</a>
              <a href="tel:+264811227510"><span>Flip Nortje</span> +264 81 122 7510</a>
              <a href="mailto:armoredpangolin.info@gmail.com"><span>Email</span> armoredpangolin.info@gmail.com</a>
            </div>
          </div>
          <div className="editorial-footer-actions">
            <button type="button" onClick={openBrief} className="editorial-button editorial-button-solid">
              Start a project <ArrowUpRight aria-hidden="true" />
            </button>
            <button type="button" onClick={() => setProfileOpen(true)} className="editorial-button editorial-button-outline">
              Read company profile
            </button>
            <Link href="/admin/" className="editorial-admin-link">Portfolio admin</Link>
          </div>
        </div>
        <div className="editorial-shell editorial-footer-base">
          <Image src="/brand/logo-lockup-transparent.png" alt="Armored Pangolin" width={1500} height={616} className="h-auto w-48" />
          <p>{COMPANY.registeredEntity} · Swakopmund, Namibia</p>
        </div>
      </footer>

      <AnimatePresence>
        {profileOpen && (
          <CompanyProfile
            onClose={() => setProfileOpen(false)}
            onQuote={() => {
              setProfileOpen(false);
              openBrief();
            }}
          />
        )}
      </AnimatePresence>
    </main>
  );
}
