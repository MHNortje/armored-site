"use client";

import { Component, Suspense, forwardRef, useCallback, useEffect, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import { OrbitControls } from "@react-three/drei";
import { Canvas, useLoader, useThree } from "@react-three/fiber";
import { DRACOLoader, GLTFLoader, MeshoptDecoder, type OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { Box, ChevronLeft, ChevronRight, Hand, LoaderCircle, MousePointer2, Rotate3D, Scan, ZoomIn, ZoomOut } from "lucide-react";
import * as THREE from "three";
import { productModelAlt, type ProductModel } from "@/lib/product-models";
import { loadStepMeshes } from "@/lib/step-loader";
import { createStepGroup, modelPresentation, type ModelPresentation } from "@/lib/model-presentation";

type View = "3D" | "Front" | "Side" | "Top";
type CameraActions = { fit: (view?: View) => void; zoom: (factor: number) => void; turn: (angle: number) => void };
type LoadState = { status: "loading" | "ready" | "error"; message: string };
type ModelProps = { upAxis: "y" | "z"; onReady: (presentation: ModelPresentation) => void; onStatus: (state: LoadState) => void };

function PresentedModel({ object, upAxis, onReady }: { object: THREE.Object3D; upAxis: "y" | "z"; onReady: ModelProps["onReady"] }) {
  const oriented = useMemo(() => {
    const group = new THREE.Group();
    // Inventor's Z-up CAD coordinates need conversion to the viewer's Y-up world.
    group.rotation.x = upAxis === "z" ? -Math.PI / 2 : 0;
    group.add(object.clone(true));
    return group;
  }, [object, upAxis]);
  const presentation = useMemo(() => modelPresentation(oriented), [oriented]);
  useLayoutEffect(() => { onReady(presentation); }, [onReady, presentation]);
  return <group dispose={null} scale={presentation.scale}><group position={presentation.offset}><primitive object={oriented} /></group></group>;
}

function StepModel({ url, upAxis, onReady, onStatus }: ModelProps & { url: string }) {
  const [object, setObject] = useState<THREE.Group | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    let created: THREE.Group | undefined;
    void loadStepMeshes(url, (message) => onStatus({ status: "loading", message }), controller.signal)
      .then((meshes) => {
        if (controller.signal.aborted) return;
        created = createStepGroup(meshes);
        setObject(created);
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) onStatus({ status: "error", message: error instanceof Error ? error.message : "The STEP model could not be opened." });
      });
    return () => {
      controller.abort();
      created?.traverse((item) => {
        if (item instanceof THREE.Mesh) {
          item.geometry.dispose();
          const materials = Array.isArray(item.material) ? item.material : [item.material];
          materials.forEach((material: THREE.Material) => material.dispose());
        }
      });
    };
  }, [url, onStatus]);
  return object ? <PresentedModel object={object} upAxis={upAxis} onReady={onReady} /> : null;
}

// Retain GLB decoder support. Uncompressed Painter exports don't download Draco.
const draco = new DRACOLoader().setDecoderPath("https://www.gstatic.com/draco/versioned/decoders/1.5.5/");
function configureGltf(loader: GLTFLoader) {
  loader.setDRACOLoader(draco);
  loader.setMeshoptDecoder(MeshoptDecoder);
}

function GlbModel({ url, upAxis, onReady, onStatus }: ModelProps & { url: string }) {
  const progress = useCallback((event: ProgressEvent) => {
    const amount = event.lengthComputable && event.total
      ? `${Math.round(event.loaded / event.total * 100)}%`
      : `${(event.loaded / 1048576).toFixed(1)} MB`;
    onStatus({ status: "loading", message: event.lengthComputable && event.loaded === event.total ? "Preparing materials and textures…" : `Downloading material model · ${amount}` });
  }, [onStatus]);
  const gltf = useLoader(GLTFLoader, url, configureGltf, progress);
  // GLTFLoader's cached geometry/textures are shared with the clone, so never dispose them here.
  return <PresentedModel object={gltf.scene} upAxis={upAxis} onReady={onReady} />;
}

class ViewerBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}

function StudioLighting() {
  const { get, invalidate } = useThree();
  useEffect(() => {
    const { scene } = get();
    // A uniform, prefiltered CubeUV environment provides neutral PBR fill without
    // a network HDR or runtime PMREM convolution (unreliable on some Windows GPUs).
    const previous = scene.environment;
    const pixels = new Uint8Array(336 * 64 * 4);
    for (let i = 0; i < pixels.length; i += 4) pixels.set([180, 185, 190, 255], i);
    const environment = new THREE.DataTexture(pixels, 336, 64);
    environment.mapping = THREE.CubeUVReflectionMapping;
    environment.colorSpace = THREE.LinearSRGBColorSpace;
    environment.minFilter = environment.magFilter = THREE.LinearFilter;
    environment.generateMipmaps = false;
    environment.needsUpdate = true;
    scene.environment = environment;
    scene.environmentIntensity = 0.8;
    invalidate();
    return () => {
      scene.environment = previous;
      environment.dispose();
    };
  }, [get, invalidate]);
  return <><ambientLight intensity={0.7} /><directionalLight position={[4, 7, 5]} intensity={2.1} /><directionalLight position={[-4, 3, -4]} intensity={1.1} /></>;
}

