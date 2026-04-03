export default function Footer() {
  return (
    <footer style={{
      padding: "clamp(28px, 4vh, 40px) clamp(24px, 5vw, 48px)",
      borderTop: "1px solid rgba(255,255,255,0.07)",
      background: "#080808",
      display: "flex",
      flexWrap: "wrap",
      gap: "16px",
      justifyContent: "space-between",
      alignItems: "center",
    }}>
      <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "18px", letterSpacing: "3px", color: "rgba(255,255,255,0.5)" }}>
        Grey Origin
      </span>
      <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.2)", letterSpacing: "1px" }}>
        © {new Date().getFullYear()} Grey Origin. All rights reserved.
      </span>
      <div style={{ display: "flex", gap: "24px" }}>
        {["Instagram", "YouTube"].map((s) => (
          <a
            key={s}
            href="https://www.instagram.com/_moneesh/"
            style={{ fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", textDecoration: "none", transition: "color 0.3s" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.8)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.35)"; }}
          >
            {s}
          </a>
        ))}
      </div>
    </footer>
  );
}
