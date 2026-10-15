"use client";

import { useGLTF } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState } from "react";

import * as THREE from "three";

import {
  belongsToObject,
  DetectedInteractiveObject,
  getObjectMeshes,
  setObjectHighlight,
} from "./interactive/InteractiveObject";

import { BOOK_NAME } from "./interactive/Book";
import { CARD_NAME } from "./interactive/Card";
import { CONTACT_NAME } from "./interactive/Contact";

interface ModelProps {
  onBookClick?: () => void;
  onCardClick?: () => void;
  onContactClick?: () => void;
  onGalleryClick?: () => void;
  onInteractiveObjectsChange?: (objects: DetectedInteractiveObject[]) => void;
}

type InteractiveObject = "book" | "card" | "contact" | "gallery" | null;

const isGalleryDoor = (object: THREE.Object3D) => {
  let current: THREE.Object3D | null = object;

  while (current) {
    const normalizedName = current.name.toLowerCase().replace(/[ _-]/g, "");
    if (normalizedName.includes("gallerydoor")) return true;
    current = current.parent;
  }

  return false;
};

export default function Model({
  onBookClick,
  onCardClick,
  onContactClick,
  onGalleryClick,
  onInteractiveObjectsChange,
}: ModelProps) {
  const { scene } = useGLTF("/models/env.glb");

  const [hoveredObject, setHoveredObject] = useState<InteractiveObject>(null);

  const hoveredRef = useRef<InteractiveObject>(null);

  const book = useMemo(() => scene.getObjectByName(BOOK_NAME), [scene]);

  const card = useMemo(() => scene.getObjectByName(CARD_NAME), [scene]);

  const contact = useMemo(() => scene.getObjectByName(CONTACT_NAME), [scene]);

  // GalleryDoor : matériau lumineux indépendant des projecteurs
  useEffect(() => {
    const originals = new Map<THREE.Mesh, THREE.Material | THREE.Material[]>();

    scene.traverse((object) => {
      if (!(object instanceof THREE.Mesh) || !isGalleryDoor(object)) {
        return;
      }

      originals.set(object, object.material);

      const makeEmissive = (material: THREE.Material) => {
        if (
          material instanceof THREE.MeshStandardMaterial ||
          material instanceof THREE.MeshPhysicalMaterial
        ) {
          const clone = material.clone();

          clone.emissive.set("#5c5850");
          clone.emissiveIntensity = 0.1;

          return clone;
        }

        return material;
      };

      object.material = Array.isArray(object.material)
        ? object.material.map(makeEmissive)
        : makeEmissive(object.material);
    });

    return () => {
      originals.forEach((original, mesh) => {
        const current = Array.isArray(mesh.material)
          ? mesh.material
          : [mesh.material];

        const previous = Array.isArray(original) ? original : [original];

        current.forEach((material) => {
          if (!previous.includes(material)) material.dispose();
        });

        mesh.material = original;
      });
    };
  }, [scene]);

  const interactiveObjects = useMemo(() => {
    const objects = new Map<string, THREE.Object3D>();

    const knownObjects: Array<[string, THREE.Object3D | undefined]> = [
      ["book", book],
      ["card", card],
      ["contact", contact],
    ];

    knownObjects.forEach(([name, object]) => {
      if (object) {
        objects.set(name, object);
      }
    });

    scene.traverse((object) => {
      if (object.userData.interactive === true && !objects.has(object.name)) {
        objects.set(object.name, object);
      }
    });

    return Array.from(objects, ([name, object]) => ({
      name,
      object,
    }));
  }, [book, card, contact, scene]);

  useEffect(() => {
    onInteractiveObjectsChange?.(interactiveObjects);
  }, [interactiveObjects, onInteractiveObjectsChange]);

  const bookMeshes = useMemo(() => getObjectMeshes(book), [book]);

  const cardMeshes = useMemo(() => getObjectMeshes(card), [card]);

  const contactMeshes = useMemo(() => getObjectMeshes(contact), [contact]);

  const originalColors = useRef(new Map<THREE.Material, THREE.Color>());

  useEffect(() => {
    [...bookMeshes, ...cardMeshes, ...contactMeshes].forEach((mesh) => {
      const materials = Array.isArray(mesh.material)
        ? mesh.material
        : [mesh.material];

      materials.forEach((material) => {
        const mat = material as THREE.MeshStandardMaterial;

        if (!mat.color) return;

        if (!originalColors.current.has(mat)) {
          originalColors.current.set(mat, mat.color.clone());
        }
      });
    });
  }, [bookMeshes, cardMeshes, contactMeshes]);

  useEffect(() => {
    setObjectHighlight(
      bookMeshes,
      hoveredObject === "book",
      "#817874",
      originalColors.current,
    );

    setObjectHighlight(
      cardMeshes,
      hoveredObject === "card",
      "#817874",
      originalColors.current,
    );

    setObjectHighlight(
      contactMeshes,
      hoveredObject === "contact",
      "#817874",
      originalColors.current,
    );

    document.body.style.cursor = hoveredObject ? "pointer" : "default";

    return () => {
      document.body.style.cursor = "default";
    };
  }, [hoveredObject, bookMeshes, cardMeshes, contactMeshes]);

  const handlePointerMove = (e: any) => {
    const object = e.object;

    if (isGalleryDoor(object)) {
      if (hoveredRef.current !== "gallery") {
        hoveredRef.current = "gallery";
        setHoveredObject("gallery");
      }
      e.stopPropagation();
      return;
    }

    if (belongsToObject(object, BOOK_NAME)) {
      if (hoveredRef.current !== "book") {
        hoveredRef.current = "book";

        setHoveredObject("book");
      }

      e.stopPropagation();
      return;
    }

    if (belongsToObject(object, CARD_NAME)) {
      if (hoveredRef.current !== "card") {
        hoveredRef.current = "card";

        setHoveredObject("card");
      }

      e.stopPropagation();
      return;
    }

    if (belongsToObject(object, CONTACT_NAME)) {
      if (hoveredRef.current !== "contact") {
        hoveredRef.current = "contact";

        setHoveredObject("contact");
      }

      e.stopPropagation();
      return;
    }

    if (hoveredRef.current !== null) {
      hoveredRef.current = null;
      setHoveredObject(null);
    }
  };

  const handlePointerOut = (e: any) => {
    e.stopPropagation();

    hoveredRef.current = null;
    setHoveredObject(null);
  };

  const handleClick = (e: any) => {
    const object = e.object;

    if (isGalleryDoor(object)) {
      e.stopPropagation();
      onGalleryClick?.();
      return;
    }

    if (belongsToObject(object, BOOK_NAME)) {
      e.stopPropagation();

      onBookClick?.();

      return;
    }

    if (belongsToObject(object, CARD_NAME)) {
      e.stopPropagation();

      onCardClick?.();

      return;
    }

    if (belongsToObject(object, CONTACT_NAME)) {
      e.stopPropagation();

      onContactClick?.();

      return;
    }
  };

  return (
    <primitive
      object={scene}
      rotation={[0, Math.PI, 0]}
      onPointerMove={handlePointerMove}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
    />
  );
}

useGLTF.preload("/models/env.glb");
