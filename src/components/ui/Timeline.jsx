import { RevealGroup, RevealItem } from './Reveal';

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

// "Jan 2026 – Jul 2026" → "7 mos" (both months counted); "Present" counts up to this month
const length = (period) => {
  const ends = period.split('–').map((part) => {
    const [month, year] = part.trim().toLowerCase().split(' ');
    if (month === 'present') return new Date().getFullYear() * 12 + new Date().getMonth();
    return Number(year) * 12 + MONTHS.indexOf(month.slice(0, 3));
  });
  const months = ends.length === 2 && ends.every((n) => !Number.isNaN(n)) ? ends[1] - ends[0] + 1 : 0;
  if (months <= 0) return '';
  const years = Math.floor(months / 12);
  const rest = months % 12;
  return [years && `${years} yr${years > 1 ? 's' : ''}`, rest && `${rest} mo${rest > 1 ? 's' : ''}`]
    .filter(Boolean)
    .join(' ');
};

/** The organization's logo in a round badge (its name is right beside it), or its initials as a fallback. */
const OrgBadge = ({ logo, initials }) => (
  <span
    aria-hidden
    className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-line bg-surface"
  >
    {logo ? (
      <img src={logo} alt="" className="size-full bg-[#fff] object-contain p-1" />
    ) : (
      <span className="font-mono text-label font-medium text-accent-strong">{initials}</span>
    )}
  </span>
);

/**
 * One job as a row between hairlines: when, where and how long on the left, beside the company's logo; the role, what I did as dash points and the
 * tools I used as small tags (like the projects' stack) on the right. Stacked on phones.
 */
const Entry = ({ entry: { role, organization, logo, initials, period, type, points, tools = [] } }) => {
  const span = length(period);
  return (
    <RevealItem as="li" className="grid gap-3 border-b border-white/15 py-7 first:pt-0 md:grid-cols-12 md:gap-8">
      <div className="flex items-start gap-3.5 md:col-span-4">
        <OrgBadge logo={logo} initials={initials} />
        <div className="min-w-0">
          <p className="font-mono text-label font-medium tracking-[0.08em] text-accent uppercase">{period}</p>
          <p className="mt-1.5 text-copy font-semibold text-white">{organization}</p>
          <p className="mt-0.5 text-sm text-stone-400">{[span, type].filter(Boolean).join(' · ')}</p>
        </div>
      </div>
      <div className="md:col-span-8">
        <h3 className="font-display text-item leading-snug font-bold text-balance text-white">{role}</h3>
        <ul className="mt-3 space-y-2">
          {points.map((point) => (
            <li key={point} className="relative max-w-3xl pl-5 text-copy leading-relaxed text-pretty text-stone-300">
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
};

/** Jobs as rows (Experience), newest first. */
const Timeline = ({ entries }) => (
  <RevealGroup as="ol" stagger={0.08}>
    {entries.map((entry) => (
      <Entry key={`${entry.organization}-${entry.role}`} entry={entry} />
    ))}
  </RevealGroup>
);

export default Timeline;
