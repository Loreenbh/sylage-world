"use client";

interface ContactPanelProps {
  onClose: () => void;
}

export default function ContactPanel({ onClose }: ContactPanelProps) {
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
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
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
            opacity-50
            transition-opacity
            duration-500
            hover:opacity-100
            sm:right-7
            sm:top-7
          "
        >
          ×
        </button>

        <div className="relative z-10">
          <div className="mb-20">
            <img
              src="/contact.png"
              alt="CONTACT"
              className="
                h-auto
                w-[220px]
                sm:w-[300px]
              "
            />

            <div className="mt-6 h-px w-full bg-[#141313]/20" />
          </div>

          {/* Links */}
          <div
            className="
              flex
              flex-wrap
              items-center
              justify-center
              gap-x-5
              gap-y-3
              text-center
              sm:gap-x-7
            "
          >
            <a
              href="/cv.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="
                text-[12px]
                font-light
                tracking-[0.28em]
                opacity-70
                transition-opacity
                duration-500
                hover:opacity-100
                sm:text-[14px]
              "
            >
              CV
            </a>

            <span className="text-[8px] opacity-45 sm:text-[9px]">•</span>

            <a
              href="https://github.com/Loreenbh"
              target="_blank"
              rel="noopener noreferrer"
              className="
                text-[12px]
                font-light
                tracking-[0.28em]
                opacity-70
                transition-opacity
                duration-500
                hover:opacity-100
                sm:text-[14px]
              "
            >
              GITHUB
            </a>

            <span className="text-[8px] opacity-45 sm:text-[9px]">•</span>

            <a
              href="https://linkedin.com/in/loreen-begliomini-hazan"
              target="_blank"
              rel="noopener noreferrer"
              className="
                text-[12px]
                font-light
                tracking-[0.28em]
                opacity-70
                transition-opacity
                duration-500
                hover:opacity-100
                sm:text-[14px]
              "
            >
              LINKEDIN
            </a>
          </div>

          <div
            className="
              mt-20
              border-t
              border-[#141313]/20
              pt-7
            "
          >
            <div
              className="
                text-[9px]
                font-light
                tracking-[0.28em]
                opacity-40
                sm:text-[10px]
              "
            >
              SYLAGE — CREATIVE PORTFOLIO
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}