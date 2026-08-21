import type { Metadata } from "next";
import { AdminPortal } from "./admin-portal";

export const metadata: Metadata = {
  title: "Portfolio Admin",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return <AdminPortal />;
}
