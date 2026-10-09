export type OcctMesh = {
  name?: string;
  color?: number[];
  brep_faces?: Array<{ first: number; last: number; color?: number[] | null }>;
  attributes: {
    position: { array: Float32Array };
    normal?: { array: Float32Array };
  };
  index: { array: Uint32Array };
};

type StepWorkerMessage =
  | { type: "progress"; message: string }
  | { type: "complete"; meshes: OcctMesh[] }
  | { type: "error"; message: string };

const STEP_LOAD_TIMEOUT_MS = 180_000;

/** Each load owns its worker; terminating it releases the CAD runtime and model. */
export function loadStepMeshes(
  url: string,
  onProgress: (message: string) => void,
  signal: AbortSignal,
): Promise<OcctMesh[]> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(new DOMException("Model loading was cancelled.", "AbortError"));
      return;
    }

    let worker: Worker;
    try {
      worker = new Worker("/workers/step-loader.js");
    } catch {
      reject(new Error("The 3D model loader could not start. Refresh the page and try again."));
      return;
    }

    let settled = false;
    const cleanup = () => {
      clearTimeout(timeout);
      signal.removeEventListener("abort", abort);
      worker.onmessage = null;
      worker.onerror = null;
      worker.onmessageerror = null;
      worker.terminate();
    };
    const fail = (error: Error) => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(error);
    };
    const abort = () => fail(new DOMException("Model loading was cancelled.", "AbortError"));

    const timeout = setTimeout(() => {
      fail(new Error("The 3D model took too long to load. Check your connection and try again."));
    }, STEP_LOAD_TIMEOUT_MS);
    signal.addEventListener("abort", abort, { once: true });

    worker.onmessage = (event: MessageEvent<StepWorkerMessage>) => {
      if (settled) return;
      const message = event.data;
      if (message.type === "progress") {
        onProgress(message.message);
      } else if (message.type === "error") {
        fail(new Error(message.message));
      } else if (message.type === "complete") {
        settled = true;
        cleanup();
        resolve(message.meshes);
      }
    };
    worker.onerror = (event) => {
      event.preventDefault();
      fail(new Error("The 3D model loader stopped unexpectedly. Please try again."));
    };
    worker.onmessageerror = () => {
      fail(new Error("The 3D model could not be prepared for display. Please try again."));
    };

    try {
      worker.postMessage({ type: "load", url: new URL(url, window.location.href).href });
    } catch {
      fail(new Error("The 3D model could not be requested. Please try again."));
    }
  });
}
