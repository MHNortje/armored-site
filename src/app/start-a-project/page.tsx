import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Mail, MapPin, Phone } from "lucide-react";
import { ProjectEnquiryForm } from "@/components/ui/project-enquiry-form";
import { COMPANY } from "@/lib/company";

export const metadata: Metadata = {
  title: "Start a Project",
  description: "Send Armored Pangolin the details, drawings and requirements for your steel engineering or fabrication project.",
};

export default function StartProjectPage() {
  return (
    <main className="project-page">
      <header className="project-header editorial-shell">
        <Link href="/" className="project-brand" aria-label="Armored Pangolin home">
          <Image src="/brand/logo-lockup-transparent.png" alt="Armored Pangolin" width={1500} height={616} priority />
        </Link>
        <Link href="/" className="project-back"><ArrowLeft aria-hidden="true" /> Back to website</Link>
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
    </main>
  );
}
