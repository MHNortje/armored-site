import { copyFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sourceRoot = resolve(projectRoot, "node_modules", "occt-import-js", "dist");
const targetRoot = resolve(projectRoot, "public", "occt");

await mkdir(targetRoot, { recursive: true });
await Promise.all([
  copyFile(resolve(sourceRoot, "occt-import-js.js"), resolve(targetRoot, "occt-import-js.js")),
  copyFile(resolve(sourceRoot, "occt-import-js.wasm"), resolve(targetRoot, "occt-import-js.wasm")),
  copyFile(resolve(sourceRoot, "license.occt-import-js.txt"), resolve(targetRoot, "license.occt-import-js.txt")),
  copyFile(resolve(sourceRoot, "license.occt.txt"), resolve(targetRoot, "license.occt.txt")),
]);

console.log("Prepared browser STEP renderer assets in public/occt.");
