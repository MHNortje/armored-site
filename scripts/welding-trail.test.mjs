import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { runInNewContext } from "node:vm";
import ts from "typescript";

// Exercise the real component effect with deterministic events, time and canvas
// calls. This is not a browser rendering or physical touch-device test.
const source = readFileSync(new URL("../src/components/ui/welding-trail.tsx", import.meta.url), "utf8");
const { outputText } = ts.transpileModule(source, {
  compilerOptions: {
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.CommonJS,
    jsx: ts.JsxEmit.ReactJSX,
    esModuleInterop: true,
  },
});

class EventSurface {
  listeners = [];
  addEventListener(type, callback, options = {}) {
    const capture = typeof options === "boolean" ? options : Boolean(options.capture);
    this.listeners.push({ type, callback, capture, passive: Boolean(options.passive) });
  }
  removeEventListener(type, callback, options = {}) {
    const capture = typeof options === "boolean" ? options : Boolean(options.capture);
    this.listeners = this.listeners.filter((item) => item.type !== type || item.callback !== callback || item.capture !== capture);
  }
  dispatch(type, values = {}) {
    const event = {
      type,
      target: null,
      preventDefault() { throw new Error(`${type} must not prevent native behavior`); },
      stopPropagation() { throw new Error(`${type} must not stop propagation`); },
      ...values,
    };
    for (const listener of [...this.listeners]) if (listener.type === type) listener.callback(event);
  }
}

class MockElement {
  constructor(excluded = false) { this.excluded = excluded; }
  closest() { return this.excluded ? this : null; }
}

function harness({ reduced = false, width = 390, height = 844, dpr = 3, canvasSupported = true } = {}) {
  let now = 1_000;
  let nextFrame = 0;
  let effects = [];
  let cleanups = [];
  let currentPath = [];
  const frames = new Map();
  const stats = { strokes: 0, strokeCalls: [], fills: 0, visibleMarks: 0, transforms: [] };
  const context = {
    clearRect() { stats.visibleMarks = 0; },
    setTransform(...values) { stats.transforms.push(values); },
    beginPath() { currentPath = []; },
    moveTo(x, y) { currentPath.push(["moveTo", x, y]); },
    lineTo(x, y) { currentPath.push(["lineTo", x, y]); },
    stroke() {
      stats.strokes++; stats.visibleMarks++;
      stats.strokeCalls.push({
        colour: context.strokeStyle,
        alpha: context.globalAlpha,
        width: context.lineWidth,
        path: currentPath.map((point) => [...point]),
      });
    },
    fillRect() { stats.fills++; stats.visibleMarks++; },
    createRadialGradient() { return { addColorStop() {} }; },
  };
  const canvas = { width: 0, height: 0, getContext: () => canvasSupported ? context : null };
  const motion = Object.assign(new EventSurface(), { matches: reduced });
  const window = Object.assign(new EventSurface(), {
    innerWidth: width, innerHeight: height, devicePixelRatio: dpr,
    matchMedia: () => motion,
  });
  const document = Object.assign(new EventSurface(), { hidden: false });
  const compiledModule = { exports: {} };
  const math = Object.create(Math);
  math.random = () => 0.5;
  const imports = {
    react: { useRef: (value) => ({ current: value }), useEffect: (effect) => effects.push(effect) },
    "react/jsx-runtime": { jsx: (type, props) => ({ type, props }) },
    "./welding-trail.module.css": { trail: "trail" },
  };
  runInNewContext(outputText, {
    module: compiledModule, exports: compiledModule.exports, window, document, Element: MockElement, Math: math,
    performance: { now: () => now },
    requestAnimationFrame(callback) { frames.set(++nextFrame, callback); return nextFrame; },
    cancelAnimationFrame(id) { frames.delete(id); },
    require(name) {
      assert.ok(name in imports, `Unexpected dependency: ${name}`);
      return imports[name];
    },
  });
  const api = {
    window, document, motion, canvas, stats, frames,
    mount() {
      effects = [];
      const node = compiledModule.exports.WeldingTrail();
      assert.equal(node.type, "canvas");
      assert.equal(node.props["aria-hidden"], "true");
      node.props.ref.current = canvas;
      cleanups = effects.map((effect) => effect()).filter(Boolean);
    },
    unmount() { for (const cleanup of cleanups) cleanup(); cleanups = []; },
    advance(milliseconds = 34) { now += milliseconds; },
    frame(milliseconds = 34) {
      now += milliseconds;
      const queued = [...frames.values()];
      frames.clear();
      for (const callback of queued) callback(now);
    },
    flush() {
      let count = 0;
      while (frames.size && count++ < 100) api.frame();
      assert.equal(frames.size, 0, "Animation must stop when the trail expires");
      return count;
    },
    pointer(x, y = 100, values = {}) {
      document.dispatch("pointermove", { clientX: x, clientY: y, pointerType: "mouse", isPrimary: true, ...values });
    },
    touch(points, values = {}) {
      document.dispatch("touchmove", { touches: points.map(([clientX, clientY]) => ({ clientX, clientY })), ...values });
    },
    moveMouse() { api.pointer(100); api.advance(); api.pointer(130); },
  };
  api.mount();
  return api;
}

