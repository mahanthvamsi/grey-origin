import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Cursor from "./components/Cursor";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Work from "./components/Work";
import About from "./components/About";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import WorkPage from "./components/WorkPage";
import VideoPage from "./components/VideoPage";
import Admin from "./components/Admin";
import NotFound from "./components/NotFound";
import { Routes, Route, useLocation } from "react-router-dom";

gsap.registerPlugin(ScrollTrigger);

function HomePage() {
  useEffect(() => {
    const sections = document.querySelectorAll("section[id]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute("id");
            window.history.replaceState(null, "", id === "home" ? "/" : `#${id}`);
          }
        });
      },
      { threshold: 0.2 }
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <Hero />
      <Work />
      <About />
      <Contact />
      <Footer />
    </>
  );
}

export default function App() {
const location = useLocation();
  const isAdmin = location.pathname === "/admin";

  return (
    <>
      <Cursor />
      {!isAdmin && <Navbar />}
      <Routes>
        <Route path="/"              element={<HomePage />} />
        <Route path="/work"          element={<WorkPage />} />
        <Route path="/work/:slug"    element={<VideoPage />} />
        <Route path="/admin"         element={<Admin />} />
        <Route path="*"              element={<NotFound />} />
      </Routes>
    </>
  );
}
