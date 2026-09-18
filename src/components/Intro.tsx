"use client";

import { useEffect, useState } from "react";

interface IntroProps {
  onFinish: () => void;
}

export default function Intro({
  onFinish,
}: IntroProps) {
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setClosing(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!closing) return;

    const timer = setTimeout(() => {
      onFinish();
    }, 500);

    return () => clearTimeout(timer);
  }, [closing, onFinish]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "#141313",

        display: "flex",
        alignItems: "center",
        justifyContent: "center",

        pointerEvents: "none",

        opacity: closing ? 0 : 1,

        transition:
          "opacity 0.5s cubic-bezier(0.65, 0, 0.35, 1)",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",

          transform: closing
            ? "translateY(-5px)"
            : "translateY(0)",

          transition:
            "transform 0.5s cubic-bezier(0.65, 0, 0.35, 1)",
        }}
      >
        {/* BHL */}

        {/* <div
          className="
            text-[100px]
            sm:text-[180px]
            lg:text-[300px]

            ml-[20px]
            sm:ml-[50px]
            lg:ml-[100px]
          "
          style={{
            fontFamily: "'Bodoni Moda', serif",
            lineHeight: 0.8,
            letterSpacing: "0.32em",
            fontWeight: 200,
            color: "#e4e3d0",
            whiteSpace: "nowrap",
          }}
        >
          BHL
        </div> */}
        {/* LOGO BHL */}
        <img
        src="/logo.png"
        alt="BHL"
        className="
            w-[180px]
            sm:w-[280px]
            lg:w-[420px]

            ml-[20px]
            sm:ml-[50px]
            lg:ml-[100px]

            object-contain
        "
        />

        {/* PORTFOLIO */}

        <div
          className="
            text-[14px]
            sm:text-[20px]
            lg:text-[30px]

            translate-x-[150px]
            sm:translate-x-[230px]
            lg:translate-x-[450px]
          "
          style={{
            fontFamily: "Roboto, sans-serif",
            letterSpacing: "0.35em",
            fontWeight: 300,
            color: "#fff",
            marginTop: "24px",
            whiteSpace: "nowrap",
          }}
        >
          PORTFOLIO
        </div>
      </div>
    </div>
  );
}