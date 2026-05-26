import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";

export default function AdminLogin() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const inputStyle = {
    width: "100%", background: "transparent",
    border: "none", borderBottom: "1px solid rgba(255,255,255,0.15)",
    padding: "14px 0", color: "#f5f5f0",
    fontSize: "14px", outline: "none",
    fontFamily: "'DM Sans', sans-serif",
    transition: "border-color 0.3s",
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch {
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "#080808",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "24px",
    }}>
      <div style={{ width: "100%", maxWidth: "400px" }}>
        <div style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: "42px", letterSpacing: "4px",
          color: "#f5f5f0", marginBottom: "8px",
        }}>
          Grey Origin
        </div>
        <div style={{
          fontSize: "11px", letterSpacing: "3px", textTransform: "uppercase",
          color: "rgba(255,255,255,0.3)", marginBottom: "48px",
        }}>
          Admin Access
        </div>

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
          <input
            required type="email" placeholder="Email"
            value={email} onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
            onFocus={(e) => { e.target.style.borderBottomColor = "rgba(255,255,255,0.5)"; }}
            onBlur={(e)  => { e.target.style.borderBottomColor = "rgba(255,255,255,0.15)"; }}
          />
          <input
            required type="password" placeholder="Password"
            value={password} onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
            onFocus={(e) => { e.target.style.borderBottomColor = "rgba(255,255,255,0.5)"; }}
            onBlur={(e)  => { e.target.style.borderBottomColor = "rgba(255,255,255,0.15)"; }}
          />

          {error && (
            <p style={{ fontSize: "12px", color: "#e63c3c", letterSpacing: "1px" }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: "8px",
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.2)",
              color: "#f5f5f0", padding: "16px",
              fontSize: "11px", letterSpacing: "2.5px",
              textTransform: "uppercase", cursor: "none",
              fontFamily: "'DM Sans', sans-serif",
              transition: "all 0.3s",
              opacity: loading ? 0.5 : 1,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.45)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
