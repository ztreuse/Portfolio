import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, MotionConfig, useReducedMotion } from 'motion/react';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Preloader from './components/layout/Preloader';
import Smoke from './components/layout/Smoke';
import CremaBand from './components/layout/CremaBand';
import Hold from './components/layout/Hold';
import useCleanAnchorLinks from './hooks/useCleanAnchorLinks';
import useSmoothScroll, { setScrollLocked } from './hooks/useSmoothScroll';
import Hero from './sections/Hero';
import About from './sections/About';
import Experience from './sections/Experience';
import Certifications from './sections/Certifications';
import Skills from './sections/Skills';
import Projects from './sections/Projects';
import Contact from './sections/Contact';

// reducedMotion="user" turns off transform animations for visitors who prefer reduced motion.
const App = () => {
  const [loading, setLoading] = useState(true);
  const finishLoading = useCallback(() => setLoading(false), []);
  const reduceMotion = useReducedMotion();
  useSmoothScroll(); // must run before the lock below so the scroller exists
  useCleanAnchorLinks();

  // Keep the page from scrolling behind the preloader.
  useEffect(() => {
    setScrollLocked(loading);
  }, [loading]);

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence>{loading && <Preloader onDone={finishLoading} />}</AnimatePresence>

      <Navbar ready={!loading} />
      {/* overflow-x-clip stops slide-in reveals from widening the page on phones */}
      <main className="overflow-x-clip">
        <Hero ready={!loading} />
        {/* The rest of the page slides up over the pinned hero. Its top is a fade (part of the panel, so it
            starts below the first screen and moves with it), which means there's never a hard edge. */}
        <div className="relative z-10">
          {/* No fade at the panel's top: the hero has already faded to ink by the time the panel slides up, so the edge
              is invisible. Only for reduced motion (no dive, so the hero is still visible) is there a short soft edge. */}
          <div
            aria-hidden
            className="pointer-events-none hidden h-36 bg-linear-to-b from-transparent to-ink motion-reduce:block"
          />
          {/* Transparent so the smoke (behind) shows through; the hero has faded to ink before this covers it. With
              reduced motion there's no dive, so the panel keeps its solid ink to cover the still-visible hero. */}
          <div data-panel className="motion-reduce:bg-ink">
            {/* Projects comes first, straight after the hero, because it's what recruiters look for first. Its crema
                band rises over WORK behind a wavy edge and ends in the same wave, hanging into About. Dark and light
                alternate: the credentials sit on crema too, between the dark sections; the Experience coffee drop
                spreads over the end of About and closes over Certifications. */}
            <CremaBand flood={{ word: 'Work', section: 'projects' }} landingFor="projects" waveOut>
              <Projects />
            </CremaBand>
            {/* About's last screen holds still while the Experience drop spreads over it */}
            {reduceMotion ? (
              <About />
            ) : (
              <Hold edge="end">
                <About />
              </Hold>
            )}
            <Experience />
            <CremaBand tuck="experience" hold="start" landingFor="certifications" lightsDown={{ flyTo: [0.72, 0.3] }}>
              <Certifications />
            </CremaBand>
            <Skills />
            <Contact />
          </div>
        </div>
      </main>
      {/* WebGL smoke behind everything after the hero, footer included: above the pinned hero (z-5) but below the
          section panel and the footer (both z-10, transparent) */}
      <Smoke />
      <Footer />
    </MotionConfig>
  );
};

export default App;
