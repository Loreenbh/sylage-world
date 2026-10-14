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
  const [galleryOpen, setGalleryOpen] = useState(false);

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

  const handleGalleryClick = () => {
    setShowInstruction(false);
    setGalleryOpen(true);
  };

  const handleGalleryClose = () => {
    setGalleryOpen(false);
    setShowInstruction(true);
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

      {galleryOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="gallery-title"
          onClick={handleGalleryClose}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 10001,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
            background: "rgba(20, 17, 15, 0.78)",
            backdropFilter: "blur(5px)",
            color: "#EAE3D8",
            fontFamily: "Roboto, Arial, sans-serif",
            textAlign: "center",
          }}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            style={{
              position: "relative",
              width: "min(100%, 520px)",
              padding: "clamp(32px, 6vw, 64px) 24px",
              border: "1px solid rgba(234, 227, 216, 0.22)",
              background: "rgba(33, 28, 25, 0.94)",
            }}
          >
            <button
              type="button"
              aria-label="Close gallery message"
              onClick={() => setGalleryOpen(false)}
              style={{
                position: "absolute",
                top: "16px",
                right: "18px",
                border: 0,
                background: "transparent",
                color: "#EAE3D8",
                opacity: 0.65,
                fontSize: "22px",
                fontWeight: 300,
                cursor: "pointer",
              }}
            >
              ×
            </button>
            <div style={{
              fontSize: "10px",
              letterSpacing: "0.28em",
              opacity: 0.62,
              marginBottom: "24px",
            }}>
              SYLAGE · GALLERY
            </div>
            <h2
              id="gallery-title"
              style={{
                margin: "0 0 16px",
                fontFamily: "Bodoni Moda, Georgia, serif",
                fontSize: "clamp(25px, 4vw, 36px)",
                fontWeight: 400,
                lineHeight: 1.2,
              }}
            >
              A new space is taking shape.
            </h2>
            <p style={{
              margin: 0,
              fontSize: "12px",
              lineHeight: 1.8,
              letterSpacing: "0.06em",
              opacity: 0.7,
            }}>
              The gallery is currently under construction.
            </p>
            <div style={{
              marginTop: "32px",
              fontSize: "9px",
              letterSpacing: "0.28em",
              opacity: 0.55,
            }}>
              COMING SOON
            </div>
          </div>
        </div>
      )}

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
          onGalleryClick={handleGalleryClick}
          onInteractiveObjectsChange={handleInteractiveObjectsChange}
        />
      </Canvas>
    </>
  );
}
