import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, MotionConfig } from 'motion/react';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Preloader from './components/layout/Preloader';
import Band from './components/layout/Band';
import { introSeen, markIntroSeen } from './components/layout/intro';
import useCleanAnchorLinks from './hooks/useCleanAnchorLinks';
import useSmoothScroll, { getLenis, setScrollLocked } from './hooks/useSmoothScroll';
import Hero from './sections/Hero';
import Education from './sections/Education';
import Experience from './sections/Experience';
import Certifications from './sections/Certifications';
import Skills from './sections/Skills';
import Projects from './sections/Projects';
import Contact from './sections/Contact';

// reducedMotion="user" turns off transform animations for visitors who prefer reduced motion.
const App = () => {
  // The coffee intro plays once per visit (browser tab session)
  const [loading, setLoading] = useState(!introSeen);
  const finishLoading = useCallback(() => {
    markIntroSeen();
    setLoading(false);
  }, []);
  useSmoothScroll(); // must run before the lock below so the scroller exists
  useCleanAnchorLinks();

  // Keep the page from scrolling behind the preloader.
  useEffect(() => {
    setScrollLocked(loading);
  }, [loading]);

  // Opening a link such as /#contact: the browser looks for the section before React has drawn it, so go there once the
  // page is shown. A reload keeps its place instead.
  useEffect(() => {
    if (loading || performance.getEntriesByType('navigation')[0]?.type === 'reload') return;
    const target = window.location.hash.length > 1 && document.getElementById(window.location.hash.slice(1));
    if (!target) return;
    document.fonts.ready.then(() => {
      const offset = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      const lenis = getLenis();
      if (lenis) lenis.scrollTo(top, { immediate: true, force: true });
      else window.scrollTo(0, top);
    });
  }, [loading]);

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence>{loading && <Preloader onDone={finishLoading} />}</AnimatePresence>

      <a
        href="#main"
        className="sr-only z-60 rounded-full bg-accent px-5 py-2.5 font-display text-sm font-semibold text-ink focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>
      <Navbar ready={!loading} />
      {/* overflow-x-clip stops slide-in reveals from widening the page on phones */}
      <main id="main" tabIndex={-1} className="overflow-x-clip outline-none">
        <Hero ready={!loading} />
        {/* Sections simply follow one another, alternating between the page and a shade off it. The only scroll-driven
            transition is the desk film from Skills into Contact. */}
        <Band wave>
          <Projects />
        </Band>
        <Experience />
        <Education />
        <Band>
          <Certifications />
        </Band>
        <Skills />
        <Contact />
      </main>
      <Footer />
    </MotionConfig>
  );
};

export default App;
