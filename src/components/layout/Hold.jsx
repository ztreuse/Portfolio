import { useLayoutEffect, useRef, useState } from 'react';

/**
 * Holds a section's content still for a stretch of scrolling while the Experience circle plays over it, instead of
 * adding empty space. `edge="end"`: the content's last screen stays put (its bottom on the screen's bottom) for 120%
 * of a screen while the Experience drop spreads over it. `edge="start"`: its first screen stays put (its top just under the
 * navbar, `top-31`, so its big outlined number clears it and lines up with the other sections') for 110% of a screen while the drop draws back. It's a sticky element followed by a spacer it slides over,
 * so nothing blank ever shows. `landingFor` (a section id) adds the spot a navbar link to that section glides to,
 * fixed in the page while the content itself moves: past the hold for "start" (so it lands with the drop gone), the
 * content's real top for "end" (after the hold the sticky content sits lower, and a link measuring it landed
 * mid-drop).
 */
const Hold = ({ edge, landingFor, children }) => {
  const ref = useRef(null);
  const [top, setTop] = useState(0);

  // Pinning the bottom edge needs the content's height: top = screen height - content height
  useLayoutEffect(() => {
    if (edge !== 'end') return undefined;
    const measure = () => ref.current && setTop(window.innerHeight - ref.current.offsetHeight);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(ref.current);
    window.addEventListener('resize', measure);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [edge]);

  return (
    <div className="relative">
      {landingFor && (
        <span
          aria-hidden
          data-landing-for={landingFor}
          // Where the start hold lets go: land exactly here (the pinned heading never moves during the hold, so
          // chasing its chapter number landed at the start of the hold, inside the coffee drop)
          data-landing-exact={edge === 'start' ? '' : undefined}
          className={`pointer-events-none absolute h-px w-px ${edge === 'start' ? 'top-[calc(110svh-3.75rem)]' : 'top-0'}`}
        />
      )}
      <div ref={ref} style={edge === 'end' ? { top } : undefined} className={`sticky ${edge === 'start' ? 'top-31' : ''}`}>
        {children}
      </div>
      <div aria-hidden className={edge === 'end' ? 'h-[120svh]' : 'h-[110svh]'} />
    </div>
  );
};

export default Hold;
