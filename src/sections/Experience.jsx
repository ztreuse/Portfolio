import Section from '../components/ui/Section';
import { RevealGroup, RevealItem } from '../components/ui/Reveal';
import { education, experience } from '../data/experience';
import desk from '../assets/images/desk-soft.webp'; // desk.webp, pre-blurred (a live blur made phones stutter)

/** The organization's logo in a round badge, or its initials as a fallback. */
const OrgBadge = ({ logo, initials, organization }) => (
  <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-line bg-surface">
    {logo ? (
      <img src={logo} alt={`${organization} logo`} className="size-full bg-white object-contain p-1" />
    ) : (
      <span aria-hidden className="font-display text-label font-bold tracking-wide text-accent-strong">
        {initials}
      </span>
    )}
  </span>
);

/**
 * One job or degree as a row: where and when on the left (logo, organization, dates), what on the right (title and
 * its points). A hairline divides the rows. Stacked on smaller screens.
 */
const Entry = ({ entry: { role, organization, logo, initials, period, points } }) => (
  <RevealItem
    as="li"
    className="grid gap-4 border-b border-white/15 py-7 first:pt-0 last:border-b-0 last:pb-0 md:grid-cols-12 md:gap-8"
  >
    <div className="flex items-start gap-4 md:col-span-4">
      <OrgBadge logo={logo} initials={initials} organization={organization} />
      <div>
        <p className="font-display text-copy font-semibold text-white">{organization}</p>
        <p className="mt-1 font-display text-label font-bold tracking-[0.14em] text-accent uppercase">{period}</p>
      </div>
    </div>
    <div className="md:col-span-8">
      <h3 className="font-display text-item leading-snug font-bold text-balance text-white">{role}</h3>
      <ul className="mt-3 space-y-2">
        {points.map((point) => (
          <li key={point} className="relative max-w-2xl pl-5 text-copy leading-relaxed text-pretty text-stone-300">
            <span aria-hidden className="absolute top-[0.8em] left-0 h-px w-2.5 bg-accent" />
            {point}
          </li>
        ))}
      </ul>
    </div>
  </RevealItem>
);

/**
 * The owner's desk at night (their own setup, the same scene as the Contact film, graded to the site's taupes), softly
 * blurred under a veil so the text stays readable. From tablets up it stays put while the section scrolls over it,
 * like looking through a window (a fixed layer clipped to the section); on phones it's a plain background.
 */
const DeskBackdrop = () => (
  <div
    aria-hidden
    className="pointer-events-none absolute inset-0 -z-10 overflow-hidden bg-dimension [clip-path:inset(0)]"
  >
    <div className="absolute inset-0 md:fixed">
      <img src={desk} alt="" width="640" height="360" className="absolute inset-0 size-full object-cover" />
      <div className="absolute inset-0 bg-dimension/70" />
    </div>
  </div>
);

// On the desk photo's lighter taupe, muted text steps up one shade
const ON_DESK =
  '[--color-accent:var(--color-accent-strong)] [--color-stone-400:var(--color-stone-300)] [--color-stone-300:var(--color-stone-200)]';

/** Work first, then education, newest first in each. New entries go in data/experience.js. */
const Experience = () => (
  <Section
    id="experience"
    eyebrow="02 — Experience"
    title="Where I've worked and studied"
    className={ON_DESK}
    background={<DeskBackdrop />}
  >
    <RevealGroup as="ol" stagger={0.08}>
      {[...experience, ...education].map((entry) => (
        <Entry key={entry.role} entry={entry} />
      ))}
    </RevealGroup>
  </Section>
);

export default Experience;
