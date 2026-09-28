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

/*CAMERA — DESKTOP*/

const DESKTOP_HOME_POSITION = new THREE.Vector3(
  -0.05406547710299313,
  3.6554354764551578,
  -5.145386699794555,
);

const DESKTOP_HOME_TARGET = new THREE.Vector3(
  0.01224830998273932,
  8.955509944730269e-18,
  8.624737493758543,
);

const DESKTOP_PORTFOLIO_POSITION = new THREE.Vector3(
  -0.5800418172867785,
  4.03324453920146,
  0.537195536694822,
);

const DESKTOP_PORTFOLIO_TARGET = new THREE.Vector3(
  -0.7401992391440444,
  1.0408340855860848e-18,
  3.556997286653223,
);

/*CAMERA — IPHONE SE < 600px*/

const MOBILE_HOME_POSITION = new THREE.Vector3(
  2.972726627492723,
  4.937183697443969,
  -6.381642545152816,
);

const MOBILE_HOME_TARGET = new THREE.Vector3(
  -3.2848150102916587,
  9.020562075079397e-18,
  5.427265792871036,
);

const MOBILE_PORTFOLIO_POSITION = new THREE.Vector3(
  -0.7956124543004424,
  6.404423826101063,
  0.3285019177785715,
);

const MOBILE_PORTFOLIO_TARGET = new THREE.Vector3(
  -0.4031002642339939,
  3.4694469519536126e-18,
  4.118329144366796,
);

/*CAMERA — IPAD MINI 600px → 1024px*/

const TABLET_HOME_POSITION = new THREE.Vector3(
  1.240290957275033,
  4.4247941781237135,
  -5.459843442890259,
);

const TABLET_HOME_TARGET = new THREE.Vector3(
  -3.812053506833022,
  -1.8561541192951838e-17,
  7.105105353026106,
);

const TABLET_PORTFOLIO_POSITION = MOBILE_PORTFOLIO_POSITION.clone();

const TABLET_PORTFOLIO_TARGET = MOBILE_PORTFOLIO_TARGET.clone();

const ANIMATION_DURATION = 1000;

function getCameraSettings() {
  const width = window.innerWidth;

  if (width < 600) {
    return {
      homePosition: MOBILE_HOME_POSITION,
      homeTarget: MOBILE_HOME_TARGET,

      portfolioPosition: MOBILE_PORTFOLIO_POSITION,
      portfolioTarget: MOBILE_PORTFOLIO_TARGET,
    };
  }

  if (width <= 1024) {
    return {
      homePosition: TABLET_HOME_POSITION,
      homeTarget: TABLET_HOME_TARGET,

      portfolioPosition: TABLET_PORTFOLIO_POSITION,
      portfolioTarget: TABLET_PORTFOLIO_TARGET,
    };
  }

  return {
    homePosition: DESKTOP_HOME_POSITION,
    homeTarget: DESKTOP_HOME_TARGET,

    portfolioPosition: DESKTOP_PORTFOLIO_POSITION,
    portfolioTarget: DESKTOP_PORTFOLIO_TARGET,
  };
}

const CameraController = forwardRef<
  CameraControllerHandle,
  CameraControllerProps
>(function CameraController({ onPortfolioReached, onHomeReached }, ref) {
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

      const currentPosition = startPosition.clone().lerp(position, eased);

      const currentTarget = startTarget.clone().lerp(target, eased);
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
        const camera = getCameraSettings();

        animateTo(
          camera.portfolioPosition,
          camera.portfolioTarget,
          onPortfolioReached,
        );
      },

      goHome: () => {
        const camera = getCameraSettings();

        animateTo(camera.homePosition, camera.homeTarget, onHomeReached);
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

    const camera = getCameraSettings();
    console.log("SCREEN WIDTH:", window.innerWidth);
    console.log("CAMERA SETTINGS:", getCameraSettings());
    controls.setLookAt(
      camera.homePosition.x,
      camera.homePosition.y,
      camera.homePosition.z,

      camera.homeTarget.x,
      camera.homeTarget.y,
      camera.homeTarget.z,

      false,
    );
  }, []);

  /* TEMPORAIRE KEYBOARD CAMERA CONTROLSA SUPP + TARD POUR MOUVEMENT CAMERA FIXE*/

  /*TEMPORAIRE DEBUG COORDONNEES CAMERAA SUPP + TARD APRES CADRAGE CAMERA*/

  return <CameraControls ref={controlsRef} enabled={false} />;
});

CameraController.displayName = "CameraController";

export default CameraController;
