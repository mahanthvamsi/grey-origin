import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { gsap } from "gsap";

export default function VideoPage() {
  const { slug }      = useParams();
  const navigate      = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const container     = useRef(null);
  const content       = useRef(null);

  useEffect(() => {
    const fetch = async () => {
      const snap = await getDocs(query(collection(db, "projects"), where("slug", "==", slug)));
      if (!snap.empty) {
        setProject({ id: snap.docs[0].id, ...snap.docs[0].data() });
      }
      setLoading(false);
    };
    fetch();
  }, [slug]);

  useEffect(() => {
    if (!project || !content.current) return;
    gsap.fromTo(content.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.7, ease: "power3.out", delay: 0.1 }
    );
  }, [project]);

  const handleBack = () => {
    gsap.to(content.current, {
      opacity: 0, y: -20, duration: 0.4, ease: "power2.in",
      onComplete: () => navigate("/work"),
    });
  };

  if (loading) return (
    <div style={{ position: "fixed", inset: 0, background: "#080808", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "13px", letterSpacing: "4px", color: "rgba(255,255,255,0.2)" }}>
        LOADING
      </div>
    </div>
  );

  if (!project) return (
    <div style={{ position: "fixed", inset: 0, background: "#080808", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "24px" }}>
      <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "32px", letterSpacing: "3px", color: "rgba(255,255,255,0.3)" }}>
        Project Not Found
      </div>
      <button onClick={() => navigate("/work")} style={{ background: "none", border: "1px solid rgba(255,255,255,0.2)", color: "#f5f5f0", padding: "12px 28px", fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", cursor: "none", fontFamily: "'DM Sans', sans-serif" }}>
        Back to Work
      </button>
    </div>
  );

  return (
    <div
      ref={container}
      style={{ minHeight: "100vh", background: "#080808", color: "#f5f5f0" }}
    >
      <div ref={content} style={{ opacity: 0 }}>

        {/* ── Fullscreen video embed ── */}
        <div style={{
          width: "100%",
          padding: "clamp(16px,3vw,40px)",
          background: "#080808",
          position: "relative",
        }}>
          <div style={{ aspectRatio: "16/9", position: "relative", width: "100%" }}>
            {project.youtubeId ? (
              <iframe
                src={`https://www.youtube.com/embed/${project.youtubeId}?autoplay=1&rel=0`}
                title={project.title}
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: "12px", letterSpacing: "2px", color: "rgba(255,255,255,0.2)" }}>No video available</span>
              </div>
            )}
          </div>
        </div>

        {/* ── Project info ── */}
        <div style={{ padding: "clamp(32px,5vw,64px) clamp(24px,5vw,48px)", maxWidth: "860px" }}>

          {/* Back */}
          <button
            onClick={handleBack}
            style={{
              background: "none", border: "none",
              color: "rgba(255,255,255,0.35)", fontSize: "11px",
              letterSpacing: "2.5px", textTransform: "uppercase",
              cursor: "none", fontFamily: "'DM Sans', sans-serif",
              marginBottom: "32px", display: "flex", alignItems: "center", gap: "10px",
              transition: "color 0.3s", padding: 0,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.8)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.35)"; }}
          >
            <span style={{ display: "block", width: "16px", height: "1px", background: "currentColor", position: "relative", flexShrink: 0 }}>
              <span style={{ position: "absolute", left: 0, top: "-3px", width: "6px", height: "6px", borderLeft: "1px solid currentColor", borderTop: "1px solid currentColor", transform: "rotate(-45deg)" }} />
            </span>
            All Work
          </button>

          {/* Meta */}
          <div style={{ fontSize: "11px", letterSpacing: "3px", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: "16px" }}>
            {project.category}{project.year ? ` · ${project.year}` : ""}
          </div>

          {/* Title */}
          <h1 style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "clamp(36px,6vw,72px)",
            letterSpacing: "2px", lineHeight: 0.9,
            color: "#f5f5f0", marginBottom: "28px",
          }}>
            {project.title}
          </h1>

          {/* Description */}
          {project.description && (
            <p style={{
              fontSize: "clamp(13px,1.5vw,15px)",
              fontWeight: 300, color: "rgba(255,255,255,0.5)",
              lineHeight: 1.85, maxWidth: "600px",
            }}>
              {project.description}
            </p>
          )}
        </div>

      </div>
    </div>
  );
}
