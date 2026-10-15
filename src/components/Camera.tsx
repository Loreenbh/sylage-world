"use client";

import { CameraControls } from "@react-three/drei";
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import * as THREE from "three";

export interface CameraControllerHandle {
  goToPortfolioView: () => void;
  goHome: () => void;
  getCameraControls: () => CameraControls | null;
}

interface CameraControllerProps {
  onPortfolioReached?: () => void;
  onHomeReached?: () => void;
}

const HOME_POSITION = new THREE.Vector3(
  -0.2459337614741019,
  3.2043425133609302,
  -3.4563462443225283,
);

const HOME_TARGET = new THREE.Vector3(
  -0.17908108068779804,
  8.944667923005415e-18,
  10.42567976497814,
);

const PORTFOLIO_POSITION = new THREE.Vector3(
  -0.5905395588553392,
  3.749275736317929,
  1.1196458790038426,
);

const PORTFOLIO_TARGET = new THREE.Vector3(
  -0.6178220856894656,
  1.2143064331837659e-18,
  2.459261511381073,
);

const ANIMATION_DURATION = 1000;

const CameraController = forwardRef<
  CameraControllerHandle,
  CameraControllerProps
>(function CameraController(
  { onPortfolioReached, onHomeReached },
  ref,
) {
  const controlsRef = useRef<CameraControls>(null);
  const animationRef = useRef<number | null>(null);

  const animateTo = (
    position: THREE.Vector3,
    target: THREE.Vector3,
    onComplete?: () => void,
  ) => {
    const controls = controlsRef.current;

    if (!controls) return;

    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
    }

    const startPosition = controls.camera.position.clone();
    const startTarget = controls.getTarget(new THREE.Vector3());
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const progress = Math.min(
        (currentTime - startTime) / ANIMATION_DURATION,
        1,
      );

      const eased = progress * progress * (3 - 2 * progress);

      const currentPosition = startPosition.clone().lerp(
        position,
        eased,
      );

      const currentTarget = startTarget.clone().lerp(
        target,
        eased,
      );

      controls.setLookAt(
        currentPosition.x,
        currentPosition.y,
        currentPosition.z,
        currentTarget.x,
        currentTarget.y,
        currentTarget.z,
        false,
      );

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        animationRef.current = null;
        onComplete?.();
      }
    };

    animationRef.current = requestAnimationFrame(animate);
  };

  useImperativeHandle(
    ref,
    () => ({
      goToPortfolioView: () => {
        animateTo(
          PORTFOLIO_POSITION,
          PORTFOLIO_TARGET,
          onPortfolioReached,
        );
      },

      goHome: () => {
        animateTo(
          HOME_POSITION,
          HOME_TARGET,
          onHomeReached,
        );
      },

      getCameraControls: () => {
        return controlsRef.current;
      },
    }),
    [onPortfolioReached, onHomeReached],
  );

  useEffect(() => {
    const controls = controlsRef.current;

    if (!controls) return;

    controls.setLookAt(
      HOME_POSITION.x,
      HOME_POSITION.y,
      HOME_POSITION.z,
      HOME_TARGET.x,
      HOME_TARGET.y,
      HOME_TARGET.z,
      false,
    );
  }, []);
    return <CameraControls ref={controlsRef} enabled={false} />;
});

CameraController.displayName = "CameraController";

export default CameraController;


  /* TEMPORAIRE KEYBOARD CAMERA CONTROLSA SUPP + TARD POUR MOUVEMENT CAMERA FIXE*/

  /*TEMPORAIRE DEBUG COORDONNEES CAMERAA SUPP + TARD APRES CADRAGE CAMERA*/