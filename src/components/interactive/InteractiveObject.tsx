"use client";

import * as THREE from "three";

export function belongsToObject(
  object: THREE.Object3D | null | undefined,
  objectName: string
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
  object: THREE.Object3D | null | undefined
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
  originalColors: Map<
    THREE.Material,
    THREE.Color
  >
) {
  meshes.forEach((mesh) => {
    const materials = Array.isArray(mesh.material)
      ? mesh.material
      : [mesh.material];

    materials.forEach((material) => {
      const mat =
        material as THREE.MeshStandardMaterial;

      if (!mat.color) return;

      let original =
        originalColors.get(mat);

      if (!original) {
        original = mat.color.clone();

        originalColors.set(
          mat,
          original
        );
      }

      if (hovered) {
        mat.color.set(hoverColor);
      } else {
        mat.color.copy(original);
      }

      mat.needsUpdate = true;
    });
  });
}