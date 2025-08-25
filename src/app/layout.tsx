import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import LenisSmooth from "../components/LenisSmooth";
import Header from "../components/Header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Armored Pangolin",
  description: "Innovations • Productions • Beyond",

  // ✅ OpenGraph (used by Facebook, WhatsApp, LinkedIn, etc.)
  openGraph: {
    title: "Armored Pangolin",
    description: "Innovations • Productions • Beyond",
    url: "https://armoredpangolin.com",
    siteName: "Armored Pangolin",
    images: [
      {
        url: "/og-image.jpg", // 1200x630 recommended
        width: 1200,
        height: 630,
        alt: "Armored Pangolin Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  // ✅ Twitter card (used by Twitter/X)
  twitter: {
    card: "summary_large_image",
    title: "Armored Pangolin",
    description: "Innovations • Productions • Beyond",
    images: ["/og-image.jpg"],
    creator: "@yourhandle", // optional, add your Twitter handle
  },

  // ✅ Favicon + App icons
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <LenisSmooth />
        <Header />
        {children}
      </body>
    </html>
  );
}
