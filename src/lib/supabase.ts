import type { GalleryImage } from "@/lib/gallery";
import type { ProductModel } from "@/lib/product-models";

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

function encodeStoragePath(name: string) {
  return name.split("/").map(encodeURIComponent).join("/");
}

function publicObjectUrl(name: string) {
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${encodeStoragePath(name)}`;
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

async function uploadObject(name: string, file: Blob, accessToken: string, contentType: string) {
  const response = await fetch(
    `${supabaseUrl}/storage/v1/object/${bucket}/${encodeStoragePath(name)}`,
    {
      method: "POST",
      headers: {
        ...apiHeaders(accessToken),
        "Content-Type": contentType,
        "x-upsert": "false",
      },
      body: file,
    },
  );
  if (!response.ok) {
    const detail = (await response.json().catch(() => ({}))) as { message?: string; error?: string };
    throw new Error(detail.message || detail.error || `Could not upload ${name.split("/").pop()}.`);
  }
}

async function deleteObject(name: string, accessToken: string) {
  const response = await fetch(
    `${supabaseUrl}/storage/v1/object/${bucket}/${encodeStoragePath(name)}`,
    { method: "DELETE", headers: apiHeaders(accessToken) },
  );
  if (!response.ok) {
    const detail = (await response.json().catch(() => ({}))) as { message?: string; error?: string };
    throw new Error(detail.message || detail.error || `Could not remove ${name.split("/").pop()}.`);
  }
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
    await uploadObject(objectName, file, accessToken, file.type);
  }
}

export async function deletePortfolioImage(name: string, accessToken: string) {
  requireConfiguration();
  if (!name || name.includes("/") || name.includes("\\")) {
    throw new Error("That portfolio image name is not valid.");
  }

  await deleteObject(name, accessToken);
}

type ProductManifest = {
  id: string;
  name: string;
  sourceFileName: string;
  assets: {
    step: string;
    glb?: string;
    preview?: string;
  };
};

export async function listProductModels(): Promise<{ files: ProductModel[]; configured: boolean }> {
  if (!isSupabaseConfigured) return { files: [], configured: false };
  const response = await fetch(`${supabaseUrl}/storage/v1/object/list/${bucket}`, {
    method: "POST",
    headers: { ...apiHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({
      prefix: "models",
      limit: 200,
      offset: 0,
      sortBy: { column: "created_at", order: "desc" },
    }),
    cache: "no-store",
  });
  if (!response.ok) throw new Error("3D product models are temporarily unavailable.");

  const objects = (await response.json()) as StorageObject[];
  const manifests = objects.filter((object) => object.id && object.name.endsWith("--manifest.json"));
  const models: Array<ProductModel | null> = await Promise.all(manifests.map(async (object) => {
    try {
      const storageName = `models/${object.name}`;
      const manifestResponse = await fetch(publicObjectUrl(storageName), { cache: "no-store" });
      if (!manifestResponse.ok) return null;
      const manifest = (await manifestResponse.json()) as ProductManifest;
      if (!manifest.id || !manifest.name || !manifest.assets?.step) return null;
      const uploadedAt = Date.parse(object.created_at || object.updated_at || "") || 0;
      const storageNames = [storageName, manifest.assets.step, manifest.assets.glb, manifest.assets.preview]
        .filter((name): name is string => Boolean(name));
      return {
        id: manifest.id,
        name: manifest.name,
        sourceFileName: manifest.sourceFileName,
        stepUrl: `${publicObjectUrl(manifest.assets.step)}?v=${uploadedAt}`,
        glbUrl: manifest.assets.glb ? `${publicObjectUrl(manifest.assets.glb)}?v=${uploadedAt}` : undefined,
        previewUrl: manifest.assets.preview ? `${publicObjectUrl(manifest.assets.preview)}?v=${uploadedAt}` : undefined,
        uploadedAt,
        storageNames,
      } satisfies ProductModel;
    } catch {
      // A malformed or partially uploaded record should not hide valid products.
      return null;
    }
  }));

  return {
    files: models.filter((model): model is ProductModel => model !== null)
      .sort((a, b) => b.uploadedAt - a.uploadedAt),
    configured: true,
  };
}

export async function uploadProductModel(
  name: string,
  stepFile: File,
  glbFile: File | undefined,
  previewFile: File | undefined,
  accessToken: string,
) {
  requireConfiguration();
  const title = name.replace(/\s+/g, " ").trim();
  if (title.length < 2 || title.length > 80) throw new Error("Enter a product name between 2 and 80 characters.");
  if (!/\.(step|stp)$/i.test(stepFile.name)) throw new Error("The source model must be a STEP or STP file.");
  if (stepFile.size > 45 * 1024 * 1024) throw new Error("The STEP file is larger than 45 MB.");
  if (glbFile && !/\.glb$/i.test(glbFile.name)) throw new Error("The web render must be a GLB file.");
  if (glbFile && glbFile.size > 45 * 1024 * 1024) throw new Error("The GLB file is larger than 45 MB.");
  if (previewFile && !previewFile.type.startsWith("image/")) throw new Error("The product cover must be an image.");
  if (previewFile && previewFile.size > 8 * 1024 * 1024) throw new Error("The product cover is larger than 8 MB.");

  const id = crypto.randomUUID();
  const stepExtension = stepFile.name.toLowerCase().endsWith(".stp") ? "stp" : "step";
  const stepName = `models/${id}--source.${stepExtension}`;
  const glbName = glbFile ? `models/${id}--render.glb` : undefined;
  const previewExtension = previewFile?.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const previewName = previewFile ? `models/${id}--preview.${previewExtension}` : undefined;
  const manifestName = `models/${id}--manifest.json`;

  const uploadedNames: string[] = [];
  try {
    await uploadObject(stepName, stepFile, accessToken, stepFile.type || "application/step");
    uploadedNames.push(stepName);
    if (glbFile && glbName) {
      await uploadObject(glbName, glbFile, accessToken, glbFile.type || "model/gltf-binary");
      uploadedNames.push(glbName);
    }
    if (previewFile && previewName) {
      await uploadObject(previewName, previewFile, accessToken, previewFile.type);
      uploadedNames.push(previewName);
    }

    const manifest: ProductManifest = {
      id,
      name: title,
      sourceFileName: stepFile.name,
      assets: { step: stepName, glb: glbName, preview: previewName },
    };
    await uploadObject(
      manifestName,
      new Blob([JSON.stringify(manifest)], { type: "application/json" }),
      accessToken,
      "application/json",
    );
  } catch (error) {
    await Promise.allSettled(uploadedNames.map((objectName) => deleteObject(objectName, accessToken)));
    throw error;
  }
}

export async function deleteProductModel(model: ProductModel, accessToken: string) {
  requireConfiguration();
  if (!model.storageNames.length || model.storageNames.some((name) => !name.startsWith("models/"))) {
    throw new Error("That 3D product record is not valid.");
  }
  for (const name of model.storageNames) await deleteObject(name, accessToken);
}
