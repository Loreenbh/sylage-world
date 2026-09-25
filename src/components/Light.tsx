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

  const overlays = overlaysRef.current;

  /*
   * Lumière douce.
   * Beaucoup moins blanche / flash.
   */
  const flashOpacity = 0.16;

  /*
   * Chaque objet s'allume l'un après l'autre.
   */
  const delayBetweenObjects = 900;

  /*
   * Progression de la lumière sur chaque objet.
   */
  const fadeInDuration = 1000;
  const holdDuration = 500;
  const fadeOutDuration = 1800;

  const objectDuration =
    fadeInDuration +
    holdDuration +
    fadeOutDuration;

  const totalDuration =
    (overlays.length - 1) *
      delayBetweenObjects +
    objectDuration;

  const startTime = performance.now();

  let animationFrame: number;

  const smoothstep = (value: number) => {
    const x = Math.max(
      0,
      Math.min(1, value)
    );

    return x * x * (3 - 2 * x);
  };

  const animate = (currentTime: number) => {
    const elapsed =
      currentTime - startTime;

    overlays.forEach(
      (overlay, index) => {
        const material =
          overlay.material as THREE.MeshBasicMaterial;

        /*
         * Chaque objet commence
         * après le précédent.
         */
        const objectElapsed =
          elapsed -
          index * delayBetweenObjects;

        let opacity = 0;

        /*
         * FADE-IN
         */
        if (
          objectElapsed >= 0 &&
          objectElapsed < fadeInDuration
        ) {
          const progress =
            objectElapsed /
            fadeInDuration;

          opacity =
            smoothstep(progress) *
            flashOpacity;
        }

        /*
         * MAINTIEN
         */
        else if (
          objectElapsed >= fadeInDuration &&
          objectElapsed <
            fadeInDuration +
              holdDuration
        ) {
          opacity = flashOpacity;
        }

        /*
         * FADE-OUT
         */
        else if (
          objectElapsed >=
            fadeInDuration +
              holdDuration &&
          objectElapsed <
            objectDuration
        ) {
          const progress =
            (objectElapsed -
              fadeInDuration -
              holdDuration) /
            fadeOutDuration;

          opacity =
            (1 - smoothstep(progress)) *
            flashOpacity;
        }

        material.opacity = opacity;
      }
    );

    if (elapsed < totalDuration) {
      animationFrame =
        requestAnimationFrame(animate);
    } else {
      overlays.forEach((overlay) => {
        const material =
          overlay.material as THREE.MeshBasicMaterial;

        material.opacity = 0;
      });
    }
  };

  animationFrame =
    requestAnimationFrame(animate);

  return () => {
    cancelAnimationFrame(animationFrame);

    overlays.forEach((overlay) => {
      const material =
        overlay.material as THREE.MeshBasicMaterial;

      material.opacity = 0;
    });
  };
}, [
  enabled,
  sweepTrigger,
]);

  return (
    <>
<ambientLight
  intensity={0.52}
  color="#b8b0a8"
/>

{/* CHAUD — lumière naturelle de fenêtre */}
<directionalLight
  position={[5, 6, 2]}
  intensity={lightIntensity}
  color="#b28d77"
/>

{/* CHAUD — diffusion */}
<directionalLight
  position={[-2, 5, 1]}
  intensity={0.72}
  color="#c0aa97"
/>

{/* FROID — lumière du ciel */}
<directionalLight
  position={[3, 4, -4]}
  intensity={0.56}
  color="#9cafbd"
/>

{/* FROID — remplissage */}
<directionalLight
  position={[-4, 3, -3]}
  intensity={0.44}
  color="#909da6"
/>

{/* LUMIÈRE GÉNÉRALE */}
<directionalLight
  position={[0, 8, 5]}
  intensity={0.34}
  color="#c5b9ab"
/>
    </>
  );
}