"use client";

import { FormEvent, useState } from "react";

interface ContactPanelProps {
  onClose: () => void;
}

export default function ContactPanel({ onClose }: ContactPanelProps) {
  const [status, setStatus] = useState<
    "idle" | "sending" | "success" | "error"
  >("idle");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (status === "sending") {
      return;
    }

    const form = e.currentTarget;
    const formData = new FormData(form);

    const name = formData.get("name");
    const email = formData.get("email");
    const message = formData.get("message");

    setStatus("sending");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          message,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Impossible d'envoyer le message.");
      }

      console.log("Réponse API :", data);

      form.reset();

      setStatus("success");
    } catch (error) {
      console.error("Erreur lors de l'envoi :", error);

      setStatus("error");
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-[#141313]/70 px-5 py-8 backdrop-blur-[3px]">
      <div
        onPointerDown={(e) => e.stopPropagation()}
        onPointerMove={(e) => e.stopPropagation()}
        onWheel={(e) => e.stopPropagation()}
        className="
          relative
          w-full
          max-w-[820px]
          overflow-hidden
          bg-[url('/bg-contact.png')]
          px-7
          py-12
          text-[#141313]
          shadow-[0_20px_80px_rgba(0,0,0,0.18)]
          sm:px-16
          sm:py-16
        "
      >
        <div
          className="
            pointer-events-none
            absolute
            inset-0
            opacity-[0.07]
          "
          style={{
            backgroundImage: `
              radial-gradient(
                circle at 20% 20%,
                #141313 0.6px,
                transparent 0.8px
              ),
              radial-gradient(
                circle at 80% 70%,
                #141313 0.5px,
                transparent 0.8px
              )
            `,
            backgroundSize: "17px 17px, 23px 23px",
          }}
        />

        <button
          type="button"
          onClick={onClose}
          aria-label="Close contact panel"
          className="
            absolute
            right-5
            top-5
            z-10
            text-[22px]
            font-light
            leading-none
            opacity-60
            transition-opacity
            duration-300
            hover:opacity-100
            sm:right-7
            sm:top-7
          "
        >
          ×
        </button>

        <div className="relative z-10">
          <div className="mb-14">
            <img
              src="/contact.png"
              alt="CONTACT"
              className="
                h-auto
                w-[240px]
                sm:w-[330px]
              "
            />

            <div className="mt-5 h-px w-full bg-[#141313]/20" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-9">
            <div>
              <label
                htmlFor="name"
                className="
                  mb-2
                  block
                  text-[10px]
                  tracking-[0.25em]
                  opacity-60
                  sm:text-[12px]
                "
              >
                NAME
              </label>

              <input
                id="name"
                name="name"
                type="text"
                required
                className="
                  w-full
                  border-0
                  border-b
                  border-[#141313]/30
                  bg-transparent
                  px-0
                  pb-3
                  text-[15px]
                  outline-none
                  transition-colors
                  duration-300
                  placeholder:text-[#141313]/30
                  focus:border-[#141313]
                  sm:text-[17px]
                "
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="
                  mb-2
                  block
                  text-[10px]
                  tracking-[0.25em]
                  opacity-60
                  sm:text-[12px]
                "
              >
                EMAIL
              </label>

              <input
                id="email"
                name="email"
                type="email"
                required
                className="
                  w-full
                  border-0
                  border-b
                  border-[#141313]/30
                  bg-transparent
                  px-0
                  pb-3
                  text-[15px]
                  outline-none
                  transition-colors
                  duration-300
                  placeholder:text-[#141313]/30
                  focus:border-[#141313]
                  sm:text-[17px]
                "
              />
            </div>

            <div>
              <label
                htmlFor="message"
                className="
                  mb-2
                  block
                  text-[10px]
                  tracking-[0.25em]
                  opacity-60
                  sm:text-[12px]
                "
              >
                MESSAGE
              </label>

              <textarea
                id="message"
                name="message"
                required
                rows={3}
                className="
                  w-full
                  resize-none
                  border-0
                  border-b
                  border-[#141313]/30
                  bg-transparent
                  px-0
                  pb-3
                  text-[15px]
                  outline-none
                  transition-colors
                  duration-300
                  focus:border-[#141313]
                  sm:text-[17px]
                "
              />
            </div>

            <div className="pt-3">
              <button
                type="submit"
                disabled={status === "sending"}
                className="
                  text-[11px]
                  tracking-[0.3em]
                  transition-opacity
                  duration-300
                  disabled:cursor-not-allowed
                  disabled:opacity-40
                  hover:opacity-50
                  sm:text-[12px]
                "
              >
                {status === "sending" && "SENDING..."}
                {status === "success" && "SENT ✓"}
                {status === "error" && "TRY AGAIN"}
                {status === "idle" && "SEND →"}
              </button>
            </div>
          </form>

          <div
            className="
              mt-16
              border-t
              border-[#141313]/20
              pt-7
            "
          >
            <div
              className="
                flex
                flex-wrap
                items-center
                gap-x-8
                gap-y-4
              "
            >
              <a
                href="https://linkedin.com/in/loreen-begliomini-hazan"
                target="_blank"
                rel="noopener noreferrer"
                className="
                  text-[11px]
                  tracking-[0.2em]
                  transition-opacity
                  duration-300
                  hover:opacity-50
                "
              >
                LINKEDIN
              </a>

              <span className="text-[9px] opacity-60">•</span>

              <a
                href="https://github.com/Loreenbh"
                target="_blank"
                rel="noopener noreferrer"
                className="
                  text-[11px]
                  tracking-[0.2em]
                  transition-opacity
                  duration-300
                  hover:opacity-50
                "
              >
                GITHUB
              </a>

              <span className="text-[9px] opacity-60">•</span>

              <a
                href="/cv.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="
                  text-[11px]
                  tracking-[0.2em]
                  transition-opacity
                  duration-300
                  hover:opacity-50
                "
              >
                CV
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
