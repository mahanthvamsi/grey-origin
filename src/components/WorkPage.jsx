import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import { gsap } from "gsap";

const CACHE_KEY = "go_all_projects";
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export default function WorkPage() {
  const navigate       = useNavigate();
  const container      = useRef(null);
  const rows           = useRef([]);
  const imgRef         = useRef(null);
  const [projects, setProjects]           = useState([]);
  const [activeProject, setActiveProject] = useState(null);
  const [loading, setLoading]             = useState(true);

  useEffect(() => {
    const load = async () => {
      // ── Try cache first ──
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const { data, ts } = JSON.parse(cached);
          setProjects(data);
          setLoading(false);
          if (Date.now() - ts < CACHE_TTL) return;
          // Stale — refresh in background
          fetchFromFirestore(false);
          return;
        }
      } catch {}

      await fetchFromFirestore(true);
    };

    const fetchFromFirestore = async (showLoader) => {
      try {
        const snap = await getDocs(query(collection(db, "projects"), orderBy("createdAt", "desc")));
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        localStorage.setItem(CACHE_KEY, JSON.stringify({ data, ts: Date.now() }));
        setProjects(data);
      } catch (err) {
        console.error("Failed to load projects:", err);
      } finally {
        if (showLoader) setLoading(false);
      }
    };

    load();
  }, []);

  // Mount animation
  useEffect(() => {
    if (loading) return;
    gsap.fromTo(container.current,
      { opacity: 0 }, { opacity: 1, duration: 0.5, ease: "power2.out" }
    );
    gsap.fromTo(rows.current.filter(Boolean),
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: 0.6, stagger: 0.07, ease: "power3.out", delay: 0.2 }
    );
  }, [loading]);

  // Cursor-following image
  useEffect(() => {
    const move = (e) => {
      if (!imgRef.current) return;
      gsap.to(imgRef.current, { x: e.clientX, y: e.clientY, duration: 0.45, ease: "power2.out" });
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  const handleRowClick = (project) => {
    gsap.to(container.current, {
      opacity: 0, duration: 0.35, ease: "power2.in",
      onComplete: () => navigate(`/work/${project.slug}`),
    });
  };

  const handleBack = () => {
  gsap.to(container.current, {
    opacity: 0, duration: 0.4, ease: "power2.in",
    onComplete: () => {
      navigate("/");
      setTimeout(() => {
        document.getElementById("work")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    },
  });
};

  if (loading) return (
    <div style={{ position: "fixed", inset: 0, background: "#080808", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "20px" }}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: "4px", height: "32px" }}>
        {[0,1,2,3,4].map((i) => (
          <div key={i} style={{
            width: "4px", background: "rgba(255,255,255,0.6)",
            borderRadius: "2px",
            animation: `workBarPulse 1.1s ease-in-out ${i * 0.12}s infinite alternate`,
          }} />
        ))}
      </div>
      <span style={{ fontSize: "11px", letterSpacing: "4px", color: "rgba(255,255,255,0.5)", textTransform: "uppercase" }}>
        Loading Work
      </span>
      <style>{`
        @keyframes workBarPulse {
          from { height: 8px;  opacity: 0.2; }
          to   { height: 32px; opacity: 0.7; }
        }
      `}</style>
    </div>
  );

  return (
    <div
      ref={container}
      style={{
        minHeight: "100vh", background: "#080808",
        padding: "clamp(60px,8vh,100px) clamp(24px,5vw,48px)",
        opacity: 0,
      }}
    >
      {/* Header */}
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

      {/* Project list */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
        {projects.length === 0 && (
          <p style={{ padding: "40px 0", color: "rgba(255,255,255,0.25)", fontSize: "13px", letterSpacing: "1px" }}>No projects yet.</p>
        )}
        {projects.map((project, i) => (
          <div
            key={project.id}
            ref={(el) => (rows.current[i] = el)}
            onClick={() => handleRowClick(project)}
            onMouseEnter={() => setActiveProject(project)}
            onMouseLeave={() => setActiveProject(null)}
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
            onMouseOut={(e)  => { e.currentTarget.style.background = "transparent"; }}
          >
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "11px", color: "rgba(255,255,255,0.2)", letterSpacing: "1px" }}>
              {String(i + 1).padStart(2, "0")}
            </span>
            <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(28px,4vw,52px)", letterSpacing: "1.5px", color: "#f5f5f0", lineHeight: 1 }}>
              {project.title}
            </span>
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

      {/* Cursor-following thumbnail */}
      <div
        ref={imgRef}
        style={{
          position: "fixed", top: 0, left: 0,
          width: activeProject?.portrait ? "clamp(100px,11vw,160px)" : "clamp(180px,20vw,280px)",
          aspectRatio: activeProject?.portrait ? "9/16" : "16/9",
          pointerEvents: "none", zIndex: 600,
          transform: "translate(-50%, -60%)",
          opacity: activeProject ? 1 : 0,
          transition: "opacity 0.25s ease",
          overflow: "hidden",
        }}
      >
        {activeProject && (
          <img
            src={activeProject.thumbnail || activeProject.gif}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        )}
      </div>
    </div>
  );
}
