import type { GalleryImage } from "@/lib/gallery";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/+$/, "") ?? "";
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
const bucket = "portfolio";

export const isSupabaseConfigured = Boolean(supabaseUrl && anonKey);

export type SupabaseSession = {
  access_token: string;
  refresh_token: string;
  expires_at?: number;
  expires_in?: number;
  user?: { email?: string };
};

type StorageObject = {
  id?: string | null;
  name: string;
  created_at?: string | null;
  updated_at?: string | null;
  metadata?: { mimetype?: string } | null;
};

function apiHeaders(token?: string) {
  return {
    apikey: anonKey,
    Authorization: `Bearer ${token || anonKey}`,
  };
}

function requireConfiguration() {
  if (!isSupabaseConfigured) {
    throw new Error("Portfolio storage has not been configured yet.");
  }
}

function publicObjectUrl(name: string) {
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${encodeURIComponent(name)}`;
}

function portfolioDisplayName(storageName: string) {
  const withoutExtension = storageName.replace(/\.[^.]+$/, "");
  const withoutGeneratedPrefix = withoutExtension.replace(
    /^\d{13}-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}-/i,
    "",
  );
  const words = withoutGeneratedPrefix.replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim();
  if (!words) return "Armored Pangolin Project";

  const letters = (words.match(/[a-z]/gi) ?? []).length;
  const digits = (words.match(/\d/g) ?? []).length;
  if (words.length > 64 || digits > letters * 1.5) return "Armored Pangolin Project";

  return words
    .replace(/\b[a-z]/g, (character) => character.toUpperCase())
    .replace(/\bDji\b/g, "DJI")
    .replace(/\bCnc\b/g, "CNC");
}

export async function listPortfolioImages(): Promise<{ files: GalleryImage[]; configured: boolean }> {
  if (!isSupabaseConfigured) return { files: [], configured: false };

  const response = await fetch(`${supabaseUrl}/storage/v1/object/list/${bucket}`, {
    method: "POST",
    headers: { ...apiHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({
      prefix: "",
      limit: 100,
      offset: 0,
      sortBy: { column: "created_at", order: "desc" },
    }),
    cache: "no-store",
  });

  if (!response.ok) throw new Error("Portfolio images are temporarily unavailable.");
  const objects = (await response.json()) as StorageObject[];
  const files = objects
    .filter((object) => object.id && object.name && object.name !== ".emptyFolderPlaceholder")
    .filter((object) => !object.metadata?.mimetype || object.metadata.mimetype.startsWith("image/"))
    .map((object) => {
      const uploadedAt = Date.parse(object.created_at || object.updated_at || "") || 0;
      return {
        id: object.id || object.name,
        name: portfolioDisplayName(object.name),
        storageName: object.name,
        url: `${publicObjectUrl(object.name)}?v=${uploadedAt}`,
        uploadedAt,
      };
    });

  return { files, configured: true };
}

export async function signInToPortfolio(email: string, password: string) {
  requireConfiguration();
  const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { ...apiHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = (await response.json()) as SupabaseSession & { error_description?: string; msg?: string };
  if (!response.ok) throw new Error(data.error_description || data.msg || "Unable to sign in.");
  if (!data.expires_at && data.expires_in) data.expires_at = Math.floor(Date.now() / 1000) + data.expires_in;
  return data;
}

export async function signOutOfPortfolio(accessToken: string) {
  if (!isSupabaseConfigured) return;
  await fetch(`${supabaseUrl}/auth/v1/logout`, {
    method: "POST",
    headers: apiHeaders(accessToken),
  });
}

function safeFileName(name: string) {
  const extension = name.includes(".") ? `.${name.split(".").pop()?.toLowerCase()}` : "";
  const stem = name.replace(/\.[^.]+$/, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "project";
  return `${Date.now()}-${crypto.randomUUID()}-${stem}${extension}`;
}

export async function uploadPortfolioImages(files: File[], accessToken: string) {
  requireConfiguration();
  if (!files.length) throw new Error("Choose at least one image.");
  if (files.length > 6) throw new Error("Upload no more than six images at a time.");

  for (const file of files) {
    if (!file.type.startsWith("image/")) throw new Error(`${file.name} is not an image.`);
    if (file.size > 8 * 1024 * 1024) throw new Error(`${file.name} is larger than 8 MB.`);
  }

  for (const file of files) {
    const objectName = safeFileName(file.name);
    const response = await fetch(
      `${supabaseUrl}/storage/v1/object/${bucket}/${encodeURIComponent(objectName)}`,
      {
        method: "POST",
        headers: {
          ...apiHeaders(accessToken),
          "Content-Type": file.type,
          "x-upsert": "false",
        },
        body: file,
      },
    );
    if (!response.ok) {
      const detail = (await response.json().catch(() => ({}))) as { message?: string; error?: string };
      throw new Error(detail.message || detail.error || `Could not upload ${file.name}.`);
    }
  }
}

export async function deletePortfolioImage(name: string, accessToken: string) {
  requireConfiguration();
  if (!name || name.includes("/") || name.includes("\\")) {
    throw new Error("That portfolio image name is not valid.");
  }

  const response = await fetch(
    `${supabaseUrl}/storage/v1/object/${bucket}/${encodeURIComponent(name)}`,
    {
      method: "DELETE",
      headers: apiHeaders(accessToken),
    },
  );

  if (!response.ok) {
    const detail = (await response.json().catch(() => ({}))) as { message?: string; error?: string };
    throw new Error(detail.message || detail.error || "Could not remove that image.");
  }
}
