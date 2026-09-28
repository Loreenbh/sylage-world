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
        color: "#e5d1b8d6",

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

    const flashOpacity = 0.35;

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
      <ambientLight intensity={0.28} color="#b3ada8" />

      <directionalLight
        position={[-3.8, 3.4, 3.8]}
        intensity={lightIntensity * 0.72}
        color="#cbb1ad"
      />

      <directionalLight
        position={[3.8, 3.4, 3.8]}
        intensity={lightIntensity * 0.58}
        color="#c9ad9d"
      />

      <directionalLight position={[3, 4, -4]} intensity={0.3} color="#a1adb5" />

      <directionalLight
        position={[-4, 3, -3]}
        intensity={0.16}
        color="#9ba5ad"
      />

      <directionalLight position={[0, 8, 5]} intensity={0.04} color="#c5b9ab" />
    </>
  );
}
