import { useLayoutEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from 'motion/react';

/**
 * Zoom-through entrance: a pinned stretch before the band where one giant word in crema floats on the page's own
 * smoky background (no box of its own, so the smoke runs straight on from the section before, with no edge). The
 * word fades up and sharpens as it arrives; scrolling then zooms into one letter's thick left stroke (to about
 * 14x, where it fills most of the screen) while the crema fades in over the whole screen, and you land in the band.
 * The word is scaled around a point in that stroke. Reverses going back up. Much past 14x the browser stops
 * drawing the text (it vanished at 90x), which is why the crema fades in instead of zooming all the way.
 * `section` is the id of the section it leads into, so the navbar highlights that one during the stretch.
 */
const ZoomThrough = ({ word, letter, section }) => {
  const runway = useRef(null);
  const text = useRef(null);
  const group = useRef(null);
  const [origin, setOrigin] = useState({ x: 500, y: 300 });
  const { scrollYProgress } = useScroll({ target: runway, offset: ['start start', 'end end'] });
  // The word's arrival, over the screen of scrolling before the stretch pins
  const { scrollYProgress: arrival } = useScroll({ target: runway, offset: ['start end', 'start start'] });

  // Find the letter to fly through, once the font has loaded and laid the word out
  useLayoutEffect(() => {
    const measure = () => {
      const el = text.current;
      if (!el) return;
      const box = el.getExtentOfChar(letter);
      // Aim at the middle of the letter's left stroke, not its counter (the hole, which shows the smoke).
      // Measured for Big Shoulders' "O": the stroke spans about 7% to 38% of the character box.
      setOrigin({ x: box.x + box.width * 0.23, y: box.y + box.height * 0.5 });
    };
    measure();
    document.fonts?.ready.then(measure);
  }, [letter]);

  const enter = (p) => Math.min(1, Math.max(0, (p - 0.35) / 0.5));
  const wordOpacity = useTransform(arrival, (p) => enter(p));
  const wordBlur = useTransform(arrival, (p) => `blur(${(1 - enter(p)) * 12}px)`);
  const wordY = useTransform(arrival, (p) => (1 - enter(p)) * 40);

  // Slow at first (you read the word), then rushing in: 14x by 85% of the stretch, while the crema fades in over
  // the last third so it takes the whole screen
  const scale = useTransform(scrollYProgress, (p) => {
    const t = Math.min(1, Math.max(0, (p - 0.1) / 0.75));
    return 1 + 13 * t ** 2.2;
  });
  const fill = useTransform(scrollYProgress, (p) => Math.min(1, Math.max(0, (p - 0.62) / 0.3)));
  const apply = (s) =>
    group.current?.setAttribute(
      'transform',
      `translate(${origin.x} ${origin.y}) scale(${s}) translate(${-origin.x} ${-origin.y})`,
    );
  useMotionValueEvent(scale, 'change', apply);
  useLayoutEffect(() => apply(scale.get()));

  return (
    <div ref={runway} aria-hidden data-section-of={section} className="relative h-[200svh]">
      <div className="sticky top-0 h-svh overflow-hidden">
        <svg viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid meet" className="size-full overflow-visible">
          <motion.g style={{ opacity: wordOpacity, filter: wordBlur, y: wordY }}>
            <g ref={group}>
              <text
                ref={text}
                x="500"
                y="300"
                textAnchor="middle"
                dominantBaseline="central"
                className="fill-crema font-heading text-[330px] font-black uppercase"
              >
                {word}
              </text>
            </g>
          </motion.g>
        </svg>
        {/* data-nav-light: the navbar turns to light glass over it (see Navbar) */}
        <motion.div data-nav-light style={{ opacity: fill }} className="absolute inset-0 bg-crema" />
      </div>
    </div>
  );
};

/**
 * Recede exit: as the band leaves the top of the screen, its content (not its background) shrinks back a little and
 * dims, like it's sinking away, while the dark section below follows straight on. It takes no extra space and the
 * crema stays full width, so no dark sides show. It starts once the band's bottom edge is 70% of the way up the
 * screen, so it never touches what you're still reading. Reverses going back up; still for reduced motion.
 */
const Recede = ({ children }) => {
  const ref = useRef(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['end end', 'end start'] });
  const t = (p) => (reduceMotion ? 0 : Math.min(1, Math.max(0, (p - 0.3) / 0.7)));
  const scale = useTransform(scrollYProgress, (p) => 1 - 0.08 * t(p));
  // A function transform, so motion keeps it on the JS side (a plain opacity map can stick, see the footer)
  const opacity = useTransform(scrollYProgress, (p) => 1 - 0.75 * t(p));

  return (
    <motion.div ref={ref} style={{ scale, opacity }} className="origin-[50%_100%]">
      {children}
    </motion.div>
  );
};

