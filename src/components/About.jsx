import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const brands = ["Canon", "DJI", "YouTube", "Nike", "Hyundai", "Musicbed"];

export default function About() {
  const section = useRef(null);

  useEffect(() => {
    gsap.fromTo(
      section.current.querySelectorAll(".reveal"),
      { opacity: 0, y: 40 },
      {
        opacity: 1, y: 0, duration: 1, stagger: 0.15, ease: "power3.out",
        scrollTrigger: {
          trigger: section.current,
          start: "top 75%",
          toggleActions: "play reverse play reverse",
        },
      }
    );
  }, []);

  return (
    <section
      id="about"
      ref={section}
      style={{ padding: "clamp(60px, 8vh, 120px) clamp(24px, 5vw, 48px)", background: "#0a0a0a" }}
    >
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "clamp(40px, 6vw, 80px)", alignItems: "start" }}>

        {/* Left column */}
        <div>
          <div
            className="reveal"
            style={{ opacity: 0, fontSize: "11px", letterSpacing: "4px", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: "24px" }}
          >
            About Grey Origin
          </div>
          <h2
            className="reveal"
            style={{ opacity: 0, fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(40px, 5vw, 72px)", lineHeight: 0.95, letterSpacing: "2px", color: "#f5f5f0", marginBottom: "32px" }}
          >
            Crafting Stories<br />
            <span style={{ color: "rgba(255,255,255,0.3)" }}>Frame by Frame</span>
          </h2>
          <p
            className="reveal"
            style={{ opacity: 0, fontSize: "clamp(13px, 1.4vw, 15px)", fontWeight: 300, color: "rgba(255,255,255,0.5)", lineHeight: 1.85, marginBottom: "20px" }}
          >
            Grey Origin is a video production company based in Chennai. We specialise in cinematic
            storytelling - from brand campaigns and commercial content to travel documentaries and
            personal projects.
          </p>
          <p
            className="reveal"
            style={{ opacity: 0, fontSize: "clamp(13px, 1.4vw, 15px)", fontWeight: 300, color: "rgba(255,255,255,0.5)", lineHeight: 1.85 }}
          >
            Every frame is intentional. Every cut tells a story.
          </p>
        </div>

        {/* Right column */}
        <div>
          <div
            className="reveal"
            style={{ opacity: 0, fontSize: "11px", letterSpacing: "4px", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: "28px" }}
          >
            Trusted By
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
            {brands.map((brand) => (
              <span
                key={brand}
                className="reveal"
                style={{
                  opacity: 0,
                  padding: "10px 18px",
                  border: "1px solid rgba(255,255,255,0.12)",
                  fontSize: "11px",
                  letterSpacing: "2px",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.45)",
                }}
              >
                {brand}
              </span>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
