"use client";

import { Canvas } from "@react-three/fiber";
import { useRef, useState, useCallback, useEffect } from "react";

import Intro from "./Intro";
import Lighting from "./Light";
import Model from "./Model";
import ContactPanel from "./ContactPanel";
import { DetectedInteractiveObject } from "./interactive/InteractiveObject";
import CameraController, { CameraControllerHandle } from "./Camera";

type SelectedObject = "book" | "card" | "contact" | null;

export default function Scene() {
  const cameraRef = useRef<CameraControllerHandle>(null);

  const [introFinished, setIntroFinished] = useState(false);
  const [orientationReady, setOrientationReady] = useState(false);

  const [orientationDevice, setOrientationDevice] = useState<
    "PHONE" | "IPAD" | null
  >(null);

  const [selectedObject, setSelectedObject] =
    useState<SelectedObject>(null);

  const [cameraOnPortfolioView, setCameraOnPortfolioView] =
    useState(false);

  const [contactOpen, setContactOpen] = useState(false);

  const [interactiveObjects, setInteractiveObjects] = useState<
    DetectedInteractiveObject[]
  >([]);

  const [sweepTrigger, setSweepTrigger] = useState(0);
  const [initialLightingComplete, setInitialLightingComplete] =
    useState(false);

  // Indication d'exploration
  const [showInstruction, setShowInstruction] = useState(true);

  useEffect(() => {
    const updateOrientation = () => {
      const isPhone = window.innerWidth < 600;

      const isIPad =
        /iPad/.test(navigator.userAgent) ||
        (navigator.platform === "MacIntel" &&
          navigator.maxTouchPoints > 1);

      const isPortrait = window.innerHeight > window.innerWidth;

      setOrientationDevice(
        isPortrait && isPhone
          ? "PHONE"
          : isPortrait && isIPad
            ? "IPAD"
            : null,
      );

      setOrientationReady(true);
    };

    window.addEventListener("resize", updateOrientation);
    window.addEventListener("orientationchange", updateOrientation);

    updateOrientation();

    return () => {
      window.removeEventListener("resize", updateOrientation);
      window.removeEventListener("orientationchange", updateOrientation);
    };
  }, []);

  const handleInteractiveObjectsChange = useCallback(
    (objects: DetectedInteractiveObject[]) => {
      setInteractiveObjects(objects);
    },
    [],
  );

  const handleBookClick = () => {
    setShowInstruction(false);

    if (cameraOnPortfolioView && selectedObject === "book") {
      window.location.href = "https://sylage-archive.vercel.app";
      return;
    }

    setSelectedObject("book");
    cameraRef.current?.goToPortfolioView();
  };

  const handleContactClick = () => {
    setShowInstruction(false);

    if (cameraOnPortfolioView && selectedObject === "contact") {
      setContactOpen(true);
      return;
    }

    setSelectedObject("contact");
    cameraRef.current?.goToPortfolioView();
  };

  const handleCardClick = () => {
    setShowInstruction(false);

    if (cameraOnPortfolioView && selectedObject === "card") {
      cameraRef.current?.goHome();
      return;
    }

    setSelectedObject("card");
    cameraRef.current?.goToPortfolioView();
  };

  const handlePortfolioReached = () => {
    setCameraOnPortfolioView(true);

    if (initialLightingComplete) {
      setSweepTrigger((trigger) => trigger + 1);
    }
  };

  const handleInitialLightingComplete = useCallback(() => {
    setInitialLightingComplete(true);
    setSweepTrigger((trigger) => (trigger === 0 ? 1 : trigger));
  }, []);

  const handleHomeReached = () => {
    setCameraOnPortfolioView(false);
    setSelectedObject(null);
    setShowInstruction(true);
  };

  return (
    <>
      {orientationReady && !orientationDevice && !introFinished && (
        <Intro onFinish={() => setIntroFinished(true)} />
      )}

      {orientationDevice && (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 10000,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
            background: "#211C19",
            color: "#EAE3D8",
            fontFamily: "Arial, Helvetica, sans-serif",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: "13px",
              fontWeight: 400,
              letterSpacing: "0.24em",
            }}
          >
            ROTATE YOUR {orientationDevice}
          </div>

          <div
            style={{
              fontSize: "11px",
              fontWeight: 300,
              letterSpacing: "0.2em",
            }}
          >
            FOR THE FULL EXPERIENCE
          </div>
        </div>
      )}

      {/* Indication inscirptions */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: "clamp(16px, 3.5vh, 36px)",
          zIndex: 10,
          display: "flex",
          justifyContent: "center",
          paddingInline: "16px",
          pointerEvents: "none",
          opacity:
            introFinished &&
            !orientationDevice &&
            !cameraOnPortfolioView &&
            showInstruction
              ? 1
              : 0,
          transition: "opacity 1200ms ease",
        }}
      >
        <div
          style={{
            color: "#EAE3D8",
            fontFamily: "Roboto, sans-serif",
            fontSize: "clamp(8px, 0.65vw, 10px)",
            fontWeight: 300,
            letterSpacing: "0.24em",
            lineHeight: 1.6,
            textAlign: "center",
            textTransform: "uppercase",
            opacity: 0.28,
            textShadow: "0 1px 8px rgba(0,0,0,0.12)",
            whiteSpace: "normal",
          }}
        >
          A WORLD TO DISCOVER
        </div>
      </div>

      {contactOpen && (
        <ContactPanel onClose={() => setContactOpen(false)} />
      )}

      <Canvas
        camera={{
          position: [-0.19462416, 4.62333714, -2.6572102],
          fov: 45,
        }}
      >
        <CameraController
          ref={cameraRef}
          onPortfolioReached={handlePortfolioReached}
          onHomeReached={handleHomeReached}
        />

        <Lighting
          enabled={introFinished}
          interactiveObjects={interactiveObjects}
          sweepTrigger={sweepTrigger}
          onInitialLightingComplete={handleInitialLightingComplete}
        />

        <Model
          onBookClick={handleBookClick}
          onCardClick={handleCardClick}
          onContactClick={handleContactClick}
          onInteractiveObjectsChange={handleInteractiveObjectsChange}
        />
      </Canvas>
    </>
  );
}
