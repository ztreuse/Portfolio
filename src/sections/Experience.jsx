import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useInView,
  useScroll,
  animate,
} from 'motion/react';
import Section from '../components/ui/Section';
import { RevealGroup, RevealItem } from '../components/ui/Reveal';
import { experience } from '../data/experience';
import desk from '../assets/images/desk.webp';

const enterEase = [0.22, 1, 0.36, 1];
const pad2 = (n) => String(n).padStart(2, '0');
// The year a role started, for the big rolling year ("Jan 2026 – Jul 2026" -> "2026")
const startYear = (period) => period.match(/\d{4}/)?.[0] ?? '';

// The logo spins in from a quarter turn as its role arrives
const badgeIn = {
  hidden: { opacity: 0, scale: 0.6, rotate: -90 },
  visible: { opacity: 1, scale: 1, rotate: 0, transition: { duration: 0.8, ease: enterEase } },
};

/** The organization's logo in a round badge, or its initials as a fallback. */
const OrgBadge = ({ logo, initials, organization }) => (
  <motion.span
    variants={badgeIn}
    className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-line bg-surface shadow-[0_0_18px_-4px_rgb(159_143_129/0.5)]"
  >
    {logo ? (
      <img src={logo} alt={`${organization} logo`} className="size-full bg-white object-contain p-1" />
    ) : (
      <span aria-hidden className="font-display text-xs font-bold tracking-wide text-accent-strong">
        {initials}
      </span>
    )}
  </motion.span>
);

/**
 * One role as an editorial row, each detail shown once: on the left the big outlined start year; on the right the
 * company (with its logo) and the dates on one line, the title large and the description as plain paragraphs. A hairline
 * divides it from the row above. It plays in as it arrives: the year sharpens, the logo spins in and the rest rises
 * one by one. Stacked on smaller screens.
 */
const RoleEntry = ({ entry, index }) => {
  const { role, organization, logo, initials, period, points } = entry;
  const ref = useRef(null);
  // The role being read: the one crossing the middle of the screen
  const active = useInView(ref, { margin: '-50% 0px -50% 0px' });

  return (
    <RevealGroup
      ref={ref}
      as="li"
      id={`role-${index + 1}`}
      stagger={0.08}
      className="grid scroll-mt-32 gap-6 border-t border-white/15 pt-10 lg:grid-cols-12 lg:gap-16"
    >
      {/* The year rides along beside its role on wide screens, and fills in solid while that role is being read */}
      <div className="lg:sticky lg:top-32 lg:col-span-4 lg:self-start">
        <RevealItem
          as="p"
          aria-hidden
          className={`font-heading text-[clamp(5rem,9vw,8rem)] leading-[0.85] font-black transition-[color,-webkit-text-stroke-color] duration-700 motion-reduce:transition-none [-webkit-text-stroke-width:1.5px] ${
            active
              ? 'text-accent-strong [-webkit-text-stroke-color:var(--color-accent-strong)]'
              : 'text-transparent [-webkit-text-stroke-color:color-mix(in_oklab,var(--color-accent)_70%,transparent)]'
          }`}
        >
          {startYear(period)}
        </RevealItem>
      </div>

      <div className="lg:col-span-8">
        {/* The role's own header: who and when on one line, so the dates clearly belong to this job */}
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
          <div className="flex items-center gap-4">
            <OrgBadge logo={logo} initials={initials} organization={organization} />
            <RevealItem as="p" className="text-lg font-medium text-stone-200">
              {organization}
            </RevealItem>
          </div>
          <RevealItem
            as="p"
            className="rounded-full border border-accent/35 px-4 py-1.5 font-display text-[0.8125rem] font-bold tracking-[0.14em] text-accent-strong uppercase"
          >
            {period}
            {experience.length > 1 && (
              <span className="text-stone-400">
                {' '}
                · {pad2(index + 1)} / {pad2(experience.length)}
              </span>
            )}
          </RevealItem>
        </div>
        <RevealItem
          as="h3"
          className="mt-5 font-heading text-3xl leading-[0.95] font-extrabold tracking-[0.01em] text-balance text-white uppercase sm:text-4xl lg:text-5xl"
        >
          {role}
        </RevealItem>
        {points.map((point) => (
          <RevealItem as="p" key={point} className="mt-5 max-w-2xl text-base leading-relaxed text-pretty text-stone-300">
            {point}
          </RevealItem>
        ))}
      </div>
    </RevealGroup>
  );
};

