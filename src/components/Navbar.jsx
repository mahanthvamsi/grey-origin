import { useEffect, useRef } from "react";
import { gsap } from "gsap";

export default function Navbar() {
  const nav = useRef(null);

  useEffect(() => {
    gsap.fromTo(
      nav.current.children,
      { opacity: 0, y: -16 },
      { opacity: 1, y: 0, duration: 0.8, stagger: 0.15, delay: 0.3, ease: "power3.out" }
    );
  }, []);

  return (
    <nav
      ref={nav}
      style={{ mixBlendMode: "difference" }}
      className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-6 md:px-12 py-5 md:py-7"
    >
      <span className="bebas text-lg md:text-xl tracking-widest text-white">Grey Origin</span>
      <ul className="flex gap-5 md:gap-9 list-none">
        {["Work", "About", "Contact"].map((item) => (
          <li key={item}>
            <a
              href={`#${item.toLowerCase()}`}
              className="text-white text-xs tracking-widest uppercase opacity-60 hover:opacity-100 transition-opacity duration-300"
            >
              {item}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}