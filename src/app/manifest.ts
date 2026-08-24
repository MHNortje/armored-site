import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Armored Pangolin Metal Manufacturing",
    short_name: "Armored Pangolin",
    description:
      "Metal manufacturing, steel fabrication, CNC plasma cutting and CAD design in Swakopmund, Namibia.",
    start_url: "/",
    display: "standalone",
    background_color: "#171719",
    theme_color: "#232323",
    lang: "en-NA",
    icons: [
      {
        src: "/pangolin-favicon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/pangolin-favicon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
