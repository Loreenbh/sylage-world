"use client";

import { CameraControls } from "@react-three/drei";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";

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

/* =========================================================
   CAMERA — DESKTOP
   ========================================================= */

const DESKTOP_HOME_POSITION =
  new THREE.Vector3(
    -0.9773974442104253,
    3.464438796329396,
    -7.4873469882786114
  );

const DESKTOP_HOME_TARGET =
  new THREE.Vector3(
    -0.011249006092192836,
    0,
    8.768357527039273
  );

const DESKTOP_PORTFOLIO_POSITION =
  new THREE.Vector3(
    -0.011249006092192836,
    4.5403447543,
    0.254550184062472
  );

const DESKTOP_PORTFOLIO_TARGET =
  new THREE.Vector3(
    -0.8596972394223994,
    0,
    3.043874350362472
  );

/* =========================================================
   CAMERA — IPHONE SE
   < 600px
   ========================================================= */

const MOBILE_HOME_POSITION =
  new THREE.Vector3(
    -0.2595821243744352,
    5.4775850812395515,
    -10.256428589157547
  );

const MOBILE_HOME_TARGET =
  new THREE.Vector3(
    -0.4546230202047738,
    0,
    5.464313409681198
  );

const MOBILE_PORTFOLIO_POSITION =
  new THREE.Vector3(
    -0.46734027380768045,
    5.0662657714090695,
    3.3407667702979267
  );

const MOBILE_PORTFOLIO_TARGET =
  new THREE.Vector3(
    -0.5489043277240174,
    0,
    6.453186270096136
  );

/* =========================================================
   CAMERA — IPAD MINI
   600px → 1024px
   ========================================================= */

const TABLET_HOME_POSITION =
  new THREE.Vector3(
    -0.18067940994816498,
    5.4775850812395515,
    -8.55531884500341
  );

const TABLET_HOME_TARGET =
  new THREE.Vector3(
    -0.37572030577850357,
    0,
    7.165423153835335
  );

// Même cadrage que mobile pour Portfolio View
const TABLET_PORTFOLIO_POSITION =
  MOBILE_PORTFOLIO_POSITION.clone();

const TABLET_PORTFOLIO_TARGET =
  MOBILE_PORTFOLIO_TARGET.clone();

/* ========================================================= */

const ANIMATION_DURATION = 1000;

/* =========================================================
   RESPONSIVE CAMERA
   ========================================================= */

function getCameraSettings() {
  const width = window.innerWidth;

  // 📱 iPhone / petits mobiles
  if (width < 600) {
    return {
      homePosition: MOBILE_HOME_POSITION,
      homeTarget: MOBILE_HOME_TARGET,

      portfolioPosition:
        MOBILE_PORTFOLIO_POSITION,
      portfolioTarget:
        MOBILE_PORTFOLIO_TARGET,
    };
  }

  // 📱 Tablettes
  if (width <= 1024) {
    return {
      homePosition: TABLET_HOME_POSITION,
      homeTarget: TABLET_HOME_TARGET,

      portfolioPosition:
        TABLET_PORTFOLIO_POSITION,
      portfolioTarget:
        TABLET_PORTFOLIO_TARGET,
    };
  }

  // 🖥️ Desktop
  return {
    homePosition: DESKTOP_HOME_POSITION,
    homeTarget: DESKTOP_HOME_TARGET,

    portfolioPosition:
      DESKTOP_PORTFOLIO_POSITION,
    portfolioTarget:
      DESKTOP_PORTFOLIO_TARGET,
  };
}

/* ========================================================= */

const CameraController = forwardRef<
  CameraControllerHandle,
  CameraControllerProps
