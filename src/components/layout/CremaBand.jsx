import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from 'motion/react';
import Hold from './Hold';
import stratum from '../ui/stratum';

const clamp01 = (v) => Math.min(Math.max(v, 0), 1);
const smooth = (x) => x * x * (3 - 2 * x);

/**
 * Flood entrance, part one: one giant word in crema floats on the page's own smoky background (no box of its own,
 * so the smoke runs straight on from the hero). It fades up and sharpens as it arrives and holds still while the
 * band (pulled up over the runway's last screen) rises with its wavy crema edge (`WaveEdge`). Where the crema has
 * reached it the word turns to ink, as if dipped in it. Then, as the section's heading comes up with the crema, the
 * word shrinks and flies onto that heading's own copy of the word ("WORK" of "Selected work") and hands over to it,
 * so the big word becomes the title instead of being covered. Scroll-scrubbed, so it all reverses going back up.
 * It replaced the word being covered by the crema (a navbar trip made that sharp: fast, frozen, fast), a zoom into
 * the "O" (dizzying, said a classmate) and two flooding layers that filled the screen before the content came.
 * `section` is the id of the section it leads into, so the navbar highlights that one during the stretch.
 */
const Flood = ({ word, section }) => {
  const runway = useRef(null);
  const layer = useRef(null);
  const text = useRef(null);
  // The word's arrival, over the screen of scrolling before it pins
  const { scrollYProgress: arrival } = useScroll({ target: runway, offset: ['start end', 'start start'] });
  const enter = (p) => clamp01((p - 0.35) / 0.5);
  const wordOpacity = useTransform(arrival, (p) => enter(p));
  const wordBlur = useTransform(arrival, (p) => `blur(${(1 - enter(p)) * 12}px)`);
  const wordY = useTransform(arrival, (a) => `${(1 - enter(a)) * 6}svh`);

  // Every scroll frame: fly the word onto the heading's word as that comes up with the crema
  const { scrollY } = useScroll();
  const place = () => {
    const w = text.current;
    if (!w || !layer.current) return;
    const vh = window.innerHeight;
    const target = document.querySelector(`#${section} [data-word="${word.toLowerCase()}"]`);
    // The flight: 0 as the heading's word comes up from the bottom of the screen, 1 when it's 30% down; then the
    // real heading takes over
    const t = target?.getBoundingClientRect();
    const q = t ? clamp01((vh - t.top) / (vh * 0.7)) : 0;
    const landed = q >= 1;
    layer.current.style.visibility = landed ? 'hidden' : '';
    if (target) {
      target.style.visibility = landed ? '' : 'hidden';
      // The heading's other words ("Selected") wait, then fade in beside it as it lands, so the big word never
      // runs into them. Through the colour's alpha: their opacity belongs to the heading's reveal animation.
      const ink = getComputedStyle(target.parentElement)
        .color.match(/[\d.]+/g)
        .slice(0, 3)
        .join(' ');
      const alpha = landed ? null : clamp01((q - 0.65) / 0.35);
      target.parentElement.querySelectorAll('[data-word]').forEach((other) => {
        if (other !== target) other.style.color = alpha === null ? '' : `rgb(${ink} / ${alpha})`;
      });
    }
    const e = smooth(q);
    // Its layout box (transforms don't move it), in screen coordinates: the layer is fixed at the top left
    const scale = t ? 1 + (t.height / w.offsetHeight - 1) * e : 1;
    const dx = t ? (t.left - w.offsetLeft) * e : 0;
    const dy = t ? (t.top - w.offsetTop) * e : 0;
    w.style.transform = `translate(${dx}px, ${dy}px) scale(${scale})`;
  };
  useMotionValueEvent(scrollY, 'change', place);
  useLayoutEffect(() => {
    place();
    window.addEventListener('resize', place);
    return () => window.removeEventListener('resize', place);
  });
  // Give the heading's words back if this ever unmounts
  useEffect(
    () => () => {
      const target = document.querySelector(`#${section} [data-word="${word.toLowerCase()}"]`);
      if (!target) return;
      target.style.visibility = '';
      target.parentElement.querySelectorAll('[data-word]').forEach((other) => (other.style.color = ''));
    },
    [section, word],
  );

  return (
    <div ref={runway} aria-hidden data-section-of={section} className="relative h-[230svh]">
      {/* A navbar glide into the section goes through the whole thing at one calm, steady pace (from the word's
          arrival until it has landed on the heading), instead of rushing it. Rejected before: stopping dead on the
          word for a second, then a quick flood (fast, frozen, fast) */}
      <div
        data-slow-glide="1.8"
        data-slow-between={`hero ${section}`}
        className="pointer-events-none absolute inset-x-0 -top-[65svh] h-[310svh]"
      />
      {/* Fixed, above the rising band, so the word stays on top of the crema while it flies to the heading. It's
          blended with `difference`, so it shows light over the dark page and dark wherever the crema is behind it,
          following the wave's exact edge, as if dipped in it. Its colour is crema minus the band's ink (#e6ddd2 -
          #1a1714), so over the crema it comes out exactly the heading's ink and the hand-off doesn't show. */}
      <div ref={layer} className="pointer-events-none fixed inset-0 z-20 mix-blend-difference">
        <motion.div
          style={{ opacity: wordOpacity, filter: wordBlur, y: wordY }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <span
            ref={text}
            className="inline-block origin-top-left font-heading text-[min(34vw,60svh)] leading-[0.88] font-black tracking-[0.005em] text-[#ccc6be] uppercase"
          >
            {word}
          </span>
        </motion.div>
      </div>
    </div>
  );
};

/**
 * The band's wavy edge: a rolling crema wave like the Skills strata (the same edge from `stratum`, redrawn at 30fps
 * while on screen, plus its own `animate-sway`), with a soft shadow on its dark side. Its box reaches 16svh past the
 * band and overlaps the band's own crema, so the edge is all you see of it.
 * `bottom` hangs it upside down off the band's bottom edge instead, so the band ends in a wave into the next section.
 */
const WaveEdge = ({ bottom = false }) => {
  const box = useRef(null);
  const path = useRef(null);
  const shadowPath = useRef(null);
  useEffect(() => {
    let frame = 0;
    let visible = false;
    let last = 0;
    const start = performance.now();
    const tick = (now) => {
      frame = visible && !document.hidden ? requestAnimationFrame(tick) : 0;
      if (now - last < 1000 / 30) return;
      last = now;
      const d = stratum(5.1, (now - start) / 1000, -0.9);
      path.current?.setAttribute('d', d);
      shadowPath.current?.setAttribute('d', d);
    };
    const wake = () => {
      if (visible && !document.hidden && !frame) frame = requestAnimationFrame(tick);
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      wake();
    });
    if (box.current) observer.observe(box.current);
    document.addEventListener('visibilitychange', wake);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      document.removeEventListener('visibilitychange', wake);
    };
  }, []);

  const sway = { '--sway-x': '120px', '--sway-y': '12px', animationDuration: '11s', animationDelay: '-8s' };
  return (
    <div
      ref={box}
      aria-hidden
      className={`pointer-events-none absolute -inset-x-[30%] h-[60svh] ${bottom ? '-bottom-[16svh] -scale-y-100' : '-top-[16svh]'}`}
    >
      {/* The shadow: a blurred dark copy of the wave just past its edge */}
      <svg
        viewBox="0 0 2000 1000"
        preserveAspectRatio="none"
        style={sway}
        className="absolute inset-x-0 -top-2.5 h-full w-full animate-sway blur-[9px]"
      >
        <path ref={shadowPath} d={stratum(5.1, 0, -0.9)} className="fill-espresso/35" />
      </svg>
      <svg
        viewBox="0 0 2000 1000"
        preserveAspectRatio="none"
        style={sway}
        className="absolute inset-0 size-full animate-sway"
      >
        <path ref={path} d={stratum(5.1, 0, -0.9)} className="fill-crema" />
      </svg>
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
        <motion.div style={{ opacity, scale, transformOrigin: origin }}>{children}</motion.div>
      </div>
      {/* Counts as part of the section for the navbar */}
      <div aria-hidden data-section-of={section} className="h-[65svh]" />
    </div>
  );
};

