"use client";

import { Component, Suspense, useEffect, useMemo, useState, type ErrorInfo, type ReactNode } from "react";
import Image from "next/image";
import { Bounds, Center, ContactShadows, Environment, Grid, Html, OrbitControls, useGLTF } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Box, LoaderCircle, MousePointer2, Rotate3D, Scan, ZoomIn } from "lucide-react";
import * as THREE from "three";
import { productModelAlt, type ProductModel } from "@/lib/product-models";

type OcctMesh = {
  name?: string;
  color?: number[];
  brep_faces?: Array<{ first: number; last: number; color?: number[] | null }>;
  attributes: {
    position: { array: number[] };
    normal?: { array: number[] };
  };
  index: { array: number[] };
};

type OcctResult = { success: boolean; meshes: OcctMesh[] };
type OcctApi = { ReadStepFile: (content: Uint8Array, params: Record<string, unknown>) => OcctResult };
type OcctFactory = (options?: { locateFile?: (path: string) => string }) => Promise<OcctApi>;

declare global {
  interface Window {
    occtimportjs?: OcctFactory;
    __armoredOcctPromise?: Promise<OcctApi>;
  }
}

type StepPart = {
  geometry: THREE.BufferGeometry;
  materials: THREE.MeshStandardMaterial[];
  name: string;
};

function colour(values?: number[] | null) {
  if (!values || values.length < 3) return new THREE.Color("#9ea1a6");
  const divisor = values.some((value) => value > 1) ? 255 : 1;
  return new THREE.Color(values[0] / divisor, values[1] / divisor, values[2] / divisor);
}

function steelMaterial(values?: number[] | null) {
  return new THREE.MeshStandardMaterial({
    color: colour(values),
    metalness: 0.62,
    roughness: 0.34,
    envMapIntensity: 0.85,
  });
}

async function loadOcct() {
  if (window.__armoredOcctPromise) return window.__armoredOcctPromise;
  window.__armoredOcctPromise = new Promise<OcctApi>((resolve, reject) => {
    const initialise = () => {
      if (!window.occtimportjs) {
        reject(new Error("The STEP renderer did not initialise."));
        return;
      }
      window.occtimportjs({ locateFile: (path) => `/occt/${path}` }).then(resolve, reject);
    };
    const existing = document.querySelector<HTMLScriptElement>('script[data-occt-loader="true"]');
    if (existing) {
      if (window.occtimportjs) initialise();
      else existing.addEventListener("load", initialise, { once: true });
      return;
    }
    const script = document.createElement("script");
    script.src = "/occt/occt-import-js.js";
    script.async = true;
    script.dataset.occtLoader = "true";
    script.addEventListener("load", initialise, { once: true });
    script.addEventListener("error", () => reject(new Error("The STEP renderer could not be downloaded.")), { once: true });
    document.head.appendChild(script);
  });
  return window.__armoredOcctPromise;
}

function useStepParts(url: string) {
  const [parts, setParts] = useState<StepPart[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [message, setMessage] = useState("Preparing engineering geometry…");

  useEffect(() => {
    let active = true;
    let createdParts: StepPart[] = [];

    const load = async () => {
      try {
        const [occt, response] = await Promise.all([loadOcct(), fetch(url)]);
        if (!response.ok) throw new Error("The STEP model could not be downloaded.");
        const result = occt.ReadStepFile(new Uint8Array(await response.arrayBuffer()), {
          linearUnit: "millimeter",
          linearDeflectionType: "bounding_box_ratio",
          linearDeflection: 0.001,
          angularDeflection: 0.35,
        });
        if (!result.success || !result.meshes.length) throw new Error("No displayable geometry was found in this STEP model.");

        createdParts = result.meshes.map((mesh, index) => {
          const geometry = new THREE.BufferGeometry();
          geometry.setAttribute("position", new THREE.Float32BufferAttribute(mesh.attributes.position.array, 3));
          if (mesh.attributes.normal?.array.length) {
            geometry.setAttribute("normal", new THREE.Float32BufferAttribute(mesh.attributes.normal.array, 3));
          } else {
            geometry.computeVertexNormals();
          }
          geometry.setIndex(mesh.index.array);

          const materials = [steelMaterial(mesh.color)];
          const colouredFaces = mesh.brep_faces?.filter((face) => face.color) ?? [];
          if (colouredFaces.length) {
            geometry.clearGroups();
            for (const face of mesh.brep_faces ?? []) {
              let materialIndex = 0;
              if (face.color) {
                materialIndex = materials.length;
                materials.push(steelMaterial(face.color));
              }
              geometry.addGroup(face.first * 3, (face.last - face.first + 1) * 3, materialIndex);
            }
          }
          geometry.computeBoundingSphere();
          return { geometry, materials, name: mesh.name || `STEP part ${index + 1}` };
        });
        if (!active) return;
        setParts(createdParts);
        setStatus("ready");
      } catch (error) {
        if (!active) return;
        setMessage(error instanceof Error ? error.message : "The STEP model could not be rendered.");
        setStatus("error");
      }
    };
    void load();
    return () => {
      active = false;
      createdParts.forEach((part) => {
        part.geometry.dispose();
        part.materials.forEach((material) => material.dispose());
      });
    };
  }, [url]);

  return { parts, status, message };
}

function StepModel({ url }: { url: string }) {
  const { parts, status, message } = useStepParts(url);
  if (status !== "ready") {
    return (
      <group>
        <HtmlStatus status={status} message={message} />
      </group>
    );
  }
  return (
    <Bounds fit clip observe margin={1.18}>
      <Center>
        <group>
          {parts.map((part, index) => (
            <mesh key={`${part.name}-${index}`} geometry={part.geometry} material={part.materials} castShadow receiveShadow />
          ))}
        </group>
      </Center>
    </Bounds>
  );
}

function HtmlStatus({ status, message }: { status: "loading" | "error"; message: string }) {
  return (
    <Html center>
      <div className="product-canvas-status" data-error={status === "error"} role="status">
        {status === "loading" ? <LoaderCircle aria-hidden="true" /> : <Box aria-hidden="true" />}
        <span>{message}</span>
      </div>
    </Html>
  );
}

function GlbModel({ url }: { url: string }) {
  const gltf = useGLTF(url);
  const scene = useMemo(() => gltf.scene.clone(true), [gltf.scene]);
  useEffect(() => {
    scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.castShadow = true;
        object.receiveShadow = true;
      }
    });
  }, [scene]);
  return (
    <Bounds fit clip observe margin={1.18}>
      <Center><primitive object={scene} /></Center>
    </Bounds>
  );
}

class ViewerBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error("3D product viewer failed", error, info); }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}

function ProductCanvas({ model, autoRotate }: { model: ProductModel; autoRotate: boolean }) {
  return (
    <div className="product-viewer-canvas">
      <Canvas shadows dpr={[1, 1.75]} camera={{ position: [3.4, 2.5, 4.2], fov: 38, near: 0.01, far: 1000 }}>
        <color attach="background" args={["#17181b"]} />
        <fog attach="fog" args={["#17181b", 8, 18]} />
        <ambientLight intensity={0.58} />
        <directionalLight position={[4, 7, 5]} intensity={2.1} castShadow shadow-mapSize={[1024, 1024]} />
        <directionalLight position={[-5, 2, -3]} intensity={0.75} color="#8c50f0" />
        <Suspense fallback={null}>
          <ViewerBoundary fallback={<StepModel url={model.stepUrl} />}>
            {model.glbUrl ? <GlbModel url={model.glbUrl} /> : <StepModel url={model.stepUrl} />}
          </ViewerBoundary>
          <Environment preset="warehouse" environmentIntensity={0.75} />
        </Suspense>
        <ContactShadows position={[0, -1.25, 0]} opacity={0.42} scale={12} blur={2.4} far={4.5} />
        <Grid position={[0, -1.28, 0]} args={[20, 20]} cellSize={0.5} cellThickness={0.45} cellColor="#4c4e54" sectionSize={2.5} sectionThickness={0.8} sectionColor="#7650a8" fadeDistance={16} infiniteGrid />
        <OrbitControls
          makeDefault
          enableDamping
          dampingFactor={0.075}
          enablePan
          enableZoom
          minDistance={0.35}
          maxDistance={18}
          autoRotate={autoRotate}
          autoRotateSpeed={0.65}
        />
      </Canvas>
    </div>
  );
}

export function ProductShowroom({ models }: { models: ProductModel[] }) {
  const [selectedId, setSelectedId] = useState("");
  const [autoRotate, setAutoRotate] = useState(true);
  const [version, setVersion] = useState(0);
  const selected = models.find((model) => model.id === selectedId) ?? models[0];

  if (!selected) {
    return (
      <div className="product-showroom-empty">
        <span><Box aria-hidden="true" /></span>
        <div>
          <p className="editorial-kicker">Interactive catalogue</p>
          <h3>Product models are being prepared.</h3>
          <p>The showroom is ready for STEP geometry and texture-rich GLB presentation files uploaded through the private admin portal.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="product-showroom">
      <div className="product-viewer-shell">
        <div className="product-viewer-topbar">
          <div>
            <span>Interactive product</span>
            <strong>{selected.name}</strong>
          </div>
          <div>
            <button type="button" onClick={() => setAutoRotate((current) => !current)} data-active={autoRotate} aria-pressed={autoRotate} aria-label="Toggle automatic model rotation">
              <Rotate3D aria-hidden="true" /> {autoRotate ? "Rotation on" : "Rotation off"}
            </button>
            <button type="button" onClick={() => setVersion((current) => current + 1)} aria-label="Reset the 3D model camera">
              <Scan aria-hidden="true" /> Reset view
            </button>
          </div>
        </div>
        <ProductCanvas key={`${selected.id}-${version}`} model={selected} autoRotate={autoRotate} />
        <div className="product-viewer-loading" aria-live="polite">
          <LoaderCircle aria-hidden="true" /> Large STEP models may take a moment to triangulate on first view.
        </div>
        <div className="product-viewer-gestures" aria-label="3D viewer controls">
          <span><MousePointer2 aria-hidden="true" /> Drag to rotate</span>
          <span><ZoomIn aria-hidden="true" /> Wheel or pinch to zoom</span>
          <span><Rotate3D aria-hidden="true" /> Right-drag to pan</span>
        </div>
      </div>

      <div className="product-model-list" role="list" aria-label="Available 3D products">
        {models.map((model, index) => (
          <button
            key={model.id}
            type="button"
            role="listitem"
            className="product-model-card"
            data-active={model.id === selected.id}
            onClick={() => { setSelectedId(model.id); setVersion((current) => current + 1); }}
            aria-label={`View ${model.name} in 3D`}
          >
            <span className="product-model-card-media">
              {model.previewUrl ? (
                <Image src={model.previewUrl} alt={productModelAlt(model.name)} fill loading="lazy" sizes="(max-width: 767px) 42vw, 13rem" className="object-contain" />
              ) : (
                <Box aria-hidden="true" />
              )}
            </span>
            <span className="product-model-card-copy">
              <small>{String(index + 1).padStart(2, "0")}</small>
              <strong>{model.name}</strong>
              <em>{model.glbUrl ? "Material render + STEP" : "STEP engineering view"}</em>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
