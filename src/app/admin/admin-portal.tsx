"use client";

import { FormEvent, useCallback, useEffect, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Box, CheckCircle2, ImageIcon, LoaderCircle, LockKeyhole, LogOut, Trash2, UploadCloud } from "lucide-react";
import { PersistentAudioControl } from "@/components/ui/persistent-audio";
import {
  deletePortfolioImage,
  deleteProductModel,
  isSupabaseConfigured,
  listPortfolioImages,
  listProductModels,
  signInToPortfolio,
  signOutOfPortfolio,
  type SupabaseSession,
  uploadPortfolioImages,
  uploadProductModel,
} from "@/lib/supabase";
import { portfolioImageAlt, type GalleryImage } from "@/lib/gallery";
import { productModelAlt, type ProductModel } from "@/lib/product-models";

const sessionKey = "armored-pangolin-portfolio-session";

export function AdminPortal() {
  const [session, setSession] = useState<SupabaseSession | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [view, setView] = useState<"gallery" | "models">("gallery");
  const [files, setFiles] = useState<File[]>([]);
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [models, setModels] = useState<ProductModel[]>([]);
  const [modelName, setModelName] = useState("");
  const [stepFile, setStepFile] = useState<File>();
  const [glbFile, setGlbFile] = useState<File>();
  const [previewFile, setPreviewFile] = useState<File>();
  const [pending, setPending] = useState(false);
  const [modelPending, setModelPending] = useState(false);
  const [galleryPending, setGalleryPending] = useState(false);
  const [modelsPending, setModelsPending] = useState(false);
  const [deleting, setDeleting] = useState("");
  const [modelDeleting, setModelDeleting] = useState("");
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
    return () => { if (restoreTimer) window.clearTimeout(restoreTimer); };
  }, []);

  const refreshImages = useCallback(async () => {
    setGalleryPending(true);
    try {
      setImages((await listPortfolioImages()).files);
    } catch (galleryError) {
      setError(galleryError instanceof Error ? galleryError.message : "Unable to load portfolio images.");
    } finally {
      setGalleryPending(false);
    }
  }, []);

  const refreshModels = useCallback(async () => {
    setModelsPending(true);
    try {
      setModels((await listProductModels()).files);
    } catch (modelError) {
      setError(modelError instanceof Error ? modelError.message : "Unable to load 3D product models.");
    } finally {
      setModelsPending(false);
    }
  }, []);

  useEffect(() => {
    if (!session) return;
    const refreshTimer = window.setTimeout(() => { void Promise.all([refreshImages(), refreshModels()]); }, 0);
    return () => window.clearTimeout(refreshTimer);
  }, [session, refreshImages, refreshModels]);

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

  async function uploadImages(event: FormEvent<HTMLFormElement>) {
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
      setError(uploadError instanceof Error ? uploadError.message : "The image upload failed.");
    } finally {
      setPending(false);
    }
  }

  async function uploadModel(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!session || !stepFile) return;
    setModelPending(true);
    setError("");
    setMessage("");
    try {
      await uploadProductModel(modelName, stepFile, glbFile, previewFile, session.access_token);
      setModelName("");
      setStepFile(undefined);
      setGlbFile(undefined);
      setPreviewFile(undefined);
      form.reset();
      setMessage("3D product uploaded. It is now available in the interactive showroom.");
      await refreshModels();
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "The 3D product upload failed.");
    } finally {
      setModelPending(false);
    }
  }

  async function removeImage(image: GalleryImage) {
    if (!session || !window.confirm("Remove this image from the public portfolio gallery?")) return;
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

  async function removeModel(model: ProductModel) {
    if (!session || !window.confirm(`Remove ${model.name} from the 3D showroom?`)) return;
    setModelDeleting(model.id);
    setError("");
    setMessage("");
    try {
      await deleteProductModel(model, session.access_token);
      setModels((current) => current.filter((item) => item.id !== model.id));
      setMessage("3D product removed from the showroom.");
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "The 3D product could not be removed.");
    } finally {
      setModelDeleting("");
    }
  }

  async function logout() {
    if (session) await signOutOfPortfolio(session.access_token);
    window.sessionStorage.removeItem(sessionKey);
    setSession(null);
    setImages([]);
    setModels([]);
    setMessage("");
    setError("");
  }

  return (
    <main className="technical-grid min-h-screen bg-[#232323] px-4 py-10 text-white sm:px-6 sm:py-16">
      <section className="glass-panel mx-auto max-w-6xl rounded-3xl p-6 sm:p-10">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-white/15 bg-[#18191b] p-2"><Image src="/brand/mark-transparent.png" alt="Armored Pangolin pangolin mark" width={716} height={762} loading="eager" className="h-full w-full object-contain" /></span>
            <div className="min-w-0"><p className="micro-label text-[#b994ff]">Armored Pangolin</p><h1 className="mt-1 text-xl font-semibold tracking-tight text-[#dcdcdc] sm:text-2xl">Media & 3D product portal</h1></div>
          </div>
          <div className="flex shrink-0 items-center gap-2"><PersistentAudioControl className="editorial-utility admin-audio-control" /><Link href="/" className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/15 text-white/50 transition hover:border-[#8c50f0] hover:text-white" aria-label="Back to website"><ArrowLeft className="h-4 w-4" aria-hidden="true" /></Link></div>
        </div>
        <p className="mt-5 max-w-2xl text-sm leading-6 text-white/50">Manage full-resolution project photography and interactive STEP product models from separate, purpose-built sections.</p>

        {!isSupabaseConfigured ? (
          <p className="mt-8 rounded-xl border border-amber-300/20 bg-amber-300/5 p-4 text-sm leading-6 text-amber-100/75">Portfolio storage is ready for Cloudflare, but Supabase must be connected before uploads can be used.</p>
        ) : !session ? (
          <form onSubmit={login} className="mt-8 max-w-2xl space-y-4">
            <label className="block"><span className="micro-label text-white/45">Admin email</span><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="username" required disabled={pending} className="admin-text-input" /></label>
            <label className="block"><span className="micro-label text-white/45">Admin password</span><div className="mt-2 flex items-center gap-3 rounded-xl border border-white/15 bg-black/25 px-4 focus-within:border-[#8c50f0]"><LockKeyhole className="h-4 w-4 text-white/35" /><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required disabled={pending} className="h-13 w-full bg-transparent text-sm text-white outline-none" /></div></label>
            <button type="submit" disabled={pending} className="micro-label w-full rounded-xl bg-[#8c50f0] px-5 py-4 text-white transition hover:bg-[#a77aff] disabled:opacity-35">{pending ? "Checking…" : "Open management portal"}</button>
          </form>
        ) : (
          <div className="mt-8 space-y-6">
            <nav className="grid gap-2 rounded-2xl border border-white/12 bg-black/20 p-2 sm:grid-cols-2" aria-label="Admin content sections">
              <button type="button" onClick={() => setView("gallery")} data-active={view === "gallery"} className="admin-media-tab"><ImageIcon aria-hidden="true" /> Gallery photography <span>{images.length}</span></button>
              <button type="button" onClick={() => setView("models")} data-active={view === "models"} className="admin-media-tab"><Box aria-hidden="true" /> 3D product models <span>{models.length}</span></button>
            </nav>

            {view === "gallery" ? (
              <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
                <form onSubmit={uploadImages} className="technical-grid h-fit rounded-2xl border border-white/12 bg-black/20 p-4 sm:p-7">
                  <UploadHeading icon={<UploadCloud />} title="Add gallery images" detail="Original aspect ratio retained · up to 8 MB each" />
                  <input name="portfolioFiles" type="file" accept="image/*,.heic,.heif" multiple required aria-label="Select portfolio images to upload" onChange={(event) => setFiles(Array.from(event.target.files ?? []))} className="admin-file-input" />
                  <button type="submit" disabled={pending || files.length === 0} className="micro-label mt-4 w-full rounded-xl bg-[#8c50f0] px-5 py-4 text-white transition hover:bg-[#a77aff] disabled:opacity-35">{pending ? "Uploading…" : `Upload ${files.length || "selected"} image${files.length === 1 ? "" : "s"}`}</button>
                </form>
                <section className="rounded-2xl border border-white/12 bg-black/20 p-4 sm:p-7" aria-labelledby="uploaded-images-title">
                  <AdminSectionHeading icon={<ImageIcon />} title="Uploaded photography" detail={`${images.length} image${images.length === 1 ? "" : "s"} in the public gallery`} pending={galleryPending} onRefresh={refreshImages} titleId="uploaded-images-title" />
                  {galleryPending ? <LoadingCopy>Loading portfolio images…</LoadingCopy> : images.length === 0 ? <EmptyCopy>No uploaded portfolio images yet. The six concept images remain as the gallery fallback.</EmptyCopy> : <div className="grid gap-3 sm:grid-cols-2">{images.map((image) => <article key={image.id} className="overflow-hidden rounded-xl border border-white/12 bg-[#171719]"><div className="relative aspect-[4/3] bg-[radial-gradient(circle_at_center,#303136,#151619_70%)]"><Image src={image.url} alt={portfolioImageAlt(image.name)} fill loading="lazy" sizes="(max-width:639px) 100vw, 20rem" className="object-contain" /></div><div className="flex items-center justify-between gap-3 p-3"><div className="min-w-0"><p className="truncate text-xs text-white/58" title={image.name}>{image.name}</p><p className="mt-1 text-[0.65rem] text-white/28">{image.uploadedAt ? new Date(image.uploadedAt).toLocaleDateString("en-NA", { dateStyle: "medium" }) : "Portfolio image"}</p></div><DeleteButton label={`Remove ${image.name} from portfolio`} pending={deleting === image.storageName} disabled={Boolean(deleting)} onClick={() => void removeImage(image)} /></div></article>)}</div>}
                </section>
              </div>
            ) : (
              <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
                <form onSubmit={uploadModel} className="technical-grid h-fit rounded-2xl border border-white/12 bg-black/20 p-4 sm:p-7">
                  <UploadHeading icon={<Box />} title="Add a 3D product" detail="STEP is required · GLB and cover image are optional" />
                  <label className="block"><span className="micro-label text-white/45">Product name</span><input name="modelName" value={modelName} onChange={(event) => setModelName(event.target.value)} required minLength={2} maxLength={80} placeholder="Example: Namib braai stand" className="admin-text-input" /></label>
                  <ModelFileField label="Engineering model · STEP/STP" name="stepFile" accept=".step,.stp,application/step" required help="Displayed directly in the browser with STEP colours and geometry." onChange={setStepFile} />
                  <ModelFileField label="Material render · GLB" name="glbFile" accept=".glb,model/gltf-binary" help="Recommended for preserving Inventor material textures and polished web performance." onChange={setGlbFile} />
                  <ModelFileField label="Product cover image" name="previewFile" accept="image/*" help="Shown in the product selector before the interactive model opens." onChange={setPreviewFile} />
                  <button type="submit" disabled={modelPending || !stepFile || modelName.trim().length < 2} className="micro-label mt-5 w-full rounded-xl bg-[#8c50f0] px-5 py-4 text-white transition hover:bg-[#a77aff] disabled:opacity-35">{modelPending ? "Uploading model…" : "Publish 3D product"}</button>
                </form>
                <section className="rounded-2xl border border-white/12 bg-black/20 p-4 sm:p-7" aria-labelledby="uploaded-models-title">
                  <AdminSectionHeading icon={<Box />} title="3D product catalogue" detail={`${models.length} interactive product${models.length === 1 ? "" : "s"} in the showroom`} pending={modelsPending} onRefresh={refreshModels} titleId="uploaded-models-title" />
                  {modelsPending ? <LoadingCopy>Loading 3D products…</LoadingCopy> : models.length === 0 ? <EmptyCopy>No 3D products yet. Upload a STEP model to activate the public showroom.</EmptyCopy> : <div className="grid gap-3 sm:grid-cols-2">{models.map((model) => <article key={model.id} className="overflow-hidden rounded-xl border border-white/12 bg-[#171719]"><div className="relative grid aspect-[4/3] place-items-center bg-[radial-gradient(circle_at_center,#303136,#151619_70%)]">{model.previewUrl ? <Image src={model.previewUrl} alt={productModelAlt(model.name)} fill loading="lazy" sizes="(max-width:639px) 100vw, 20rem" className="object-contain" /> : <Box className="h-14 w-14 text-[#b994ff]/50" aria-hidden="true" />}</div><div className="flex items-center justify-between gap-3 p-3"><div className="min-w-0"><p className="truncate text-xs text-white/68" title={model.name}>{model.name}</p><p className="mt-1 text-[0.65rem] text-white/32">STEP{model.glbUrl ? " + material GLB" : " engineering view"}</p></div><DeleteButton label={`Remove ${model.name} from the 3D showroom`} pending={modelDeleting === model.id} disabled={Boolean(modelDeleting)} onClick={() => void removeModel(model)} /></div></article>)}</div>}
                </section>
              </div>
            )}
            <button type="button" onClick={logout} className="micro-label inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-3 text-white/55 transition hover:border-[#8c50f0] hover:text-white"><LogOut className="h-3 w-3" /> Sign out</button>
          </div>
        )}
        {message && <p className="mt-6 flex items-start gap-2 rounded-xl border border-white/10 bg-white/5 p-4 text-sm leading-6 text-white/65"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#b994ff]" />{message}</p>}
        {error && <p className="mt-6 rounded-xl border border-red-300/20 bg-red-300/5 p-4 text-sm text-red-200" role="alert">{error}</p>}
      </section>
    </main>
  );
}

function UploadHeading({ icon, title, detail }: { icon: ReactNode; title: string; detail: string }) {
  return <div className="mb-5 flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-full bg-[#8c50f0]/15 text-[#b994ff]">{icon}</span><div><h2 className="font-semibold text-[#dcdcdc]">{title}</h2><p className="mt-1 text-xs text-white/40">{detail}</p></div></div>;
}

function AdminSectionHeading({ icon, title, detail, pending, onRefresh, titleId }: { icon: ReactNode; title: string; detail: string; pending: boolean; onRefresh: () => Promise<void>; titleId?: string }) {
  return <div className="mb-5 flex items-center justify-between gap-3"><div className="flex min-w-0 items-center gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#8c50f0]/15 text-[#b994ff]">{icon}</span><div className="min-w-0"><h2 id={titleId} className="font-semibold text-[#dcdcdc]">{title}</h2><p className="mt-1 text-xs text-white/40">{detail}</p></div></div><button type="button" onClick={() => void onRefresh()} disabled={pending} className="micro-label rounded-full border border-white/15 px-3 py-2 text-white/50 transition hover:border-[#8c50f0] hover:text-white disabled:opacity-35">Refresh</button></div>;
}

function ModelFileField({ label, name, accept, required, help, onChange }: { label: string; name: string; accept: string; required?: boolean; help: string; onChange: (file: File | undefined) => void }) {
  return <label className="mt-4 block"><span className="micro-label text-white/45">{label}</span><input name={name} type="file" accept={accept} required={required} aria-label={label} onChange={(event) => onChange(event.target.files?.[0])} className="admin-file-input mt-2" /><small className="admin-field-help">{help}</small></label>;
}

function DeleteButton({ label, pending, disabled, onClick }: { label: string; pending: boolean; disabled: boolean; onClick: () => void }) {
  return <button type="button" onClick={onClick} disabled={disabled} className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-red-300/15 text-red-200/55 transition hover:border-red-300/45 hover:bg-red-300/8 hover:text-red-100 disabled:opacity-30" aria-label={label}>{pending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}</button>;
}

function LoadingCopy({ children }: { children: ReactNode }) {
  return <p className="flex items-center gap-2 py-8 text-sm text-white/45"><LoaderCircle className="h-4 w-4 animate-spin" />{children}</p>;
}

function EmptyCopy({ children }: { children: ReactNode }) {
  return <p className="rounded-xl border border-dashed border-white/15 p-6 text-sm leading-6 text-white/42">{children}</p>;
}
