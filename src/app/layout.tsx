// src/app/layout.tsx
import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import LenisSmooth from "../components/LenisSmooth";
import Header from "../components/Header";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  // ✅ Your primary domain
  metadataBase: new URL("https://armoredpangolin.com"),

  // Titles
  title: {
    default: "Armored",
    template: "%s • Armored",
  },

  // Descriptions used by search / link previews
  description: "Innovations • Productions • Beyond",

  // SEO: canonical URL
  alternates: {
    canonical: "/",
  },

  // Open Graph (Facebook, LinkedIn, etc.)
  openGraph: {
    type: "website",
    url: "https://armoredpangolin.com",
    siteName: "Armored",
    title: "Armored",
    description: "Innovations • Productions • Beyond",
    images: [
      // Optional: place an image at /public/og-image.jpg (1200x630 recommended)
      { url: "/og-image.jpg", width: 1200, height: 630, alt: "Armored" },
    ],
  },

  // Twitter card
  twitter: {
    card: "summary_large_image",
    title: "Armored",
    description: "Innovations • Productions • Beyond",
    images: ["/og-image.jpg"], // safe if the file exists; otherwise remove this line
  },

  // Icons (put these files in /public if you have them)
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },

  // Basic robots settings
  robots: {
    index: true,
    follow: true,
  },
};

// Browser UI color on mobile
export const viewport: Viewport = {
  themeColor: "#2D2D2D",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-[rgb(45,45,45)] text-white antialiased">
        <LenisSmooth />
        <Header />
        {children}
      </body>
    </html>
  );
}