function ModelError({ onStatus, message }: { onStatus: ModelProps["onStatus"]; message: string }) {
  useEffect(() => { onStatus({ status: "error", message }); }, [onStatus, message]);
  return null;
}

function ContextMonitor({ onLost }: { onLost: () => void }) {
  const { gl } = useThree();
  useEffect(() => {
    const canvas = gl.domElement;
    const lost = (event: Event) => { event.preventDefault(); onLost(); };
    canvas.addEventListener("webglcontextlost", lost);
    // R3F intentionally releases old contexts on unmount; don't report that as failure.
    return () => canvas.removeEventListener("webglcontextlost", lost);
  }, [gl, onLost]);
  return null;
}

const CameraController = forwardRef<CameraActions, { presentation: ModelPresentation | null; autoRotate: boolean; pan: boolean; onInteract: () => void }>(function CameraController({ presentation, autoRotate, pan, onInteract }, ref) {
  const controls = useRef<OrbitControlsImpl>(null);
  const { get, size, invalidate } = useThree();
  const fit = useCallback((view?: View) => {
    const { camera } = get();
    const orbit = controls.current;
    if (!orbit || !(camera instanceof THREE.PerspectiveCamera)) return;
    const radius = presentation?.radius ?? 2.5;
    const vertical = THREE.MathUtils.degToRad(camera.fov) / 2;
    const horizontal = Math.atan(Math.tan(vertical) * size.width / size.height);
    const distance = radius / Math.sin(Math.min(vertical, horizontal)) * 1.15;
    const wasAutoRotating = orbit.autoRotate;
    orbit.autoRotate = false;
    orbit.enableDamping = false;
    orbit.update();
    const direction = view === "Front" ? new THREE.Vector3(0, 0, 1)
      : view === "Side" ? new THREE.Vector3(1, 0, 0)
      : view === "Top" ? new THREE.Vector3(0, 1, 0.001)
      : view === "3D" ? new THREE.Vector3(1, 0.65, 1)
      : camera.position.clone().sub(orbit.target).normalize();
    orbit.target.set(0, 0, 0);
    orbit.minDistance = radius * 0.12;
    orbit.maxDistance = distance * 4;
    camera.near = 0.01;
    camera.far = Math.max(150, distance * 8);
    camera.updateProjectionMatrix();
    camera.position.copy(direction.normalize().multiplyScalar(distance));
    orbit.update();
    orbit.enableDamping = true;
    orbit.autoRotate = wasAutoRotating;
    orbit.saveState();
    invalidate();
  }, [get, size.width, size.height, presentation, invalidate]);
  useLayoutEffect(() => { fit(); }, [fit]);
  useImperativeHandle(ref, () => ({
    fit,
    zoom(factor) {
      const { camera } = get();
      const orbit = controls.current;
      if (!orbit) return;
      const offset = camera.position.clone().sub(orbit.target);
      offset.setLength(THREE.MathUtils.clamp(offset.length() * factor, orbit.minDistance, orbit.maxDistance));
      camera.position.copy(orbit.target).add(offset);
      orbit.update(); invalidate();
    },
    turn(angle) {
      const orbit = controls.current;
      if (!orbit) return;
      orbit.setAzimuthalAngle(orbit.getAzimuthalAngle() + angle);
      invalidate();
    },
  }), [fit, get, invalidate]);
  return <OrbitControls ref={controls} makeDefault enableDamping dampingFactor={0.12} rotateSpeed={0.65} zoomSpeed={0.8} panSpeed={0.7} screenSpacePanning autoRotate={autoRotate} autoRotateSpeed={0.55} onStart={onInteract}
    mouseButtons={{ LEFT: pan ? THREE.MOUSE.PAN : THREE.MOUSE.ROTATE, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.PAN }}
    touches={{ ONE: pan ? THREE.TOUCH.PAN : THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN }} />;
});

