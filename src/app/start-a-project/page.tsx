import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";
import { ProjectEnquiryForm } from "@/components/ui/project-enquiry-form";
import { PersistentAudioControl } from "@/components/ui/persistent-audio";
import { COMPANY } from "@/lib/company";
import { SERVICE_PAGES } from "@/lib/service-pages";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.armoredpangolin.com";

export const metadata: Metadata = {
  title: "Start a Project",
  description: "Send Armored Pangolin the details, drawings and requirements for your steel engineering or fabrication project.",
  alternates: { canonical: "/start-a-project/" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "Start a Steel Engineering Project | Armored Pangolin",
    description: "Send your project brief to Armored Pangolin in Swakopmund, Namibia.",
    type: "website",
    url: "/start-a-project/",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Armored Pangolin engineering workshop" }],
  },
};

export default function StartProjectPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "@id": `${siteUrl}/start-a-project/#contact-page`,
    url: `${siteUrl}/start-a-project/`,
    name: "Start a project with Armored Pangolin",
    description: "Request a quotation for steel engineering, design and fabrication in Swakopmund, Namibia.",
    about: { "@id": `${siteUrl}/#business` },
  };

  return (
    <main className="project-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
      <header className="project-header editorial-shell">
        <Link href="/" className="project-brand" aria-label="Armored Pangolin home">
          <Image src="/brand/logo-lockup-transparent.png" alt="Armored Pangolin" width={1500} height={616} priority />
        </Link>
        <div className="project-header-actions">
          <PersistentAudioControl className="editorial-utility project-audio-control" />
          <Link href="/" className="project-back" aria-label="Back to website"><ArrowLeft aria-hidden="true" /> <span>Back to website</span></Link>
        </div>
      </header>

      <section className="project-hero editorial-shell">
        <div>
          <p className="editorial-kicker">Start a project · Swakopmund</p>
          <h1>Tell us what the work must do.</h1>
          <p>Good fabrication starts with a clear brief. Share what you know—even if the design is not resolved yet—and our team can help define the practical way forward.</p>
        </div>
        <aside className="project-contact-card" aria-label="Direct contact details">
          <p>Prefer to speak directly?</p>
          <a href="tel:+264815519040"><Phone aria-hidden="true" /><span><strong>Morne Nortje</strong>+264 81 551 9040</span></a>
          <a href="tel:+264811227510"><Phone aria-hidden="true" /><span><strong>Flip Nortje</strong>+264 81 122 7510</span></a>
          <a href="mailto:armoredpangolin.info@gmail.com"><Mail aria-hidden="true" /><span><strong>Email</strong>armoredpangolin.info@gmail.com</span></a>
          <div><MapPin aria-hidden="true" /><span>{COMPANY.location}</span></div>
        </aside>
      </section>

      <section className="project-form-shell editorial-shell">
        <ProjectEnquiryForm />
      </section>

      <nav className="project-service-links editorial-shell" aria-label="Armored Pangolin services">
        <p>Explore our manufacturing capabilities</p>
        <div>
          {SERVICE_PAGES.map((service) => (
            <Link key={service.slug} href={`/${service.slug}/`}>{service.name}<ArrowUpRight aria-hidden="true" /></Link>
          ))}
        </div>
      </nav>
    </main>
  );
}
