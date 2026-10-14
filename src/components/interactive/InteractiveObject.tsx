"use client";

import * as THREE from "three";

export interface DetectedInteractiveObject {
  name: string;
  object: THREE.Object3D;
}

export interface OriginalEmissive {
  color: THREE.Color;
  intensity: number;
}

export function setSurfaceHighlight(
  meshes: THREE.Mesh[],
  intensity: number,
  originalEmissive: Map<THREE.Material, OriginalEmissive>,
) {
  meshes.forEach((mesh) => {
    const materials = Array.isArray(mesh.material)
      ? mesh.material
      : [mesh.material];

    materials.forEach((material) => {
      const mat = material as THREE.MeshStandardMaterial;

      if (!("emissive" in mat)) return;

      if (!originalEmissive.has(mat)) {
        originalEmissive.set(mat, {
          color: mat.emissive.clone(),
          intensity: mat.emissiveIntensity,
        });
      }

      mat.emissive.set("#c7bfb5");
      mat.emissiveIntensity = intensity;
      mat.needsUpdate = true;
    });
  });
}

export function restoreSurfaceHighlight(
  originalEmissive: Map<THREE.Material, OriginalEmissive>,
) {
  originalEmissive.forEach((original, material) => {
    const mat = material as THREE.MeshStandardMaterial;

    if (!("emissive" in mat)) return;

    mat.emissive.copy(original.color);
    mat.emissiveIntensity = original.intensity;
    mat.needsUpdate = true;
  });
}

export function belongsToObject(
  object: THREE.Object3D | null | undefined,
  objectName: string,
): boolean {
  let current = object;

  while (current) {
    if (current.name === objectName) {
      return true;
    }

    current = current.parent;
  }

  return false;
}

export function getObjectMeshes(
  object: THREE.Object3D | null | undefined,
): THREE.Mesh[] {
  if (!object) return [];

  const meshes: THREE.Mesh[] = [];

  object.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      meshes.push(child);
    }
  });

  return meshes;
}

export function setObjectHighlight(
  meshes: THREE.Mesh[],
  hovered: boolean,
  hoverColor: string,
  originalColors: Map<THREE.Material, THREE.Color>,
) {
  meshes.forEach((mesh) => {
    const materials = Array.isArray(mesh.material)
      ? mesh.material
      : [mesh.material];

    materials.forEach((material) => {
      const mat = material as THREE.MeshStandardMaterial;

      if (!mat.color) return;

      let original = originalColors.get(mat);

      if (!original) {
        original = mat.color.clone();
        originalColors.set(mat, original);
      }

      mat.color.copy(original);

      if ("emissive" in mat) {
        mat.emissive.set(hovered ? hoverColor : "#000000");

        mat.emissiveIntensity = hovered ? 0.45 : 0;
      }

      mat.needsUpdate = true;
    });
  });
}
