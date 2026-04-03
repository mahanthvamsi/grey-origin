import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const stats = [
  { number: "1.2M", label: "Total Views" },
  { number: "48+",  label: "Projects" },
  { number: "12",   label: "Brand Clients" },
  { number: "6+",   label: "Years" },
];

export default function Stats() {
  const section = useRef(null);

  useEffect(() => {
    gsap.fromTo(
      section.current.querySelectorAll(".stat-item"),
      { opacity: 0, y: 30 },
      {
        opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: "power3.out",
        scrollTrigger: {
          trigger: section.current,
          start: "top 80%",
          toggleActions: "play reverse play reverse",
        },
      }
    );
  }, []);

  return (
    <div
      ref={section}
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        borderTop: "1px solid rgba(255,255,255,0.07)",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        margin: "0 clamp(24px, 5vw, 48px)",
      }}
      className="md:grid-cols-4"
    >
      {stats.map((s, i) => (
        <div
          key={s.label}
          style={{
            opacity: 0,
            padding: "clamp(24px, 4vh, 40px) clamp(16px, 3vw, 32px)",
            // Mobile (2-col): right border on items 0 & 2; bottom border on items 0 & 1
            // The md: breakpoint override is handled via the className below
            borderRight: "1px solid rgba(255,255,255,0.07)",
            borderBottom: i < 2 ? "1px solid rgba(255,255,255,0.07)" : "none",
          }}
          // Remove right border on the last column for each row:
          // 2-col: items 1 & 3 (odd indices) | 4-col: item 3 (last)
          className={`stat-item ${
            i % 2 === 1 ? "border-r-0" : ""
          } md:border-r md:border-b-0 ${
            i < 3 ? "md:border-r" : "md:border-r-0"
          } ${
            i < 2 ? "border-b" : "border-b-0"
          }`}
        >
          <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(36px, 5vw, 52px)", letterSpacing: "1px", color: "#f5f5f0", display: "block", lineHeight: 1 }}>
            {s.number}
          </span>
          <span style={{ fontSize: "11px", letterSpacing: "2.5px", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginTop: "6px", display: "block" }}>
            {s.label}
          </span>
        </div>
      ))}
    </div>
  );
}
