import { RevealGroup, RevealItem } from './Reveal';

const SectionHeading = ({ eyebrow, title, description, action }) => (
  <RevealGroup className="flex flex-wrap items-end justify-between gap-6">
    <div className="max-w-2xl">
      {eyebrow && (
        <RevealItem as="p" className="font-display text-xs font-semibold tracking-[0.14em] text-accent uppercase sm:text-sm">
          {eyebrow}
        </RevealItem>
      )}
      <RevealItem as="h2" className="mt-3 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
        {title}
      </RevealItem>
      {description && (
        <RevealItem as="p" className="mt-4 text-base leading-relaxed text-stone-400 sm:text-lg">
          {description}
        </RevealItem>
      )}
    </div>
    {action && <RevealItem>{action}</RevealItem>}
  </RevealGroup>
);

export default SectionHeading;
