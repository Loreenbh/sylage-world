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

/*CAMERA — DESKTOP*/

const DESKTOP_HOME_POSITION =
  new THREE.Vector3(
    -0.06369691066211441,
    3.6554354764551578,
    -7.145363508531997
  );

const DESKTOP_HOME_TARGET =
  new THREE.Vector3(
    0.0026168764236207858,
    8.955509944730269e-18,
    6.624760685021101
  );

const DESKTOP_PORTFOLIO_POSITION =
  new THREE.Vector3(
    -0.873557826820947,
    4.033244539201459,
    -1.481182116804923
  );

const DESKTOP_PORTFOLIO_TARGET =
  new THREE.Vector3(
    -1.0337152486782129,
    2.081668171172169e-18,
    1.5386196331534792
  );

/*CAMERA — IPHONE SE < 600px*/

const MOBILE_HOME_POSITION =
  new THREE.Vector3(
   1.9928777364680994,
    4.840980295306595,
    -8.269284448865504
  );

const MOBILE_HOME_TARGET =
  new THREE.Vector3(
    -2.5198916815317056,
    9.020562075079397e-18,
    4.347480124795208
  );

const MOBILE_PORTFOLIO_POSITION =
  new THREE.Vector3(
    -0.933836224981,
    6.348982140964651,
    -1.7615021217060458
  );

const MOBILE_PORTFOLIO_TARGET =
  new THREE.Vector3(
    -1.0360512971909748,
    2.0816681711721684e-18,
    2.138943830207164
  );

/*CAMERA — IPAD MINI 600px → 1024px*/

const TABLET_HOME_POSITION =
  new THREE.Vector3(
    -1.8020095703856305,
    4.280323700538324,
    -8.762769156758235
  );

const TABLET_HOME_TARGET =
  new THREE.Vector3(
    -2.7996252191758915,
    8.673617379884037e-18,
    4.789592939299398
  );

const TABLET_PORTFOLIO_POSITION =
  MOBILE_PORTFOLIO_POSITION.clone();

const TABLET_PORTFOLIO_TARGET =
  MOBILE_PORTFOLIO_TARGET.clone();


const ANIMATION_DURATION = 1000;

function getCameraSettings() {
  const width = window.innerWidth;

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

  return {
    homePosition: DESKTOP_HOME_POSITION,
    homeTarget: DESKTOP_HOME_TARGET,

    portfolioPosition:
      DESKTOP_PORTFOLIO_POSITION,
    portfolioTarget:
      DESKTOP_PORTFOLIO_TARGET,
  };
}

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
console.log("SCREEN WIDTH:", window.innerWidth);
console.log("CAMERA SETTINGS:", getCameraSettings());
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

  useEffect(() => {
    const controls =
      controlsRef.current;

    if (!controls) return;

    const camera =
      getCameraSettings();
console.log("SCREEN WIDTH:", window.innerWidth);
console.log("CAMERA SETTINGS:", getCameraSettings());
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

  /* 
     TEMPORAIRE KEYBOARD CAMERA CONTROLSA SUPP + TARD POUR MOUVEMENT CAMERA FIXE*/
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

  /*TEMPORAIRE DEBUG COORDONNEES CAMERAA SUPP + TARD APRES CADRAGE CAMERA*/

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
          "CAMERA POSITION:",
          {
            x: position.x,
            y: position.y,
            z: position.z,
          }
        );

        console.log(
          "CAMERA TARGET:",
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

  return (
    <CameraControls
      ref={controlsRef}
    />
  );
});

CameraController.displayName =
  "CameraController";

export default CameraController;