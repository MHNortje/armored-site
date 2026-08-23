import type { Metadata, Viewport } from "next";
import { PersistentAudioProvider } from "@/components/ui/persistent-audio";
import { SERVICE_PAGES } from "@/lib/service-pages";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.armoredpangolin.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Armored Pangolin | Steel Engineering & Fabrication Namibia",
    template: "%s | Armored Pangolin",
  },
  description:
    "Professional steel fabrication, CNC plasma cutting, bending, welding, machining and CAD design from Swakopmund, Namibia. From concept to finished product.",
  alternates: {
    canonical: "/",
  },
  keywords: [
    "steel fabrication Namibia",
    "CNC plasma cutting Swakopmund",
    "CAD design Namibia",
    "press brake bending",
    "welding and fabrication",
    "industrial engineering Namibia",
  ],
  applicationName: "Armored Pangolin",
  creator: "Armored Pangolin",
  category: "Industrial engineering and steel fabrication",
  openGraph: {
    title: "Armored Pangolin | From Concept to Steel",
    description:
      "Steel engineering, CNC plasma cutting, CAD design and fabrication—built in Swakopmund for Namibia's industrial, commercial and mining sectors.",
    type: "website",
    locale: "en_NA",
    siteName: "Armored Pangolin",
    url: "/",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Armored Pangolin precision steel engineering workshop in Namibia",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Armored Pangolin | From Concept to Steel",
    description:
      "Steel engineering, CNC plasma cutting, CAD design and fabrication from Swakopmund, Namibia.",
    images: ["/og.png"],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#232323",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["LocalBusiness", "ProfessionalService"],
        "@id": `${siteUrl}/#business`,
        name: "Armored Pangolin",
        legalName: "Herda Investments CC",
        url: siteUrl,
        logo: `${siteUrl}/brand/logo-lockup-transparent.png`,
        image: `${siteUrl}/og.png`,
        description:
          "Steel engineering, CNC plasma cutting, CAD design and fabrication from Swakopmund, Namibia.",
        email: "armoredpangolin.info@gmail.com",
        telephone: "+264815519040",
        address: {
          "@type": "PostalAddress",
          streetAddress: "Unit 2 Marvin Park, Industrial Area",
          addressLocality: "Swakopmund",
          addressRegion: "Erongo",
          addressCountry: "NA",
        },
        areaServed: ["Swakopmund", "Walvis Bay", "Erongo", "Namibia"],
        knowsAbout: [
          "CNC plasma cutting",
          "steel fabrication",
          "press brake bending",
          "welding",
          "3D CAD engineering",
          "machining",
        ],
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: "Engineering and metal manufacturing services",
          itemListElement: SERVICE_PAGES.map((service) => ({
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: service.name,
              url: `${siteUrl}/${service.slug}/`,
            },
          })),
        },
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: "Armored Pangolin",
        publisher: { "@id": `${siteUrl}/#business` },
        inLanguage: "en-NA",
      },
    ],
  };

  return (
    <html
      lang="en"
      className="antialiased"
    >
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}
        />
        <PersistentAudioProvider>{children}</PersistentAudioProvider>
      </body>
    </html>
  );
}
