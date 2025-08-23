import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import LenisSmooth from "../components/LenisSmooth";
import Header from "../components/Header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Armored",
  description: "Innovations • Productions • Beyond",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
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
