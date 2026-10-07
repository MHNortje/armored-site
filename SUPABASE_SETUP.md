# Armored Pangolin portfolio storage

The deployed website is a static export. Supabase provides browser-safe authentication and media storage without a Next.js server.

## 1. Create the project and administrator

1. Create a Supabase project.
2. Open **Authentication → Users → Add user**.
3. Create the private administrator email and password used at `/admin/`.
4. Disable public user sign-ups under **Authentication → Providers → Email** if only the owners should upload.

## 2. Create the media bucket

Open **Storage → New bucket** and create a public bucket named exactly:

```text
portfolio
```

Use at least a 45 MB file limit. Leave the MIME restriction open, or allow images plus STEP/STP, GLB and JSON. Gallery images are limited to 8 MB by the website; each STEP or GLB model is limited to 45 MB.

The admin portal stores normal gallery images at the bucket root. Product assets are grouped under `models/` with one JSON manifest per product. The policies below cover both areas.

## 3. Add Storage policies

Open **SQL Editor**, review the following policies, and run them once:

```sql
create policy "Public can list portfolio images"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'portfolio');

create policy "Authenticated admin can upload portfolio images"
on storage.objects for insert
to authenticated
with check (bucket_id = 'portfolio');

create policy "Authenticated admin can update portfolio images"
on storage.objects for update
to authenticated
using (bucket_id = 'portfolio')
with check (bucket_id = 'portfolio');

create policy "Authenticated admin can delete portfolio images"
on storage.objects for delete
to authenticated
using (bucket_id = 'portfolio');
```

## 4. Add public project values

Copy **Project URL** and **anon public key** from **Project Settings → API**:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

These values are safe in browser code. Do not use or publish the Supabase service-role key.

Add the same two values in Cloudflare Pages under **Settings → Environment variables** for the Production environment, then redeploy.

## 5. Test

1. Open `/admin/` and sign in with the administrator created in step 1.
2. Under **Gallery photography**, upload one portrait or landscape JPG/WebP and confirm the full frame remains visible in the public gallery.
3. Under **3D product models**, upload a STEP file, an optional GLB material render and an optional cover image.
4. Return to the home page and confirm the gallery and product showroom update within 30 seconds.
5. Rotate, zoom and pan the model on desktop and a touch device.
6. Sign out and confirm an unauthenticated upload is rejected.

## Inventor material note

STEP is the source of truth for the model geometry and can retain basic face colours. Inventor appearance texture images are not normally embedded in STEP. For a close visual match to Inventor, export a GLB with its textures embedded and upload it beside the STEP file. The showroom prefers GLB for presentation and automatically falls back to STEP when no GLB is supplied or a GLB cannot be loaded.
