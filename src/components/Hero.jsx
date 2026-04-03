import { useEffect, useRef } from "react";
import { gsap } from "gsap";

/**
 * SEQUENCE:
 *  1. Black screen. "GREY ORIGIN" text at normal size, centred.
 *     Video plays through the letter-shaped holes.
 *  2. Text GROWS (scale 1 → 6) — expands off the screen edges.
 *     As it grows, the black border closes in and disappears.
 *  3. Black mask layer gone — full video revealed, no cut.
 *  4. Hero content animates in.
 *
 * 🔧 Swap HERO_VIDEO_URL for real footage when ready.
 */

const HERO_VIDEO_URL = "src/assets/My Movie 1.mp4";

export default function Hero() {
  const maskLayer = useRef(null);
  const svgText   = useRef(null);
  const overlay   = useRef(null);
  const eyebrow   = useRef(null);
  const lineOne   = useRef(null);
  const lineTwo   = useRef(null);
  const sub       = useRef(null);
  const bottom    = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    // 1. Hold a beat so the text reads at normal size
    tl.to({}, { duration: 1.4 }, 0.3)

    // 2. Text grows outward until letters bleed off screen
    .to(svgText.current, {
      scale: 6,
      duration: 1.2,
      ease: "power2.in",
    }, "grow")

    // 3. Collapse the black mask layer — video fully revealed
    .to(maskLayer.current, {
      opacity: 0,
      duration: 0.2,
      ease: "none",
    }, "grow+=1.0")

    // 4. Dark overlay fades in
    .fromTo(overlay.current,
      { opacity: 0 }, { opacity: 1, duration: 0.6, ease: "power2.out" },
      "grow+=1.1"
    )

    // 5. Hero text
    .fromTo(eyebrow.current,
      { opacity: 0, x: -16 }, { opacity: 1, x: 0, duration: 0.6 },
      "grow+=1.2"
    )
    .fromTo([lineOne.current, lineTwo.current],
      { yPercent: 110, opacity: 0 },
      { yPercent: 0, opacity: 1, duration: 0.9, stagger: 0.1, ease: "power4.out" },
      "grow+=1.3"
    )
    .fromTo(sub.current,
      { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.7 },
      "grow+=1.6"
    )
    .fromTo(bottom.current,
      { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.7 },
      "grow+=1.7"
    );

    return () => tl.kill();
  }, []);

  return (
    <section
      id="home"
      style={{
        position: "relative",
        width: "100%",
        height: "100svh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        overflow: "hidden",
        padding: "0 clamp(24px,5vw,48px) clamp(40px,6vh,64px)",
        background: "#080808",
      }}
    >
      {/* ── Video — fullscreen from frame 0 ── */}
      <video
        autoPlay muted loop playsInline
        style={{
          position: "absolute", inset: 0,
          width: "100%", height: "100%",
          objectFit: "cover", zIndex: 0,
        }}
      >
        <source src={HERO_VIDEO_URL} type="video/mp4" />
      </video>

      {/* ── Dark overlay (fades in post-reveal) ── */}
      <div
        ref={overlay}
        style={{
          position: "absolute", inset: 0, zIndex: 1,
          background: "rgba(8,8,8,0.52)",
          opacity: 0, pointerEvents: "none",
        }}
      />
      {/* Vignette */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 2,
        background: "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.5) 100%)",
        pointerEvents: "none",
      }} />

      {/* ── Mask layer: black with text holes, sits above video ── */}
      <div
        ref={maskLayer}
        style={{
          position: "absolute", inset: 0, zIndex: 10,
          pointerEvents: "none",
        }}
      >
        <svg
          ref={svgText}
          width="100%" height="100%"
          xmlns="http://www.w3.org/2000/svg"
          style={{
            position: "absolute", inset: 0, display: "block",
            transformOrigin: "center center",
            // Starts at scale(1) — normal readable size
            transform: "scale(1)",
          }}
        >
          <defs>
            <mask id="goMask">
              <rect width="100%" height="100%" fill="white" />
              <text
                x="50%" y="44%"
                textAnchor="middle"
                dominantBaseline="middle"
                fontFamily="'Bebas Neue', sans-serif"
                fontSize="clamp(80px, 14vw, 168px)"
                letterSpacing="10"
                fill="black"
              >
                GREY
              </text>
              <text
                x="50%" y="64%"
                textAnchor="middle"
                dominantBaseline="middle"
                fontFamily="'Bebas Neue', sans-serif"
                fontSize="clamp(80px, 14vw, 168px)"
                letterSpacing="10"
                fill="black"
              >
                ORIGIN
              </text>
            </mask>
          </defs>
          <rect width="100%" height="100%" fill="#080808" mask="url(#goMask)" />
        </svg>
      </div>

      {/* ── Hero text content ── */}
      <div style={{ position: "relative", zIndex: 5 }}>
        <div
          ref={eyebrow}
          style={{
            opacity: 0, fontSize: "11px", letterSpacing: "4px",
            textTransform: "uppercase", color: "rgba(255,255,255,0.4)",
            marginBottom: "16px", display: "flex", alignItems: "center", gap: "12px",
          }}
        >
          <span style={{ display: "block", width: "28px", height: "1px", background: "rgba(255,255,255,0.3)" }} />
          Video Production Studio · Chennai
        </div>

        <h1 style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: "clamp(56px, 11vw, 140px)",
          lineHeight: 0.88, letterSpacing: "2px",
          marginBottom: "24px", overflow: "hidden",
        }}>
          <span ref={lineOne} style={{ display: "block", color: "#f5f5f0" }}>Grey</span>
          <span ref={lineTwo} style={{ display: "block", color: "rgba(255,255,255,0.28)" }}>Origin</span>
        </h1>

        <p ref={sub} style={{
          opacity: 0, fontSize: "clamp(13px, 1.5vw, 15px)",
          fontWeight: 300, color: "rgba(255,255,255,0.5)",
          maxWidth: "360px", lineHeight: 1.75,
        }}>
          Cinematic storytelling for brands, travel, and commercial content. Based in Chennai, working worldwide.
        </p>
      </div>

      {/* ── Bottom row ── */}
      <div
        ref={bottom}
        style={{
          opacity: 0, position: "relative", zIndex: 5,
          display: "flex", justifyContent: "space-between",
          alignItems: "flex-end", marginTop: "clamp(28px,4vh,48px)",
        }}
      >
        <a
          href="#work"
          style={{
            display: "flex", alignItems: "center", gap: "12px",
            border: "1px solid rgba(255,255,255,0.2)",
            padding: "clamp(10px,1.5vh,14px) clamp(18px,2.5vw,28px)",
            fontSize: "11px", letterSpacing: "2.5px", textTransform: "uppercase",
            textDecoration: "none", color: "#f5f5f0",
            transition: "all 0.3s", whiteSpace: "nowrap",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.5)"; e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; e.currentTarget.style.background = "transparent"; }}
        >
          View Work
          <span style={{ display: "block", width: "20px", height: "1px", background: "rgba(255,255,255,0.7)", position: "relative", flexShrink: 0 }}>
            <span style={{ position: "absolute", right: 0, top: "-3px", width: "6px", height: "6px", borderRight: "1px solid rgba(255,255,255,0.7)", borderTop: "1px solid rgba(255,255,255,0.7)", transform: "rotate(45deg)" }} />
          </span>
        </a>

        <div style={{
          display: "flex", flexDirection: "column",
          alignItems: "center", gap: "10px",
          fontSize: "11px", letterSpacing: "3px",
          textTransform: "uppercase", color: "rgba(255,255,255,0.25)",
        }}>
          <div style={{ width: "1px", height: "40px", background: "linear-gradient(to bottom, rgba(255,255,255,0.4), transparent)" }} />
          Scroll
        </div>
      </div>
    </section>
  );
}