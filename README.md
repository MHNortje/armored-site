# Armored Pangolin Portfolio

High-end editorial Next.js portfolio for Armored Pangolin, Swakopmund. The project includes restrained workshop animation, a detailed project-enquiry route, a full-resolution Supabase gallery, an interactive STEP/GLB product showroom, and a protected phone/desktop media portal.

## Start locally

```bash
copy .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The admin portal is at `/admin`.

## Project enquiries

The static project form opens a fully prepared email draft addressed to `armoredpangolin.info@gmail.com`. Visitors attach any drawings in their email app before sending.

## Gallery and 3D product uploads

Follow [SUPABASE_SETUP.md](./SUPABASE_SETUP.md), then add the two public project values to `.env.local` and Cloudflare Pages. Supabase Auth and Storage policies protect uploads; the public gallery and 3D showroom refresh automatically.

The model workflow uses:

- STEP or STP as the required engineering source, rendered in the browser with OpenCascade.
- GLB as an optional presentation companion for Inventor materials and texture maps.
- JPG, PNG or WebP as an optional product-selector cover.

STEP reliably carries geometry and basic face colours, but it does not normally embed Inventor texture bitmaps. Exporting a GLB companion is the recommended route when the exact visual material finish matters.

## Varien Regular

The display typography is configured for Varien Regular. Add the licensed webfont as `public/fonts/Varien-Regular.woff2`. Until that file is supplied, the page uses the existing sans-serif fallback. A webfont licence is required before deploying the font file publicly.

## Production build

```bash
npm run build
```

The Cloudflare-ready site is generated in `/out`. See [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) for the complete Cloudflare Pages and domain launch procedure.
