import { useEffect, useState } from 'react';

/**
 * Returns the id of the section currently crossing a line a fifth down the viewport (high enough that a short section a
 * link has just landed on still counts). When several do, the one furthest down
 * the page wins. An element with `data-section-of="<id>"` counts as part of that section (the desk film and the stretch
 * before it).
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
        const crossingIds = new Set([...crossing].map((el) => el.dataset.sectionOf || el.id));
        const current = ids.findLast((id) => crossingIds.has(id));
        if (current) setActiveId(current);
      },
      { rootMargin: '-20% 0px -75% 0px' },
    );

    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
      document.querySelectorAll(`[data-section-of="${id}"]`).forEach((part) => observer.observe(part));
    });

    return () => observer.disconnect();
  }, [ids]);

  return activeId;
};

export default useActiveSection;
