import { useEffect, useRef } from 'react';
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'motion/react';
import { LuBriefcase, LuGraduationCap } from 'react-icons/lu';
import IconBadge from '../components/ui/IconBadge';
import Section from '../components/ui/Section';
import Reveal, { RevealGroup, RevealItem } from '../components/ui/Reveal';
import { education, experience } from '../data/experience';

const labelClass = 'font-display text-xs font-semibold tracking-[0.14em] text-accent uppercase';

/** Circular badge on the timeline: the organization's logo, or its initials as a fallback. */
const OrgBadge = ({ logo, initials, organization }) => (
  <span className="absolute top-0 -left-6 flex size-12 items-center justify-center overflow-hidden rounded-full border border-line bg-surface ring-4 ring-surface shadow-[0_0_18px_-4px_rgb(159_143_129/0.5)]">
    {logo ? (
      <img src={logo} alt={`${organization} logo`} className="size-full bg-white object-contain p-1" />
    ) : (
      <span aria-hidden className="font-display text-xs font-bold tracking-wide text-accent-strong">
        {initials}
      </span>
    )}
  </span>
);

/** Track plus a taupe line that draws down it as the timeline scrolls past, led by a glowing tip. */
const DrawnLine = ({ target }) => {
  const { scrollYProgress } = useScroll({ target, offset: ['start 0.75', 'end 0.5'] });
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 });
  const tipTop = useTransform(progress, (v) => `${v * 100}%`);

  return (
    <>
      <span aria-hidden className="absolute inset-y-0 left-0 w-px bg-line" />
      <motion.span
        aria-hidden
        style={{ scaleY: progress }}
        className="absolute inset-y-0 left-0 w-px origin-top bg-linear-to-b from-accent/40 to-accent-strong"
      />
      <motion.span
        aria-hidden
        style={{ top: tipTop }}
        className="absolute left-0 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-strong shadow-[0_0_14px_4px_rgb(201_188_175/0.55)]"
      />
    </>
  );
};

const Timeline = ({ title, icon: Icon, entries }) => {
  const listRef = useRef(null);

  return (
    <div>
      <Reveal as="h3" className="group flex items-center gap-3 font-display text-xl font-semibold text-white">
        <IconBadge icon={Icon} />
        {title}
      </Reveal>

      <RevealGroup as="ol" ref={listRef} className="relative mt-8 ml-6 space-y-12">
        <DrawnLine target={listRef} />
        {entries.map(({ role, organization, logo, initials, period, points }) => (
          <RevealItem as="li" key={role} className="relative min-h-12 pl-12">
            <OrgBadge logo={logo} initials={initials} organization={organization} />
            <p className={labelClass}>{period}</p>
            <h4 className="mt-2 font-display text-lg leading-snug font-semibold text-white sm:text-xl">{role}</h4>
            <p className="mt-1 text-stone-300">{organization}</p>
            {points.length > 0 && (
              <ul className="mt-4 space-y-2.5 text-sm leading-relaxed text-stone-400 sm:text-base">
                {points.map((point) => (
                  <li key={point} className="flex gap-3">
                    <span aria-hidden className="mt-2.5 size-1 shrink-0 rounded-full bg-accent" />
                    {point}
                  </li>
                ))}
              </ul>
            )}
          </RevealItem>
        ))}
      </RevealGroup>
    </div>
  );
};

const clamp01 = (v) => Math.min(Math.max(v, 0), 1);

// Inside the circle, re-point the muted palette one step lighter (labels, dates, descriptions, bullets).
const DIMENSION_TEXT =
  '[--color-accent:var(--color-accent-strong)] [--color-stone-400:var(--color-stone-300)] [--color-stone-300:var(--color-stone-200)]';

// Lags behind the scroll a little and settles with a touch of give.
const CIRCLE_SPRING = { stiffness: 110, damping: 18, mass: 0.8 };

