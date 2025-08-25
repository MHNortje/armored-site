// src/app/layout.tsx
import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import LenisSmooth from "../components/LenisSmooth";
import Header from "../components/Header";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  metadataBase: new URL("https://armoredpangolin.com"),
  title: {
    default: "Armored Pangolin",
    template: "%s • Armored Pangolin",
  },
  description: "Innovations • Productions • Beyond",
  alternates: { canonical: "/" },

  openGraph: {
    type: "website",
    url: "https://armoredpangolin.com",
    siteName: "Armored Pangolin",
    title: "Armored Pangolin",
    description: "Innovations • Productions • Beyond",
    images: [
      { url: "/og-image.jpg", width: 1200, height: 630, alt: "Armored Pangolin Preview" },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Armored Pangolin",
    description: "Innovations • Productions • Beyond",
    images: ["/og-image.jpg"],
    // creator: "@yourhandle", // optional
  },

  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },

  robots: { index: true, follow: true },
};

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
