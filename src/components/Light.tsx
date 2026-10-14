
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
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
  const { scene } = useThree();

  // Cible de la lumière principale
  const spotlightTarget = useMemo(() => new THREE.Object3D(), []);

  // Cibles des lumières latérales
  const leftTarget = useMemo(() => new THREE.Object3D(), []);
  const rightTarget = useMemo(() => new THREE.Object3D(), []);

  const leftLight = useRef<THREE.SpotLight>(null);
  const rightLight = useRef<THREE.SpotLight>(null);

  const leftPosition = useMemo(() => new THREE.Vector3(), []);
  const rightPosition = useMemo(() => new THREE.Vector3(), []);

  // Suivi des repères placés dans Blender
  useFrame(() => {
    const leftMarker = scene.getObjectByName("LightLeft");
    const rightMarker = scene.getObjectByName("LightRight");

    if (leftMarker && leftLight.current) {
      leftMarker.getWorldPosition(leftPosition);

      leftLight.current.position.copy(leftPosition);

      leftTarget.position.set(
        leftPosition.x,
        leftPosition.y - 2.5,
        leftPosition.z,
      );
    }

    if (rightMarker && rightLight.current) {
      rightMarker.getWorldPosition(rightPosition);

      rightLight.current.position.copy(rightPosition);

      rightTarget.position.set(
        rightPosition.x,
        rightPosition.y - 2.5,
        rightPosition.z,
      );
    }
  });

  useEffect(() => {
    if (!enabled) return;

    let startTime: number | null = null;
    let animationFrame = 0;

    const duration = 4000;

    const animate = (currentTime: number) => {
      if (startTime === null) {
        startTime = currentTime;
      }

      const progress = Math.min(
        (currentTime - startTime) / duration,
        1,
      );

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

    if (interactiveObjects.length === 0) return;

    const sourceMeshes: THREE.Mesh[] = [];

    interactiveObjects.forEach(({ object }) => {
      sourceMeshes.push(...getObjectMeshes(object));
    });

    sourceMeshes.forEach((sourceMesh) => {
      const material = new THREE.MeshBasicMaterial({
        // Beige chaud plutôt que blanc froid
        color: "#d5cabe",
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

      const overlay = new THREE.Mesh(
        sourceMesh.geometry,
        material,
      );

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
    if (
      !enabled ||
      sweepTrigger === 0 ||
      overlaysRef.current.length === 0
    ) {
      return;
    }

    const overlays = overlaysRef.current;

    const flashOpacity = 0.24;

    const delayBetweenObjects = 900;
    const fadeInDuration = 1000;
    const holdDuration = 500;
    const fadeOutDuration = 1800;

    const objectDuration =
      fadeInDuration + holdDuration + fadeOutDuration;

    const totalDuration =
      (overlays.length - 1) * delayBetweenObjects +
      objectDuration;

    const startTime = performance.now();
    let animationFrame = 0;

    const smoothstep = (value: number) => {
      const x = Math.max(0, Math.min(1, value));
      return x * x * (3 - 2 * x);
    };

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;

      overlays.forEach((overlay, index) => {
        const material =
          overlay.material as THREE.MeshBasicMaterial;

        const objectElapsed =
          elapsed - index * delayBetweenObjects;

        let opacity = 0;

        if (
          objectElapsed >= 0 &&
          objectElapsed < fadeInDuration
        ) {
          opacity =
            smoothstep(objectElapsed / fadeInDuration) *
            flashOpacity;
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
            (objectElapsed -
              fadeInDuration -
              holdDuration) /
            fadeOutDuration;

          opacity =
            (1 - smoothstep(progress)) * flashOpacity;
        }

        material.opacity = opacity;
      });

      if (elapsed < totalDuration) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        overlays.forEach((overlay) => {
          (
            overlay.material as THREE.MeshBasicMaterial
          ).opacity = 0;
        });
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrame);

      overlays.forEach((overlay) => {
        (
          overlay.material as THREE.MeshBasicMaterial
        ).opacity = 0;
      });
    };
  }, [enabled, sweepTrigger]);

  return (
    <>
      <ambientLight
        intensity={0.2}
        color="#d1c7bc"
      />

      <primitive
        object={spotlightTarget}
        position={[0, 0, 0]}
      />

      <spotLight
        target={spotlightTarget}
        position={[-2, 9, 0.7]}
        color="#f2e6d6"
        intensity={lightIntensity * 42}
        angle={0.38}
        penumbra={0.45}
        distance={15}
        decay={2}
      />

      <primitive object={leftTarget} />
      <primitive object={rightTarget} />

      <spotLight
        ref={leftLight}
        target={leftTarget}
        color="#e4d0b8"
        intensity={lightIntensity * 2.8}
        angle={0.65}
        penumbra={0.8}
        distance={10}
        decay={1.2}
      />

      <spotLight
        ref={rightLight}
        target={rightTarget}
        color="#e4d0b8"
        intensity={lightIntensity * 2.8}
        angle={0.65}
        penumbra={0.8}
        distance={10}
        decay={1.2}
      />
    </>
  );
}
