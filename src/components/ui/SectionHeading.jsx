import { Fragment, useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { RevealGroup, RevealItem } from './Reveal';
import ScrollBand from './ScrollBand';

// Each title word fades up whole and sharpens into place; the group's stagger plays them in sequence. No mask: a
// word caught mid-rise behind one showed only the tops of its letters, like cut-off stumps.
const wordRise = {
  hidden: { opacity: 0, y: '0.3em', filter: 'blur(8px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } },
};

const MaskedTitle = ({ text }) =>
  text.split(' ').map((word, i) => (
    // The space sits outside the word's inline-block, which would otherwise swallow it
    <Fragment key={`${word}-${i}`}>
      <motion.span variants={wordRise} className="inline-block">
        {word}
      </motion.span>{' '}
    </Fragment>
  ));

/**
 * The chapter numeral ("01"): a huge outlined number behind the heading. As the section arrives it sweeps in
 * from the side and firms up, then drifts slower than the page, so moving down the page feels like turning
 * chapters. Off for reduced motion (it just sits there).
 */
const ChapterNumber = ({ value, target, centered }) => {
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target, offset: ['start end', 'end start'] });
  // Arrival: 0 as the heading enters at the bottom of the screen, 1 once it's two-fifths of the way up.
  const arrive = useTransform(scrollYProgress, (p) => (reduceMotion ? 1 : Math.min(1, p / 0.4)));
  const x = useTransform(arrive, (a) => `${(1 - a) * (centered ? 0 : 40)}%`);
  const y = useTransform(scrollYProgress, (p) => (reduceMotion ? 0 : 70 - p * 140));
  const scale = useTransform(arrive, (a) => (centered ? 0.85 + 0.15 * a : 1));
  // A function transform, so motion keeps it on the JS side (a plain opacity map can stick, see the footer).
  const opacity = useTransform(arrive, (a) => 0.15 + 0.85 * a);

  return (
    <motion.span
      aria-hidden
      // useCleanAnchorLinks keeps it clear of the navbar when a link lands on the section
      data-chapter
      style={{ x, y, scale, opacity }}
      className={`pointer-events-none absolute -top-20 -z-10 font-heading text-[9rem] leading-none font-black text-transparent [-webkit-text-stroke:1.5px_color-mix(in_oklab,var(--color-accent)_40%,transparent)] select-none sm:-top-28 sm:text-[13rem] lg:-top-36 lg:text-[17rem] ${
        centered ? 'left-1/2 -translate-x-1/2' : 'right-0'
      }`}
    >
      {value}
    </motion.span>
  );
};

/**
 * "Focus reveal": the title starts blurred and spread out, then sharpens and tightens into place as it scrolls up
 * to reading height; it reverses going back up. Off for reduced motion.
 */
const useFocusReveal = (enabled, target) => {
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target, offset: ['start end', 'start 0.35'] });
  const on = enabled && !reduceMotion;
  const ease = (p) => 1 - (1 - p) ** 2;
  const filter = useTransform(scrollYProgress, (p) => (on ? `blur(${(1 - ease(p)) * 14}px)` : 'none'));
  const letterSpacing = useTransform(scrollYProgress, (p) => (on ? `${(1 - ease(p)) * 0.22}em` : '0em'));
  const opacity = useTransform(scrollYProgress, (p) => (on ? 0.25 + 0.75 * ease(p) : 1));
  return on ? { filter, letterSpacing, opacity } : undefined;
};

// How large each zoom target may start (it's also capped to what fits the heading's width).
const MAX_ZOOM = { title: 2.6, label: 7 };
// Even, smooth pacing (ease in and out) so it visibly settles over the whole pinned stretch.
const smooth = (t) => t * t * (3 - 2 * t);

/**
 * `zoom="title"` or `zoom="label"`: that text starts oversized and shrinks into place, scrubbed by the scroll (it
 * grows back when you scroll up). The heading pins just under the navbar (navbar + section padding) and stays there
 * over a stretch of scroll (`runway`) while the zoom plays, then scrolls on with the page. A navbar link lands at the
 * end of that stretch (`data-landing`), with the zoom already settled. It only grows as large as fits the heading's
 * width, so it never overflows. Everything else in the heading (title when the label zooms, description,
 * action) fades in as it settles. Off for reduced motion.
 */
