import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { projects } from "../data/projects";

gsap.registerPlugin(ScrollTrigger);

function WorkCard({ project, featured }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="work-card"
      style={{ position: "relative", overflow: "hidden", cursor: "none" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <img
        src={project.thumbnail}
        alt={project.title}
        style={{
          width: "100%",
          aspectRatio: featured ? "16/9" : "4/3",
          objectFit: "cover", display: "block",
          transition: "transform 0.7s cubic-bezier(0.16,1,0.3,1)",
          transform: hovered ? "scale(1.04)" : "scale(1)",
        }}
      />
      {project.gif && (
        <img src={project.gif} alt="" aria-hidden="true" style={{
          position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
          objectFit: "cover", pointerEvents: "none",
          opacity: hovered ? 1 : 0,
          transform: hovered ? "scale(1.04)" : "scale(1)",
          transition: "opacity 0.4s ease, transform 0.7s cubic-bezier(0.16,1,0.3,1)",
        }} />
      )}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(to top, rgba(0,0,0,0.88) 0%, transparent 55%)",
        display: "flex", flexDirection: "column", justifyContent: "flex-end",
        padding: "clamp(16px,3vw,32px)",
        opacity: hovered ? 1 : 0, transition: "opacity 0.4s",
      }}>
        <div style={{ fontSize: "10px", letterSpacing: "3px", textTransform: "uppercase", color: "rgba(255,255,255,0.5)", marginBottom: "6px" }}>
          {project.category} · {project.year}
        </div>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(20px,2.5vw,32px)", letterSpacing: "1px", color: "#fff" }}>
          {project.title}
        </div>
      </div>
    </div>
  );
}

export default function Work() {
  const section  = useRef(null);
  const navigate = useNavigate();

  const featured = projects.find((p) => p.featured);
  const rest     = projects.filter((p) => !p.featured);

  useEffect(() => {
    gsap.fromTo(
      section.current.querySelectorAll(".work-card"),
      { opacity: 0, y: 50 },
      {
        opacity: 1, y: 0, duration: 0.9, stagger: 0.12, ease: "power3.out",
        scrollTrigger: {
          trigger: section.current,
          start: "top 75%",
          toggleActions: "play reverse play reverse",
        },
      }
    );
  }, []);

  if (!featured) return null;

  return (
    <section id="work" ref={section} style={{ padding: "clamp(60px,8vh,100px) clamp(24px,5vw,48px)", background: "#080808" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "clamp(28px,4vh,48px)" }}>
        <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(36px,5vw,52px)", letterSpacing: "2px", color: "rgba(255,255,255,0.9)" }}>
          Selected Work
        </h2>
        <button
          onClick={() => navigate("/work")}
          style={{ background: "none", border: "none", fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", cursor: "none", fontFamily: "'DM Sans', sans-serif", transition: "color 0.3s" }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.8)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.35)"; }}
        >
          View All →
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
        <WorkCard project={featured} featured={true} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "3px" }}>
          {rest.map((p) => <WorkCard key={p.id} project={p} />)}
        </div>
      </div>
    </section>
  );
}
