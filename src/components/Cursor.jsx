import { useEffect, useRef } from "react";

export default function Cursor() {
  const dot = useRef(null);
  const ring = useRef(null);

  useEffect(() => {
    let mouseX = 0, mouseY = 0;
    let ringX = 0, ringY = 0;
    let rafId;

    const move = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      // Dot follows instantly
      dot.current.style.left = mouseX + "px";
      dot.current.style.top = mouseY + "px";
    };

    const lerp = (a, b, t) => a + (b - a) * t;

    const animate = () => {
      // Ring lerps toward mouse - creates the natural lag effect
      ringX = lerp(ringX, mouseX, 0.12);
      ringY = lerp(ringY, mouseY, 0.12);
      ring.current.style.left = ringX + "px";
      ring.current.style.top = ringY + "px";
      rafId = requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", move);
    rafId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", move);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <>
      <div ref={dot} className="cursor" />
      <div ref={ring} className="cursor-follower" />
    </>
  );
}
