"use client";

import { useEffect, useState } from "react";
import { SiteHud } from "@/components/ui/site-hud";
import type { GalleryImage } from "@/lib/gallery";
import { listPortfolioImages } from "@/lib/supabase";

export function PortfolioExperience() {
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);

  useEffect(() => {
    const refreshGallery = async () => {
      try {
        const data = await listPortfolioImages();
        setGalleryImages(data.files);
      } catch {
        // The designed workshop crops remain visible until storage is configured.
      }
    };

    void refreshGallery();
    const interval = window.setInterval(refreshGallery, 30_000);
    const onVisible = () => {
      if (document.visibilityState === "visible") void refreshGallery();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  return <SiteHud galleryImages={galleryImages} />;
}
