import { useId, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { LuCheck, LuChevronDown } from 'react-icons/lu';

const Label = ({ children }) => (
  <h4 className="font-mono text-label font-medium tracking-[0.08em] text-accent uppercase">{children}</h4>
);

/** Short points, each led by a small round check. */
const Points = ({ items }) => (
  <ul className="mt-3.5 space-y-3">
    {items.map((item) => (
      <li key={item} className="flex gap-3 text-copy leading-relaxed text-pretty text-stone-300">
        <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-matcha/20 text-matcha-strong">
          <LuCheck aria-hidden className="size-3" strokeWidth={3} />
        </span>
        {item}
      </li>
    ))}
  </ul>
);

const Overview = ({ project: { details, description } }) => (
  <>
    <Label>About</Label>
    <p className="mt-2.5 text-copy leading-relaxed text-pretty text-stone-300">{description}</p>
    <div className="mt-6 border-t border-line pt-6">
      <Label>What I did</Label>
      <Points items={details.did} />
    </div>
  </>
);

/** The flow as numbered stops on a line: across on wide screens, down on phones. */
const Flow = ({ steps }) => (
  <ol className="mt-4 flex flex-col sm:flex-row">
    {steps.map((step, i) => (
      <li
        key={step}
        className="relative flex flex-1 items-start gap-3.5 pb-4 last:pb-0 sm:flex-col sm:items-center sm:gap-2.5 sm:px-1 sm:pb-0 sm:text-center"
      >
        {/* The line to the next stop */}
        {i < steps.length - 1 && (
          <span
            aria-hidden
            className="absolute top-7 bottom-0 left-3.5 w-px bg-accent/40 sm:top-3.5 sm:right-[calc(-50%+1.1rem)] sm:bottom-auto sm:left-[calc(50%+1.1rem)] sm:h-px sm:w-auto"
          />
        )}
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-accent/50 bg-accent/15 font-mono text-label font-medium text-accent-strong tabular-nums">
          {i + 1}
        </span>
        <span className="pt-0.5 text-sm leading-snug text-balance text-stone-300 sm:pt-0">{step}</span>
      </li>
    ))}
  </ol>
);

const HowItWorks = ({ project: { details } }) => (
  <>
    <Label>The flow</Label>
    <Flow steps={details.flow} />
    <div className="mt-6 border-t border-line pt-6">
      <Label>What makes it work</Label>
      <Points items={details.points} />
    </div>
  </>
);

const Stack = ({ project: { tools } }) => (
  <>
    <Label>Built with</Label>
    <ul className="mt-3.5 flex flex-wrap gap-2">
      {tools.map((tool) => (
        <li key={tool} className="rounded-lg border border-white/15 px-2.5 py-1 text-sm text-stone-300">
          {tool}
        </li>
      ))}
    </ul>
  </>
);

const TABS = [
  { name: 'Overview', Panel: Overview },
  { name: 'How it works', Panel: HowItWorks },
  { name: 'Stack', Panel: Stack },
];

/**
 * Overview / How it works / Stack, picked from a pill switch (click or arrow keys). All panels share one grid cell, so
 * it's always as tall as the tallest and switching never moves the page. With a single tab there's no switch.
 */
const ProjectTabs = ({ project, stack }) => {
  const id = useId();
  const [current, setCurrent] = useState(0);
  const buttons = useRef([]);
  // No "How it works" without a flow, and no Stack where it already shows as tags beside the project (the desktop list)
  const tabs = TABS.filter(({ name }) => (name === 'Stack' ? stack : name !== 'How it works' || project.details.flow));

  const onKeyDown = (e) => {
    const by = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
    if (!by) return;
    const next = (current + by + tabs.length) % tabs.length;
    setCurrent(next);
    buttons.current[next]?.focus();
  };

  if (tabs.length === 1) return <Overview project={project} />;

  return (
    <>
      <div
        role="tablist"
        aria-label={`${project.name} details`}
        onKeyDown={onKeyDown}
        className="flex w-fit max-w-full rounded-full border border-line bg-ink/50 p-1"
      >
        {tabs.map(({ name }, i) => (
          <button
            key={name}
            ref={(node) => {
              buttons.current[i] = node;
            }}
            type="button"
            role="tab"
            id={`${id}-tab-${i}`}
            aria-selected={i === current}
            aria-controls={`${id}-panel-${i}`}
            tabIndex={i === current ? 0 : -1}
            onClick={() => setCurrent(i)}
            className={`relative rounded-full px-3.5 py-1.5 font-display text-[0.8125rem] font-semibold whitespace-nowrap transition-colors duration-200 sm:px-4 ${
              i === current ? 'text-ink' : 'text-stone-400 hover:text-white'
            }`}
          >
            {/* The thumb slides between the options, like the grid / list switch */}
            {i === current && (
              <motion.span
                layoutId={`${id}-thumb`}
                transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                className="absolute inset-0 rounded-full bg-linear-to-br from-matcha-strong to-matcha"
              />
            )}
            <span className="relative">{name}</span>
          </button>
        ))}
      </div>
      <div className="mt-6 grid">
        {tabs.map(({ name, Panel }, i) => (
          <div
            key={name}
            role="tabpanel"
            id={`${id}-panel-${i}`}
            aria-labelledby={`${id}-tab-${i}`}
            aria-hidden={i !== current}
            className={`min-w-0 [grid-area:1/1] transition-opacity duration-200 ${
              i === current ? 'opacity-100' : 'invisible opacity-0'
            }`}
          >
            <Panel project={project} />
          </div>
        ))}
      </div>
    </>
  );
};

/** Opens and closes a project's details; the same pill on every project. */
export const DetailsButton = ({ project, open, onToggle, className = '' }) => (
  <button
    type="button"
    onClick={onToggle}
    aria-expanded={open}
    aria-label={`${open ? 'Hide' : 'View'} details of ${project.name}`}
    // After onins.dev's (the owner's request): a squared-off outline button in the ordinary button type (Manrope, normal
    // case), no fill. At rest a faint hairline and muted text; on hover, focus or while open the outline and the text
    // both turn taupe brown (his turn purple); in the light theme the text a deeper brown, so the change from the faint grey
    // is plain to see. Not while open: it goes back to faint once you let go
    className={`relative z-10 inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 font-display text-sm font-medium whitespace-nowrap transition-colors duration-200 ${'border-white/15 text-stone-500 hover:border-matcha-strong hover:text-matcha-strong focus-visible:border-matcha-strong focus-visible:text-matcha-strong light:hover:text-matcha-strong light:focus-visible:text-matcha-strong'} ${className}`}
  >
    {open ? 'Hide details' : 'View details'}
    <LuChevronDown
      aria-hidden
      className={`size-3.5 transition-transform duration-300 motion-reduce:transition-none ${open ? 'rotate-180' : ''}`}
    />
  </button>
);

/**
 * A project's details, opening in place in the list and on phones. `picture` (the desktop list, which shows none) adds
 * the screenshot on its own tinted side, centred, so there's never an empty gap under it; the text has the other side.
 * Everything comes from `details` in data/projects.js. `space` is the gap above it, kept inside the part that opens and
 * closes: as the row's grid gap it stayed until the details were gone, then vanished at once, a bump at the end of closing.
 */
const ProjectDetails = ({ project, open, picture = false, space = '', className = '' }) => (
  <AnimatePresence initial={false}>
    {open && (
      <motion.div
        key={project.name}
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className={`relative z-10 overflow-hidden ${className}`}
      >
        <div className={space}>
          <div className={`overflow-hidden rounded-2xl bg-surface ${picture ? 'grid grid-cols-12' : ''}`}>
            {picture && (
              <div className="col-span-5 flex items-center bg-accent/15 p-6 lg:p-8">
                <img
                  src={project.image}
                  alt=""
                  width={1600}
                  height={900}
                  className="h-auto w-full rounded-lg shadow-[0_24px_50px_-24px_rgb(0_0_0/0.5)]"
                />
              </div>
            )}
            <div className={picture ? 'col-span-7 p-6 lg:p-9' : 'p-5 sm:p-6'}>
              <ProjectTabs project={project} stack={!picture} />
            </div>
          </div>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

export default ProjectDetails;
