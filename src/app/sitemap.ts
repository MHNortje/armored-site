import type { MetadataRoute } from "next";
import { SERVICE_PAGES } from "@/lib/service-pages";

const siteUrl = "https://www.armoredpangolin.com";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const servicePages: MetadataRoute.Sitemap = SERVICE_PAGES.map((service) => ({
    url: `${siteUrl}/${service.slug}/`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.86,
    images: [`${siteUrl}${service.image}`],
  }));

  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
      images: [`${siteUrl}/og.png`],
    },
    {
      url: `${siteUrl}/start-a-project/`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    ...servicePages,
  ];
}