>(function CameraController(
  {
    onPortfolioReached,
    onHomeReached,
  },
  ref
) {
  const controlsRef =
    useRef<CameraControls>(null);

  const animationRef =
    useRef<number | null>(null);

  /* =======================================================
     ANIMATION
     ======================================================= */

  const animateTo = (
    position: THREE.Vector3,
    target: THREE.Vector3,
    onComplete?: () => void
  ) => {
    const controls =
      controlsRef.current;

    if (!controls) return;

    if (animationRef.current !== null) {
      cancelAnimationFrame(
        animationRef.current
      );
    }

    const startPosition =
      controls.camera.position.clone();

    const startTarget =
      controls.getTarget(
        new THREE.Vector3()
      );

    const startTime =
      performance.now();

    const animate = (
      currentTime: number
    ) => {
      const progress = Math.min(
        (currentTime - startTime) /
          ANIMATION_DURATION,
        1
      );

      const eased =
        progress *
        progress *
        (3 - 2 * progress);

      const currentPosition =
        startPosition
          .clone()
          .lerp(position, eased);

      const currentTarget =
        startTarget
          .clone()
          .lerp(target, eased);

      controls.setLookAt(
        currentPosition.x,
        currentPosition.y,
        currentPosition.z,

        currentTarget.x,
        currentTarget.y,
        currentTarget.z,

        false
      );

      if (progress < 1) {
        animationRef.current =
          requestAnimationFrame(
            animate
          );
      } else {
        animationRef.current = null;

        onComplete?.();
      }
    };

    animationRef.current =
      requestAnimationFrame(animate);
  };

  /* =======================================================
     PUBLIC CAMERA CONTROLLER
     ======================================================= */

  useImperativeHandle(
    ref,
    () => ({
      goToPortfolioView: () => {
        const camera =
          getCameraSettings();

        animateTo(
          camera.portfolioPosition,
          camera.portfolioTarget,
          onPortfolioReached
        );
      },

      goHome: () => {
        const camera =
          getCameraSettings();

        animateTo(
          camera.homePosition,
          camera.homeTarget,
          onHomeReached
        );
      },

      getCameraControls: () => {
        return controlsRef.current;
      },
    }),
    [
      onPortfolioReached,
      onHomeReached,
    ]
  );

  /* =======================================================
     INITIAL CAMERA
     ======================================================= */

  useEffect(() => {
    const controls =
      controlsRef.current;

    if (!controls) return;

    const camera =
      getCameraSettings();

    controls.setLookAt(
      camera.homePosition.x,
      camera.homePosition.y,
      camera.homePosition.z,

      camera.homeTarget.x,
      camera.homeTarget.y,
      camera.homeTarget.z,

      false
    );
  }, []);

  /* =======================================================
     TEMPORAIRE — KEYBOARD CAMERA CONTROLS
     À SUPPRIMER PLUS TARD SI TU NE VEUX PAS QUE
     LE VISITEUR PUISSE BOUGER LA CAMÉRA AU CLAVIER.
     ======================================================= */

  useEffect(() => {
    const handleKeyDown = (
      event: KeyboardEvent
    ) => {
      const controls =
        controlsRef.current;

      if (!controls) return;

      const speed = 0.1;

      switch (event.key) {
        case "ArrowUp":
          controls.forward(
            speed,
            true
          );
          break;

        case "ArrowDown":
          controls.forward(
            -speed,
            true
          );
          break;

        case "ArrowLeft":
          controls.truck(
            -speed,
            0,
            true
          );
          break;

        case "ArrowRight":
          controls.truck(
            speed,
            0,
            true
          );
          break;

        case "q":
        case "Q":
          controls.elevate(
            speed,
            true
          );
          break;

        case "e":
        case "E":
          controls.elevate(
            -speed,
            true
          );
          break;
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, []);

  /* =======================================================
     TEMPORAIRE — DEBUG COORDONNÉES CAMÉRA
     À SUPPRIMER UNE FOIS LES CADRAGES VALIDÉS.
     ======================================================= */

  useEffect(() => {
    const controls =
      controlsRef.current;

    if (!controls) return;

    let frameId:
      number | null = null;

    const lastPosition =
      new THREE.Vector3();

    const lastTarget =
      new THREE.Vector3();

    const checkCamera = () => {
      const position =
        controls.camera.position;

      const target =
        controls.getTarget(
          new THREE.Vector3()
        );

      const positionChanged =
        !position.equals(
          lastPosition
        );

      const targetChanged =
        !target.equals(
          lastTarget
        );

      if (
        positionChanged ||
        targetChanged
      ) {
        console.log(
          "📷 CAMERA POSITION:",
          {
            x: position.x,
            y: position.y,
            z: position.z,
          }
        );

        console.log(
          "🎯 CAMERA TARGET:",
          {
            x: target.x,
            y: target.y,
            z: target.z,
          }
        );

        lastPosition.copy(
          position
        );

        lastTarget.copy(
          target
        );
      }

      frameId =
        requestAnimationFrame(
          checkCamera
        );
    };

    frameId =
      requestAnimationFrame(
        checkCamera
      );

    return () => {
      if (
        frameId !== null
      ) {
        cancelAnimationFrame(
          frameId
        );
      }
    };
  }, []);

  /* ======================================================= */

  return (
    <CameraControls
      ref={controlsRef}
    />
  );
});

CameraController.displayName =
  "CameraController";

export default CameraController;