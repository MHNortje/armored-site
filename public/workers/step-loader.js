/* global importScripts, occtimportjs */
// The OCCT assets and their licenses are copied unchanged into /occt by
// scripts/copy-occt-assets.mjs. This worker uses only that local CAD runtime.

let started = false;

function progress(message) {
  self.postMessage({ type: "progress", message });
}

async function downloadModel(url) {
  progress("Downloading 3D model…");
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("The 3D model could not be downloaded. Check your connection and try again.");
  }
  if (!response.body) return new Uint8Array(await response.arrayBuffer());

  const contentLength = Number(response.headers.get("content-length"));
  const reader = response.body.getReader();
  const chunks = [];
  let received = 0;
  let lastProgress = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      received += value.byteLength;
      const now = Date.now();
      if (now - lastProgress >= 150) {
        const detail = contentLength > 0
          ? `${Math.min(100, Math.round(received / contentLength * 100))}%`
          : `${(received / 1_048_576).toFixed(1)} MB`;
        progress(`Downloading 3D model (${detail})…`);
        lastProgress = now;
      }
    }
  } finally {
    reader.releaseLock();
  }

  const content = new Uint8Array(received);
  let offset = 0;
  for (const chunk of chunks) {
    content.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return content;
}

async function initialiseRenderer() {
  importScripts("/occt/occt-import-js.js");
  return occtimportjs({ locateFile: (path) => `/occt/${path}` });
}

self.onmessage = async (event) => {
  if (started || event.data?.type !== "load") return;
  started = true;

  try {
    const modelDownload = downloadModel(event.data.url).then((content) => {
      progress("Preparing 3D viewer…");
      return content;
    });
    const renderer = initialiseRenderer();
    const [content, occt] = await Promise.all([modelDownload, renderer]);
    if (!content.byteLength) throw new Error("This 3D model is empty. Please choose another product.");

    progress("Preparing model geometry… You can continue browsing.");
    const result = occt.ReadStepFile(content, {
      linearUnit: "millimeter",
      linearDeflectionType: "bounding_box_ratio",
      linearDeflection: 0.001,
      angularDeflection: 0.35,
    });
    if (!result.success || !result.meshes?.length) {
      throw new Error("No displayable geometry was found in this model. Please choose another product.");
    }

    progress("Preparing the 3D view…");
    const transfers = [];
    const meshes = result.meshes.map((mesh) => {
      const positions = new Float32Array(mesh.attributes.position.array);
      const indices = new Uint32Array(mesh.index.array);
      const normal = mesh.attributes.normal?.array?.length
        ? { array: new Float32Array(mesh.attributes.normal.array) }
        : undefined;
      transfers.push(positions.buffer, indices.buffer);
      if (normal) transfers.push(normal.array.buffer);
      return {
        name: mesh.name,
        color: mesh.color,
        brep_faces: mesh.brep_faces,
        attributes: { position: { array: positions }, ...(normal ? { normal } : {}) },
        index: { array: indices },
      };
    });
    self.postMessage({ type: "complete", meshes }, transfers);
  } catch (error) {
    self.postMessage({
      type: "error",
      message: error instanceof Error && !/fetch|network|importScripts|WebAssembly/i.test(error.message)
        ? error.message
        : "The 3D model could not be loaded. Check your connection and try again.",
    });
  } finally {
    self.close();
  }
};
