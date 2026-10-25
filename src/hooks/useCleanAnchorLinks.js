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
// Scroll cue) play it out instead of flashing past. Roughly 1 s per 1100 px, between 1 s and 2.2 s: past about 2.5
// screens the time stops growing, so far trips move faster (2.8 s made trips across the page drag).
const glide = (distance) => ({
  duration: Math.min(2.2, Math.max(1, Math.abs(distance) / 1100)),
  easing: (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2), // easeInOutCubic
});

// Smooth, never-reversing curve through points [t, x] (monotone cubic, Fritsch–Carlson), flat at both ends so the
// glide eases in and out
const monotone = (points) => {
  const n = points.length;
  const slope = [];
  for (let i = 0; i < n - 1; i += 1) {
    slope.push((points[i + 1][1] - points[i][1]) / (points[i + 1][0] - points[i][0]));
  }
  const tangent = points.map((_, i) =>
    i === 0 || i === n - 1 || slope[i - 1] * slope[i] <= 0 ? 0 : (slope[i - 1] + slope[i]) / 2,
  );
  for (let i = 0; i < n - 1; i += 1) {
    if (slope[i] === 0) continue;
    const a = tangent[i] / slope[i];
    const b = tangent[i + 1] / slope[i];
    const h = a * a + b * b;
    if (h > 9) {
      tangent[i] = (3 / Math.sqrt(h)) * a * slope[i];
      tangent[i + 1] = (3 / Math.sqrt(h)) * b * slope[i];
    }
  }
  return (t) => {
    let i = 0;
    while (i < n - 2 && t > points[i + 1][0]) i += 1;
    const [t0, x0] = points[i];
    const [t1, x1] = points[i + 1];
    const h = t1 - t0;
    const s = (t - t0) / h;
    return (
      (2 * s ** 3 - 3 * s ** 2 + 1) * x0 +
      (s ** 3 - 2 * s ** 2 + s) * h * tangent[i] +
      (-2 * s ** 3 + 3 * s ** 2) * x1 +
      (s ** 3 - s ** 2) * h * tangent[i + 1]
    );
  };
};

// A scroll-scrubbed transition can ask link glides that pass through it to spend `data-slow-glide` seconds on it
// (the Certifications → Skills flight: a plain glide sped through it in about 0.6 s), when it starts or ends next to
// it (within 2 screens in all). The glide then runs at its
// usual pace up to it, at a steady, slower pace through it and at its usual pace after it, as one continuous motion
// with no stop. Returns the glide's options, or null when it doesn't cross one.
const slowGlide = (distance, targetId) => {
  const from = window.scrollY;
  const to = from + distance;
  const region = [...document.querySelectorAll('[data-slow-glide]')].find((el) => {
    const top = from + el.getBoundingClientRect().top;
    const bottom = top + el.offsetHeight - window.innerHeight;
    return Math.max(from, to) > top && Math.min(from, to) < bottom;
  });
  if (!region) return null;
  const top = from + region.getBoundingClientRect().top;
  const bottom = top + region.offsetHeight - window.innerHeight;
  const total = Math.abs(distance);
  // Distances along the glide to where it enters and leaves the region
  const enter = Math.min(total, Math.max(0, distance > 0 ? top - from : from - bottom));
  const leave = Math.min(total, Math.max(enter, distance > 0 ? bottom - from : from - top));
  // Only between neighbours: a glide that just passes through on the way somewhere further (Skills → About) keeps
  // its normal pace, or every far trip would sit through the whole transition. A region can name its two sections
  // (`data-slow-between`): then it applies whenever the glide goes from one to the other, however tall they are (a
  // tall Skills put the film more than 2 screens away, so Skills ↔ Contact skipped it); otherwise only when there's
  // under 2 screens of travel outside it.
  const between = region.dataset.slowBetween?.split(' ');
  if (between) {
    const mid = window.innerHeight / 2;
    const holdsMiddle = (el) => {
      const r = el?.getBoundingClientRect();
      return Boolean(r) && r.top <= mid && r.bottom >= mid;
    };
    const fromOk = holdsMiddle(region) || between.some((id) => holdsMiddle(document.getElementById(id)));
    if (!fromOk || !between.includes(targetId)) return null;
  } else if (enter + (total - leave) > 2 * window.innerHeight) return null;
  // The stretches before and after it at the usual pace, but never dragging (a tall section made them long)
  const pace = (px) => (px > 0 ? Math.min(1.2, Math.max(0.5, px / 1100)) : 0);
  const times = [pace(enter), parseFloat(region.dataset.slowGlide) || 2, pace(total - leave)];
  const duration = times[0] + times[1] + times[2];
  const points = [[0, 0]];
  if (times[0]) points.push([times[0] / duration, enter / total]);
  if (times[2]) points.push([(times[0] + times[1]) / duration, leave / total]);
  points.push([1, 1]);
  return { duration, easing: monotone(points) };
};

// The glide in progress (one at a time)
let glideFrame = 0;
const stopGlide = () => {
  cancelAnimationFrame(glideFrame);
  glideFrame = 0;
};

/**
 * Glides to `destination()` (a scroll position) over `duration` s with `easing`, re-measuring the destination every
 * frame. Lenis' own scrollTo measures it once at the start; on long glides something above the target changed
 * height on the way (lazy images, the bands), so it landed off and then had to correct itself, which felt like a
 * recoil. Wheel, touch or a key stop the glide so the visitor keeps control.
 */
const run = (lenis, destination, { duration, easing }) => {
  stopGlide();
  const from = window.scrollY;
  const start = performance.now();
  const step = (now) => {
    const t = Math.min(1, (now - start) / 1000 / duration);
    lenis.scrollTo(from + (destination() - from) * easing(t), { immediate: true, force: true });
    glideFrame = t < 1 ? requestAnimationFrame(step) : 0;
  };
  glideFrame = requestAnimationFrame(step);
};

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
          run(lenis, () => 0, glide(window.scrollY));
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
      // A section can mark a different landing spot (Skills: past its pinned heading zoom, already settled), inside
      // it or, from outside, with data-landing-for (Certifications: past the pause where the Experience circle leaves).
      const landing =
        target.querySelector('[data-landing]') ?? document.querySelector(`[data-landing-for="${target.id}"]`) ?? target;
      const offset = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
      // Land high enough that the section's big outlined number (it sits above the heading) clears the navbar
      // too, with a little room; landing the section's top under the navbar cut most of them off
      // (not for a spot marked `data-landing-exact`, where the heading is pinned)
      const chapter = 'landingExact' in landing.dataset ? null : target.querySelector('[data-chapter]');
      const spot = () => {
        const top = landing.getBoundingClientRect().top;
        return chapter ? Math.min(top, chapter.getBoundingClientRect().top - 16) : top;
      };
      const distance = spot() - offset;
      run(lenis, () => window.scrollY + spot() - offset, slowGlide(distance, target.id) ?? glide(distance));
    };

    // An old /Portfolio/#hero bookmark lands on the clean address too.
    if (window.location.hash === '#hero') {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }

    document.addEventListener('click', onClick);
    const interrupt = ['wheel', 'touchstart', 'keydown'];
    interrupt.forEach((type) => window.addEventListener(type, stopGlide, { passive: true }));
    return () => {
      document.removeEventListener('click', onClick);
      interrupt.forEach((type) => window.removeEventListener(type, stopGlide));
      stopGlide();
    };
  }, []);
};

export default useCleanAnchorLinks;
