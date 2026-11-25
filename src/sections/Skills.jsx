import { useRef, useState } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import Section from '../components/ui/Section';
import { RevealGroup, RevealItem } from '../components/ui/Reveal';
import SkillsBackdrop from './SkillsBackdrop';
import skillGroups from '../data/skills';

const clamp01 = (v) => Math.min(Math.max(v, 0), 1);
const smooth = (x) => x * x * (3 - 2 * x);

/**
 * One tool: its brand logo (or generic icon) and name; hovering tints it in the brand colour and shows what it is.
 * `wide` logos (Cisco's bridge, the CCST badge) use the box's full width, or they'd shrink to a sliver.
 * `flashDelay` (ms) plays the "lights on" flicker in its brand colour when its card appears.
 */
const SkillChip = ({ name, description, logo, wide = false, icon: Icon, color, flashDelay }) => (
  <li
    title={description}
    style={{ '--brand': color, animationDelay: flashDelay === undefined ? undefined : `${flashDelay}ms` }}
    className={`${flashDelay === undefined ? '' : 'animate-chip-flash motion-reduce:animate-none'} flex items-center gap-2 rounded-lg border border-white/10 py-1 pr-2.5 pl-1 transition-[border-color,background-color,box-shadow] duration-300 hover:border-[color-mix(in_srgb,var(--brand)_55%,transparent)] hover:bg-[color-mix(in_srgb,var(--brand)_10%,transparent)] hover:shadow-[0_0_18px_-6px_var(--brand)]`}
  >
    <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-[color-mix(in_srgb,var(--brand)_14%,transparent)]">
      {logo ? (
        <img src={logo} alt="" className={`${wide ? 'h-3.5 w-5' : 'size-3.5'} object-contain`} />
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
 * One category card: its title and its tools as chips. The first time it appears its chips flick on one after another
 * in their brand colours (once only).
 */
const CategoryCard = ({ group }) => {
  const [lit, setLit] = useState(false);

  return (
    <RevealItem
      as="li"
      onAnimationComplete={(state) => state === 'visible' && setLit(true)}
      onPointerMove={trackSpotlight}
      className="group relative isolate overflow-hidden rounded-2xl border border-line bg-surface/85 p-5 transition-[border-color] duration-300 hover:border-accent/35"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(320px_circle_at_var(--mx,50%)_var(--my,0%),rgb(159_143_129/0.14),transparent_70%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />
      <h3 className="font-display text-item leading-snug font-bold text-white">{group.title}</h3>
      <ul className="mt-4 flex flex-wrap gap-2">
        {group.items.map((skill, i) => (
          <SkillChip key={skill.name} {...skill} flashDelay={lit ? i * 50 : undefined} />
        ))}
      </ul>
    </RevealItem>
  );
};

// As Skills ends, the cards fade out while their bottom rises from 85% to 60% of the screen, leaving the backdrop to
// come into focus as the first frame of the desk film
const SkillsFade = ({ children }) => {
  const ref = useRef(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['end 0.85', 'end 0.6'] });
  // A function transform, so motion keeps it on the JS side (a plain opacity map can stick)
  const opacity = useTransform(scrollYProgress, (p) => (reduceMotion ? 1 : 1 - smooth(clamp01(p))));
  return (
    <motion.div ref={ref} style={{ opacity }}>
      {children}
    </motion.div>
  );
};

/**
 * Skills as category cards: each card has its title and its tools as brand-tinted chips. Adding skills or categories
 * in data/skills.js just adds chips or cards. The backdrop runs on past the section for half a screen, where it comes
 * into focus as the first frame of the Contact film (see SkillsBackdrop, ContactFilm).
 */
const Skills = () => {
  const reduceMotion = useReducedMotion();
  return (
    <div className="relative isolate">
      <SkillsBackdrop />
      <Section id="skills" eyebrow="04 — Skills" title="Tools I build with">
        {/* Desktop: 3 cards per row on a 6-track grid, so an incomplete last row (one or two cards) sits centred.
          Tablet: 2 per row, and a lone last card spans both. */}
        <SkillsFade>
          <RevealGroup
            as="ul"
            stagger={0.05}
            className="grid gap-4 sm:grid-cols-2 sm:[&>li:last-child:nth-child(odd)]:col-span-2 lg:grid-cols-6 lg:[&>li]:[grid-column:span_2] lg:[&>li:last-child:nth-child(3n+1):not(:first-child)]:[grid-column:3/span_2] lg:[&>li:nth-last-child(2):nth-child(3n+1)]:[grid-column:2/span_2]"
          >
            {skillGroups.map((group) => (
              <CategoryCard key={group.title} group={group} />
            ))}
          </RevealGroup>
        </SkillsFade>
      </Section>
      {/* Where the backdrop comes into focus before the Contact film takes over */}
      {!reduceMotion && <div aria-hidden data-section-of="skills" className="h-[50lvh]" />}
    </div>
  );
};

export default Skills;
