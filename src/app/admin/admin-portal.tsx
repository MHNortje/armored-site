"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, ImageIcon, LoaderCircle, LockKeyhole, LogOut, Trash2, UploadCloud } from "lucide-react";
import {
  deletePortfolioImage,
  isSupabaseConfigured,
  listPortfolioImages,
  signInToPortfolio,
  signOutOfPortfolio,
  type SupabaseSession,
  uploadPortfolioImages,
} from "@/lib/supabase";
import type { GalleryImage } from "@/lib/gallery";

const sessionKey = "armored-pangolin-portfolio-session";

export function AdminPortal() {
  const [session, setSession] = useState<SupabaseSession | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [pending, setPending] = useState(false);
  const [galleryPending, setGalleryPending] = useState(false);
  const [deleting, setDeleting] = useState("");
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let restoreTimer: number | undefined;
    try {
      const saved = window.sessionStorage.getItem(sessionKey);
      if (!saved) return;
      const parsed = JSON.parse(saved) as SupabaseSession;
      if (parsed.expires_at && parsed.expires_at <= Date.now() / 1000) {
        window.sessionStorage.removeItem(sessionKey);
        return;
      }
      restoreTimer = window.setTimeout(() => setSession(parsed), 0);
    } catch {
      window.sessionStorage.removeItem(sessionKey);
    }
    return () => {
      if (restoreTimer) window.clearTimeout(restoreTimer);
    };
  }, []);

  const refreshImages = useCallback(async () => {
    setGalleryPending(true);
    try {
      const result = await listPortfolioImages();
      setImages(result.files);
    } catch (galleryError) {
      setError(galleryError instanceof Error ? galleryError.message : "Unable to load portfolio images.");
    } finally {
      setGalleryPending(false);
    }
  }, []);

  useEffect(() => {
    if (!session) return;

    const refreshTimer = window.setTimeout(() => {
      void refreshImages();
    }, 0);

    return () => window.clearTimeout(refreshTimer);
  }, [session, refreshImages]);

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    try {
      const nextSession = await signInToPortfolio(email, password);
      window.sessionStorage.setItem(sessionKey, JSON.stringify(nextSession));
      setSession(nextSession);
      setPassword("");
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Unable to sign in.");
    } finally {
      setPending(false);
    }
  }

  async function upload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!session) return;
    setPending(true);
    setError("");
    setMessage("");
    try {
      await uploadPortfolioImages(files, session.access_token);
      setFiles([]);
      setMessage("Upload complete. The public gallery will refresh automatically.");
      const input = form.elements.namedItem("portfolioFiles") as HTMLInputElement | null;
      if (input) input.value = "";
      await refreshImages();
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "The upload failed.");
    } finally {
      setPending(false);
    }
  }

  async function removeImage(image: GalleryImage) {
    if (!session) return;
    const confirmed = window.confirm("Remove this image from the public portfolio gallery?");
    if (!confirmed) return;

    setDeleting(image.storageName);
    setError("");
    setMessage("");
    try {
      await deletePortfolioImage(image.storageName, session.access_token);
      setImages((current) => current.filter((item) => item.storageName !== image.storageName));
      setMessage("Image removed from the portfolio gallery.");
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "The image could not be removed.");
    } finally {
      setDeleting("");
    }
  }

  async function logout() {
    if (session) await signOutOfPortfolio(session.access_token);
    window.sessionStorage.removeItem(sessionKey);
    setSession(null);
    setImages([]);
    setMessage("");
    setError("");
  }

  return (
    <main className="technical-grid min-h-screen bg-[#232323] px-4 py-10 text-white sm:px-6 sm:py-16">
      <section className="glass-panel mx-auto max-w-2xl rounded-3xl p-6 sm:p-10">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-white/15 bg-[#18191b] p-1.5">
              <Image src="/brand/mark-transparent.png" alt="Armored Pangolin" width={716} height={762} className="h-full w-full object-contain" priority />
            </span>
            <div>
              <p className="micro-label text-[#b994ff]">Armored Pangolin</p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#dcdcdc]">Portfolio upload portal</h1>
            </div>
          </div>
          <Link href="/" className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/15 text-white/50 transition hover:border-[#8c50f0] hover:text-white" aria-label="Back to website">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </div>
        <p className="mt-5 max-w-xl text-sm leading-6 text-white/50">Upload finished-work, process and detail photography from your phone or desktop. New images flow directly into the showcase gallery.</p>

        {!isSupabaseConfigured ? (
          <p className="mt-8 rounded-xl border border-amber-300/20 bg-amber-300/5 p-4 text-sm leading-6 text-amber-100/75">Portfolio storage is ready for Cloudflare, but Supabase must be connected before uploads can be used.</p>
        ) : !session ? (
          <form onSubmit={login} className="mt-8 space-y-4">
            <label className="block"><span className="micro-label text-white/45">Admin email</span><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="username" required disabled={pending} className="mt-2 h-13 w-full rounded-xl border border-white/15 bg-black/25 px-4 text-sm text-white outline-none focus:border-[#8c50f0]" /></label>
            <label className="block"><span className="micro-label text-white/45">Admin password</span><div className="mt-2 flex items-center gap-3 rounded-xl border border-white/15 bg-black/25 px-4 focus-within:border-[#8c50f0]"><LockKeyhole className="h-4 w-4 text-white/35" /><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required disabled={pending} className="h-13 w-full bg-transparent text-sm text-white outline-none" /></div></label>
            <button type="submit" disabled={pending} className="micro-label w-full rounded-xl bg-[#8c50f0] px-5 py-4 text-white transition hover:bg-[#a77aff] disabled:opacity-35">{pending ? "Checking…" : "Open upload portal"}</button>
          </form>
        ) : (
          <div className="mt-8 space-y-6">
            <form onSubmit={upload} className="technical-grid rounded-2xl border border-white/12 bg-black/20 p-4 sm:p-7">
              <div className="mb-5 flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-full bg-[#8c50f0]/15 text-[#b994ff]"><UploadCloud className="h-5 w-5" /></span><div><h2 className="font-semibold text-[#dcdcdc]">Add portfolio images</h2><p className="mt-1 text-xs text-white/40">JPG, PNG, WebP or HEIC · up to 8 MB each · six at a time</p></div></div>
              <input name="portfolioFiles" type="file" accept="image/*,.heic,.heif" multiple required onChange={(event) => setFiles(Array.from(event.target.files ?? []))} className="block w-full rounded-xl border border-dashed border-white/20 bg-[#232323]/60 p-6 text-sm text-white/55 file:mr-4 file:rounded-full file:border-0 file:bg-[#8c50f0] file:px-4 file:py-3 file:text-xs file:font-semibold file:uppercase file:tracking-wider file:text-white" />
              <button type="submit" disabled={pending || files.length === 0} className="micro-label mt-4 w-full rounded-xl bg-[#8c50f0] px-5 py-4 text-white transition hover:bg-[#a77aff] disabled:opacity-35">{pending ? "Uploading…" : `Upload ${files.length || "selected"} image${files.length === 1 ? "" : "s"}`}</button>
            </form>
            <section className="rounded-2xl border border-white/12 bg-black/20 p-4 sm:p-7" aria-labelledby="uploaded-images-title">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-[#8c50f0]/15 text-[#b994ff]"><ImageIcon className="h-5 w-5" /></span>
                  <div>
                    <h2 id="uploaded-images-title" className="font-semibold text-[#dcdcdc]">Uploaded portfolio</h2>
                    <p className="mt-1 text-xs text-white/40">{images.length} image{images.length === 1 ? "" : "s"} currently in the public gallery</p>
                  </div>
                </div>
                <button type="button" onClick={() => void refreshImages()} disabled={galleryPending} className="micro-label rounded-full border border-white/15 px-3 py-2 text-white/50 transition hover:border-[#8c50f0] hover:text-white disabled:opacity-35">Refresh</button>
              </div>

              {galleryPending ? (
                <p className="flex items-center gap-2 py-8 text-sm text-white/45"><LoaderCircle className="h-4 w-4 animate-spin" /> Loading portfolio images…</p>
              ) : images.length === 0 ? (
                <p className="rounded-xl border border-dashed border-white/15 p-6 text-sm leading-6 text-white/42">No uploaded portfolio images yet. Your six concept images remain available as the gallery fallback.</p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {images.map((image) => (
                    <article key={image.id} className="overflow-hidden rounded-xl border border-white/12 bg-[#171719]">
                      <div className="relative aspect-[4/3] bg-black/35">
                        <Image src={image.url} alt="Uploaded Armored Pangolin portfolio project" fill sizes="(max-width: 639px) 100vw, 20rem" className="object-cover" />
                      </div>
                      <div className="flex items-center justify-between gap-3 p-3">
                        <div className="min-w-0">
                          <p className="truncate text-xs text-white/58" title={image.name}>{image.name}</p>
                          <p className="mt-1 text-[0.65rem] text-white/28">{image.uploadedAt ? new Date(image.uploadedAt).toLocaleDateString("en-NA", { dateStyle: "medium" }) : "Portfolio image"}</p>
                        </div>
                        <button type="button" onClick={() => void removeImage(image)} disabled={Boolean(deleting)} className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-red-300/15 text-red-200/55 transition hover:border-red-300/45 hover:bg-red-300/8 hover:text-red-100 disabled:opacity-30" aria-label="Remove image from portfolio">
                          {deleting === image.storageName ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
            <button type="button" onClick={logout} className="micro-label inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-3 text-white/55 transition hover:border-[#8c50f0] hover:text-white"><LogOut className="h-3 w-3" /> Sign out</button>
          </div>
        )}
        {message && <p className="mt-6 flex items-start gap-2 rounded-xl border border-white/10 bg-white/5 p-4 text-sm leading-6 text-white/65"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#b994ff]" />{message}</p>}
        {error && <p className="mt-6 rounded-xl border border-red-300/20 bg-red-300/5 p-4 text-sm text-red-200" role="alert">{error}</p>}
      </section>
    </main>
  );
}
