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
    let active = true;
    const refreshMedia = async () => {
      // A slow photo request must not hold up the independent 3D catalogue.
      await Promise.allSettled([
        listPortfolioImages().then((result) => { if (active) setGalleryImages(result.files); }),
        listProductModels().then((result) => { if (active) setProductModels(result.files); }),
      ]);
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
      active = false;
      window.clearTimeout(initialRefresh);
      if (interval) window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  return <SiteHud galleryImages={galleryImages} productModels={productModels} />;
}
