import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, query, where, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function Work() {
  const section      = useRef(null);
  const headRef      = useRef(null);
  const itemRefs     = useRef([]);
  const imgInnerRefs = useRef([]);
  const ctaRef       = useRef(null);
  const navigate     = useNavigate();

  const [featured, setFeatured] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    const load = async () => {
      const [snap, orderSnap] = await Promise.all([
        getDocs(query(collection(db, "projects"), where("featured", "==", true))),
        getDoc(doc(db, "settings", "featured")),
      ]);
      const all = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      const order = orderSnap.exists() ? (orderSnap.data().order || []) : [];
      // Sort by saved order, append any featured not in order
      const sorted = [
        ...order.map((id) => all.find((p) => p.id === id)).filter(Boolean),
        ...all.filter((p) => !order.includes(p.id)),
      ].slice(0, 4);
      setFeatured(sorted);
      setLoading(false);
    };
    load();
  }, []);

  useEffect(() => {
    if (loading) return;
    const ctx = gsap.context(() => {

      // ── Section heading ──
      gsap.fromTo(headRef.current,
        { yPercent: 110 },
        {
          yPercent: 0, duration: 1, ease: "power4.out",
          scrollTrigger: {
            trigger: headRef.current,
            start: "top 90%",
            toggleActions: "play none none none",
            once: true,
          },
        }
      );

      // ── Per card ──
      itemRefs.current.filter(Boolean).forEach((card, i) => {
        const imgWrap    = card.querySelector(".img-wrap");
        const imgInner   = imgInnerRefs.current[i];
        const index      = card.querySelector(".proj-index");
        const cat        = card.querySelector(".proj-cat");
        const titleWords = card.querySelectorAll(".proj-word");
        const desc       = card.querySelector(".proj-desc");

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: card,
            start: "top 80%",
            toggleActions: "play none none none",
            once: true,
          },
          defaults: { ease: "power3.out" },
        });

        tl.fromTo(index,
          { x: -40, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.6 },
          0
        )
        .fromTo(imgWrap,
          { clipPath: "inset(100% 0% 0% 0%)" },
          { clipPath: "inset(0% 0% 0% 0%)", duration: 1.1 },
          0.05
        )
        .fromTo(imgInner,
          { scale: 1.18 },
          { scale: 1, duration: 1.4, ease: "power2.out" },
          0.05
        )
        .fromTo(cat,
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.6 },
          0.5
        )
        .fromTo(titleWords,
          { yPercent: 105 },
          { yPercent: 0, duration: 0.75, stagger: 0.08 },
          0.55
        )
        .fromTo(desc,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.7 },
          0.85
        );
      });

      // ── CTA ──
      gsap.fromTo(ctaRef.current,
        { opacity: 0, y: 50 },
        {
          opacity: 1, y: 0, duration: 1, ease: "power3.out",
          scrollTrigger: {
            trigger: ctaRef.current,
            start: "top 88%",
            toggleActions: "play none none none",
            once: true,
          },
        }
      );

    }, section);

    return () => ctx.revert();
  }, [loading, featured]);

  return (
    <section
      id="work"
      ref={section}
      style={{ background: "#080808", padding: "clamp(80px,10vh,140px) clamp(24px,5vw,64px)" }}
    >
      {/* ── Heading ── */}
      <div style={{ overflow: "hidden", marginBottom: "clamp(56px,8vh,100px)" }}>
        <h2
          ref={headRef}
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "clamp(48px,7vw,88px)",
            letterSpacing: "3px",
            color: "#f5f5f0",
            lineHeight: 1,
            margin: 0,
          }}
        >
          Work
        </h2>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ height: "300px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "20px" }}>
          {/* Animated bars */}
          <div style={{ display: "flex", alignItems: "flex-end", gap: "4px", height: "32px" }}>
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                style={{
                  width: "4px",
                  background: "rgba(255,255,255,0.6)",
                  borderRadius: "2px",
                  animation: `workBarPulse 1.1s ease-in-out ${i * 0.12}s infinite alternate`,
                }}
              />
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
      )}

      {/* ── Project cards ── */}
      {!loading && featured.map((project, i) => {
        const isEven = i % 2 === 0;
        const words  = project.title.split(" ");

        return (
          <div
            key={project.id}
            ref={(el) => (itemRefs.current[i] = el)}
            onClick={() => navigate("/work/" + project.slug)}
            style={{
              cursor: "none",
              marginBottom: "clamp(64px,10vh,120px)",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "clamp(24px,4vw,56px)",
              alignItems: "center",
              direction: isEven ? "ltr" : "rtl",
            }}
          >
            {/* ── Image column ── */}
            <div style={{ direction: "ltr" }}>
              <div
                className="img-wrap"
                style={{
                  overflow: "hidden",
                  clipPath: "inset(100% 0% 0% 0%)",
                  aspectRatio: project.portrait ? "9/16" : "4/3",
                  maxHeight: project.portrait ? "75vh" : "60vh",
                  width: "100%",
                }}
              >
                <img
                  ref={(el) => (imgInnerRefs.current[i] = el)}
                  src={project.featureImage || project.thumbnail || project.gif}
                  alt={project.title}
                  style={{
                    width: "100%", height: "100%",
                    objectFit: "cover", display: "block",
                    transformOrigin: "center center",
                  }}
                />
              </div>
            </div>

            {/* ── Text column ── */}
            <div style={{ direction: "ltr" }}>
              <div
                className="proj-index"
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "11px", letterSpacing: "3px",
                  color: "rgba(255,255,255,0.2)",
                  marginBottom: "16px",
                  opacity: 0,
                }}
              >
                {String(i + 1).padStart(2, "0")}
              </div>

              <div
                className="proj-cat"
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "11px", letterSpacing: "3px",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.35)",
                  marginBottom: "clamp(12px,2vh,20px)",
                  opacity: 0,
                }}
              >
                {project.category}{project.year ? ` · ${project.year}` : ""}
              </div>

              <h3 style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: "clamp(40px,5vw,72px)",
                letterSpacing: "2px", lineHeight: 0.92,
                color: "#f5f5f0",
                margin: "0 0 clamp(16px,2.5vh,28px) 0",
                display: "flex", flexWrap: "wrap", gap: "0 12px",
              }}>
                {words.map((word, wi) => (
                  <span key={wi} style={{ overflow: "hidden", display: "inline-block" }}>
                    <span className="proj-word" style={{ display: "inline-block" }}>
                      {word}
                    </span>
                  </span>
                ))}
              </h3>

              <p
                className="proj-desc"
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "clamp(12px,1.3vw,14px)",
                  fontWeight: 300,
                  color: "rgba(255,255,255,0.4)",
                  lineHeight: 1.85, maxWidth: "360px",
                  margin: "0 0 clamp(20px,3vh,32px) 0",
                  opacity: 0,
                }}
              >
                {project.description || ""}
              </p>

              <div style={{
                display: "flex", alignItems: "center", gap: "10px",
                fontSize: "11px", letterSpacing: "2px",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.3)",
                fontFamily: "'DM Sans', sans-serif",
              }}>
                <span style={{
                  display: "block", width: "32px", height: "1px",
                  background: "rgba(255,255,255,0.3)", position: "relative",
                }}>
                  <span style={{
                    position: "absolute", right: 0, top: "-3px",
                    width: "6px", height: "6px",
                    borderRight: "1px solid rgba(255,255,255,0.3)",
                    borderTop: "1px solid rgba(255,255,255,0.3)",
                    transform: "rotate(45deg)",
                  }} />
                </span>
                Watch
              </div>
            </div>
          </div>
        );
      })}

      {/* ── View All CTA ── */}
      {!loading && (
        <div
          ref={ctaRef}
          style={{
            opacity: 0,
            marginTop: "clamp(40px,6vh,72px)",
            paddingTop: "clamp(40px,6vh,72px)",
            borderTop: "1px solid rgba(255,255,255,0.08)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "24px",
          }}
        >
          <h2 style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "clamp(40px,6vw,80px)",
            letterSpacing: "2px", color: "#f5f5f0",
            lineHeight: 0.9, margin: 0,
          }}>
            View All<br />
            <span style={{ color: "rgba(255,255,255,0.2)" }}>Work</span>
          </h2>

          <button
            onClick={() => navigate("/work")}
            style={{
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.25)",
              color: "#f5f5f0", padding: "16px 40px",
              fontSize: "11px", letterSpacing: "2.5px",
              textTransform: "uppercase", cursor: "none",
              fontFamily: "'DM Sans', sans-serif",
              transition: "all 0.3s",
              display: "flex", alignItems: "center", gap: "12px",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.6)"; e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)"; e.currentTarget.style.background = "transparent"; }}
          >
            See All Projects
            <span style={{ display: "block", width: "20px", height: "1px", background: "rgba(255,255,255,0.7)", position: "relative", flexShrink: 0 }}>
              <span style={{ position: "absolute", right: 0, top: "-3px", width: "6px", height: "6px", borderRight: "1px solid rgba(255,255,255,0.7)", borderTop: "1px solid rgba(255,255,255,0.7)", transform: "rotate(45deg)" }} />
            </span>
          </button>
        </div>
      )}
    </section>
  );
}