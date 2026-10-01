import { useEffect } from 'react';

/**
 * Props for an in-page link: `<a {...sectionLink('projects')}>`.
 * Section links are normal `#id` anchors, except Home: it points at the plain site URL so the
 * hover preview and address bar show `/Portfolio/` instead of `/Portfolio/#hero`.
 */
export const sectionLink = (id) =>
  id === 'hero' ? { href: import.meta.env.BASE_URL, 'data-section': 'hero' } : { href: `#${id}` };

/** Scrolls Home links back to the top and clears any `#section` from the address bar. */
const useCleanAnchorLinks = () => {
  useEffect(() => {
    const onClick = (e) => {
      // Let ctrl/cmd/shift/middle clicks behave like normal links (open the site in a new tab).
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (!e.target.closest('a[data-section="hero"]')) return;

      e.preventDefault();
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
      const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
      window.scrollTo({ top: 0, behavior });
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
