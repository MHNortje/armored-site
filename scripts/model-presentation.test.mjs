import assert from "node:assert/strict";
import test from "node:test";
import * as THREE from "three";
import { createStepGroup, modelPresentation } from "../src/lib/model-presentation.ts";

function close(actual, expected, message) {
  assert.ok(Math.abs(actual - expected) < 1e-6, `${message ?? "Values differ"}: ${actual} versus ${expected}`);
}

function dispose(object) {
  object.traverse((item) => {
    if (!(item instanceof THREE.Mesh)) return;
    item.geometry.dispose();
    const materials = Array.isArray(item.material) ? item.material : [item.material];
    for (const material of materials) material.dispose();
  });
}

function present(object) {
  const presentation = modelPresentation(object);
  const outer = new THREE.Group();
  outer.scale.setScalar(presentation.scale);
  const centered = new THREE.Group();
  centered.position.fromArray(presentation.offset);
  centered.add(object);
  outer.add(centered);
  outer.updateMatrixWorld(true);
  return { presentation, bounds: new THREE.Box3().setFromObject(outer) };
}

function triangle(overrides = {}) {
  return {
    name: "Uncoloured STEP part",
    attributes: { position: { array: new Float32Array([0, 0, 0, 1000, 0, 0, 0, 1000, 0]) } },
    index: { array: new Uint32Array([0, 1, 2]) },
    ...overrides,
  };
}

test("millimetre STEP and metre GLB geometry occupy the same orbit space", (t) => {
  const millimetres = new THREE.Mesh(new THREE.BoxGeometry(2400, 1600, 1200), new THREE.MeshStandardMaterial());
  const metres = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.6, 1.2), new THREE.MeshStandardMaterial());
  t.after(() => { dispose(millimetres); dispose(metres); });
  const mm = present(millimetres);
  const m = present(metres);
  for (const axis of ["x", "y", "z"]) {
    close(mm.bounds.min[axis], m.bounds.min[axis], `${axis} minimum`);
    close(mm.bounds.max[axis], m.bounds.max[axis], `${axis} maximum`);
  }
  close(mm.bounds.getSize(new THREE.Vector3()).x, 4, "Longest displayed dimension");
  close(mm.presentation.radius, m.presentation.radius, "Camera radius");
  close(mm.presentation.floor, m.presentation.floor, "Ground height");
});

test("non-origin geometry and object transforms are centered without changing proportions", (t) => {
  const geometry = new THREE.BoxGeometry(500, 1500, 2500);
  geometry.translate(18000, -2400, 7000);
  const object = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial());
  object.position.set(-4000, 900, 1200);
  object.rotation.y = Math.PI / 2;
  object.scale.setScalar(1.5);
  t.after(() => dispose(object));
  const original = new THREE.Box3().setFromObject(object).getSize(new THREE.Vector3());
  const { presentation, bounds } = present(object);
  const center = bounds.getCenter(new THREE.Vector3());
  const size = bounds.getSize(new THREE.Vector3());
  close(center.length(), 0, "Displayed center");
  close(Math.max(size.x, size.y, size.z), 4, "Longest displayed dimension");
  close(size.y / size.x, original.y / original.x, "Preserved proportions");
  close(presentation.floor, bounds.min.y - 0.04, "Ground below the model");
});

test("Z-up CAD stays upright, centered and above its floor after presentation normalization", (t) => {
  const source = new THREE.Mesh(new THREE.BoxGeometry(2600, 1700, 1350), new THREE.MeshStandardMaterial());
  source.position.set(8200, -2700, 3100);
  t.after(() => dispose(source));
  const sourceBounds = new THREE.Box3().setFromObject(source);
  const sourceSize = sourceBounds.getSize(new THREE.Vector3());
  const oriented = new THREE.Group();
  oriented.rotation.x = -Math.PI / 2;
  oriented.add(source.clone(true));
  const { presentation, bounds } = present(oriented);
  const size = bounds.getSize(new THREE.Vector3());
  close(size.y, sourceSize.z * presentation.scale, "CAD Z becomes displayed height");
  close(size.z, sourceSize.y * presentation.scale, "CAD Y becomes displayed depth");
  close(size.x, 4, "Longest displayed dimension");
  close(bounds.getCenter(new THREE.Vector3()).length(), 0, "Displayed center");
  close(presentation.floor, bounds.min.y - 0.04, "Floor follows upright model bounds");
  const up = new THREE.Vector3(0, 0, 1).transformDirection(oriented.matrixWorld);
  close(up.y, 1, "Positive CAD Z points upward");
  assert.deepEqual(new THREE.Box3().setFromObject(source), sourceBounds, "Orienting the clone preserves source geometry and transforms");
  assert.equal(source.parent, null);
});

