import type { MetadataRoute } from "next";
import { SERVICE_PAGES } from "@/lib/service-pages";

const siteUrl = "https://www.armoredpangolin.com";
const lastContentUpdate = new Date("2026-08-23T00:00:00+02:00");

const homepageImages = [
  "/brand/workshop-hero-4k-v6.webp",
  "/brand/press-brake-workshop-v2-hd.webp",
  "/brand/cad-engineering-workstation-v1-hd.webp",
  "/brand/welding-workshop-v2-hd.webp",
  "/brand/concept-namibian-braaier-hd.webp",
  "/brand/concept-lodge-sign-hd.webp",
  "/brand/concept-steel-frame-hd.webp",
  "/brand/concept-truck-trailer-hd.webp",
  "/brand/concept-vehicle-canopy-hd.webp",
  "/brand/concept-ibeam-warehouse-hd.webp",
].map((image) => `${siteUrl}${image}`);

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const servicePages: MetadataRoute.Sitemap = SERVICE_PAGES.map((service) => ({
    url: `${siteUrl}/${service.slug}/`,
    lastModified: lastContentUpdate,
    changeFrequency: "monthly",
    priority: 0.86,
    images: [`${siteUrl}${service.image}`],
  }));

  return [
    {
      url: siteUrl,
      lastModified: lastContentUpdate,
      changeFrequency: "monthly",
      priority: 1,
      images: homepageImages,
    },
    {
      url: `${siteUrl}/start-a-project/`,
      lastModified: lastContentUpdate,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    ...servicePages,
  ];
}
