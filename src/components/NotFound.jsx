import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";

export default function NotFound() {
  const navigate  = useNavigate();
  const fourOFour = useRef(null);
  const line1     = useRef(null);
  const line2     = useRef(null);
  const sub       = useRef(null);
  const btn       = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    tl.fromTo(fourOFour.current,
      { opacity: 0, scale: 1.08 },
      { opacity: 1, scale: 1, duration: 1.1 },
      0
    )
    .fromTo([line1.current, line2.current],
      { yPercent: 110, opacity: 0 },
      { yPercent: 0, opacity: 1, duration: 0.9, stagger: 0.1, ease: "power4.out" },
      0.3
    )
    .fromTo(sub.current,
      { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.7 },
      0.75
    )
    .fromTo(btn.current,
      { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.7 },
      0.9
    );
  }, []);

  const handleBack = () => {
    gsap.to([fourOFour.current, line1.current, line2.current, sub.current, btn.current], {
      opacity: 0, y: -20, duration: 0.45, stagger: 0.05, ease: "power2.in",
      onComplete: () => navigate("/"),
    });
  };

  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "#080808",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "clamp(24px,5vw,48px)",
      overflow: "hidden",
    }}>

      {/* Subtle radial glow behind the 404 */}
      <div style={{
        position: "absolute",
        width: "600px", height: "600px",
        borderRadius: "50%",
        background: "radial-gradient(ellipse, rgba(255,255,255,0.03) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* 404 */}
      <div
        ref={fourOFour}
        style={{
          opacity: 0,
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: "clamp(120px, 22vw, 280px)",
          lineHeight: 0.85,
          letterSpacing: "8px",
          color: "rgba(255,255,255,0.06)",
          userSelect: "none",
          marginBottom: "clamp(16px,3vh,32px)",
        }}
      >
        404
      </div>

      {/* Headline — two lines clipping up */}
      <div style={{ overflow: "hidden", textAlign: "center", marginBottom: "6px" }}>
        <div
          ref={line1}
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "clamp(40px, 7vw, 88px)",
            letterSpacing: "3px",
            color: "#f5f5f0",
            lineHeight: 0.9,
          }}
        >
          This Frame
        </div>
      </div>
      <div style={{ overflow: "hidden", textAlign: "center", marginBottom: "clamp(20px,3vh,36px)" }}>
        <div
          ref={line2}
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "clamp(40px, 7vw, 88px)",
            letterSpacing: "3px",
            color: "rgba(255,255,255,0.22)",
            lineHeight: 0.9,
          }}
        >
          Doesn't Exist
        </div>
      </div>

      {/* Subtext */}
      <p
        ref={sub}
        style={{
          opacity: 0,
          fontSize: "clamp(12px, 1.4vw, 14px)",
          fontWeight: 300,
          color: "rgba(255,255,255,0.35)",
          letterSpacing: "1px",
          textAlign: "center",
          maxWidth: "320px",
          lineHeight: 1.8,
          marginBottom: "clamp(28px,4vh,48px)",
        }}
      >
        The page you're looking for has been cut from the edit.
      </p>

      {/* Back button */}
      <button
        ref={btn}
        onClick={handleBack}
        style={{
          opacity: 0,
          background: "transparent",
          border: "1px solid rgba(255,255,255,0.2)",
          color: "#f5f5f0",
          padding: "clamp(10px,1.5vh,14px) clamp(24px,3vw,40px)",
          fontSize: "11px",
          letterSpacing: "2.5px",
          textTransform: "uppercase",
          cursor: "none",
          fontFamily: "'DM Sans', sans-serif",
          transition: "all 0.3s",
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.5)"; e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; e.currentTarget.style.background = "transparent"; }}
      >
        <span style={{ display: "block", width: "16px", height: "1px", background: "rgba(255,255,255,0.7)", position: "relative", flexShrink: 0 }}>
          <span style={{ position: "absolute", left: 0, top: "-3px", width: "6px", height: "6px", borderLeft: "1px solid rgba(255,255,255,0.7)", borderTop: "1px solid rgba(255,255,255,0.7)", transform: "rotate(-45deg)" }} />
        </span>
        Back to Home
      </button>

      {/* Corner label — matches site's eyebrow style */}
      <div style={{
        position: "absolute",
        bottom: "clamp(20px,3vh,36px)",
        left: "clamp(24px,5vw,48px)",
        fontSize: "10px",
        letterSpacing: "3px",
        textTransform: "uppercase",
        color: "rgba(255,255,255,0.15)",
        fontFamily: "'DM Sans', sans-serif",
      }}>
        Grey Origin · Chennai
      </div>
    </div>
  );
}
