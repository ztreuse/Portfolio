import Section from '../components/ui/Section';
import Reveal, { RevealGroup, RevealItem } from '../components/ui/Reveal';
import skillGroups from '../data/skills';
import skillsBg from '../assets/images/skills-bg.webp';

// Fixed background attachment gives a parallax effect without scroll listeners.
const background = (
  <>
    <div
      aria-hidden
      className="absolute inset-0 -z-10 bg-cover bg-center opacity-15 md:bg-fixed"
      style={{ backgroundImage: `url(${skillsBg})` }}
    />
    <div aria-hidden className="absolute inset-0 -z-10 bg-linear-to-b from-ink via-transparent to-ink" />
  </>
);

/** One skill: brand-colored icon in a tinted box, name, and a short description. */
const SkillTile = ({ name, description, icon: Icon, color }) => (
  <RevealItem
    as="li"
    style={{ '--brand': color }}
    className="group flex items-center gap-4 rounded-xl border border-line bg-surface/80 p-3 pr-4 backdrop-blur-sm transition-[translate,border-color] duration-300 hover:-translate-y-0.5 hover:border-white/15"
  >
    <span className="flex size-11 shrink-0 items-center justify-center rounded-lg border border-white/5 bg-[color-mix(in_srgb,var(--brand)_12%,transparent)] transition-shadow duration-300 group-hover:shadow-[0_0_22px_-4px_var(--brand)]">
      <Icon aria-hidden className="size-6" style={{ color }} />
    </span>
    <span className="min-w-0">
      <span className="block font-display text-sm font-semibold text-white">{name}</span>
      <span className="block text-sm text-stone-400">{description}</span>
    </span>
  </RevealItem>
);

const Skills = () => (
  <Section
    id="skills"
    eyebrow="04 — Skills"
    title="Skills & Expertise"
    description="Bringing ideas to life with modern web technologies."
    background={background}
    className="overflow-hidden"
  >
    <div className="grid items-start gap-x-10 gap-y-14 lg:grid-cols-2">
      {skillGroups.map((group) => (
        <div key={group.title}>
          <Reveal as="h3" className="flex items-center gap-4 font-display text-lg font-semibold text-white">
            {group.title}
            <span aria-hidden className="h-px flex-1 bg-linear-to-r from-line to-transparent" />
          </Reveal>

          <RevealGroup as="ul" stagger={0.05} className="mt-5 grid gap-3 sm:grid-cols-2">
            {group.items.map((skill) => (
              <SkillTile key={skill.name} {...skill} />
            ))}
          </RevealGroup>
        </div>
      ))}
    </div>
  </Section>
);

export default Skills;
