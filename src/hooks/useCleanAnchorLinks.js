import { useEffect } from 'react';
import { getLenis } from './useSmoothScroll';

/**
 * Props for an in-page link: `<a {...sectionLink('projects')}>`.
 * Section links are normal `#id` anchors, except Home: it points at the plain site URL so the
 * hover preview and address bar show `/Portfolio/` instead of `/Portfolio/#hero`.
 */
export const sectionLink = (id) =>
  id === 'hero' ? { href: import.meta.env.BASE_URL, 'data-section': 'hero' } : { href: `#${id}` };

// Link glides take longer the further they travel, so jumps that pass through the hero's dive (e.g. the
// Scroll cue) play it out instead of flashing past. Roughly 1 s per 1100 px, between 1 s and 2.8 s.
const glide = (distance) => ({
  duration: Math.min(2.8, Math.max(1, Math.abs(distance) / 1100)),
  easing: (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2), // easeInOutCubic
});

/**
 * Routes in-page link clicks through the smooth scroller (Lenis) when it's active.
 * Home scrolls to the top and clears any hash; other links glide to their section and keep `#id`.
 */
const useCleanAnchorLinks = () => {
  useEffect(() => {
    const onClick = (e) => {
      // Let ctrl/cmd/shift/middle clicks behave like normal links (open the site in a new tab).
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const link = e.target.closest('a[data-section], a[href^="#"]');
      if (!link) return;

      const id = link.dataset.section ?? link.getAttribute('href').slice(1);
      const lenis = getLenis();

      if (id === 'hero') {
        e.preventDefault();
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
        if (lenis) {
          lenis.start(); // see note below
          lenis.scrollTo(0, glide(window.scrollY));
        } else {
          window.scrollTo({ top: 0 });
        }
        return;
      }

      // Without the smooth scroller (reduced motion), the browser's own anchor jump is fine.
      const target = document.getElementById(id);
      if (!lenis || !target) return;

      e.preventDefault();
      window.history.pushState(null, '', `#${id}`);
      // Resume first if the phone menu paused scrolling: resuming later (when the menu closes) would
      // cancel this scroll. Lenis reads `scroll-padding-top`, so the navbar offset comes from CSS.
      lenis.start();
      // A section can mark a different landing spot (Skills: past its pinned heading zoom, already settled).
      const landing = target.querySelector('[data-landing]') ?? target;
      lenis.scrollTo(landing, glide(landing.getBoundingClientRect().top));
    };

    // An old /Portfolio/#hero bookmark lands on the clean address too.
    if (window.location.hash === '#hero') {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }

    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);
};

export default useCleanAnchorLinks;
