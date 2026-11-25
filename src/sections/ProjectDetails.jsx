import { useId, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { LuArrowRight, LuChevronDown } from 'react-icons/lu';

const Label = ({ children }) => (
  <h4 className="font-display text-label font-bold tracking-[0.14em] text-accent uppercase">{children}</h4>
);

const Points = ({ items }) => (
  <ul className="mt-2 space-y-1.5">
    {items.map((item) => (
      <li key={item} className="relative pl-5 text-copy leading-relaxed text-pretty text-stone-300">
        <span aria-hidden className="absolute top-[0.8em] left-0 h-px w-2.5 bg-accent" />
        {item}
      </li>
    ))}
  </ul>
);

const Overview = ({ project: { details, role } }) => (
  <div className="grid gap-6 sm:grid-cols-2 sm:gap-8">
    <div>
      <Label>The idea</Label>
      <p className="mt-2 text-copy leading-relaxed text-pretty text-stone-300">{details.idea}</p>
      <div className="mt-5">
        <Label>My role</Label>
        <p className="mt-2 text-copy text-pretty text-stone-300">{role}</p>
      </div>
    </div>
    <div>
      <Label>What I did</Label>
      <Points items={details.did} />
    </div>
  </div>
);

const HowItWorks = ({ project: { details } }) => (
  <>
    <Label>The flow</Label>
    {/* Steps as chips with arrows between them, wrapping like text */}
    <ol className="mt-3 flex flex-wrap items-center gap-2">
      {details.flow.map((step, i) => (
        <li key={step} className="flex items-center gap-2">
          <span className="rounded-lg border border-white/15 px-2.5 py-1 text-sm text-stone-300">
            <span aria-hidden className="mr-1.5 text-accent tabular-nums">
              {i + 1}
            </span>
            {step}
          </span>
          {i < details.flow.length - 1 && <LuArrowRight aria-hidden className="size-3.5 text-accent" />}
        </li>
      ))}
    </ol>
    <div className="mt-6">
      <Label>What makes it work</Label>
      <Points items={details.points} />
    </div>
  </>
);

const Stack = ({ project: { tools } }) => (
  <>
    <Label>Built with</Label>
    <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
      {tools.map((tool) => (
        <li
          key={tool}
          className="flex items-center gap-2.5 rounded-lg border border-white/15 px-3 py-2 text-sm text-stone-300"
        >
          <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-accent" />
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

/** Overview / How it works / Stack, switched by click or the arrow keys. */
const Tabs = ({ project }) => {
  const id = useId();
  const [current, setCurrent] = useState(0);
  const buttons = useRef([]);
  const { Panel } = TABS[current];

  const onKeyDown = (e) => {
    const by = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
    if (!by) return;
    const next = (current + by + TABS.length) % TABS.length;
    setCurrent(next);
    buttons.current[next]?.focus();
  };

  return (
    <div className="min-w-0">
      <div
        role="tablist"
        aria-label={`${project.name} details`}
        onKeyDown={onKeyDown}
        className="flex border-b border-white/15"
      >
        {TABS.map(({ name }, i) => (
          <button
            key={name}
            ref={(node) => {
              buttons.current[i] = node;
            }}
            type="button"
            role="tab"
            id={`${id}-tab-${i}`}
            aria-selected={i === current}
            aria-controls={`${id}-panel`}
            tabIndex={i === current ? 0 : -1}
            onClick={() => setCurrent(i)}
            className={`-mb-px flex-auto border-b-2 px-1 py-2.5 font-display text-label font-bold tracking-[0.04em] whitespace-nowrap uppercase sm:flex-1 sm:tracking-[0.1em] transition-colors duration-200 ${
              i === current ? 'border-accent-strong text-white' : 'border-transparent text-stone-400 hover:text-white'
            }`}
          >
            {name}
          </button>
        ))}
      </div>
      <div role="tabpanel" id={`${id}-panel`} aria-labelledby={`${id}-tab-${current}`} className="pt-5">
        <Panel project={project} />
      </div>
    </div>
  );
};

/** Opens and closes a project's details (a small outlined pill with a chevron that flips). */
export const DetailsButton = ({ project, open, onToggle, className = '' }) =>
  project.details ? (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      aria-label={`${open ? 'Hide' : 'View'} details of ${project.name}`}
      className={`relative z-10 inline-flex items-center gap-1.5 self-start rounded-full border py-1.5 pr-2.5 pl-3.5 font-display text-label font-bold tracking-[0.12em] uppercase transition-colors duration-200 hover:border-transparent hover:bg-accent hover:text-ink ${
        open ? 'border-accent/60 bg-accent/15 text-white' : 'border-white/20 text-stone-300'
      } ${className}`}
    >
      {open ? 'Hide details' : 'View details'}
      <LuChevronDown
        aria-hidden
        className={`size-4 transition-transform duration-300 motion-reduce:transition-none ${open ? 'rotate-180' : ''}`}
      />
    </button>
  ) : null;

/**
 * A project's details, opening in place: a card with the Overview / How it works / Stack tabs. `picture` adds the
 * screenshot beside them (the desktop list, which doesn't show one). Everything comes from `details` in
 * data/projects.js. It replaced a separate case-study page (the owner found leaving the page, and that much text, too
 * much; this follows the in-place details on two friends' portfolios).
 */
const ProjectDetails = ({ project, open, picture = false, className = '' }) => (
  <AnimatePresence initial={false}>
    {open && project.details && (
      <motion.div
        key={project.name}
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className={`relative z-10 overflow-hidden ${className}`}
      >
        <div
          className={`rounded-xl border border-line bg-surface p-5 sm:p-6 ${picture ? 'grid gap-6 lg:grid-cols-12 lg:gap-8' : ''}`}
        >
          {picture && (
            <img
              src={project.image}
              alt=""
              width={1600}
              height={900}
              className="h-auto w-full self-start rounded-lg border border-line lg:col-span-5"
            />
          )}
          <div className={picture ? 'lg:col-span-7' : ''}>
            <Tabs project={project} />
          </div>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

export default ProjectDetails;
