export type ProductModel = {
  id: string;
  name: string;
  stepUrl: string;
  glbUrl?: string;
  previewUrl?: string;
  uploadedAt: number;
  storageNames: string[];
  sourceFileName?: string;
};

export function productModelAlt(name: string) {
  return `${name} interactive 3D product model by Armored Pangolin`;
}
