import { LuBriefcase, LuGraduationCap } from 'react-icons/lu';
import IconBadge from '../components/ui/IconBadge';
import Section from '../components/ui/Section';
import Reveal, { RevealGroup, RevealItem } from '../components/ui/Reveal';
import { education, experience } from '../data/experience';

const labelClass = 'font-display text-xs font-semibold tracking-[0.14em] text-accent uppercase';

/** Circular badge on the timeline: the organization's logo, or its initials as a fallback. */
const OrgBadge = ({ logo, initials, organization }) => (
  <span className="absolute top-0 -left-6 flex size-12 items-center justify-center overflow-hidden rounded-full border border-line bg-surface ring-4 ring-ink shadow-[0_0_18px_-4px_rgb(159_143_129/0.5)]">
    {logo ? (
      <img src={logo} alt={`${organization} logo`} className="size-full bg-white object-contain p-1" />
    ) : (
      <span aria-hidden className="font-display text-xs font-bold tracking-wide text-accent-strong">
        {initials}
      </span>
    )}
  </span>
);

const Timeline = ({ title, icon: Icon, entries }) => (
  <div>
    <Reveal as="h3" className="group flex items-center gap-3 font-display text-xl font-semibold text-white">
      <IconBadge icon={Icon} />
      {title}
    </Reveal>

    <RevealGroup as="ol" className="mt-8 ml-6 space-y-12 border-l border-line">
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

const Experience = () => (
  <Section
    id="experience"
    eyebrow="02 — Experience"
    title="Experience & Education"
    description="Hands-on internship experience in front-end engineering, backed by a degree in web and mobile applications."
  >
    <div className="grid gap-14 lg:grid-cols-2 lg:gap-16">
      <Timeline title="Work Experience" icon={LuBriefcase} entries={experience} />
      <Timeline title="Education" icon={LuGraduationCap} entries={education} />
    </div>
  </Section>
);

export default Experience;
