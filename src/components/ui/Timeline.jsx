import { RevealGroup, RevealItem } from './Reveal';

/** The organization's logo in a round badge, or its initials as a fallback. */
const OrgBadge = ({ logo, initials, organization }) => (
  <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-line bg-surface">
    {logo ? (
      <img src={logo} alt={`${organization} logo`} className="size-full bg-[#fff] object-contain p-1" />
    ) : (
      <span aria-hidden className="font-display text-label font-bold tracking-wide text-accent-strong">
        {initials}
      </span>
    )}
  </span>
);

/**
 * One job or degree as a row: where and when on the left (logo, organization, dates), what on the right (title, points
 * and, for a job, what was used). A hairline divides the rows. Stacked on smaller screens.
 */
const Entry = ({ entry: { role, organization, logo, initials, period, points, tools = [] } }) => (
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
      {tools.length > 0 && (
        <ul aria-label="Worked with" className="mt-4 flex flex-wrap gap-1.5">
          {tools.map((tool) => (
            <li key={tool} className="rounded-lg border border-white/15 px-2.5 py-1 text-sm text-stone-300">
              {tool}
            </li>
          ))}
        </ul>
      )}
    </div>
  </RevealItem>
);

/** Rows of jobs or degrees (Experience, Education). */
const Timeline = ({ entries }) => (
  <RevealGroup as="ol" stagger={0.08}>
    {entries.map((entry) => (
      <Entry key={`${entry.organization}-${entry.role}`} entry={entry} />
    ))}
  </RevealGroup>
);

export default Timeline;
