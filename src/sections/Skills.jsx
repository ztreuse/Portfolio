import { useRef, useState } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { intros } from '../data/site';
import Section from '../components/ui/Section';
import { RevealGroup, RevealItem } from '../components/ui/Reveal';
import SkillsBackdrop from './SkillsBackdrop';
import skillGroups from '../data/skills';
import projects from '../data/projects';

const clamp01 = (v) => Math.min(Math.max(v, 0), 1);
const smooth = (x) => x * x * (3 - 2 * x);

// "Used in Nirvana, Tourisla" for a chip's tooltip, from the projects' own stacks ("React.js" counts as React)
const plain = (tool) => tool.toLowerCase().replace(/\.js$/, '');
const usedIn = (name) => {
  const names = projects.filter((p) => p.tools.some((tool) => plain(tool) === plain(name))).map((p) => p.name);
  return names.length ? ` · used in ${names.join(', ')}` : '';
};

/**
 * One tool: its brand logo (or generic icon) and name; hovering tints it in the brand colour and shows what it is and
 * which projects used it. `wide` logos (Cisco's bridge, the CCST badge) use the box's full width, or they'd shrink to a
 * sliver. White marks are `mono` (inverted in the light theme) or have their own `logoLight`.
 * `flashDelay` (ms) plays the "lights on" flicker in its brand colour when its row appears.
 */
const SkillChip = ({ name, description, logo, logoLight, mono, wide = false, icon: Icon, color, flashDelay }) => (
  <li
    title={description + usedIn(name)}
    // A white brand follows the theme, or its tint would vanish on crema
    style={{
      '--brand': color === '#FFFFFF' ? 'var(--color-white)' : color,
      animationDelay: flashDelay === undefined ? undefined : `${flashDelay}ms`,
    }}
    className={`${flashDelay === undefined ? '' : 'animate-chip-flash motion-reduce:animate-none'} flex items-center gap-2 rounded-lg border border-line bg-ink/60 light:bg-surface/40 py-1.5 pr-2.5 pl-2 transition-[border-color,background-color,box-shadow] duration-300 hover:border-[color-mix(in_srgb,var(--brand)_55%,transparent)] hover:bg-[color-mix(in_srgb,var(--brand)_10%,transparent)] hover:shadow-[0_0_18px_-6px_var(--brand)]`}
  >
    <span className="flex size-4 shrink-0 items-center justify-center">
      {logo ? (
        <>
          <img
            src={logo}
            alt=""
            className={`${wide ? 'h-3.5 w-5' : 'size-3.5'} object-contain ${mono ? 'light:invert' : ''} ${logoLight ? 'light:hidden' : ''}`}
          />
          {logoLight && (
            <img
              src={logoLight}
              alt=""
              className={`${wide ? 'h-3.5 w-5' : 'size-3.5'} hidden object-contain light:block`}
            />
          )}
        </>
      ) : (
        <Icon aria-hidden className="size-3.5 text-accent-strong" />
      )}
    </span>
    <span className="text-sm whitespace-nowrap text-stone-300">{name}</span>
  </li>
);

/**
 * One group as a compact card: its name and how many tools along the top, the tools under it. Two per row, paired by
 * size in data/skills.js. It rises a little and its border turns matcha green while it's pointed at, and what I'm still learning has a dashed
 * matcha-green outline (still growing), like something not finished yet. The first time it appears its chips flick on one after another in their
 * brand colours (once only).
 */
const GroupCard = ({ group }) => {
  const [lit, setLit] = useState(false);

  return (
    <RevealItem
      as="li"
      onAnimationComplete={(state) => state === 'visible' && setLit(true)}
      // Hover: it rises a little and only its outline turns plainly matcha green (both themes; no green fill, no shadow). The
      // lift is the CSS translate property, so it doesn't fight the reveal's transform
      className={`rounded-xl border bg-surface/90 p-5 light:bg-ink/55 transition-[translate,border-color] duration-300 ease-out hover:-translate-y-1 hover:border-matcha motion-reduce:hover:translate-y-0 ${
        group.learning ? 'border-dashed border-matcha/55' : 'border-line light:border-white/15'
      }`}
    >
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="font-display text-copy font-bold text-white">{group.title}</h3>
        <span
          className={`shrink-0 font-mono text-[0.6875rem] font-medium tracking-[0.08em] uppercase ${
            group.learning ? 'text-matcha' : 'text-accent'
          }`}
        >
          {group.items.length} {group.items.length === 1 ? 'tool' : 'tools'}
        </span>
      </div>
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
 * The tech stack: two columns of compact cards, one per group, with its tools as chips. Adding skills or groups in
 * data/skills.js just adds chips or cards. The backdrop runs on past the section for half a screen, where it comes
 * into focus as the first frame of the Contact film (see SkillsBackdrop, ContactFilm).
 */
const Skills = () => {
  const reduceMotion = useReducedMotion();
  return (
    <div className="relative isolate">
      <SkillsBackdrop />
      <Section id="skills" title="Tech stack" intro={intros.skills} rule={false}>
        <SkillsFade>
          <RevealGroup as="ul" stagger={0.05} className="grid gap-4 md:grid-cols-2">
            {skillGroups.map((group) => (
              <GroupCard key={group.title} group={group} />
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
