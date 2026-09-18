"use client";

import { useGLTF } from "@react-three/drei";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import * as THREE from "three";

import {
  belongsToObject,
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
}

type InteractiveObject =
  | "book"
  | "card"
  | "contact"
  | null;

export default function Model({
  onBookClick,
  onCardClick,
  onContactClick,
}: ModelProps) {
  const { scene } = useGLTF(
    "/models/env.glb"
  );

  const [
    hoveredObject,
    setHoveredObject,
  ] = useState<InteractiveObject>(null);

  const hoveredRef =
    useRef<InteractiveObject>(null);

  /*
   * =========================
   * OBJETS
   * =========================
   */

  const book = useMemo(
    () =>
      scene.getObjectByName(
        BOOK_NAME
      ),
    [scene]
  );

  const card = useMemo(
    () =>
      scene.getObjectByName(
        CARD_NAME
      ),
    [scene]
  );

  const contact = useMemo(
    () =>
      scene.getObjectByName(
        CONTACT_NAME
      ),
    [scene]
  );

  /*
   * =========================
   * MESHES
   * =========================
   */

  const bookMeshes = useMemo(
    () => getObjectMeshes(book),
    [book]
  );

  const cardMeshes = useMemo(
    () => getObjectMeshes(card),
    [card]
  );

  const contactMeshes = useMemo(
    () => getObjectMeshes(contact),
    [contact]
  );

  /*
   * =========================
   * COULEURS ORIGINALES
   * =========================
   */

  const originalColors =
    useRef(
      new Map<
        THREE.Material,
        THREE.Color
      >()
    );

  useEffect(() => {
    [
      ...bookMeshes,
      ...cardMeshes,
      ...contactMeshes,
    ].forEach((mesh) => {
      const materials =
        Array.isArray(mesh.material)
          ? mesh.material
          : [mesh.material];

      materials.forEach((material) => {
        const mat =
          material as THREE.MeshStandardMaterial;

        if (!mat.color) return;

        if (
          !originalColors.current.has(
            mat
          )
        ) {
          originalColors.current.set(
            mat,
            mat.color.clone()
          );
        }
      });
    });
  }, [
    bookMeshes,
    cardMeshes,
    contactMeshes,
  ]);

  /*
   * =========================
   * HOVER
   * =========================
   */

  useEffect(() => {
    setObjectHighlight(
      bookMeshes,
      hoveredObject === "book",
      "#ff0000",
      originalColors.current
    );

    setObjectHighlight(
      cardMeshes,
      hoveredObject === "card",
      "#ff0000",
      originalColors.current
    );

    setObjectHighlight(
      contactMeshes,
      hoveredObject === "contact",
      "#ff0000",
      originalColors.current
    );

    document.body.style.cursor =
      hoveredObject
        ? "pointer"
        : "default";

    return () => {
      document.body.style.cursor =
        "default";
    };
  }, [
    hoveredObject,
    bookMeshes,
    cardMeshes,
    contactMeshes,
  ]);

  /*
   * =========================
   * SURVOL
   * =========================
   */

  const handlePointerMove = (
    e: any
  ) => {
    const object = e.object;

    /*
     * BOOK
     */
    if (
      belongsToObject(
        object,
        BOOK_NAME
      )
    ) {
      if (
        hoveredRef.current !== "book"
      ) {
        hoveredRef.current =
          "book";

        setHoveredObject("book");
      }

      e.stopPropagation();
      return;
    }

    /*
     * CARD
     */
    if (
      belongsToObject(
        object,
        CARD_NAME
      )
    ) {
      if (
        hoveredRef.current !== "card"
      ) {
        hoveredRef.current =
          "card";

        setHoveredObject("card");
      }

      e.stopPropagation();
      return;
    }

    /*
     * CONTACT / ENVELOPPE
     */
    if (
      belongsToObject(
        object,
        CONTACT_NAME
      )
    ) {
      if (
        hoveredRef.current !== "contact"
      ) {
        hoveredRef.current =
          "contact";

        setHoveredObject("contact");
      }

      e.stopPropagation();
      return;
    }

    /*
     * Aucun objet interactif
     */
    if (
      hoveredRef.current !== null
    ) {
      hoveredRef.current = null;
      setHoveredObject(null);
    }
  };

  /*
   * =========================
   * SORTIE DU SURVOL
   * =========================
   */

  const handlePointerOut = (
    e: any
  ) => {
    e.stopPropagation();

    hoveredRef.current = null;
    setHoveredObject(null);
  };

  /*
   * =========================
   * CLIC
   * =========================
   */

  const handleClick = (
    e: any
  ) => {
    const object = e.object;

    /*
     * BOOK
     */
    if (
      belongsToObject(
        object,
        BOOK_NAME
      )
    ) {
      e.stopPropagation();

      onBookClick?.();

      return;
    }

    /*
     * CARD
     */
    if (
      belongsToObject(
        object,
        CARD_NAME
      )
    ) {
      e.stopPropagation();

      onCardClick?.();

      return;
    }

    /*
     * CONTACT
     */
    if (
      belongsToObject(
        object,
        CONTACT_NAME
      )
    ) {
      e.stopPropagation();

      onContactClick?.();

      return;
    }
  };

  /*
   * =========================
   * SCÈNE
   * =========================
   */

  return (
    <primitive
      object={scene}
      rotation={[0, Math.PI, 0]}
      onPointerMove={
        handlePointerMove
      }
      onPointerOut={
        handlePointerOut
      }
      onClick={handleClick}
    />
  );
}

useGLTF.preload(
  "/models/env.glb"
);