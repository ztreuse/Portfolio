import { useEffect, useState } from 'react';

/**
 * Returns the id of the section currently crossing the middle of the viewport. When several do
 * (the pinned hero stays under About while it slides over), the one furthest down the page wins.
 * An element with `data-section-of="<id>"` counts as part of that section (e.g. the flood stretch before Projects).
 * An element with `data-section-claim="<id>"` wins outright while it crosses the middle: Certifications' band is
 * tucked up behind the end of Experience, which should still read as Experience.
 */
const useActiveSection = (ids) => {
  const [activeId, setActiveId] = useState(ids[0]);

  useEffect(() => {
    const crossing = new Set();
    const observer = new IntersectionObserver(
      (entries) => {
        // Tracked per element: a section and its parts share an id, and one leaving mustn't drop the other
        entries.forEach((entry) => {
          if (entry.isIntersecting) crossing.add(entry.target);
          else crossing.delete(entry.target);
        });
        const claim = [...crossing].find((el) => el.dataset.sectionClaim)?.dataset.sectionClaim;
        const crossingIds = new Set([...crossing].map((el) => el.dataset.sectionOf || el.id));
        const current = claim || ids.findLast((id) => crossingIds.has(id));
        if (current) setActiveId(current);
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );

    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
      document
        .querySelectorAll(`[data-section-of="${id}"], [data-section-claim="${id}"]`)
        .forEach((part) => observer.observe(part));
    });

    return () => observer.disconnect();
  }, [ids]);

  return activeId;
};

export default useActiveSection;
