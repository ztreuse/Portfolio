import Section from '../components/ui/Section';
import { RevealGroup, RevealItem } from '../components/ui/Reveal';
import skillGroups from '../data/skills';

/** One tool: its brand logo (or generic icon) and name; hovering tints it in the brand colour and shows what it is. */
const SkillChip = ({ name, description, logo, icon: Icon, color }) => (
  <li
    title={description}
    style={{ '--brand': color }}
    className="flex items-center gap-2 rounded-lg border border-white/10 py-1.5 pr-3 pl-1.5 transition-[border-color,background-color,box-shadow] duration-300 hover:border-[color-mix(in_srgb,var(--brand)_55%,transparent)] hover:bg-[color-mix(in_srgb,var(--brand)_10%,transparent)] hover:shadow-[0_0_18px_-6px_var(--brand)]"
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

/** One category card: its title and its tools as chips. */
const CategoryCard = ({ group }) => (
  <RevealItem
    as="li"
    onPointerMove={trackSpotlight}
    className="group relative isolate overflow-hidden rounded-2xl border border-line bg-surface/70 p-6 backdrop-blur-sm transition-[border-color,translate] duration-300 hover:-translate-y-1 hover:border-accent/35 sm:p-7"
  >
    <span
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(320px_circle_at_var(--mx,50%)_var(--my,0%),rgb(159_143_129/0.14),transparent_70%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
    />
    <h3 className="font-display text-lg leading-snug font-semibold text-white">{group.title}</h3>
    <ul className="mt-5 flex flex-wrap gap-2">
      {group.items.map((skill) => (
        <SkillChip key={skill.name} {...skill} />
      ))}
    </ul>
  </RevealItem>
);

/**
 * Skills as category cards (like a "software expertise" board): each card has its title and its tools as
 * brand-tinted chips. A taupe spotlight follows the pointer over a card. Adding skills or
 * categories in data/skills.js just adds chips or cards.
 */
const Skills = () => {
  return (
    <Section
      id="skills"
      eyebrow="04 — Skills"
      title="Tools I build with"
      description="Bringing ideas to life with modern web technologies."
      align="center"
      // The "Skills" label pins huge and shrinks into place as you scroll (reverses when scrolling back up)
      zoom="label"
    >
      {/* Desktop: 3 cards per row on a 6-track grid, so an incomplete last row (one or two cards) sits centred.
        Tablet: 2 per row, and a lone last card spans both. */}
      <RevealGroup
        as="ul"
        stagger={0.06}
        className="grid gap-4 sm:grid-cols-2 sm:[&>li:last-child:nth-child(odd)]:col-span-2 lg:grid-cols-6 lg:gap-5 lg:[&>li]:[grid-column:span_2] lg:[&>li:nth-last-child(2):nth-child(3n+1)]:[grid-column:2/span_2] lg:[&>li:last-child:nth-child(3n+1):not(:first-child)]:[grid-column:3/span_2]"
      >
        {skillGroups.map((group) => (
          <CategoryCard key={group.title} group={group} />
        ))}
      </RevealGroup>
    </Section>
  );
};

export default Skills;
