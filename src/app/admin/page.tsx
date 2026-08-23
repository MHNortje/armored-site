import type { Metadata } from "next";
import { AdminPortal } from "./admin-portal";

export const metadata: Metadata = {
  title: "Portfolio Admin",
  description: "Private Armored Pangolin portfolio administration portal.",
  alternates: { canonical: "/admin/" },
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    googleBot: { index: false, follow: false, noimageindex: true },
  },
};

export default function AdminPage() {
  return <AdminPortal />;
}
