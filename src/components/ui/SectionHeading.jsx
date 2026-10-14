import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { RevealGroup, RevealItem } from './Reveal';

// Each title word rises from behind its own mask; the group's stagger plays them in sequence.
const wordRise = {
  hidden: { y: '110%' },
  visible: { y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } },
};

const MaskedTitle = ({ text }) =>
  text.split(' ').map((word, i) => (
    <span key={`${word}-${i}`} className="-mb-[0.12em] inline-block overflow-hidden pb-[0.12em] align-top">
      <motion.span variants={wordRise} className="inline-block">
        {word}
        {' '}
      </motion.span>
    </span>
  ));

/** Oversized faint section number ("01") behind the title, drifting slower than the page. */
const GhostNumber = ({ value, target, centered }) => {
  const { scrollYProgress } = useScroll({ target, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [70, -70]);

  return (
    <motion.span
      aria-hidden
      style={{ y }}
      className={`pointer-events-none absolute -top-16 -z-10 font-display text-[8rem] leading-none font-bold text-white/[0.04] select-none sm:-top-20 sm:text-[11rem] lg:-top-24 lg:text-[13rem] ${
        centered ? 'left-1/2 -translate-x-1/2' : '-left-3'
      }`}
    >
      {value}
    </motion.span>
  );
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
const SectionHeading = ({ eyebrow, title, description, action, play, align, zoom }) => {
  const centered = align === 'center';
  const origin = centered ? 'origin-top' : 'origin-top-left';
  const ref = useRef(null);
  const titleText = useRef(null);
  const labelText = useRef(null);
  const runway = useRef(null);
  const pin = useRef(null);
  const { active, scale, fadeIn } = useHeadingZoom(zoom, runway, pin, ref, zoom === 'label' ? labelText : titleText);
  // "01 — About": the number only drives the faint ghost number behind the title; the label shows just "About".
  const [number, label] = eyebrow?.includes(' — ') ? eyebrow.split(' — ') : [null, eyebrow];

  const heading = (
    <RevealGroup
      ref={ref}
      stagger={0.08}
      play={play}
      className={`relative flex flex-wrap gap-6 ${centered ? 'flex-col items-center text-center' : 'items-end justify-between'}`}
    >
      {number && <GhostNumber value={number} target={ref} centered={centered} />}
      <div className={`max-w-2xl ${centered ? 'mx-auto' : ''}`}>
        {eyebrow && (
          <RevealItem
            as="p"
            className="font-display text-xs font-semibold tracking-[0.14em] text-accent uppercase sm:text-sm"
          >
            <motion.span
              ref={labelText}
              style={zoom === 'label' ? { scale } : undefined}
              className={`inline-block ${origin}`}
            >
              {label}
            </motion.span>
          </RevealItem>
        )}
        <motion.h2
          aria-label={title}
          style={zoom === 'title' ? { scale } : zoom === 'label' ? { opacity: fadeIn } : undefined}
          className={`mt-3 font-display text-3xl font-bold tracking-[-0.05em] text-balance text-white sm:text-4xl lg:text-5xl ${origin}`}
        >
          <span ref={titleText} aria-hidden className="inline-block">
            <MaskedTitle text={title} />
          </span>
        </motion.h2>
        {description && (
          <RevealItem as="p" className="mt-4 text-base leading-relaxed text-pretty text-stone-400 sm:text-lg">
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
  // Zooming: the heading pins where a navbar link lands it (64px navbar + the section's top padding) while the
  // spacer below it scrolls past; the zoom is scrubbed over that stretch. The section must not be overflow-hidden
  // (use overflow-clip), or sticky stops working.
  return (
    <div ref={runway} className="relative">
      <div ref={pin} className="sticky top-36 z-10 sm:top-44">
        {heading}
      </div>
      <div aria-hidden className="h-[70svh]" />
      {/* Where a navbar link lands: the end of the pinned stretch (70svh minus the section's top padding), so a
        click arrives with the zoom already settled. useCleanAnchorLinks glides to [data-landing] when present. */}
      <span data-landing aria-hidden className="absolute top-[calc(70svh-5rem)] sm:top-[calc(70svh-7rem)]" />
    </div>
  );
};

export default SectionHeading;
