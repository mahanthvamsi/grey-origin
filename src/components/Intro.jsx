import { useEffect, useRef } from "react";
import { gsap } from "gsap";

/**
 * Intro.jsx — Kookie-style cold open
 * Sequence:
 *  0.0s  Black screen. REC + readout appear instantly (like camera booting)
 *  0.6s  "GREY" clips up from below (mask reveal)
 *  0.9s  "ORIGIN" clips up
 *  1.6s  Tagline fades in
 *  2.6s  Short pause — everything feels settled
 *  3.0s  All content fades to black
 *  3.6s  onComplete() fires → parent unmounts this, mounts Hero
 */
export default function Intro({ onComplete }) {
  const wrap     = useRef(null);
  const grey     = useRef(null);
  const origin   = useRef(null);
  const tagline  = useRef(null);
  const rec      = useRef(null);
  const readout  = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline({
      onComplete,
      defaults: { ease: "power3.out" },
    });

    // Camera-boot readout & REC blink appear instantly
    tl.fromTo(rec.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.3 },
      0
    )
    .fromTo(readout.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.4 },
      0.1
    )

    // GREY — mask clip-up
    .fromTo(grey.current,
      { yPercent: 105 },
      { yPercent: 0, duration: 0.9, ease: "power4.out" },
      0.5
    )
    // ORIGIN — clip-up, slight stagger
    .fromTo(origin.current,
      { yPercent: 105 },
      { yPercent: 0, duration: 0.9, ease: "power4.out" },
      0.72
    )
    // Tagline fade
    .fromTo(tagline.current,
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.7 },
      1.55
    )

    // Hold
    .to({}, { duration: 1.1 }, 2.4)

    // Fade everything to black
    .to(wrap.current,
      { opacity: 0, duration: 0.7, ease: "power2.inOut" },
      "+=0"
    );

    return () => tl.kill();
  }, [onComplete]);

  return (
    <div
      ref={wrap}
      style={{
        position: "fixed", inset: 0, zIndex: 9000,
        background: "#080808",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexDirection: "column",
        userSelect: "none", pointerEvents: "none",
      }}
    >
      {/* ── Camera UI overlay ── */}
      <div style={{
        position: "absolute", inset: 0,
        padding: "clamp(20px, 3vw, 36px)",
        display: "flex", flexDirection: "column",
        justifyContent: "space-between",
        pointerEvents: "none",
      }}>
        {/* Top row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          {/* REC indicator */}
          <div ref={rec} style={{ display: "flex", alignItems: "center", gap: "8px", opacity: 0 }}>
            <div style={{
              width: "8px", height: "8px", borderRadius: "50%",
              background: "#e63c3c",
              animation: "recBlink 1.1s ease-in-out infinite",
            }} />
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "11px", letterSpacing: "3px", color: "rgba(255,255,255,0.5)", textTransform: "uppercase" }}>
              REC
            </span>
          </div>
          {/* Top-right readout */}
          <div ref={readout} style={{ opacity: 0, textAlign: "right" }}>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "10px", letterSpacing: "2px", color: "rgba(255,255,255,0.25)", lineHeight: 1.9 }}>
              <div>4K · 25fps</div>
              <div>00:00:00:00</div>
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "10px", letterSpacing: "2px", color: "rgba(255,255,255,0.2)", textTransform: "uppercase" }}>
            Chennai · IE
          </span>
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "10px", letterSpacing: "2px", color: "rgba(255,255,255,0.2)", textTransform: "uppercase" }}>
            {new Date().getFullYear()}
          </span>
        </div>
      </div>

      {/* ── Wordmark ── */}
      <div style={{ textAlign: "center", lineHeight: 0.88 }}>
        {/* Clip container for GREY */}
        <div style={{ overflow: "hidden" }}>
          <div
            ref={grey}
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: "clamp(72px, 14vw, 180px)",
              letterSpacing: "8px",
              color: "#f5f5f0",
              display: "block",
              transform: "translateY(105%)",
            }}
          >
            Grey
          </div>
        </div>
        {/* Clip container for ORIGIN */}
        <div style={{ overflow: "hidden" }}>
          <div
            ref={origin}
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: "clamp(72px, 14vw, 180px)",
              letterSpacing: "8px",
              color: "rgba(255,255,255,0.22)",
              display: "block",
              transform: "translateY(105%)",
            }}
          >
            Origin
          </div>
        </div>
        {/* Tagline */}
        <div
          ref={tagline}
          style={{
            opacity: 0,
            marginTop: "clamp(14px, 2vw, 22px)",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "11px",
            letterSpacing: "4px",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.3)",
          }}
        >
          Video Production Studio · Chennai
        </div>
      </div>

      {/* REC blink keyframe */}
      <style>{`
        @keyframes recBlink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.15; }
        }
      `}</style>
    </div>
  );
}
