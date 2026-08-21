# Armored Pangolin — Cloudflare Pages launch guide

This Next.js App Router website is configured as a static export for Cloudflare Pages. The finished `/out` directory contains the public website; there are no Next.js server routes or Vercel dependencies.

## Local development

Requirements: Node.js 20.9 or newer and npm.

```bash
copy .env.example .env.local
npm install
npm run dev
```

Open `http://localhost:3000`. The portfolio portal is at `/admin/`.

## Production build

```bash
npm run lint
npm run build
```

`next.config.ts` uses:

```ts
const nextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
};
```

The completed static website is generated in `/out`.

## Static production architecture

- Next.js renders `/`, `/start-a-project/`, `/admin/`, `/robots.txt`, and `/sitemap.xml` at build time.
- Three.js, Motion, responsive interactions, audio, local fonts, and all public artwork run in the browser.
- Project enquiries open a prepared message in the visitor's email app.
- Supabase Auth protects the portfolio uploader.
- Supabase Storage serves up to 100 gallery images to the swipeable showcase.
- The supplied six project visualisations remain as the fallback gallery until Supabase contains real work.

Follow [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) before enabling live uploads.

## Cloudflare Pages

Connect the GitHub repository `MHNortje/armored-site` and use:

```text
Framework preset: Next.js (Static HTML Export)
Production branch: main
Build command: npx next build
Build output directory: out
```

If Supabase is enabled, add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to the Cloudflare Production environment before deploying.

The production metadata, canonical URL, Open Graph URL, sitemap, robots file, and structured business data all use `https://www.armoredpangolin.com`.

## Domain and DNS

1. Test the initial `*.pages.dev` deployment on desktop and mobile.
2. Add `armoredpangolin.com` to Cloudflare as a zone and carefully copy all existing DNS records before changing nameservers.
3. Preserve all MX, SPF, DKIM, DMARC, and mail-provider records so business email continues working.
4. Add both `www.armoredpangolin.com` and `armoredpangolin.com` under the Pages project's **Custom domains**.
5. Create a permanent redirect from the apex domain to `https://www.armoredpangolin.com`, preserving the path and query string.
6. Verify HTTP and HTTPS for both hostnames finish at the WWW address.

## Search launch

After the custom domain is live:

1. Add the site to Google Search Console.
2. Submit `https://www.armoredpangolin.com/sitemap.xml`.
3. Confirm `/admin/` is blocked in `robots.txt` and excluded from the sitemap.
4. Verify the Open Graph preview using the public `/og.png` image.

## Performance notes

- Mobile layouts use reduced parallax and touch-friendly navigation.
- Large project images should be exported around 2000 px on the long edge, preferably WebP at 75–85 quality.
- The gallery supports swipe, drag, keyboard arrows, and individual full-screen viewing.
- Audio autoplay remains subject to phone and browser autoplay policies; the site retries after the visitor's first interaction.

## Official references

- [Cloudflare Pages static Next.js guide](https://developers.cloudflare.com/pages/framework-guides/nextjs/deploy-a-static-nextjs-site/)
- [Cloudflare Pages custom domains](https://developers.cloudflare.com/pages/configuration/custom-domains/)
- [Cloudflare redirect rules](https://developers.cloudflare.com/rules/url-forwarding/)
- [Next.js static exports](https://nextjs.org/docs/app/guides/static-exports)
- [Supabase Storage access control](https://supabase.com/docs/guides/storage/security/access-control)
