import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase";
import AdminLogin from "./AdminLogin";
import AdminDashboard from "./AdminDashboard";

const TIMEOUT_MS = 30 * 60 * 1000;
const WARNING_MS =  2 * 60 * 1000;

// ── Loading screen ────────────────────────────────────────────
function AdminLoader() {
  const [progress, setProgress] = useState(0);
  const [label, setLabel]       = useState("Authenticating");

  useEffect(() => {
    const steps = [
      { to: 30, label: "Authenticating",    ms: 300  },
      { to: 60, label: "Loading Projects",  ms: 500  },
      { to: 85, label: "Preparing Dashboard", ms: 400 },
      { to: 100, label: "Ready",            ms: 300  },
    ];

    let current = 0;
    let frame;

    const runStep = (stepIndex) => {
      if (stepIndex >= steps.length) return;
      const { to, label, ms } = steps[stepIndex];
      setLabel(label);

      const start     = current;
      const startTime = performance.now();

      const tick = (now) => {
        const elapsed = now - startTime;
        const t       = Math.min(elapsed / ms, 1);
        const eased   = 1 - Math.pow(1 - t, 3); // cubic ease out
        current = Math.round(start + (to - start) * eased);
        setProgress(current);
        if (t < 1) {
          frame = requestAnimationFrame(tick);
        } else {
          setTimeout(() => runStep(stepIndex + 1), 80);
        }
      };
      frame = requestAnimationFrame(tick);
    };

    runStep(0);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div style={{
      position: "fixed", inset: 0, background: "#080808",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      fontFamily: "'DM Sans', sans-serif",
      zIndex: 9999,
    }}>
      {/* Wordmark */}
      <div style={{
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: "clamp(28px,4vw,40px)",
        letterSpacing: "6px",
        color: "#f5f5f0",
        marginBottom: "clamp(40px,6vh,64px)",
      }}>
        Grey Origin
      </div>

      {/* Progress bar track */}
      <div style={{
        width: "clamp(200px,30vw,320px)",
        height: "1px",
        background: "rgba(255,255,255,0.08)",
        position: "relative",
        marginBottom: "20px",
      }}>
        {/* Filled bar */}
        <div style={{
          position: "absolute", top: 0, left: 0,
          height: "100%",
          width: `${progress}%`,
          background: "rgba(255,255,255,0.6)",
          transition: "width 0.05s linear",
        }} />
        {/* Glowing tip */}
        <div style={{
          position: "absolute", top: "-2px",
          left: `${progress}%`,
          transform: "translateX(-50%)",
          width: "4px", height: "5px",
          background: "#f5f5f0",
          boxShadow: "0 0 8px rgba(255,255,255,0.8)",
          transition: "left 0.05s linear",
        }} />
      </div>

      {/* Label + percentage */}
      <div style={{
        display: "flex", justifyContent: "space-between",
        width: "clamp(200px,30vw,320px)",
      }}>
        <span style={{
          fontSize: "10px", letterSpacing: "2.5px",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.3)",
        }}>
          {label}
        </span>
        <span style={{
          fontSize: "10px", letterSpacing: "2px",
          color: "rgba(255,255,255,0.25)",
          fontVariantNumeric: "tabular-nums",
        }}>
          {progress}%
        </span>
      </div>
    </div>
  );
}

// ── Main Admin gate ───────────────────────────────────────────
export default function Admin() {
  const [user, setUser]       = useState(undefined);
  const [loading, setLoading] = useState(true);
  const [warning, setWarning] = useState(false);
  const navigate              = useNavigate();
  const timeoutRef            = useRef(null);
  const warningRef            = useRef(null);

  // Sign out on unmount (back, forward, any nav away)
  useEffect(() => {
    return () => { signOut(auth); };
  }, []);

  // Auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      // Small delay so the progress animation has time to complete
      setTimeout(() => setLoading(false), 400);
    });
    return unsub;
  }, []);

  // Inactivity timeout
  useEffect(() => {
    if (!user) return;

    const resetTimers = () => {
      setWarning(false);
      clearTimeout(timeoutRef.current);
      clearTimeout(warningRef.current);

      warningRef.current = setTimeout(() => {
        setWarning(true);
      }, TIMEOUT_MS - WARNING_MS);

      timeoutRef.current = setTimeout(async () => {
        await signOut(auth);
        navigate("/", { replace: true });
      }, TIMEOUT_MS);
    };

    const events = ["mousemove", "mousedown", "keydown", "touchstart", "scroll"];
    events.forEach((e) => window.addEventListener(e, resetTimers));
    resetTimers();

    return () => {
      events.forEach((e) => window.removeEventListener(e, resetTimers));
      clearTimeout(timeoutRef.current);
      clearTimeout(warningRef.current);
    };
  }, [user, navigate]);

  if (loading) return <AdminLoader />;

  return (
    <>
      {/* Inactivity warning */}
      {warning && user && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 9999,
          background: "rgba(200,169,110,0.12)",
          borderBottom: "1px solid rgba(200,169,110,0.3)",
          padding: "12px clamp(24px,4vw,48px)",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          gap: "16px", flexWrap: "wrap",
          fontFamily: "'DM Sans', sans-serif",
        }}>
          <span style={{ fontSize: "12px", letterSpacing: "1px", color: "#c8a96e" }}>
            You'll be signed out in 2 minutes due to inactivity.
          </span>
          <button
            onClick={() => setWarning(false)}
            style={{
              background: "transparent", border: "1px solid rgba(200,169,110,0.4)",
              color: "#c8a96e", padding: "6px 16px", fontSize: "10px",
              letterSpacing: "2px", textTransform: "uppercase", cursor: "none",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Stay Signed In
          </button>
        </div>
      )}

      {user ? <AdminDashboard /> : <AdminLogin />}
    </>
  );
}