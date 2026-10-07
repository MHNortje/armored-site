"use client";

import { useEffect, useState } from "react";
import { SiteHud } from "@/components/ui/site-hud";
import type { GalleryImage } from "@/lib/gallery";
import type { ProductModel } from "@/lib/product-models";
import { listPortfolioImages, listProductModels } from "@/lib/supabase";

export function PortfolioExperience() {
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [productModels, setProductModels] = useState<ProductModel[]>([]);

  useEffect(() => {
    let interval: number | undefined;
    const refreshMedia = async () => {
      try {
        const [galleryResult, modelResult] = await Promise.all([
          listPortfolioImages(),
          listProductModels(),
        ]);
        setGalleryImages(galleryResult.files);
        setProductModels(modelResult.files);
      } catch {
        // Designed fallback work remains visible until storage is configured.
      }
    };

    // Keep the hero's critical render path free from portfolio-storage work.
    const initialRefresh = window.setTimeout(() => {
      void refreshMedia();
      interval = window.setInterval(refreshMedia, 30_000);
    }, 900);
    const onVisible = () => {
      if (document.visibilityState === "visible") void refreshMedia();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearTimeout(initialRefresh);
      if (interval) window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  return <SiteHud galleryImages={galleryImages} productModels={productModels} />;
}