/** The circle for the current scroll position, in viewport pixels ({ radius, cy }), or null when hidden. */
const circleFor = (el) => {
  const r = el.getBoundingClientRect();
  const vh = window.innerHeight;
  const cover = Math.hypot(window.innerWidth, vh) / 2 + 40;
  // Dot appears as the top enters; full once the top is 15% down the screen, so landing on #experience (just under the
  // navbar) always shows it already covering everything.
  const open = clamp01((0.95 * vh - r.top) / (0.8 * vh));
  // Stays full while you read, shrinks as the section leaves, and is completely gone once the bottom is within 15% of
  // the top (at least 80px), so landing on the next section (just under the navbar) never shows a leftover dot.
  const goneAt = Math.max(0.15 * vh, 80);
  const close = clamp01((0.6 * vh - r.bottom) / (0.6 * vh - goneAt));
  if (close >= 1 || r.top > vh) return null;
  const size = open * open * (1 - close) ** 2; // ease in on both ends
  // Starts at the section's top edge, settles in the middle of the screen, and leaves with the section's bottom edge.
  const cy = Math.min(Math.max(vh / 2, r.top), Math.max(r.bottom, 0));
  return { radius: 14 + size * cover, cy, top: r.top };
};

/**
 * Experience lives in another "dimension": a warm gray-taupe circle that starts as a dot at the section's top edge,
 * grows over the neighbouring sections until it fills the screen, then shrinks back to a dot and vanishes as the
 * section leaves. The circle is a fixed full-screen layer drawn above About and Certifications; Experience's
 * content sits above it, masked by the same circle.
 */
const Experience = () => {
  const ref = useRef(null);
  const reduceMotion = useReducedMotion();
  const { scrollY } = useScroll();

  // Where the circle should be for this scroll position...
  const targetRadius = useMotionValue(0);
  const targetCy = useMotionValue(0);
  const contentTop = useMotionValue(0);
  // ...and where it is: it trails behind the scroll on a spring (like the cursor ring), then settles.
  const radius = useSpring(targetRadius, CIRCLE_SPRING);
  const cy = useSpring(targetCy, CIRCLE_SPRING);

  // In-page links glide to their section; during that glide the circle tracks the scroll exactly (no lag), so it's
  // already full when you land on Experience and already gone when you land on the next section.
  const linkGlideUntil = useRef(0);
  useEffect(() => {
    const onClick = (e) => {
      if (e.target.closest?.('a[href^="#"], a[data-section]')) linkGlideUntil.current = performance.now() + 3500;
    };
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, []);

  useMotionValueEvent(scrollY, 'change', () => {
    if (!ref.current) return;
    const c = circleFor(ref.current);
    contentTop.set(ref.current.getBoundingClientRect().top);
    targetRadius.set(c ? c.radius : 0);
    if (c) targetCy.set(c.cy); // keep the last centre while hidden so it doesn't jump
    if (performance.now() < linkGlideUntil.current) {
      radius.jump(targetRadius.get());
      cy.jump(targetCy.get());
    }
  });
  const backdrop = useMotionTemplate`circle(${radius}px at 50% ${cy}px)`;
  // Same circle in the content's own coordinates (the content itself scrolls normally, so no spring on its top).
  const maskCy = useTransform(() => cy.get() - contentTop.get());
  const mask = useMotionTemplate`circle(${radius}px at 50% ${maskCy}px)`;

  const section = (
    <Section
      id="experience"
      eyebrow="02 — Experience"
      title="Where I've grown"
      description="Hands-on internship experience in front-end engineering, backed by a degree in web and mobile applications."
      // The circle's gray-taupe is lighter than the page, so muted text steps up one shade inside it.
      className={DIMENSION_TEXT}
    >
      <div className="grid gap-14 lg:grid-cols-2 lg:gap-16">
        <Timeline title="Work Experience" icon={LuBriefcase} entries={experience} />
        <Timeline title="Education" icon={LuGraduationCap} entries={education} />
      </div>
    </Section>
  );

  if (reduceMotion) return <div className="bg-dimension">{section}</div>;

  return (
    <div className="relative">
      {/* z-20 puts the circle over the neighbouring sections (z auto) but under the navbar */}
      <motion.div
        aria-hidden
        style={{ clipPath: backdrop }}
        className="pointer-events-none fixed inset-0 z-20 bg-dimension"
      />
      <motion.div ref={ref} style={{ clipPath: mask }} className="relative z-30">
        {section}
      </motion.div>
    </div>
  );
};

export default Experience;
