"use client";

import { useEffect, useState } from "react";

interface LightingProps {
  enabled: boolean;
}

export default function Lighting({
  enabled,
}: LightingProps) {
  const [lightIntensity, setLightIntensity] = useState(0);

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
        progress * progress * (3 - 2 * progress);

      setLightIntensity(eased * 2.85);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [enabled]);

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