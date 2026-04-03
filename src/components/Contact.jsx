import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const inputStyle = {
  width: "100%",
  background: "transparent",
  border: "none",
  borderBottom: "1px solid rgba(255,255,255,0.15)",
  padding: "14px 0",
  color: "#f5f5f0",
  fontSize: "clamp(13px, 1.4vw, 14px)",
  outline: "none",
  fontFamily: "'DM Sans', sans-serif",
  transition: "border-color 0.3s",
};

export default function Contact() {
  const section = useRef(null);
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);

  useEffect(() => {
    gsap.fromTo(
      section.current.querySelectorAll(".reveal"),
      { opacity: 0, y: 40 },
      {
        opacity: 1, y: 0, duration: 1, stagger: 0.12, ease: "power3.out",
        scrollTrigger: {
          trigger: section.current,
          start: "top 75%",
          toggleActions: "play reverse play reverse",
        },
      }
    );
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
  };

  const handleFocus = (e) => { e.target.style.borderBottomColor = "rgba(255,255,255,0.5)"; };
  const handleBlur  = (e) => { e.target.style.borderBottomColor = "rgba(255,255,255,0.15)"; };

  return (
    <section
      id="contact"
      ref={section}
      style={{ padding: "clamp(60px, 8vh, 120px) clamp(24px, 5vw, 48px)", background: "#080808" }}
    >
      <div style={{ maxWidth: "640px" }}>
        <div
          className="reveal"
          style={{ opacity: 0, fontSize: "11px", letterSpacing: "4px", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: "24px" }}
        >
          Get In Touch
        </div>
        <h2
          className="reveal"
          style={{ opacity: 0, fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(44px, 6vw, 88px)", lineHeight: 0.9, letterSpacing: "2px", color: "#f5f5f0", marginBottom: "48px" }}
        >
          Let's Make<br />
          <span style={{ color: "rgba(255,255,255,0.3)" }}>Something Great</span>
        </h2>

        {sent ? (
          <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.5)", lineHeight: 1.7 }}>
            Message sent - we'll be in touch soon.
          </p>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
            <div className="reveal" style={{ opacity: 0 }}>
              <input
                required
                type="text"
                name="name"
                placeholder="Your Name"
                style={inputStyle}
                value={form.name}
                onChange={handleChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
            </div>
            <div className="reveal" style={{ opacity: 0 }}>
              <input
                required
                type="email"
                name="email"
                placeholder="Email Address"
                style={inputStyle}
                value={form.email}
                onChange={handleChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
            </div>
            <div className="reveal" style={{ opacity: 0 }}>
              <textarea
                required
                name="message"
                placeholder="Tell us about your project..."
                rows={4}
                style={{ ...inputStyle, resize: "none" }}
                value={form.message}
                onChange={handleChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
            </div>
            <div className="reveal" style={{ opacity: 0 }}>
              <button
                type="submit"
                style={{
                  border: "1px solid rgba(255,255,255,0.2)",
                  background: "transparent",
                  color: "#f5f5f0",
                  padding: "16px 36px",
                  fontSize: "11px",
                  letterSpacing: "2.5px",
                  textTransform: "uppercase",
                  cursor: "none",
                  transition: "all 0.3s",
                  fontFamily: "'DM Sans', sans-serif",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.45)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; }}
              >
                Send Message
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
