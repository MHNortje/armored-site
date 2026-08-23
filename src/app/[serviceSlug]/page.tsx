import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ArrowUpRight, MapPin } from "lucide-react";
import { PersistentAudioControl } from "@/components/ui/persistent-audio";
import { COMPANY } from "@/lib/company";
import { getServicePage, SERVICE_PAGES } from "@/lib/service-pages";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.armoredpangolin.com";

type ServicePageProps = {
  params: Promise<{ serviceSlug: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return SERVICE_PAGES.map(({ slug }) => ({ serviceSlug: slug }));
}

export async function generateMetadata({ params }: ServicePageProps): Promise<Metadata> {
  const { serviceSlug } = await params;
  const service = getServicePage(serviceSlug);
  if (!service) return {};

  const canonical = `/${service.slug}/`;
  return {
    title: service.metaTitle,
    description: service.description,
    alternates: { canonical },
    category: "Industrial engineering and metal manufacturing",
    robots: { index: true, follow: true },
    openGraph: {
      title: `${service.metaTitle} | Armored Pangolin`,
      description: service.description,
      type: "website",
      url: canonical,
      images: [{ url: service.image, alt: service.imageAlt }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${service.metaTitle} | Armored Pangolin`,
      description: service.description,
      images: [service.image],
    },
  };
}

export default async function ServicePageRoute({ params }: ServicePageProps) {
  const { serviceSlug } = await params;
  const service = getServicePage(serviceSlug);
  if (!service) notFound();

  const related = SERVICE_PAGES.filter((item) => item.slug !== service.slug).slice(0, 3);
  const pageUrl = `${siteUrl}/${service.slug}/`;
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        "@id": `${pageUrl}#service`,
        name: service.name,
        description: service.description,
        url: pageUrl,
        image: `${siteUrl}${service.image}`,
        provider: { "@id": `${siteUrl}/#business` },
        areaServed: ["Swakopmund", "Walvis Bay", "Erongo", "Namibia"],
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${pageUrl}#breadcrumbs`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
          { "@type": "ListItem", position: 2, name: "Services", item: `${siteUrl}/#capabilities` },
          { "@type": "ListItem", position: 3, name: service.name, item: pageUrl },
        ],
      },
      {
        "@type": "FAQPage",
        "@id": `${pageUrl}#frequently-asked-questions`,
        mainEntity: service.questions.map(({ question, answer }) => ({
          "@type": "Question",
          name: question,
          acceptedAnswer: { "@type": "Answer", text: answer },
        })),
      },
    ],
  };

  return (
    <main className="service-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />

      <header className="service-header">
        <Link href="/" className="service-brand" aria-label="Armored Pangolin home">
          <Image src="/brand/logo-lockup-transparent.png" alt="Armored Pangolin" width={1500} height={616} priority />
        </Link>
        <nav aria-label="Service page navigation">
          <Link href="/#capabilities">All services</Link>
          <Link href="/#work">Work</Link>
          <Link href="/#contact">Contact</Link>
        </nav>
        <div className="service-header-actions">
          <PersistentAudioControl className="editorial-utility service-audio-control" />
          <Link href="/start-a-project/" className="service-header-cta">Start a project <ArrowUpRight aria-hidden="true" /></Link>
        </div>
      </header>

      <section className="service-hero">
        <div className="service-hero-media">
          <Image src={service.image} alt={service.imageAlt} fill priority sizes="100vw" />
        </div>
        <div className="service-hero-shade" />
        <div className="service-hero-copy">
          <Link href="/#capabilities" className="service-back"><ArrowLeft aria-hidden="true" /> Capabilities</Link>
          <p>{service.eyebrow}</p>
          <h1>{service.title}</h1>
          <div className="service-hero-intro">
            <p>{service.introduction}</p>
            <Link href="/start-a-project/">Discuss your project <ArrowRight aria-hidden="true" /></Link>
          </div>
        </div>
      </section>

      <section className="service-content service-content-dark">
        <div className="service-content-heading">
          <p>01 · Capability</p>
          <h2>{service.name}, connected to the complete workshop.</h2>
        </div>
        <div className="service-capability-grid">
          {service.capabilities.map((capability, index) => (
            <article key={capability}>
              <span>0{index + 1}</span>
              <h3>{capability}</h3>
            </article>
          ))}
        </div>
      </section>

      <section className="service-content service-detail-grid">
        <div>
          <p className="service-label">02 · Where it works</p>
          <h2>Made for practical Namibian conditions.</h2>
        </div>
        <ul>
          {service.applications.map((application) => <li key={application}>{application}</li>)}
        </ul>
        <div>
          <p className="service-label">03 · What you receive</p>
          <h2>A clear route to finished work.</h2>
        </div>
        <ol>
          {service.outcomes.map((outcome, index) => <li key={outcome}><span>0{index + 1}</span>{outcome}</li>)}
        </ol>
      </section>

      <section className="service-content service-faq">
        <div className="service-content-heading">
          <p>04 · Useful answers</p>
          <h2>Before the first drawing.</h2>
        </div>
        <div>
          {service.questions.map(({ question, answer }) => (
            <article key={question}>
              <h3>{question}</h3>
              <p>{answer}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="service-related">
        <div className="service-content-heading">
          <p>Related capability</p>
          <h2>Keep the manufacturing conversation connected.</h2>
        </div>
        <div>
          {related.map((item) => (
            <Link key={item.slug} href={`/${item.slug}/`}>
              <span>{item.name}</span><ArrowUpRight aria-hidden="true" />
            </Link>
          ))}
        </div>
      </section>

      <footer className="service-footer">
        <div>
          <p>Built in Swakopmund</p>
          <h2>Bring us the difficult brief.</h2>
          <a href="https://www.google.com/maps/search/?api=1&query=Unit+2+Marvin+Park+Industrial+Area+Swakopmund+Namibia" target="_blank" rel="noreferrer"><MapPin aria-hidden="true" /> {COMPANY.location}</a>
        </div>
        <div>
          <Link href="/start-a-project/">Start a project <ArrowUpRight aria-hidden="true" /></Link>
          <a href="tel:+264815519040">Morne Nortje · +264 81 551 9040</a>
          <a href="tel:+264811227510">Flip Nortje · +264 81 122 7510</a>
        </div>
      </footer>
    </main>
  );
}
