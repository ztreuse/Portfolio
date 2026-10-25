import { useRef, useState } from 'react';
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from 'motion/react';
import Section from '../components/ui/Section';
import SkillsBackdrop from './SkillsBackdrop';
import SkillsIntro from './SkillsIntro';
import skillGroups from '../data/skills';

const clamp01 = (v) => Math.min(Math.max(v, 0), 1);
const smooth = (x) => x * x * (3 - 2 * x);

/**
 * One tool: its brand logo (or generic icon) and name; hovering tints it in the brand colour and shows what it is.
 * `flashDelay` (ms) plays the "lights on" flicker in its brand colour when its card lands.
 */
const SkillChip = ({ name, description, logo, icon: Icon, color, flashDelay }) => (
  <li
    title={description}
    style={{ '--brand': color, animationDelay: flashDelay === undefined ? undefined : `${flashDelay}ms` }}
    className={`${flashDelay === undefined ? '' : 'animate-chip-flash motion-reduce:animate-none'} flex items-center gap-2 rounded-lg border border-white/10 py-1.5 pr-3 pl-1.5 transition-[border-color,background-color,box-shadow] duration-300 hover:border-[color-mix(in_srgb,var(--brand)_55%,transparent)] hover:bg-[color-mix(in_srgb,var(--brand)_10%,transparent)] hover:shadow-[0_0_18px_-6px_var(--brand)]`}
  >
    <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-[color-mix(in_srgb,var(--brand)_14%,transparent)]">
      {logo ? (
        <img src={logo} alt="" className="size-3.5 object-contain" />
      ) : (
        <Icon aria-hidden className="size-3.5" style={{ color }} />
      )}
    </span>
    <span className="text-sm whitespace-nowrap text-stone-300">{name}</span>
  </li>
);

// A soft taupe spotlight follows the pointer across a card (position written straight to CSS variables).
const trackSpotlight = (e) => {
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
  e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
};

/**
 * One category card: its title and its tools as chips. It deals in as it scrolls into view: rising from below,
 * tilted back and turned a little (outward from the middle column), then settling flat into the grid like a card
 * landing on a table; cards in a row land in a quick left-to-right wave. Tied to the scroll, so it reverses going
 * back up. When it lands, its chips flick on one after another in their brand colours; that replays each time the
 * card lands again. Still for reduced motion.
 */
const CategoryCard = ({ group, index }) => {
  const ref = useRef(null);
  const reduceMotion = useReducedMotion();
  const column = index % 3;
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'start 0.55'] });
  const landed = useTransform(scrollYProgress, (p) => (reduceMotion ? 1 : smooth(clamp01(p * 1.3 - column * 0.12))));
  const y = useTransform(landed, (v) => (1 - v) * 140);
  const rotateX = useTransform(landed, (v) => (1 - v) * 32);
  const rotateZ = useTransform(landed, (v) => (1 - v) * (column - 1) * 4);
  const scale = useTransform(landed, (v) => 0.9 + 0.1 * v);
  const opacity = useTransform(landed, (v) => Math.min(1, v * 1.6));

  // Lights on: each landing bumps the count, which restarts the chips' flicker (re-armed once the card leaves)
  const [flashes, setFlashes] = useState(0);
  const armed = useRef(true);
  useMotionValueEvent(landed, 'change', (v) => {
    if (v > 0.97 && armed.current) {
      armed.current = false;
      setFlashes((n) => n + 1);
    }
    if (v < 0.2) armed.current = true;
  });

  return (
    <motion.li
      ref={ref}
      onPointerMove={trackSpotlight}
      style={{ y, rotateX, rotateZ, scale, opacity, transformPerspective: 1200 }}
      className="group relative isolate origin-bottom overflow-hidden rounded-2xl border border-line bg-surface/70 p-6 backdrop-blur-sm transition-[border-color,translate] duration-300 hover:-translate-y-1 hover:border-accent/35 sm:p-7"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(320px_circle_at_var(--mx,50%)_var(--my,0%),rgb(159_143_129/0.14),transparent_70%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />
      <h3 className="font-heading text-2xl leading-none font-extrabold tracking-[0.01em] text-white uppercase">
        {group.title}
      </h3>
      {/* Keyed by the landing count, so the chips' flicker restarts on each landing */}
      <ul key={flashes} className="mt-5 flex flex-wrap gap-2">
        {group.items.map((skill, i) => (
          <SkillChip key={skill.name} {...skill} flashDelay={flashes > 0 ? 120 + i * 70 : undefined} />
        ))}
      </ul>
    </motion.li>
  );
};

/**
 * Skills as category cards (like a "software expertise" board): each card has its title and its tools as
 * brand-tinted chips. Cards deal in as they scroll into view and their chips light up as they land (see
 * CategoryCard). A taupe spotlight follows the pointer over a card. Adding skills or
 * categories in data/skills.js just adds chips or cards.
 */
const Skills = () => {
  const reduceMotion = useReducedMotion();
  return (
    <>
      {/* Skills' intro: the flight from Certifications toward a far-off SKILLS, which you pass through */}
      {!reduceMotion && <SkillsIntro />}
      <Section
        id="skills"
        eyebrow="05 — Skills"
        title="Tools I build with"
        description="Bringing ideas to life with modern web technologies."
        background={<SkillsBackdrop />}
      >
        {/* Desktop: 3 cards per row on a 6-track grid, so an incomplete last row (one or two cards) sits centred.
          Tablet: 2 per row, and a lone last card spans both. */}
        <ul
          className="grid gap-4 sm:grid-cols-2 sm:[&>li:last-child:nth-child(odd)]:col-span-2 lg:grid-cols-6 lg:gap-5 lg:[&>li]:[grid-column:span_2] lg:[&>li:nth-last-child(2):nth-child(3n+1)]:[grid-column:2/span_2] lg:[&>li:last-child:nth-child(3n+1):not(:first-child)]:[grid-column:3/span_2]"
        >
          {skillGroups.map((group, i) => (
            <CategoryCard key={group.title} group={group} index={i} />
          ))}
        </ul>
      </Section>
    </>
  );
};

export default Skills;