const useHeadingZoom = (mode, runwayRef, pinRef, groupRef, textRef) => {
  const reduceMotion = useReducedMotion();
  const active = Boolean(mode) && !reduceMotion;
  const { scrollY } = useScroll();
  // 0 while the heading approaches its pin spot, 1 once the pinned stretch has been scrolled through.
  const progress = useTransform(scrollY, () => {
    const runway = runwayRef.current;
    const pin = pinRef.current;
    if (!active || !runway || !pin) return 1;
    const travel = runway.offsetHeight - pin.offsetHeight;
    const pinTop = parseFloat(getComputedStyle(pin).top) || 0;
    return Math.min(1, Math.max(0, (pinTop - runway.getBoundingClientRect().top) / Math.max(travel, 1)));
  });
  const scale = useTransform(progress, (p) => {
    if (!active || !groupRef.current || !textRef.current) return 1;
    const fit = groupRef.current.offsetWidth / Math.max(textRef.current.offsetWidth, 1);
    const max = Math.max(1, Math.min(MAX_ZOOM[mode], fit));
    return 1 + (max - 1) * (1 - smooth(p));
  });
  const fadeIn = useTransform(progress, [0.55, 1], active ? [0, 1] : [1, 1]);
  return { active, scale, fadeIn };
};

// `play` (optional) reveals on cue instead of on scroll; see RevealGroup. `align="center"` centres the heading.
// `focus` sharpens the title in with the scroll; `bleed` turns it into a full-width band that slides sideways.
const SectionHeading = ({ eyebrow, title, description, action, play, align, zoom, focus, bleed }) => {
  const centered = align === 'center';
  const origin = centered ? 'origin-top' : 'origin-top-left';
  const ref = useRef(null);
  const titleText = useRef(null);
  const runway = useRef(null);
  const pin = useRef(null);
  const { active, scale, fadeIn } = useHeadingZoom(zoom, runway, pin, ref, titleText);
  const focusStyle = useFocusReveal(focus, ref);
  // "01 — About": only the number is used, for the outlined chapter number behind the title. The small spaced label
  // ("ABOUT") was removed at the owner's request (it read as an AI-template formula repeated on every section).
  const number = eyebrow?.includes(' — ') ? eyebrow.split(' — ')[0] : null;

  const heading = (
    <RevealGroup
      ref={ref}
      stagger={0.08}
      play={play}
      className={`relative flex flex-wrap gap-6 ${centered ? 'flex-col items-center text-center' : 'items-end justify-between'}`}
    >
      {/* Always at the right, even on a centred heading, so every section's number lines up down the page */}
      {number && !bleed && <ChapterNumber value={number} target={ref} />}
      <div className={`min-w-0 ${bleed ? 'w-full' : 'max-w-5xl'} ${centered ? 'mx-auto' : ''}`}>
        {bleed ? (
          // Wordmark bleed: the title as a full-width band of huge type sliding sideways with the scroll
          <h2 aria-label={title} className="text-white">
            <ScrollBand items={[title]} className="text-[clamp(4.5rem,15vw,14rem)]" />
          </h2>
        ) : (
          <motion.h2
            aria-label={title}
            style={zoom === 'title' ? { scale } : zoom === 'label' ? { opacity: fadeIn } : focusStyle}
            className={`font-heading text-[clamp(3.25rem,10vw,8.5rem)] leading-[0.88] font-black tracking-[0.005em] text-balance text-white uppercase ${origin}`}
          >
            <span ref={titleText} aria-hidden className="inline-block">
              <MaskedTitle text={title} />
            </span>
          </motion.h2>
        )}
        {description && (
          <RevealItem
            as="p"
            className={`mt-5 max-w-2xl text-base leading-relaxed text-pretty text-stone-400 sm:text-lg ${centered ? 'mx-auto' : ''}`}
          >
            <motion.span style={{ opacity: fadeIn }} className="block">
              {description}
            </motion.span>
          </RevealItem>
        )}
      </div>
      {action && (
        <RevealItem>
          <motion.div style={{ opacity: fadeIn }}>{action}</motion.div>
        </RevealItem>
      )}
    </RevealGroup>
  );

  if (!active) return heading;
  // Zooming: the heading pins where a navbar link lands it (3rem lower than the section's top padding would put it,
  // so the big outlined number above it clears the navbar) while the spacer below it scrolls past; the zoom is
  // scrubbed over that stretch. The section must not be overflow-hidden
  // (use overflow-clip), or sticky stops working.
  return (
    <div ref={runway} className="relative">
      <div ref={pin} className="sticky top-48 z-10 sm:top-56">
        {heading}
      </div>
      <div aria-hidden className="h-[70svh]" />
      {/* Where a navbar link lands: the end of the pinned stretch (70svh minus the pin's distance below the navbar), so a
        click arrives with the zoom already settled. useCleanAnchorLinks glides to [data-landing] when present. */}
      <span
        data-landing
        data-landing-exact
        aria-hidden
        className="absolute top-[calc(70svh-8rem)] sm:top-[calc(70svh-10rem)]"
      />
    </div>
  );
};

export default SectionHeading;