test("empty and zero-size models fail with a useful geometry error", (t) => {
  assert.throws(() => modelPresentation(new THREE.Group()), /no visible geometry/);
  const point = new THREE.Mesh(new THREE.BufferGeometry(), new THREE.MeshStandardMaterial());
  point.geometry.setAttribute("position", new THREE.Float32BufferAttribute([2, 3, 4], 3));
  t.after(() => dispose(point));
  assert.throws(() => modelPresentation(point), /no visible geometry/);
});

test("uncoloured STEP geometry uses a visible single material without requiring groups", (t) => {
  const group = createStepGroup([triangle({ brep_faces: [{ first: 0, last: 0, color: null }] })]);
  t.after(() => dispose(group));
  const mesh = group.children[0];
  assert.ok(mesh instanceof THREE.Mesh);
  assert.equal(mesh.name, "Uncoloured STEP part");
  assert.equal(Array.isArray(mesh.material), false, "An empty group list must not accompany a material array");
  assert.equal(mesh.material.visible, true);
  assert.equal(mesh.geometry.groups.length, 0);
  assert.equal(mesh.geometry.index.count, 3);
  assert.equal(mesh.geometry.getAttribute("normal").count, 3);
  close(modelPresentation(group).scale, 0.004, "Millimetre geometry is normalized");
});

test("repeated face colours share materials and adjacent groups while uncoloured gaps remain covered", (t) => {
  const positions = [];
  const indices = [];
  for (let index = 0; index < 6; index++) {
    positions.push(index * 2, 0, 0, index * 2 + 1, 0, 0, index * 2, 1, 0);
    indices.push(index * 3, index * 3 + 1, index * 3 + 2);
  }
  const group = createStepGroup([triangle({
    color: [0.4, 0.4, 0.4],
    attributes: { position: { array: new Float32Array(positions) } },
    index: { array: new Uint32Array(indices) },
    brep_faces: [
      { first: 1, last: 1, color: [255, 0, 0] },
      { first: 2, last: 2, color: [255, 0, 0] },
      { first: 4, last: 4, color: [0, 0, 255] },
    ],
  })]);
  t.after(() => dispose(group));
  const mesh = group.children[0];
  assert.equal(mesh.material.length, 3, "One base material and two distinct face colours");
  assert.deepEqual(mesh.geometry.groups, [
    { start: 0, count: 3, materialIndex: 0 },
    { start: 3, count: 6, materialIndex: 1 },
    { start: 9, count: 3, materialIndex: 0 },
    { start: 12, count: 3, materialIndex: 2 },
    { start: 15, count: 3, materialIndex: 0 },
  ]);
  assert.equal(mesh.geometry.groups.reduce((sum, group) => sum + group.count, 0), indices.length);
  assert.deepEqual(mesh.material[1].color.toArray(), [1, 0, 0]);
  assert.deepEqual(mesh.material[2].color.toArray(), [0, 0, 1]);
});

test("missing normals follow indexed winding instead of raw vertex order", (t) => {
  const group = createStepGroup([triangle({ index: { array: new Uint32Array([0, 2, 1]) } })]);
  t.after(() => dispose(group));
  const normals = group.children[0].geometry.getAttribute("normal");
  for (let vertex = 0; vertex < 3; vertex++) {
    close(normals.getX(vertex), 0);
    close(normals.getY(vertex), 0);
    close(normals.getZ(vertex), -1, "Reverse-wound triangle normal");
  }
});

test("provided CAD normals and typed buffers are retained", (t) => {
  const source = triangle();
  const normal = new Float32Array([0, 1, 0, 0, 1, 0, 0, 1, 0]);
  source.attributes.normal = { array: normal };
  const group = createStepGroup([source]);
  t.after(() => dispose(group));
  const geometry = group.children[0].geometry;
  assert.equal(geometry.getAttribute("position").array, source.attributes.position.array);
  assert.equal(geometry.getAttribute("normal").array, normal);
  assert.equal(geometry.index.array, source.index.array);
});