/** Work experience, built to grow: one row per role, newest first. New roles go in data/experience.js. */
const Roles = () => (
  <ol className="space-y-16">
    {experience.map((entry, i) => (
      <RoleEntry key={entry.role} entry={entry} index={i} />
    ))}
  </ol>
);

/**
 * Inside the dimension: the owner's desk at night (their own setup, the same scene as the Contact film, graded to the
 * site's taupes), softly blurred under a veil of the dimension colour so the text stays readable. It replaced the
 * smoke here, so the page isn't smoke all the way through. In the drop it's fixed to the screen, so it stays put while
 * the roles scroll over it.
 */
const DeskBackdrop = () => (
  <>
    <img
      src={desk}
      alt=""
      width="1024"
      height="576"
      className="absolute inset-0 size-full scale-110 object-cover blur-[6px]"
    />
    <div className="absolute inset-0 bg-dimension/70" />
  </>
);

const clamp01 = (v) => Math.min(Math.max(v, 0), 1);
const smooth = (x) => x * x * (3 - 2 * x);

// Inside the drop, re-point the muted palette one step lighter (labels, dates, descriptions, bullets).
const DIMENSION_TEXT =
  '[--color-accent:var(--color-accent-strong)] [--color-stone-400:var(--color-stone-300)] [--color-stone-300:var(--color-stone-200)]';

// The drop trails the scroll a little and settles with a touch of give.
const DROP_SPRING = { type: 'spring', stiffness: 110, damping: 18, mass: 0.8 };
// During a navbar glide the scroll races through the drop, so tracking it made the drop burst open or shut in a fifth
// of a second; instead it follows this softer spring on its own (about 0.6 s), and starts opening a little earlier
// on the way down (GLIDE_LEAD) so it's still full before Experience's edge comes into view
const GLIDE_SPRING = { type: 'spring', stiffness: 42, damping: 13, mass: 1 };
const GLIDE_LEAD = 0.7; // screens
const EDGE_POINTS = 96;
// Nothing inside the drop (the section behind shows)
const NONE = 'inset(50%)';

/**
 * Where the drop is for this scroll position, as one number: 0 → 1 on the way in, 1 → 2 on the way out.
 * In: it spreads while the end of the section before is held still (CremaBand `hold="end"`, 120% of a screen) and
 * covers the screen 35% of a screen before Experience's top edge arrives (room for the spring). Out: starting 20%
 * of a screen after Experience's bottom edge has left, it draws back over 70% of a screen while the start of the
 * next section is held still (`hold="start"`, 110% of a screen), so it's fully gone by the spot a Certifications link
 * lands on (over 80% it was 93% gone there and left a small blob).
 */
const dropFor = (el, gliding = false) => {
  const r = el.getBoundingClientRect();
  const vh = window.innerHeight;
  const out = clamp01((0.8 * vh - r.bottom) / (0.6 * vh));
  const lead = gliding ? GLIDE_LEAD : 0;
  return out > 0 ? 1 + out : clamp01(((2.2 + lead) * vh - r.top) / (0.85 * vh));
};

/**
 * The drop's outline: a circle of the given radius with an uneven, liquid edge (a few slow waves, settling a
 * little as it spreads, and drifting as it grows so the edge never looks stamped).
 */
const dropOutline = (cx, cy, radius, spread) => {
  const wobble = 1 - 0.5 * spread;
  return Array.from({ length: EDGE_POINTS }, (_, k) => {
    const a = (2 * Math.PI * k) / EDGE_POINTS;
    const wave =
      0.045 * Math.sin(3 * a + 1.3 + radius * 0.004) +
      0.03 * Math.sin(5 * a + 0.4 - radius * 0.006) +
      0.02 * Math.sin(9 * a + 2.1 + radius * 0.009) +
      0.012 * Math.sin(14 * a + radius * 0.012);
    const r = radius * (1 + wave * wobble);
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
  });
};

/**
 * Experience lives in another "dimension", entered like a drop of coffee spreading on paper: on the held end of
 * Projects a drop of the warm gray-taupe lands in the middle and spreads with a soft, uneven edge and a darker
 * stain ring at its rim, while "EXPERIENCE" surfaces inside it (rippled and blurred as if under liquid, then sharp)
 * and lifts away as the drop fills the screen. On the way out the drop draws back into the middle over the held
 * start of Certifications. The drop is a fixed full-screen layer (the dimension colour, its smoke and the word)
 * clipped to the outline; the ring is a fixed SVG over it; Experience's content sits above, clipped to the same
 * outline in its own coordinates.
 */
