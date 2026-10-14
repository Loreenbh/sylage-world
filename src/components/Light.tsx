"use client";

import { useEffect, useRef, useState } from "react";

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
  const [lightIntensity, setLightIntensity] = useState(0);

  const overlaysRef = useRef<THREE.Mesh[]>([]);
  const spotlightTarget = useRef(new THREE.Object3D());
  useEffect(() => {
    if (!enabled) return;

    let startTime: number | null = null;
    const duration = 4000;

    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (startTime === null) {
        startTime = currentTime;
      }

      const progress = Math.min((currentTime - startTime) / duration, 1);

      const eased = progress * progress * (3 - 2 * progress);

      setLightIntensity(eased * 2.1);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        onInitialLightingComplete?.();
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [enabled, onInitialLightingComplete]);

  useEffect(() => {
    overlaysRef.current.forEach((overlay) => {
      overlay.removeFromParent();

      if (overlay.material instanceof THREE.Material) {
        overlay.material.dispose();
      }
    });

    overlaysRef.current = [];

    if (interactiveObjects.length === 0) {
      return;
    }

    const sourceMeshes: THREE.Mesh[] = [];

    interactiveObjects.forEach(({ object }) => {
      sourceMeshes.push(...getObjectMeshes(object));
    });

    sourceMeshes.forEach((sourceMesh) => {
      const material = new THREE.MeshBasicMaterial({
        color: "#d8c3aa",

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

      const overlay = new THREE.Mesh(sourceMesh.geometry, material);

      overlay.position.set(0, 0, 0);
      overlay.rotation.set(0, 0, 0);
      overlay.scale.set(1, 1, 1);

      overlay.renderOrder = 1000;

      overlay.raycast = () => null;

      sourceMesh.add(overlay);

      overlaysRef.current.push(overlay);
    });

    return () => {
      overlaysRef.current.forEach((overlay) => {
        overlay.removeFromParent();

        if (overlay.material instanceof THREE.Material) {
          overlay.material.dispose();
        }
      });

      overlaysRef.current = [];
    };
  }, [interactiveObjects]);

  useEffect(() => {
    if (!enabled || sweepTrigger === 0 || overlaysRef.current.length === 0) {
      return;
    }

    const overlays = overlaysRef.current;

    const flashOpacity = 0.50;

    const delayBetweenObjects = 900;

    const fadeInDuration = 1000;
    const holdDuration = 500;
    const fadeOutDuration = 1800;

    const objectDuration = fadeInDuration + holdDuration + fadeOutDuration;

    const totalDuration =
      (overlays.length - 1) * delayBetweenObjects + objectDuration;

    const startTime = performance.now();

    let animationFrame: number;

    const smoothstep = (value: number) => {
      const x = Math.max(0, Math.min(1, value));

      return x * x * (3 - 2 * x);
    };

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;

      overlays.forEach((overlay, index) => {
        const material = overlay.material as THREE.MeshBasicMaterial;

        const objectElapsed = elapsed - index * delayBetweenObjects;

        let opacity = 0;

        if (objectElapsed >= 0 && objectElapsed < fadeInDuration) {
          const progress = objectElapsed / fadeInDuration;

          opacity = smoothstep(progress) * flashOpacity;
        } else if (
          objectElapsed >= fadeInDuration &&
          objectElapsed < fadeInDuration + holdDuration
        ) {
          opacity = flashOpacity;
        } else if (
          objectElapsed >= fadeInDuration + holdDuration &&
          objectElapsed < objectDuration
        ) {
          const progress =
            (objectElapsed - fadeInDuration - holdDuration) / fadeOutDuration;

          opacity = (1 - smoothstep(progress)) * flashOpacity;
        }

        material.opacity = opacity;
      });

      if (elapsed < totalDuration) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        overlays.forEach((overlay) => {
          const material = overlay.material as THREE.MeshBasicMaterial;

          material.opacity = 0;
        });
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrame);

      overlays.forEach((overlay) => {
        const material = overlay.material as THREE.MeshBasicMaterial;

        material.opacity = 0;
      });
    };
  }, [enabled, sweepTrigger]);

  return (
    <>
      {/* Lumière ambiante : la pièce reste lisible sans concurrencer le bureau */}
      <ambientLight intensity={0.24} color="#d1c7bc" />

      {/* Cible du projecteur : centre de la scène / bureau */}
      <primitive object={spotlightTarget.current} position={[0, 0, 0]} />

      {/* Projecteur reculé et faisceau plus large */}
      <spotLight
        target={spotlightTarget.current}
        position={[0, 6.2, -2.4]}
        color="#f2e6d6"
        intensity={lightIntensity * 16}
        angle={0.78}
        penumbra={0.82}
        distance={12}
        decay={2}
      />
    </>
  );
}
