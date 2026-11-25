import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, MotionConfig } from 'motion/react';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Preloader from './components/layout/Preloader';
import CremaBand from './components/layout/CremaBand';
import { introSeen, markIntroSeen } from './components/layout/intro';
import useCleanAnchorLinks from './hooks/useCleanAnchorLinks';
import useSmoothScroll, { setScrollLocked } from './hooks/useSmoothScroll';
import Hero from './sections/Hero';
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

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence>{loading && <Preloader onDone={finishLoading} />}</AnimatePresence>

      <Navbar ready={!loading} />
      {/* overflow-x-clip stops slide-in reveals from widening the page on phones */}
      <main className="overflow-x-clip">
        <Hero ready={!loading} />
        {/* Sections simply follow one another, light and dark alternating. The only scroll-driven transition left is
            the desk film from Skills into Contact. */}
        <CremaBand wave>
          <Projects />
        </CremaBand>
        <Experience />
        <CremaBand>
          <Certifications />
        </CremaBand>
        <Skills />
        <Contact />
      </main>
      <Footer />
    </MotionConfig>
  );
};

export default App;