/**
 * Holds the band's content still for a stretch of scrolling while the Experience circle plays over it, instead of
 * adding empty space. `edge="end"`: the content's last screen stays put (its bottom on the screen's bottom) for 120%
 * of a screen while the Experience drop spreads over it. `edge="start"`: its first screen stays put (its top just under the
 * navbar, `top-29`, so its big outlined number clears it and lines up with the other sections') for 110% of a screen while the drop draws back. It's a sticky element followed by a spacer it slides over,
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
          className={`pointer-events-none absolute h-px w-px ${edge === 'start' ? 'top-[calc(110svh-3.25rem)]' : 'top-0'}`}
        />
      )}
      <div ref={ref} style={edge === 'end' ? { top } : undefined} className={`sticky ${edge === 'start' ? 'top-29' : ''}`}>
        {children}
      </div>
      <div aria-hidden className={edge === 'end' ? 'h-[120svh]' : 'h-[110svh]'} />
    </div>
  );
};

const clamp01 = (v) => Math.min(Math.max(v, 0), 1);
const smooth = (x) => x * x * (3 - 2 * x);

/**
 * "Lights down" exit: when the band's content ends, it holds still for 65% of a screen of scrolling while the crema
 * behind it fades away evenly (`bg`, the band's background opacity), uncovering the page's dark, smoky background,
 * and the content sinks back a little and fades out. The fade finishes exactly as the band's bottom edge reaches
 * the bottom of the screen, so no edge between the crema and the next dark section ever shows.
 * The hold is `position: sticky` with `top` = screen height − content height (the browser keeps it still on every
 * kind of scroll; an earlier JS transform jittered when dragging the scrollbar). It can wrap content that has its
 * own sticky hold at the top: nested sticky elements each stick within their own parent.
 * `flyTo` ([x, y] as fractions of the screen) turns the sink into a flight toward that point: the content swells
 * away from it, sliding off toward the opposite corner, as if the camera were rushing past it.
 */
const LightsDown = ({ bg, section, flyTo, children }) => {
  const box = useRef(null);
  const content = useRef(null);
  const [top, setTop] = useState(0);
  const opacity = useMotionValue(1);
  const scale = useMotionValue(1);
  const origin = useMotionValue('50% 45%');
  const { scrollY } = useScroll();

  useLayoutEffect(() => {
    const measure = () => content.current && setTop(window.innerHeight - content.current.offsetHeight);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(content.current);
    window.addEventListener('resize', measure);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, []);

  const update = () => {
    const el = box.current;
    if (!el || !content.current) return;
    const vh = window.innerHeight;
    const hold = 0.65 * vh;
    // How far the content's (unpinned) bottom has scrolled up past the bottom of the screen
    const passed = vh - (el.getBoundingClientRect().top + content.current.offsetHeight);
    const p = clamp01(passed / hold);
    // Spread over the whole hold, so the next section follows straight on (finishing early left a dark stretch)
    const fade = smooth(p);
    if (flyTo) {
      // Flying toward a far point on the screen: the content swells away from that point (so it slides off toward
      // the opposite corner) and fades out before the end of the hold
      const [fx, fy] = flyTo;
      const h = content.current.offsetHeight;
      origin.set(`${fx * window.innerWidth}px ${fy * vh + h - vh}px`);
      scale.set(1 + 2.2 * fade ** 1.6);
      opacity.set(1 - smooth(clamp01(p / 0.75)));
    } else {
      opacity.set(1 - fade);
      scale.set(1 - 0.1 * fade);
    }
    bg.set(1 - smooth(p));
  };
  useMotionValueEvent(scrollY, 'change', update);
  useLayoutEffect(update);

  return (
    <div ref={box}>
      <div ref={content} style={{ top }} className="sticky">
        <motion.div style={{ opacity, scale, transformOrigin: origin }}>
          {children}
        </motion.div>
      </div>
      {/* Counts as part of the section for the navbar */}
      <div aria-hidden data-section-of={section} className="h-[65svh]" />
    </div>
  );
};

/**
 * A light "crema" stretch of the page between dark sections. `tone-light` re-points the palette for everything
 * inside (see index.css), so the sections in it render light without their own styling; `bg-ink` here therefore
 * paints crema (behind the content only, so the zoom stretch shows the page's smoke). `zoom` adds the
 * zoom-through entrance (fly through the given word, skipped for reduced motion); its content recedes as the band
 * leaves the screen. `hold` ("end" or "start") pauses the content while the Experience drop plays over it, and
 * `landingFor` sets where a navbar link lands (see Hold). `lightsDown` (true, or { flyTo }) replaces the recede with the
 * "lights down" exit into a dark section (see LightsDown). Holds and lights down are skipped for reduced motion.
 */
const CremaBand = ({ zoom, hold, landingFor, lightsDown, children }) => {
  const reduceMotion = useReducedMotion();
  const bg = useMotionValue(1);
  const fades = lightsDown && !reduceMotion;
  const content = fades ? children : <Recede>{children}</Recede>;
  const held =
    hold && !reduceMotion ? (
      // With lights down the landing marker lives outside the part that slides during the fade (measured there, a
      // link from further down the page landed 200px off)
      <Hold edge={hold} landingFor={fades ? undefined : landingFor}>
        {content}
      </Hold>
    ) : (
      content
    );
  return (
    <div className="tone-light relative">
      {zoom && !reduceMotion && <ZoomThrough {...zoom} />}
      {/* The crema sits behind the content only (the zoom stretch above it stays see-through to the smoke), as
          its own layer so lights down can fade it */}
      <div className="relative">
        <motion.div aria-hidden data-nav-light style={{ opacity: bg }} className="absolute inset-0 bg-ink" />
        {fades && hold === 'start' && landingFor && (
          <span
            aria-hidden
            data-landing-for={landingFor}
            data-landing-exact
            className="pointer-events-none absolute top-[calc(110svh-3.25rem)] h-px w-px"
          />
        )}
        <div className="relative">
          {fades ? (
            <LightsDown bg={bg} section={landingFor} flyTo={lightsDown.flyTo}>
              {held}
            </LightsDown>
          ) : (
            held
          )}
        </div>
      </div>
    </div>
  );
};

export default CremaBand;
