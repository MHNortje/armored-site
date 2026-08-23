export type GalleryImage = {
  id: string;
  name: string;
  storageName: string;
  url: string;
  uploadedAt: number;
};

export function portfolioImageAlt(name: string) {
  const readableName = name
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return readableName
    ? `Armored Pangolin fabricated steel project: ${readableName}`
    : "Armored Pangolin custom steel fabrication project in Namibia";
}