function ProductWorkspace({ model }: { model: ProductModel }) {
  const [autoRotate, setAutoRotate] = useState(false);
  const [pan, setPan] = useState(false);
  // Existing catalogue uploads follow the Inventor → Painter Z-up workflow.
  const [upAxis, setUpAxis] = useState<"y" | "z">("z");
  const [presentation, setPresentation] = useState<ModelPresentation | null>(null);
  const [loading, setLoading] = useState<LoadState>({ status: "loading", message: model.glbUrl ? "Downloading material model…" : "Preparing engineering model…" });
  const [attempt, setAttempt] = useState(0);
  const actions = useRef<CameraActions>(null);
  const graphicsFailed = useRef(false);
  const ready = loading.status === "ready";
  const onStatus = useCallback((state: LoadState) => {
    if (!graphicsFailed.current || state.status === "error") setLoading(state);
  }, []);
  const onReady = useCallback((value: ModelPresentation) => {
    setPresentation(value);
    if (!graphicsFailed.current) setLoading({ status: "ready", message: "Model ready · drag to explore" });
  }, []);
  const stopRotation = useCallback(() => setAutoRotate(false), []);
  const onGraphicsLost = useCallback(() => {
    graphicsFailed.current = true;
    setLoading({ status: "error", message: "The graphics connection was interrupted. Choose Try again to reopen the model." });
  }, []);
  const createRenderer = useCallback((parameters: THREE.WebGLRendererParameters) => {
    try {
      return new THREE.WebGLRenderer(parameters);
    } catch (error) {
      // Renderer creation happens asynchronously, outside React's error boundary.
      // Surface a useful message instead of leaving the download spinner running.
      graphicsFailed.current = true;
      setLoading({ status: "error", message: "Your browser could not start 3D graphics. Close and reopen the browser, then try again." });
      throw error;
    }
  }, []);
  const act = (action: () => void) => { stopRotation(); action(); };
  const retry = () => {
    graphicsFailed.current = false;
    if (model.glbUrl) useLoader.clear(GLTFLoader, model.glbUrl);
    setLoading({ status: "loading", message: "Trying the model again…" });
    setAttempt((current) => current + 1);
  };
  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setLoading((current) => current.status === "loading" ? { status: "error", message: "This model is taking longer than expected. Check your connection, then try again." } : current);
    }, 180_000);
    return () => window.clearTimeout(timeout);
  }, [attempt]);
  return <div className="product-viewer-shell" tabIndex={0} aria-label={`${model.name} 3D viewer. Arrow keys rotate, plus and minus zoom, Home fits the model.`}
    onKeyDown={(event) => {
      if (event.target !== event.currentTarget || !ready) return;
      const key = event.key;
      if (["ArrowLeft", "ArrowRight", "+", "=", "-", "Home"].includes(key)) {
        event.preventDefault(); stopRotation();
        if (key === "ArrowLeft" || key === "ArrowRight") actions.current?.turn(key === "ArrowLeft" ? -Math.PI / 8 : Math.PI / 8);
        else if (key === "Home") actions.current?.fit("3D");
        else actions.current?.zoom(key === "-" ? 1.2 : 1 / 1.2);
      }
    }}>
    <div className="product-viewer-topbar">
      <div><span>Interactive product</span><strong>{model.name}</strong></div>
      <div>
        <button type="button" disabled={!ready} onClick={() => setAutoRotate((value) => !value)} data-active={autoRotate} aria-pressed={autoRotate}><Rotate3D aria-hidden="true" /> Auto rotate {autoRotate ? "on" : "off"}</button>
        <button type="button" disabled={!ready} onClick={() => act(() => actions.current?.fit("3D"))}><Scan aria-hidden="true" /> Fit model</button>
      </div>
    </div>
    <div className="product-viewer-toolbar" aria-label="Model controls">
      <div className="product-viewer-tools-group" role="group" aria-label="Drag mode">
        <button type="button" onClick={() => { setPan(false); stopRotation(); }} data-active={!pan} aria-pressed={!pan}><MousePointer2 aria-hidden="true" /> Rotate</button>
        <button type="button" onClick={() => { setPan(true); stopRotation(); }} data-active={pan} aria-pressed={pan}><Hand aria-hidden="true" /> Pan</button>
      </div>
      <div className="product-viewer-tools-group" role="group" aria-label="Zoom and rotation">
        <button type="button" disabled={!ready} onClick={() => act(() => actions.current?.zoom(1 / 1.2))} aria-label="Zoom in"><ZoomIn aria-hidden="true" /></button>
        <button type="button" disabled={!ready} onClick={() => act(() => actions.current?.zoom(1.2))} aria-label="Zoom out"><ZoomOut aria-hidden="true" /></button>
        <button type="button" disabled={!ready} onClick={() => act(() => actions.current?.turn(-Math.PI / 8))} aria-label="Rotate model left"><ChevronLeft aria-hidden="true" /></button>
        <button type="button" disabled={!ready} onClick={() => act(() => actions.current?.turn(Math.PI / 8))} aria-label="Rotate model right"><ChevronRight aria-hidden="true" /></button>
      </div>
      <div className="product-viewer-tools-group" role="group" aria-label="Standard views">
        {(["3D", "Front", "Side", "Top"] as const).map((view) => <button key={view} type="button" disabled={!ready} onClick={() => act(() => actions.current?.fit(view))} aria-label={`${view} view`}>{view}</button>)}
      </div>
      <button type="button" disabled={!ready} onClick={() => { stopRotation(); setUpAxis((axis) => axis === "z" ? "y" : "z"); }} aria-label="Turn model upright"><Rotate3D aria-hidden="true" /> Turn upright</button>
    </div>
    <div className="product-viewer-stage" aria-busy={loading.status === "loading"}>
      <div className="product-viewer-canvas" style={{ cursor: pan ? "move" : "grab" }}>
        <ViewerBoundary key={`renderer-${attempt}`} fallback={<ModelError onStatus={onStatus} message="The 3D view could not be displayed. Please try again or use another browser." />}>
        <Canvas gl={createRenderer} frameloop="demand" dpr={[1, 1.5]} camera={{ position: [6, 3.9, 6], fov: 38, near: 0.01, far: 150 }} fallback={<p>Your browser cannot display 3D. Please enable hardware acceleration or try another browser.</p>}>
          <ContextMonitor onLost={onGraphicsLost} />
          <color attach="background" args={["#e5e7e9"]} />
          <StudioLighting />
          <Suspense fallback={null}>
            <ViewerBoundary key={`geometry-${attempt}`} fallback={<ModelError onStatus={onStatus} message="The model geometry could not be displayed. Please try again or choose another product." />}>
            <ViewerBoundary key={`${model.id}-${attempt}`} fallback={<StepModel url={model.stepUrl} upAxis={upAxis} onReady={onReady} onStatus={onStatus} />}>
              {model.glbUrl ? <GlbModel url={model.glbUrl} upAxis={upAxis} onReady={onReady} onStatus={onStatus} /> : <StepModel url={model.stepUrl} upAxis={upAxis} onReady={onReady} onStatus={onStatus} />}
            </ViewerBoundary>
            </ViewerBoundary>
          </Suspense>
          <gridHelper position={[0, presentation?.floor ?? -1.5, 0]} args={[16, 32, "#bcc0c6", "#d3d6d9"]}>
            <lineBasicMaterial attach="material" color="#c6cbd1" transparent opacity={0.32} depthWrite={false} />
          </gridHelper>
          <CameraController ref={actions} presentation={presentation} autoRotate={autoRotate} pan={pan} onInteract={stopRotation} />
        </Canvas>
        </ViewerBoundary>
      </div>
      {!ready && <div className="product-viewer-overlay">
        <div className="product-canvas-status" data-error={loading.status === "error"} role="status">
          {loading.status === "loading" ? <LoaderCircle aria-hidden="true" /> : <Box aria-hidden="true" />}
          <span>{loading.message}</span>
          {loading.status === "error" && <button type="button" onClick={retry}>Try again</button>}
        </div>
      </div>}
    </div>
    <div className="product-viewer-gestures" aria-label="3D viewer instructions">
      <span><MousePointer2 aria-hidden="true" /> {pan ? "Drag to move the model" : "Drag or swipe to rotate"}</span>
      <span><ZoomIn aria-hidden="true" /> Pinch / wheel to zoom</span>
      <span><Hand aria-hidden="true" /> Two fingers / right-drag to pan</span>
    </div>
  </div>;
}

