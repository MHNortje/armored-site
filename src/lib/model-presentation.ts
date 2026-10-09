import * as THREE from "three";
import type { OcctMesh } from "./step-loader";

export type ModelPresentation = { scale: number; offset: [number, number, number]; radius: number; floor: number };

/** Fit millimetre CAD and metre GLBs into the same stable, centred orbit space. */
export function modelPresentation(object: THREE.Object3D): ModelPresentation {
  const box = new THREE.Box3().setFromObject(object);
  const size = box.getSize(new THREE.Vector3());
  const longest = Math.max(size.x, size.y, size.z);
  if (box.isEmpty() || !Number.isFinite(longest) || longest <= 0) throw new Error("This model has no visible geometry.");
  const center = box.getCenter(new THREE.Vector3());
  const scale = 4 / longest;
  return { scale, offset: [-center.x, -center.y, -center.z], radius: size.length() * scale / 2, floor: -size.y * scale / 2 - 0.04 };
}

function steelMaterial(values?: number[] | null) {
  const rgb = values && values.length >= 3 ? values : [0.56, 0.59, 0.63];
  const divisor = rgb.some((value) => value > 1) ? 255 : 1;
  return new THREE.MeshStandardMaterial({ color: new THREE.Color(rgb[0] / divisor, rgb[1] / divisor, rgb[2] / divisor), metalness: 0.55, roughness: 0.38 });
}

export function createStepGroup(meshes: OcctMesh[]) {
  const group = new THREE.Group();
  for (const [index, mesh] of meshes.entries()) {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(mesh.attributes.position.array, 3));
    geometry.setIndex(new THREE.BufferAttribute(mesh.index.array, 1));
    if (mesh.attributes.normal?.array.length) geometry.setAttribute("normal", new THREE.BufferAttribute(mesh.attributes.normal.array, 3));
    else geometry.computeVertexNormals();
    const materials = [steelMaterial(mesh.color)];
    const materialIndices = new Map<string, number>();
    if (mesh.brep_faces?.some((face) => face.color)) {
      let next = 0;
      for (const face of mesh.brep_faces) {
        const start = face.first * 3;
        const count = (face.last - face.first + 1) * 3;
        if (start > next) geometry.addGroup(next, start - next, 0);
        let materialIndex = 0;
        if (face.color) {
          const key = face.color.join(",");
          materialIndex = materialIndices.get(key) ?? materials.length;
          if (!materialIndices.has(key)) { materialIndices.set(key, materialIndex); materials.push(steelMaterial(face.color)); }
        }
        const previous = geometry.groups.at(-1);
        if (previous && previous.materialIndex === materialIndex && previous.start + previous.count === start) previous.count += count;
        else geometry.addGroup(start, count, materialIndex);
        next = start + count;
      }
      if (next < mesh.index.array.length) geometry.addGroup(next, mesh.index.array.length - next, 0);
    }
    geometry.computeBoundingSphere();
    // A material array without groups renders nothing in Three.js.
    const object = new THREE.Mesh(geometry, materials.length === 1 ? materials[0] : materials);
    object.name = mesh.name || `STEP part ${index + 1}`;
    group.add(object);
  }
  return group;
}
