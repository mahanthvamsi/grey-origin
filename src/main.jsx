import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import Lenis from 'lenis'

// ── Lenis smooth scroll ──────────────────────────────────────────
// Initialised here so it's global and affects every page.
// GSAP ScrollTrigger is wired to Lenis's scroll position
// so all existing scroll animations stay perfectly in sync.

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const lenis = new Lenis({
  // Expose on window so components can pause/resume

  duration: 1.2,          // how long a scroll gesture takes to settle
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // expo ease out
  orientation: 'vertical',
  smoothWheel: true,
  wheelMultiplier: 1,
  touchMultiplier: 1.5,
})

window.__lenis = lenis;

// Keep GSAP ScrollTrigger in sync with Lenis
lenis.on('scroll', ScrollTrigger.update)

gsap.ticker.add((time) => {
  lenis.raf(time * 1000)
})

gsap.ticker.lagSmoothing(0)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)