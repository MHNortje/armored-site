# Armored Pangolin Portfolio

High-end editorial Next.js portfolio for Armored Pangolin, Swakopmund. The project includes restrained workshop animation, a detailed project-enquiry route, a Supabase-backed portfolio gallery, and a protected phone/desktop upload portal.

## Start locally

```bash
copy .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The admin portal is at `/admin`.

## Project enquiries

The static project form opens a fully prepared email draft addressed to `armoredpangolin.info@gmail.com`. Visitors attach any drawings in their email app before sending.

## Portfolio uploads

Follow [SUPABASE_SETUP.md](./SUPABASE_SETUP.md), then add the two public project values to `.env.local` and Cloudflare Pages. Supabase Auth and Storage policies protect uploads; the public gallery refreshes automatically.

## Varien Regular

The display typography is configured for Varien Regular. Add the licensed webfont as `public/fonts/Varien-Regular.woff2`. Until that file is supplied, the page uses the existing sans-serif fallback. A webfont licence is required before deploying the font file publicly.

## Production build

```bash
npm run build
```

The Cloudflare-ready site is generated in `/out`. See [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) for the complete Cloudflare Pages and domain launch procedure.
