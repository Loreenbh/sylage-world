"use client";

import { useEffect, useState } from "react";

interface IntroProps {
  onFinish: () => void;
}

export default function Intro({ onFinish }: IntroProps) {
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setClosing(true);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!closing) return;

    const timer = setTimeout(() => {
      onFinish();
    }, 1400);

    return () => clearTimeout(timer);
  }, [closing, onFinish]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "#211C19",

        display: "flex",
        alignItems: "center",
        justifyContent: "center",

        pointerEvents: "none",

        opacity: closing ? 0 : 1,

        transition:
          "opacity 1.4s cubic-bezier(0.65, 0, 0.35, 1)",
      }}
    >
      <div
        style={{
          position: "relative",

          width: "min(90vw, 850px)",
          aspectRatio: "1 / 0.45",

          display: "flex",
          alignItems: "center",
          justifyContent: "center",

          transform: closing
            ? "translateY(-5px)"
            : "translateY(0)",

          transition:
            "transform 1.4s cubic-bezier(0.65, 0, 0.35, 1)",
        }}
      >
        <img
          src="/sylage-icon.svg"
          alt=""
          style={{
            position: "absolute",

            width: "clamp(220px, 65vw, 740px)",
            height: "clamp(220px, 65vw, 740px)",

            objectFit: "contain",

            opacity: 0.07,

            zIndex: 0,

            pointerEvents: "none",
          }}
        />

        <div
          style={{
            position: "relative",
            zIndex: 1,

            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
          }}
        >

          <img
            src="/sylage-wordmark.png"
            alt="SYLAGE"
            style={{
              width: "clamp(200px, 52vw, 550px)",
              height: "auto",

              objectFit: "contain",

              display: "block",
            }}
          />

          <div
            style={{
              marginTop: "10px",

              fontFamily: "Roboto, sans-serif",
              fontSize: "clamp(11px, 1.5vw, 18px)",
              fontWeight: 300,

              letterSpacing: "0.48em",

              color: "#EAE3D8",

              paddingRight: "2px",

              transform: "translateX(5px)",

              whiteSpace: "nowrap",
            }}
          >
            WORLD
          </div>
        </div>
      </div>
    </div>
  );
}