export function ProductShowroom({ models }: { models: ProductModel[] }) {
  const [selectedId, setSelectedId] = useState("");
  const selected = models.find((model) => model.id === selectedId) ?? models[0];
  if (!selected) return <div className="product-showroom-empty"><span><Box aria-hidden="true" /></span><div><p className="editorial-kicker">Interactive catalogue</p><h3>Product models are being prepared.</h3><p>The showroom is ready for STEP geometry and texture-rich GLB presentation files uploaded through the private admin portal.</p></div></div>;
  return <div className="product-showroom">
    <ProductWorkspace key={`${selected.id}-${selected.glbUrl ?? selected.stepUrl}`} model={selected} />
    <div className="product-model-list" aria-label="Available 3D products">
      {models.map((model, index) => <button key={model.id} type="button" className="product-model-card" data-active={model.id === selected.id} aria-pressed={model.id === selected.id} onClick={() => setSelectedId(model.id)} aria-label={`View ${model.name} in 3D`}>
        <span className="product-model-card-media">{model.previewUrl ? <Image src={model.previewUrl} alt={productModelAlt(model.name)} fill loading="lazy" sizes="(max-width: 767px) 42vw, 13rem" className="object-contain" /> : <Box aria-hidden="true" />}</span>
        <span className="product-model-card-copy"><small>{String(index + 1).padStart(2, "0")}</small><strong>{model.name}</strong><em>{model.glbUrl ? "Material render + STEP" : "STEP engineering view"}</em></span>
      </button>)}
    </div>
  </div>;
}
