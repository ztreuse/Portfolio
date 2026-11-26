import { RevealGroup, RevealItem } from './Reveal';

/**
 * A section's heading: the title on the left, over a hairline. `intro` is an optional line under the title in the
 * owner's own words (from data/site.js). `action` (the Projects view toggle) sits on the right. The same on every
 * section, so the whole page reads as one system. No section number: the outlined "01" on the right was removed (the
 * owner found it a common template tell). The sections no longer pass an eyebrow. `rule={false}` drops the hairline
 * (Projects and Tech stack, which sit on photos); the spacing stays the same.
 */
const SectionHeading = ({ title, intro, action, rule = true }) => (
  <RevealGroup className={`flex items-end justify-between gap-6 pb-5 ${rule ? 'border-b border-white/15' : ''}`}>
    {/* A green bar opens every heading, from the top of the title's capitals down to its subtitle (the same line as the
        side index's current section); the title and the subtitle sit just right of it */}
    <div className="relative pl-4 sm:pl-5">
      <span aria-hidden className="absolute top-[-0.06em] -bottom-1.5 left-0 w-1 rounded-full bg-matcha text-title" />
      <RevealItem
        as="h2"
        className="font-heading text-title leading-none font-black tracking-[0.01em] text-balance text-white uppercase"
      >
        {title}
      </RevealItem>
      {intro && (
        <RevealItem
          as="p"
          className="mt-3 max-w-2xl text-copy leading-relaxed text-pretty text-stone-400 light:text-white"
        >
          {intro}
        </RevealItem>
      )}
    </div>
    {action && <RevealItem className="shrink-0">{action}</RevealItem>}
  </RevealGroup>
);

export default SectionHeading;
