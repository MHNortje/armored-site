# Armored Pangolin portfolio storage

The deployed website is a static export. Supabase provides browser-safe authentication and image storage without a Next.js server.

## 1. Create the project and administrator

1. Create a Supabase project.
2. Open **Authentication → Users → Add user**.
3. Create the private administrator email and password used at `/admin/`.
4. Disable public user sign-ups under **Authentication → Providers → Email** if only the owners should upload.

## 2. Create the image bucket

Open **Storage → New bucket** and create a public bucket named exactly:

```text
portfolio
```

Use an 8 MB file limit and allow `image/jpeg`, `image/png`, `image/webp`, and `image/heic` if those controls are available.

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
2. Upload one landscape JPG or WebP image.
3. Return to the home page and confirm the gallery updates within 30 seconds.
4. Sign out and confirm an unauthenticated upload is rejected.
