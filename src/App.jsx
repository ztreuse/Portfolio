import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, MotionConfig } from 'motion/react';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Preloader from './components/layout/Preloader';
import Cursor from './components/layout/Cursor';
import Smoke from './components/layout/Smoke';
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
  useSmoothScroll(); // must run before the lock below so the scroller exists
  useCleanAnchorLinks();

  // Keep the page from scrolling behind the preloader.
  useEffect(() => {
    setScrollLocked(loading);
  }, [loading]);

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence>{loading && <Preloader onDone={finishLoading} />}</AnimatePresence>

      <Cursor />
      <Navbar ready={!loading} />
      {/* overflow-x-clip stops slide-in reveals from widening the page on phones */}
      <main className="overflow-x-clip">
        <Hero ready={!loading} />
        {/* The rest of the page slides up over the pinned hero. Its top is a fade (part of the panel, so it
            starts below the first screen and moves with it), which means there's never a hard edge. */}
        <div className="relative z-10">
          {/* No fade at the panel's top: the hero has already faded to ink by the time About slides up, so the edge
              is invisible. Only for reduced motion (no dive, so the hero is still visible) is there a short soft edge. */}
          <div aria-hidden className="pointer-events-none hidden h-36 bg-linear-to-b from-transparent to-ink motion-reduce:block" />
          {/* Transparent so the smoke (behind) shows through; the hero has faded to ink before this covers it. With
              reduced motion there's no dive, so the panel keeps its solid ink to cover the still-visible hero. */}
          <div className="motion-reduce:bg-ink">
            <About />
            <Experience />
            <Certifications />
            <Skills />
            <Projects />
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
