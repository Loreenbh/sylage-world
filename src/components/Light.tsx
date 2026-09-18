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

      setLightIntensity(eased * 4);

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

      <ambientLight intensity={0.15} />

      {/* Lumière d'ambiance */}

      <hemisphereLight intensity={0.2} />

      {/* Lumière principale */}

      <directionalLight
        position={[0, 10, 3]}
        intensity={lightIntensity}
      />

      {/* Lumière de remplissage */}

      <directionalLight
        position={[-4, 5, -2]}
        intensity={0.5}
      />
    </>
  );
}