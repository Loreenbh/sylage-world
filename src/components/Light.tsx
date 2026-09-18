"use client";

import { useEffect, useState } from "react";

interface LightingProps {
  enabled: boolean;
}

export default function Lighting({
  enabled,
}: LightingProps) {
  const [lightIntensity, setLightIntensity] =
    useState(0);

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

      setLightIntensity(eased * 2.5);

      if (progress < 1) {
        animationFrame =
          requestAnimationFrame(animate);
      }
    };

    animationFrame =
      requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [enabled]);

  return (
    <>
      {/* Lumière générale */}
      <ambientLight
        intensity={0.12}
        color="#f5eee5"
      />

      {/* Ambiance chaude très légère */}
      <hemisphereLight
        intensity={0.18}
        color="#fff1dc"
        groundColor="#3a2922"
      />

      {/* Lumière principale — coucher de soleil */}
      <directionalLight
        position={[6, 5, -2]}
        intensity={lightIntensity}
        color="#e8a878"
      />

      {/* Lumière secondaire — rose / mauve */}
      <directionalLight
        position={[-5, 6, 1]}
        intensity={0.45}
        color="#c9a7b8"
      />

      {/* Lumière neutre — équilibre les tons */}
      <directionalLight
        position={[0, 8, 5]}
        intensity={0.35}
        color="#e8e1d8"
      />

      {/* Petit remplissage froid */}
      <directionalLight
        position={[-3, 3, -4]}
        intensity={0.18}
        color="#aeb8c5"
      />
    </>
  );
}