/**
 * A light "crema" stretch of the page between dark sections. `tone-light` re-points the palette for everything
 * inside (see index.css), so the sections in it render light without their own styling; `bg-ink` here therefore
 * paints crema (behind the content only, so the flood stretch shows the page's smoke). `flood` adds the flood
 * entrance (wavy layers rising over the given word, skipped for reduced motion); by default its content recedes as
 * the band leaves the screen; `waveOut` instead ends the band in the same wave, hanging into the next section,
 * with the content simply scrolling on, and 30svh of the page after it so the wave is off screen where a navbar link
 * lands on the next section. `tuck` pulls the band up a screen behind the section before it (the Experience drop),
 * so the drop can close while that section's last content is still scrolling, with crema already behind it. `hold` ("end" or "start") pauses the content while the Experience drop plays over it, and
 * `landingFor` sets where a navbar link lands (see Hold). `lightsDown` (true, or { flyTo }) replaces the recede with the
 * "lights down" exit into a dark section (see LightsDown). Holds and lights down are skipped for reduced motion.
 */
const CremaBand = ({ flood, hold, landingFor, lightsDown, waveOut, tuck, children }) => {
  // `tuck` is the id of the section it tucks behind
  const reduceMotion = useReducedMotion();
  const bg = useMotionValue(1);
  const fades = lightsDown && !reduceMotion;
  const flooding = flood && !reduceMotion;
  const content = fades || waveOut ? children : <Recede>{children}</Recede>;
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
    <div className={`tone-light relative ${tuck && !reduceMotion ? '-mt-[100svh]' : ''}`}>
      {flooding && <Flood {...flood} />}
      {/* The tucked screen still belongs to the section in front for the navbar */}
      {tuck && !reduceMotion && (
        <span aria-hidden data-section-claim={tuck} className="pointer-events-none absolute inset-x-0 top-0 h-svh" />
      )}
      {/* The crema sits behind the content only (the flood stretch above it stays see-through to the smoke), as
          its own layer so lights down can fade it. With the flood it's pulled up a screen, so it rises over the
          pinned word, led by its wavy edge. */}
      <div className={`relative ${flooding ? '-mt-[100svh]' : ''}`}>
        {flooding && <WaveEdge />}
        {waveOut && <WaveEdge bottom />}
        <motion.div aria-hidden data-nav-light style={{ opacity: bg }} className="absolute inset-0 bg-ink" />
        {fades && hold === 'start' && landingFor && (
          <span
            aria-hidden
            data-landing-for={landingFor}
            data-landing-exact
            className="pointer-events-none absolute top-[calc(110svh-3.75rem)] h-px w-px"
          />
        )}
        <div className="relative">
          {/* The rising crema itself fills the screen: a stretch of solid band between its wave and the content,
              so by the time a navbar link lands on the section the wave has already risen past the top */}
          {flooding && <div aria-hidden className="h-[30svh]" />}
          {fades ? (
            <LightsDown bg={bg} section={landingFor} flyTo={lightsDown.flyTo}>
              {held}
            </LightsDown>
          ) : (
            held
          )}
        </div>
      </div>
      {/* Room for the wave hanging off the bottom, so a link landing on the next section never shows its edge. It
          still counts as this band's section for the navbar (unclaimed, the pinned hero won and it read "Home") */}
      {waveOut && !reduceMotion && <div aria-hidden data-section-of={landingFor} className="h-[30svh]" />}
    </div>
  );
};

export default CremaBand;