function followsSegment(call, start = 100, end = 130) {
  return JSON.stringify(call.path) === JSON.stringify([["moveTo", start, 100], ["lineTo", end, 100]]);
}

function isReddish(colour) {
  const hex = /^#([\da-f]{6})$/i.exec(colour);
  const rgb = hex
    ? [0, 2, 4].map((offset) => parseInt(hex[1].slice(offset, offset + 2), 16))
    : /^rgba?\(([^)]+)\)/.exec(colour)?.[1].split(/[,\s]+/).slice(0, 3).map(Number);
  return Boolean(rgb && rgb[0] > rgb[1] * 1.5 && rgb[0] > rgb[2] * 1.5);
}

test("mouse movement draws, expires, clears the canvas and leaves no idle RAF", (t) => {
  const h = harness(); t.after(() => h.unmount());
  h.moveMouse();
  assert.equal(h.frames.size, 1);
  assert.ok(h.flush() < 30);
  assert.ok(h.stats.strokes > 0);
  assert.equal(h.stats.visibleMarks, 0);
  const draws = h.stats.strokes;
  h.frame(5_000);
  assert.equal(h.stats.strokes, draws);
});

test("mouse and touch leave a reddish two-pass seam that fades fully and stops drawing", (t) => {
  for (const touch of [false, true]) {
    const h = harness(); t.after(() => h.unmount());
    if (touch) {
      h.document.dispatch("touchstart");
      h.touch([[100, 100]]); h.advance(); h.touch([[130, 100]]);
    } else h.moveMouse();
    h.frame();
    const firstPasses = h.stats.strokeCalls.filter((call) => followsSegment(call));
    assert.equal(firstPasses.length, 2, "The traveled line should have an outer and core stroke");
    assert.ok(firstPasses.some((call) => isReddish(call.colour)), "The seam should visibly use a red colour");
    assert.notEqual(firstPasses[0].width, firstPasses[1].width);
    for (const call of firstPasses) assert.ok(call.alpha > 0 && call.alpha <= 1);
    const firstCount = h.stats.strokeCalls.length;
    h.frame(); h.frame(); h.frame();
    const fadingPasses = h.stats.strokeCalls.slice(firstCount).filter((call) => followsSegment(call));
    assert.ok(fadingPasses.length > 0);
    for (const call of fadingPasses) {
      const initial = firstPasses.find((pass) => pass.colour === call.colour && pass.width === call.width);
      assert.ok(initial && call.alpha < initial.alpha, "Both seam passes must fade over time");
    }
    assert.ok(h.flush() < 30);
    assert.equal(h.stats.visibleMarks, 0);
    const completed = h.stats.strokeCalls.length;
    h.frame(5_000);
    assert.equal(h.stats.strokeCalls.length, completed, "Expired seams must not leave an idle animation loop");
  }
});

test("cleared seam geometry cannot reappear when a new gesture starts", (t) => {
  const h = harness(); t.after(() => h.unmount());
  h.moveMouse(); h.frame();
  assert.ok(h.stats.strokeCalls.some((call) => followsSegment(call)));
  h.window.dispatch("blur");
  assert.equal(h.frames.size, 0);
  assert.equal(h.stats.visibleMarks, 0);
  const afterClear = h.stats.strokeCalls.length;
  h.pointer(200); h.advance(); h.pointer(230); h.frame();
  const freshCalls = h.stats.strokeCalls.slice(afterClear);
  assert.ok(freshCalls.some((call) => followsSegment(call, 200, 230)));
  assert.ok(!freshCalls.some((call) => followsSegment(call)), "Old seam segments must be discarded by clear()");
});

test("reduced motion suppresses movement and cancels an active trail when changed", (t) => {
  const h = harness({ reduced: true }); t.after(() => h.unmount());
  h.moveMouse(); h.frame();
  assert.equal(h.frames.size, 0);
  assert.equal(h.stats.strokes + h.stats.fills, 0);
  h.motion.matches = false; h.motion.dispatch("change");
  h.moveMouse(); h.frame();
  assert.ok(h.stats.strokes > 0);
  h.motion.matches = true; h.motion.dispatch("change");
  assert.equal(h.frames.size, 0);
  assert.equal(h.stats.visibleMarks, 0);
  const draws = h.stats.strokes;
  h.moveMouse(); h.frame();
  assert.equal(h.stats.strokes, draws);
});

