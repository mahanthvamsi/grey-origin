import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { projects } from "../data/projects";

/**
 * WorkPage.jsx — /work
 * portfolio-lists style: numbered rows, hover reveals a GIF that follows the cursor.
 * Page slides in from right on mount, slides out on back.
 */
export default function WorkPage() {
  const navigate  = useNavigate();
  const container = useRef(null);
  const rows      = useRef([]);
  const imgRef    = useRef(null);
  const [activeImg, setActiveImg] = useState(null);

  // ── Mount animation
  useEffect(() => {
    gsap.fromTo(container.current,
      { x: "100%", opacity: 0 },
      { x: "0%", opacity: 1, duration: 0.7, ease: "power3.out" }
    );
    gsap.fromTo(rows.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.6, stagger: 0.07, ease: "power3.out", delay: 0.35 }
    );
  }, []);

  // ── Image follows cursor
  useEffect(() => {
    const move = (e) => {
      if (!imgRef.current) return;
      gsap.to(imgRef.current, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.45,
        ease: "power2.out",
      });
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  const handleBack = () => {
    gsap.to(container.current, {
      x: "100%", opacity: 0, duration: 0.55, ease: "power3.in",
      onComplete: () => navigate("/"),
    });
  };

  return (
    <div
      ref={container}
      style={{
        position: "fixed", inset: 0, zIndex: 500,
        background: "#080808", overflowY: "auto",
        padding: "clamp(60px,8vh,100px) clamp(24px,5vw,48px)",
        willChange: "transform",
      }}
    >
      {/* ── Header ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "clamp(40px,6vh,72px)" }}>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(36px,5vw,52px)", letterSpacing: "2px", color: "rgba(255,255,255,0.9)" }}>
          All Work
        </h1>
        <button
          onClick={handleBack}
          style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: "11px", letterSpacing: "2.5px", textTransform: "uppercase", cursor: "none", fontFamily: "'DM Sans', sans-serif", transition: "color 0.3s" }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.9)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.4)"; }}
        >
          ← Back
        </button>
      </div>

      {/* ── Project list ── */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
        {projects.map((project, i) => (
          <div
            key={project.id}
            ref={(el) => (rows.current[i] = el)}
            onMouseEnter={() => setActiveImg(project.gif || project.thumbnail)}
            onMouseLeave={() => setActiveImg(null)}
            style={{
              opacity: 0,
              display: "grid",
              gridTemplateColumns: "48px 1fr auto",
              alignItems: "center",
              gap: "clamp(16px,3vw,40px)",
              padding: "clamp(20px,3vh,32px) 0",
              borderBottom: "1px solid rgba(255,255,255,0.07)",
              cursor: "none",
              transition: "background 0.3s",
            }}
            onMouseOver={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.02)"; }}
            onMouseOut={(e) => { e.currentTarget.style.background = "transparent"; }}
          >
            {/* Index */}
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "11px", color: "rgba(255,255,255,0.2)", letterSpacing: "1px" }}>
              {String(i + 1).padStart(2, "0")}
            </span>

            {/* Title */}
            <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(28px,4vw,52px)", letterSpacing: "1.5px", color: "#f5f5f0", lineHeight: 1, transition: "color 0.3s" }}>
              {project.title}
            </span>

            {/* Meta */}
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "10px", letterSpacing: "2.5px", textTransform: "uppercase", color: "rgba(255,255,255,0.3)" }}>
                {project.category}
              </div>
              <div style={{ fontSize: "10px", letterSpacing: "1px", color: "rgba(255,255,255,0.18)", marginTop: "4px" }}>
                {project.year}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Cursor-following image ── */}
      <div
        ref={imgRef}
        style={{
          position: "fixed",
          top: 0, left: 0,
          width: "clamp(180px,20vw,280px)",
          aspectRatio: "16/9",
          pointerEvents: "none",
          zIndex: 600,
          transform: "translate(-50%, -60%)",
          opacity: activeImg ? 1 : 0,
          transition: "opacity 0.25s ease",
          overflow: "hidden",
        }}
      >
        {activeImg && (
          <img
            src={activeImg}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        )}
      </div>
    </div>
  );
}