// Inside the lighter dimension the smoke is reversed: dark, espresso-toned wisps instead of the page's light ones.

const Experience = () => {
  const ref = useRef(null);
  const backdrop = useRef(null);
  const ringLayer = useRef(null);
  const ring = useRef(null);
  const word = useRef(null);
  const ripple = useRef(null);
  const haze = useRef(null);
  const reduceMotion = useReducedMotion();
  const { scrollY } = useScroll();
  const [size, setSize] = useState(() => ({ w: window.innerWidth, h: window.innerHeight }));

  // Where the drop should be for this scroll position, and where it is (trailing on a spring)
  const target = useMotionValue(0);
  const dropValue = useMotionValue(0);

  useEffect(() => {
    const measure = () => setSize({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  // In-page links glide to their section; during that glide the drop tracks the scroll exactly (no lag), so it's
  // already full when you land on Experience and already gone when you land on the next section.
  const linkGlideUntil = useRef(0);
  // Whether the glide ends at Experience or past it: only then may the drop open early (GLIDE_LEAD). A glide that
  // stops at About, just before it, would otherwise land with the drop already spreading over About.
  const glidePast = useRef(false);
  useEffect(() => {
    const onClick = (e) => {
      const link = e.target.closest?.('a[href^="#"], a[data-section]');
      if (!link) return;
      linkGlideUntil.current = performance.now() + 3500;
      const id = link.getAttribute('href')?.startsWith('#') ? link.getAttribute('href').slice(1) : link.dataset.section;
      const target = id && document.getElementById(id);
      glidePast.current =
        !!target && !!ref.current && target.getBoundingClientRect().top >= ref.current.getBoundingClientRect().top - 1;
    };
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, []);

  // Draw the drop for its current value: outline, stain ring, the word and both clip-paths. Returns whether
  // Experience is showing (its smoke only animates then).
  const draw = () => {
    const el = ref.current;
    if (!el || !backdrop.current) return false;
    const v = dropValue.get();
    const w = window.innerWidth;
    const h = window.innerHeight;
    const cx = w / 2;
    const cy = h / 2;
    // Big enough that even the edge's inward waves clear the corners
    const cover = Math.hypot(cx, cy) * 1.12 + 40;
    const spread = v <= 1 ? smooth(clamp01(v)) : 1 - smooth(clamp01(v - 1));
    const radius = spread * cover;
    const outline = dropOutline(cx, cy, radius, spread);
    const shown = radius > 0.5;
    // A small drop fades rather than shrinking to a speck at the end of its way back (and fades in as it lands); under
    // 30px it's gone entirely
    const presence = clamp01((radius - 30) / 60);
    backdrop.current.style.opacity = String(presence);
    // Tells the navbar whether the drop covers the spot just under it (it stays dark glass then; see Navbar)
    backdrop.current.dataset.coversNav = radius * 0.9 > Math.hypot(0, cy - 66) ? '1' : '';

    const polygon = (offsetY) =>
      `polygon(${outline.map(([x, y]) => `${x.toFixed(1)}px ${(y - offsetY).toFixed(1)}px`).join(', ')})`;
    backdrop.current.style.clipPath = shown ? polygon(0) : NONE;
    el.style.clipPath = shown ? polygon(el.getBoundingClientRect().top) : NONE;

    // The stain ring sits just inside the edge and fades once the drop covers the screen
    const inner = dropOutline(cx, cy, Math.max(radius - 6, 0), spread);
    ring.current?.setAttribute('d', `M${inner.map((p) => p.map((n) => n.toFixed(1)).join(',')).join('L')}Z`);
    if (ringLayer.current) ringLayer.current.style.opacity = shown ? String(clamp01((1 - spread) * 6) * presence) : '0';

    // The word surfaces through the liquid on the way in (rippled and blurred, then sharp) and lifts away as the
    // drop fills the screen
    const t = v <= 1 ? clamp01(v) : 0;
    const surface = smooth(clamp01((t - 0.08) / 0.4));
    const lift = smooth(clamp01((t - 0.7) / 0.25));
    if (word.current) {
      word.current.style.opacity = v <= 1 ? String(surface * (1 - lift)) : '0';
      word.current.setAttribute('transform', `translate(0 ${(30 * (1 - surface) - 50 * lift).toFixed(1)})`);
    }
    ripple.current?.setAttribute('scale', (40 * (1 - surface) + 25 * lift).toFixed(1));
    haze.current?.setAttribute('stdDeviation', (6 * (1 - surface) + 5 * lift).toFixed(2));
    return radius > 1;
  };
  const drawAndTrack = () => {
    draw();
  };

  useMotionValueEvent(scrollY, 'change', () => {
    if (!ref.current) return;
    // The early start only helps going down into Experience; going back up it would keep the drop full for longer
    const down = scrollY.getVelocity() >= 0;
    const gliding = performance.now() < linkGlideUntil.current;
    const next = dropFor(ref.current, gliding && down && glidePast.current);
    if (next !== target.get()) {
      target.set(next);
      animate(dropValue, next, gliding ? GLIDE_SPRING : DROP_SPRING);
    }
    // Last resort: if a very fast scroll has the drop well behind while an edge of Experience is on screen, catch it
    // up at once so the straight edge never shows (normally the buffer in dropFor gives the spring time)
    const r = ref.current.getBoundingClientRect();
    // Only the top edge matters now: Certifications' crema sits behind the bottom one
    const edgeShowing = r.top < window.innerHeight && r.top > 0 && Math.abs(dropValue.get() - 1) > 0.12;
    if (edgeShowing) dropValue.jump(target.get());
    drawAndTrack();
  });
  useMotionValueEvent(dropValue, 'change', drawAndTrack);
  // Place it right away on mount and after a resize (before paint, so nothing flashes)
  useLayoutEffect(() => {
    if (!reduceMotion && ref.current) {
      target.jump(dropFor(ref.current));
      dropValue.jump(target.get());
      draw();
    }
  }, [size, reduceMotion]); // eslint-disable-line react-hooks/exhaustive-deps

  const section = (
    <Section
      id="experience"
      eyebrow="03 — Experience"
      title="Where I've worked"
      // The dimension's gray-taupe is lighter than the page, so muted text steps up one shade inside it.
      className={DIMENSION_TEXT}
    >
      <Roles />
    </Section>
  );

  if (reduceMotion) {
    return (
      <div className="relative bg-dimension">
        <DeskBackdrop />
        {section}
      </div>
    );
  }

  const { w, h } = size;
  // Big Shoulders sets EXPERIENCE about 4.7 font-sizes wide, so this spans 80% of the screen (capped by height)
  const fontSize = Math.min((w * 0.8) / 4.7, h * 0.3);

  return (
    <div className="relative">
      {/* The drop: the dimension colour, its smoke and the word, clipped to the drop's outline. z-20 puts it over
          the neighbouring sections but under the navbar */}
      <div ref={backdrop} aria-hidden className="pointer-events-none fixed inset-0 z-20 bg-dimension [clip-path:inset(50%)]">
        <DeskBackdrop />
        <svg viewBox={`0 0 ${w} ${h}`} className="absolute inset-0 size-full">
          <defs>
            {/* Seen through liquid: the letters waver and blur, settling as the word surfaces */}
            <filter id="drop-ripple" x="-10%" y="-40%" width="120%" height="180%">
              <feTurbulence type="fractalNoise" baseFrequency="0.012 0.05" numOctaves="2" seed="7" result="noise" />
              <feDisplacementMap
                ref={ripple}
                in="SourceGraphic"
                in2="noise"
                scale="40"
                xChannelSelector="R"
                yChannelSelector="G"
                result="moved"
              />
              <feGaussianBlur ref={haze} in="moved" stdDeviation="6" />
            </filter>
          </defs>
          <g ref={word} opacity="0">
            <text
              x={w / 2}
              y={h / 2}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={fontSize}
              filter="url(#drop-ripple)"
              className="fill-accent-strong font-heading font-black tracking-[0.04em] uppercase"
            >
              Experience
            </text>
          </g>
        </svg>
      </div>

      {/* The darker stain ring at the drop's rim, like the edge of a coffee spill */}
      <svg
        ref={ringLayer}
        aria-hidden
        viewBox={`0 0 ${w} ${h}`}
        className="pointer-events-none fixed inset-0 z-20 size-full opacity-0"
      >
        <defs>
          <filter id="drop-ring-soft">
            <feGaussianBlur stdDeviation="3" />
          </filter>
        </defs>
        <path ref={ring} fill="none" strokeWidth="10" filter="url(#drop-ring-soft)" className="stroke-ink/55" />
      </svg>

      <div ref={ref} className="relative z-30 [clip-path:inset(50%)]">
        {section}
      </div>
    </div>
  );
};

export default Experience;
