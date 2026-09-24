"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import * as THREE from "three";

import {
  DetectedInteractiveObject,
  getObjectMeshes,
} from "./interactive/InteractiveObject";

interface LightingProps {
  enabled: boolean;
  interactiveObjects: DetectedInteractiveObject[];
  sweepTrigger: number;
  onInitialLightingComplete?: () => void;
}

export default function Lighting({
  enabled,
  interactiveObjects,
  sweepTrigger,
  onInitialLightingComplete,
}: LightingProps) {
  const [lightIntensity, setLightIntensity] =
    useState(0);

  const overlaysRef = useRef<THREE.Mesh[]>([]);

  /*
   * ─────────────────────────────
   * LUMIÈRE PRINCIPALE DE LA SCÈNE
   * ─────────────────────────────
   */

  useEffect(() => {
    if (!enabled) return;

    let startTime: number | null = null;
    const duration = 4000;

    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (startTime === null) {
        startTime = currentTime;
      }

      const progress = Math.min(
        (currentTime - startTime) / duration,
        1
      );

      const eased =
        progress *
        progress *
        (3 - 2 * progress);

      setLightIntensity(eased * 2.85);

      if (progress < 1) {
        animationFrame =
          requestAnimationFrame(animate);
      } else {
        onInitialLightingComplete?.();
      }
    };

    animationFrame =
      requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [
    enabled,
    onInitialLightingComplete,
  ]);

  /*
   * ─────────────────────────────
   * CRÉATION DES OVERLAYS
   * ─────────────────────────────
   */

  useEffect(() => {
    /*
     * Nettoyage.
     */

    overlaysRef.current.forEach(
      (overlay) => {
        overlay.removeFromParent();

        if (
          overlay.material instanceof
          THREE.Material
        ) {
          overlay.material.dispose();
        }
      }
    );

    overlaysRef.current = [];

    if (interactiveObjects.length === 0) {
      return;
    }

    /*
     * On récupère d'abord TOUS les meshes.
     */

    const sourceMeshes: THREE.Mesh[] = [];

    interactiveObjects.forEach(
      ({ object }) => {
        sourceMeshes.push(
          ...getObjectMeshes(object)
        );
      }
    );

    /*
     * Une couche blanche par mesh.
     */

    sourceMeshes.forEach(
      (sourceMesh) => {
        const material =
          new THREE.MeshBasicMaterial({
            color: "#ffffff",

            /*
             * IMPORTANT :
             * l'opacité est contrôlée
             * uniquement par notre animation.
             */
            transparent: true,
            opacity: 0,

            depthTest: false,
            depthWrite: false,
            side: THREE.DoubleSide,

            polygonOffset: true,
            polygonOffsetFactor: -1,
            polygonOffsetUnits: -1,

            toneMapped: false,
          });

        const overlay =
          new THREE.Mesh(
            sourceMesh.geometry,
            material
          );

        overlay.position.set(0, 0, 0);
        overlay.rotation.set(0, 0, 0);
        overlay.scale.set(1, 1, 1);

        overlay.renderOrder = 1000;

        /*
         * L'overlay ne récupère pas
         * les clics / hover.
         */

        overlay.raycast = () => null;

        sourceMesh.add(overlay);

        overlaysRef.current.push(
          overlay
        );
      }
    );

    return () => {
      overlaysRef.current.forEach(
        (overlay) => {
          overlay.removeFromParent();

          if (
            overlay.material instanceof
            THREE.Material
          ) {
            overlay.material.dispose();
          }
        }
      );

      overlaysRef.current = [];
    };
  }, [interactiveObjects]);

    /*
   * ─────────────────────────────
   * ANIMATION
   * ─────────────────────────────
   *
   * FADE-IN PROGRESSIF
   * →
   * MAINTIEN
   * →
   * FADE-OUT PROGRESSIF
   */

  useEffect(() => {
    if (
      !enabled ||
      sweepTrigger === 0 ||
      overlaysRef.current.length === 0
    ) {
      return;
    }

    const overlays =
      overlaysRef.current;

    /*
     * ─────────────────────────
     * PARAMÈTRES
     * ─────────────────────────
     */

    const flashOpacity = 0.40;

    /*
     * Temps pour atteindre
     * progressivement la luminosité maximale.
     */

    const fadeInDuration = 1800;

    /*
     * Temps à luminosité maximale.
     */

    const holdDuration = 600;

    /*
     * Temps pour disparaître
     * progressivement.
     */

    const fadeOutDuration = 3000;

    const totalDuration =
      fadeInDuration +
      holdDuration +
      fadeOutDuration;

    /*
     * ─────────────────────────
     * DÉPART COMMUN
     * ─────────────────────────
     */

    const startTime =
      performance.now();

    let animationFrame: number;

    /*
     * Courbe douce.
     */

    const smoothstep = (
      value: number
    ) => {
      const x = Math.max(
        0,
        Math.min(1, value)
      );

      return (
        x *
        x *
        (3 - 2 * x)
      );
    };

    /*
     * ─────────────────────────
     * ANIMATION COMMUNE
     * ─────────────────────────
     */

    const animate = (
      currentTime: number
    ) => {
      const elapsed =
        currentTime - startTime;

      let opacity = 0;

      /*
       * FADE-IN
       *
       * 0 → 0.40
       */

      if (
        elapsed <
        fadeInDuration
      ) {
        const progress =
          elapsed /
          fadeInDuration;

        opacity =
          smoothstep(progress) *
          flashOpacity;
      }

      /*
       * HOLD
       *
       * 0.40
       */

      else if (
        elapsed <
        fadeInDuration +
          holdDuration
      ) {
        opacity =
          flashOpacity;
      }

      /*
       * FADE-OUT
       *
       * 0.40 → 0
       */

      else if (
        elapsed <
        totalDuration
      ) {
        const progress =
          (elapsed -
            fadeInDuration -
            holdDuration) /
          fadeOutDuration;

        opacity =
          (1 -
            smoothstep(progress)) *
          flashOpacity;
      }

      /*
       * EXACTEMENT LA MÊME OPACITÉ
       * POUR TOUS LES OBJETS.
       */

      overlays.forEach(
        (overlay) => {
          const material =
            overlay.material as THREE.MeshBasicMaterial;

          material.opacity =
            opacity;
        }
      );

      /*
       * FIN
       */

      if (
        elapsed <
        totalDuration
      ) {
        animationFrame =
          requestAnimationFrame(
            animate
          );
      } else {
        overlays.forEach(
          (overlay) => {
            const material =
              overlay.material as THREE.MeshBasicMaterial;

            material.opacity = 0;
          }
        );
      }
    };

    /*
     * Départ.
     */

    animationFrame =
      requestAnimationFrame(
        animate
      );

    return () => {
      cancelAnimationFrame(
        animationFrame
      );

      overlays.forEach(
        (overlay) => {
          const material =
            overlay.material as THREE.MeshBasicMaterial;

          material.opacity = 0;
        }
      );
    };
  }, [
    enabled,
    sweepTrigger,
  ]);

  return (
    <>
      <ambientLight
        intensity={0.16}
        color="#eee9e2"
      />

      <directionalLight
        position={[5, 6, 2]}
        intensity={lightIntensity}
        color="#ee9b6d"
      />

      <directionalLight
        position={[-2, 5, 1]}
        intensity={0.38}
        color="#c9a4b8"
      />

      <directionalLight
        position={[3, 4, -4]}
        intensity={0.45}
        color="#9aafc7"
      />

      <directionalLight
        position={[0, 8, 5]}
        intensity={0.26}
        color="#dedbd5"
      />
    </>
  );
}