test("touch pointer events alone emit nothing; dual delivery equals touch-only delivery", (t) => {
  const pointerOnly = harness(); t.after(() => pointerOnly.unmount());
  pointerOnly.pointer(100, 100, { pointerType: "touch" });
  pointerOnly.advance();
  pointerOnly.pointer(130, 100, { pointerType: "touch" });
  assert.equal(pointerOnly.frames.size, 0);
  const drawTouchGesture = (duplicatePointer) => {
    const h = harness(); t.after(() => h.unmount());
    h.document.dispatch("touchstart");
    for (const x of [100, 130, 160]) {
      if (duplicatePointer) h.pointer(x, 100, { pointerType: "touch" });
      h.touch([[x, 100]]); h.advance();
    }
    h.flush();
    return h.stats.strokes;
  };
  const single = drawTouchGesture(false);
  assert.ok(single > 0);
  assert.equal(drawTouchGesture(true), single);
});

test("multi-touch emits nothing and resets the start of a later single-finger gesture", (t) => {
  const h = harness(); t.after(() => h.unmount());
  h.touch([[100, 100]]); h.advance();
  h.touch([[120, 100], [150, 100]]); h.advance();
  h.touch([[140, 100], [170, 100]]);
  assert.equal(h.frames.size, 0);
  h.advance(); h.touch([[150, 100]]);
  assert.equal(h.frames.size, 0, "First single touch after a pinch must establish a new origin");
  h.advance(); h.touch([[175, 100]]);
  assert.equal(h.frames.size, 1);
});

test("gesture listeners are passive capture observers and never cancel native events", (t) => {
  const h = harness(); t.after(() => h.unmount());
  for (const type of ["pointermove", "pointerout", "touchstart", "touchmove", "touchend", "touchcancel"]) {
    const listeners = h.document.listeners.filter((listener) => listener.type === type);
    assert.equal(listeners.length, 1);
    assert.equal(listeners[0].passive, true);
    assert.equal(listeners[0].capture, true);
  }
  h.moveMouse();
  for (const type of ["touchstart", "touchend", "touchcancel"]) h.document.dispatch(type);
  h.touch([[100, 100]]); h.advance(); h.touch([[130, 100]]);
  h.document.dispatch("pointerout", { relatedTarget: null });
});

test("blur, hidden documents and resize stop active work; hidden pages cannot emit", (t) => {
  const h = harness(); t.after(() => h.unmount());
  for (const event of ["blur", "resize"]) {
    h.moveMouse(); assert.equal(h.frames.size, 1);
    h.frame(); assert.ok(h.stats.visibleMarks > 0);
    h.window.dispatch(event);
    assert.equal(h.frames.size, 0);
    assert.equal(h.stats.visibleMarks, 0);
  }
  h.moveMouse(); h.document.hidden = true; h.document.dispatch("visibilitychange");
  h.moveMouse(); h.frame();
  assert.equal(h.frames.size, 0);
  assert.equal(h.stats.visibleMarks, 0);
});

test("cleanup removes every listener and RAF, including a Strict Mode-style remount", () => {
  const h = harness();
  for (let mount = 0; mount < 2; mount++) {
    if (mount) h.mount();
    h.moveMouse(); assert.equal(h.frames.size, 1);
    h.frame(); assert.ok(h.stats.visibleMarks > 0);
    h.unmount();
    assert.equal(h.frames.size, 0);
    assert.equal(h.stats.visibleMarks, 0);
    assert.equal(h.window.listeners.length + h.document.listeners.length + h.motion.listeners.length, 0);
  }
});

test("editable targets and pointer discontinuities do not create connecting streaks", (t) => {
  const h = harness(); t.after(() => h.unmount());
  h.pointer(100); h.advance(); h.pointer(130, 100, { target: new MockElement(true) });
  h.advance(); h.pointer(160);
  assert.equal(h.frames.size, 0);
  h.advance(); h.pointer(600);
  assert.equal(h.frames.size, 0);
  h.advance(500); h.pointer(620);
  assert.equal(h.frames.size, 0);
  h.advance(); h.pointer(640);
  assert.equal(h.frames.size, 1);
});

test("combined seam, spark and backing-store budgets remain bounded under input bursts", (t) => {
  for (const touch of [false, true]) {
    const h = harness({ width: 3840, height: 2160, dpr: 4 }); t.after(() => h.unmount());
    assert.ok(h.canvas.width * h.canvas.height <= 4_005_000);
    assert.ok(h.stats.transforms.at(-1)[0] <= 1.5);
    for (let x = 0; x < 1000; x += 10) {
      if (touch) h.touch([[x, 100]]); else h.pointer(x);
      h.advance(30);
    }
    h.frame();
    assert.ok(h.stats.strokes > 0);
    // Each seam is drawn twice: 36/50 segments plus the 64/96 spark budgets.
    assert.ok(h.stats.strokes <= (touch ? 2 * 36 + 64 : 2 * 50 + 96));
  }
});

test("an unavailable 2D context leaves the page functional without listeners", () => {
  const h = harness({ canvasSupported: false });
  assert.equal(h.window.listeners.length + h.document.listeners.length + h.motion.listeners.length, 0);
  h.unmount();
});
