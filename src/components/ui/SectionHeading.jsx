import { RevealGroup, RevealItem } from './Reveal';

/**
 * A section's heading: the title on the left, the section's number (from the eyebrow, "01 — Projects") small and
 * outlined on the right, over a hairline. `action` (the Projects view toggle) sits just before the number. The same
 * on every section, so the whole page reads as one system.
 */
const SectionHeading = ({ eyebrow, title, action }) => (
  <RevealGroup className="flex items-end justify-between gap-6 border-b border-white/15 pb-5">
    <RevealItem
      as="h2"
      className="font-heading text-title leading-none font-black tracking-[0.01em] text-balance text-white uppercase"
    >
      {title}
    </RevealItem>
    <RevealItem className="flex shrink-0 items-center gap-5">
      {action}
      <span
        aria-hidden
        className="font-heading text-title leading-none font-black text-transparent [-webkit-text-stroke:1px_var(--color-accent)] select-none"
      >
        {eyebrow.split(' — ')[0]}
      </span>
    </RevealItem>
  </RevealGroup>
);

export default SectionHeading;
