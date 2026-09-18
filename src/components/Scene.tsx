"use client";

import { Canvas } from "@react-three/fiber";

import {
  useRef,
  useState,
} from "react";

import Intro from "./Intro";
import Lighting from "./Light";
import Model from "./Model";
import ContactPanel from "./ContactPanel";

import CameraController, {
  CameraControllerHandle,
} from "./Camera";

type SelectedObject =
  | "book"
  | "card"
  | "contact"
  | null;

export default function Scene() {
  const cameraRef =
    useRef<CameraControllerHandle>(
      null
    );

  const [
    introFinished,
    setIntroFinished,
  ] = useState(false);

  /*
   * Objet sélectionné au premier clic.
   */
  const [
    selectedObject,
    setSelectedObject,
  ] = useState<SelectedObject>(null);

  /*
   * Est-ce qu'on est sur la caméra
   * rapprochée ?
   */
  const [
    cameraOnPortfolioView,
    setCameraOnPortfolioView,
  ] = useState(false);


    const [
    contactOpen,
    setContactOpen,
  ] = useState(false);

  /*
   * BOOK
   */
  const handleBookClick = () => {
    /*
     * Si on est déjà sur la vue rapprochée
     * ET que Book était l'objet sélectionné,
     * c'est le deuxième clic.
     */
    if (
      cameraOnPortfolioView &&
      selectedObject === "book"
    ) {
      window.location.href =
        "https://sylage-trendbook.vercel.app";

      return;
    }

    /*
     * Premier clic.
     *
     * On mémorise Book puis on va
     * vers la caméra commune.
     */
    setSelectedObject("book");

    cameraRef.current?.goToPortfolioView();
  };

  /*
   * CONTACT
   */
    const handleContactClick = () => {
      if (
        cameraOnPortfolioView &&
        selectedObject === "contact"
      ) {
        setContactOpen(true);
        return;
      }

      setSelectedObject("contact");

      cameraRef.current?.goToPortfolioView();
    };

  /*
   * CARD
   */
  const handleCardClick = () => {
    /*
     * Deuxième clic sur Card :
     * retour à la vue principale.
     */
    if (
      cameraOnPortfolioView &&
      selectedObject === "card"
    ) {
      cameraRef.current?.goHome();

      return;
    }

    /*
     * Premier clic :
     * exactement la même caméra que
     * Book et Contact.
     */
    setSelectedObject("card");

    cameraRef.current?.goToPortfolioView();
  };

  /*
   * La caméra vient d'arriver
   * sur la vue rapprochée.
   */
  const handlePortfolioReached = () => {
    setCameraOnPortfolioView(true);
  };

  /*
   * Retour à la vue principale.
   */
  const handleHomeReached = () => {
    setCameraOnPortfolioView(false);
    setSelectedObject(null);
  };

  return (
    <>
      {!introFinished && (
        <Intro
          onFinish={() =>
            setIntroFinished(true)
          }
        />
      )}

      {contactOpen && (
        <ContactPanel
          onClose={() =>
            setContactOpen(false)
          }
        />
      )}
      <Canvas
        camera={{
          position: [
            -0.19462416,
            4.62333714,
            -2.65721020,
          ],
          fov: 45,
        }}
      >
        <CameraController
          ref={cameraRef}
          onPortfolioReached={
            handlePortfolioReached
          }
          onHomeReached={
            handleHomeReached
          }
        />

        <Lighting
          enabled={introFinished}
        />

        <Model
          onBookClick={handleBookClick}
          onCardClick={handleCardClick}
          onContactClick={handleContactClick}
        />
      </Canvas>
    </>
  );
}