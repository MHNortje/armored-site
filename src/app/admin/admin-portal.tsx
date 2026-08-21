"use client";

import { FormEvent, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, LockKeyhole, LogOut, UploadCloud } from "lucide-react";
import {
  isSupabaseConfigured,
  signInToPortfolio,
  signOutOfPortfolio,
  type SupabaseSession,
  uploadPortfolioImages,
} from "@/lib/supabase";

const sessionKey = "armored-pangolin-portfolio-session";

export function AdminPortal() {
  const [session, setSession] = useState<SupabaseSession | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [pending, setPending] = useState(false);
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
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "The upload failed.");
    } finally {
      setPending(false);
    }
  }

  async function logout() {
    if (session) await signOutOfPortfolio(session.access_token);
    window.sessionStorage.removeItem(sessionKey);
    setSession(null);
    setMessage("");
    setError("");
  }

  return (
    <main className="technical-grid min-h-screen bg-[#232323] px-4 py-10 text-white sm:px-6 sm:py-16">
      <section className="glass-panel mx-auto max-w-2xl rounded-3xl p-6 sm:p-10">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="relative grid h-12 w-12 overflow-hidden rounded-full border border-white/15 bg-[#232323]">
              <Image src="/brand/mark-large.png" alt="Armored Pangolin" width={180} height={180} className="absolute h-[150px] w-[150px] max-w-none -translate-x-[51px] -translate-y-[48px] object-contain" priority />
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
            <button type="button" onClick={logout} className="micro-label inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-3 text-white/55 transition hover:border-[#8c50f0] hover:text-white"><LogOut className="h-3 w-3" /> Sign out</button>
          </div>
        )}
        {message && <p className="mt-6 flex items-start gap-2 rounded-xl border border-white/10 bg-white/5 p-4 text-sm leading-6 text-white/65"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#b994ff]" />{message}</p>}
        {error && <p className="mt-6 rounded-xl border border-red-300/20 bg-red-300/5 p-4 text-sm text-red-200" role="alert">{error}</p>}
      </section>
    </main>
  );
}
