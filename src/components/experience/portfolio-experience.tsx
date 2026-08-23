"use client";

import { useEffect, useState } from "react";
import { SiteHud } from "@/components/ui/site-hud";
import type { GalleryImage } from "@/lib/gallery";
import { listPortfolioImages } from "@/lib/supabase";

export function PortfolioExperience() {
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);

  useEffect(() => {
    let interval: number | undefined;
    const refreshGallery = async () => {
      try {
        const data = await listPortfolioImages();
        setGalleryImages(data.files);
      } catch {
        // The designed workshop crops remain visible until storage is configured.
      }
    };

    // Keep the hero's critical render path free from portfolio-storage work.
    const initialRefresh = window.setTimeout(() => {
      void refreshGallery();
      interval = window.setInterval(refreshGallery, 30_000);
    }, 900);
    const onVisible = () => {
      if (document.visibilityState === "visible") void refreshGallery();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearTimeout(initialRefresh);
      if (interval) window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  return <SiteHud galleryImages={galleryImages} />;
}
