"use client";

import { Canvas } from "@react-three/fiber";

import { useRef, useState, useCallback } from "react";

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

  const [selectedObject, setSelectedObject] = useState<SelectedObject>(null);

  const [cameraOnPortfolioView, setCameraOnPortfolioView] = useState(false);

  const [contactOpen, setContactOpen] = useState(false);

  const [interactiveObjects, setInteractiveObjects] = useState<
    DetectedInteractiveObject[]
  >([]);

  const [sweepTrigger, setSweepTrigger] = useState(0);

  const [initialLightingComplete, setInitialLightingComplete] = useState(false);

  const handleInteractiveObjectsChange = useCallback(
    (objects: DetectedInteractiveObject[]) => {
      setInteractiveObjects(objects);
    },
    [],
  );

  const handleBookClick = () => {
    if (cameraOnPortfolioView && selectedObject === "book") {
      window.location.href = "https://sylage-archive.vercel.app";

      return;
    }

    setSelectedObject("book");

    cameraRef.current?.goToPortfolioView();
  };

  const handleContactClick = () => {
    if (cameraOnPortfolioView && selectedObject === "contact") {
      setContactOpen(true);
      return;
    }

    setSelectedObject("contact");

    cameraRef.current?.goToPortfolioView();
  };

  const handleCardClick = () => {
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
  };

  return (
    <>
      {!introFinished && <Intro onFinish={() => setIntroFinished(true)} />}

      {contactOpen && <ContactPanel onClose={() => setContactOpen(false)} />}
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
