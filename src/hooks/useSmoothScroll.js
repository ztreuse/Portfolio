import { useEffect } from 'react';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

let lenis = null;

/** The active smooth-scroll instance, or null (touch screens, reduced motion, or not started yet). */
export const getLenis = () => lenis;

// Pause or resume page scrolling (preloader, open phone menu).
export const setScrollLocked = (locked) => {
  if (lenis) {
    if (locked) lenis.stop();
    else lenis.start();
  } else {
    document.documentElement.style.overflow = locked ? 'hidden' : '';
  }
};

/**
 * Weighted, eased page scrolling (Lenis); in-page links are routed to it by useCleanAnchorLinks.
 * Skipped for visitors who prefer reduced motion, and on touch screens, whose own scrolling is already smooth (Lenis
 * there only adds a frame loop).
 */
const useSmoothScroll = () => {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce), (pointer: coarse)').matches) return undefined;

    lenis = new Lenis({ autoRaf: true, lerp: 0.1 });
    return () => {
      lenis.destroy();
      lenis = null;
    };
  }, []);
};

export default useSmoothScroll;
