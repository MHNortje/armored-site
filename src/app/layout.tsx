import type { Metadata, Viewport } from "next";
import { PersistentAudioProvider } from "@/components/ui/persistent-audio";
import { SERVICE_PAGES } from "@/lib/service-pages";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.armoredpangolin.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Armored Pangolin | Metal Manufacturing Namibia",
    template: "%s | Armored Pangolin",
  },
  description:
    "Metal manufacturing in Swakopmund: CNC plasma cutting, steel fabrication, press-brake bending, welding, machining and 3D CAD design for Namibia.",
  alternates: {
    canonical: "/",
  },
  keywords: [
    "metal manufacturing Namibia",
    "steel fabrication Namibia",
    "steel fabrication Swakopmund",
    "CNC plasma cutting Swakopmund",
    "CNC plasma cutting Namibia",
    "press brake bending Namibia",
    "welding and fabrication Swakopmund",
    "3D CAD design Namibia",
    "industrial design Swakopmund",
    "custom steelwork Namibia",
    "mining fabrication Namibia",
    "commercial metal fabrication Namibia",
    "industrial engineering Namibia",
  ],
  applicationName: "Armored Pangolin",
  authors: [{ name: "Armored Pangolin", url: "/" }],
  creator: "Armored Pangolin",
  publisher: "Armored Pangolin",
  category: "Industrial engineering and steel fabrication",
  manifest: "/manifest.webmanifest",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
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
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
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
        image: [`${siteUrl}/og.png`, `${siteUrl}/brand/workshop-hero-4k-v6.webp`],
        description:
          "Metal manufacturing, steel fabrication, CNC plasma cutting, press-brake bending, welding, machining and 3D CAD design from Swakopmund, Namibia.",
        slogan: "Engineering. Steel fabrication. Design. Perfection.",
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
        hasMap:
          "https://www.google.com/maps/search/?api=1&query=Unit+2+Marvin+Park+Industrial+Area+Swakopmund+Namibia",
        contactPoint: [
          {
            "@type": "ContactPoint",
            name: "Morne Nortje",
            telephone: "+264815519040",
            email: "armoredpangolin.info@gmail.com",
            contactType: "sales and project enquiries",
            areaServed: "NA",
            availableLanguage: "English",
          },
          {
            "@type": "ContactPoint",
            name: "Flip Nortje",
            telephone: "+264811227510",
            contactType: "sales and project enquiries",
            areaServed: "NA",
            availableLanguage: "English",
          },
        ],
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
        alternateName: "Armored Pangolin Namibia",
        description:
          "Metal manufacturing, CNC plasma cutting, steel fabrication and engineering design in Swakopmund, Namibia.",
        publisher: { "@id": `${siteUrl}/#business` },
        inLanguage: "en-NA",
      },
    ],
  };

  return (
    <html
      lang="en-NA"
      className="antialiased"
    >
      <head>
        <link rel="preload" href="/fonts/RussoOne-Regular.ttf" as="font" type="font/ttf" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/Michroma-Regular.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      </head>
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
