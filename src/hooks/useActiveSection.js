import { useEffect, useState } from 'react';

/**
 * Returns the id of the section currently crossing the middle of the viewport. When several do
 * (the pinned hero stays under About while it slides over), the one furthest down the page wins.
 */
const useActiveSection = (ids) => {
  const [activeId, setActiveId] = useState(ids[0]);

  useEffect(() => {
    const crossing = new Set();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) crossing.add(entry.target.id);
          else crossing.delete(entry.target.id);
        });
        const current = ids.findLast((id) => crossing.has(id));
        if (current) setActiveId(current);
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );

    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [ids]);

  return activeId;
};

export default useActiveSection;
