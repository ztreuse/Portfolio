import { useRef, useState } from 'react';
import { motion, useMotionValue, useReducedMotion, useSpring } from 'motion/react';
import { LuArrowUpRight, LuChevronDown, LuChevronLeft, LuChevronRight, LuLayoutGrid, LuList } from 'react-icons/lu';
import IconButton from '../components/ui/IconButton';
import Section from '../components/ui/Section';
import Reveal, { RevealGroup, RevealItem } from '../components/ui/Reveal';
import { imageReveal } from '../components/ui/revealVariants';
import ProjectDetails, { DetailsButton } from './ProjectDetails';
import projects from '../data/projects';

const PAGE_SIZE = 6;
const pageCount = Math.ceil(projects.length / PAGE_SIZE);

const viewOptions = [
  { value: 'grid', label: 'Grid view', icon: LuLayoutGrid },
  { value: 'list', label: 'List view', icon: LuList },
];

/** Icon-only link to the project (the label keeps it clear for screen readers). */
const ViewLink = ({ project, className = '' }) => (
  <IconButton
    href={project.link}
    target="_blank"
    rel="noopener noreferrer"
    label={`View ${project.name}`}
    icon={LuArrowUpRight}
    className={className}
  />
);

/**
 * What a project was built with, as small outlined chips like the Skills chips (text only: several brand logos are
 * white versions that vanish in the light theme). Shown in the list view, which is the detailed one; the grid stays clean.
 */
const StackList = ({ tools, className = '' }) => (
  <ul aria-label="Built with" className={`flex flex-wrap gap-1.5 ${className}`}>
    {tools.map((tool) => (
      <li key={tool} className="rounded-lg border border-white/15 px-2.5 py-1 text-sm text-stone-300">
        {tool}
      </li>
    ))}
  </ul>
);

/** The start of the description; once the details below are open (they have all of it), the idea in one line instead. */
const Description = ({ project, open, className }) => (
  <p className={`${className} ${open ? '' : 'line-clamp-3'}`}>{open ? project.details.idea : project.description}</p>
);

/**
 * Number and role, the name beside its arrow link (like the grid's caption), the description and the stack; used
 * by the list row. Always left-aligned: rows that alternated to right-aligned paragraphs were hard to read.
 */
const ProjectInfo = ({ project, number, open, onToggle }) => (
  <div className="flex flex-col">
    <p className="font-mono text-label font-medium tracking-[0.08em] text-accent uppercase">
      <span className="tabular-nums">{number}</span> — {project.role}
      <span className="whitespace-nowrap text-stone-500">&nbsp;· {project.year}</span>
    </p>
    <div className="mt-1.5 flex items-center justify-between gap-5">
      <h3 className="font-display text-item leading-snug font-bold text-white transition-colors duration-300 group-hover:text-matcha-strong">
        {project.name}
      </h3>
      <ViewLink
        project={project}
        className="shrink-0 group-hover:border-transparent group-hover:bg-matcha group-hover:text-ink"
      />
    </div>
    <Description project={project} open={open} className="mt-2 text-copy leading-relaxed text-pretty text-stone-300" />
    <DetailsButton project={project} open={open} onToggle={onToggle} className="mt-4 self-start" />
  </div>
);

/**
 * The screenshot, linking to the project (hidden from keyboard and screen readers, since the arrow duplicates it),
 * in a frame. Its top edge always sits exactly on the frame's top, so each site's navbar shows whole; hovering zooms it
 * a little from there.
 */
const ProjectImage = ({ project, className = '' }) => (
  <a
    href={project.link}
    target="_blank"
    rel="noopener noreferrer"
    tabIndex={-1}
    aria-hidden
    className={`block overflow-hidden ${className}`}
  >
    {/* Image reveal follows the surrounding reveal group's timing */}
    <motion.div variants={imageReveal}>
      <img
        src={project.image}
        alt=""
        loading="lazy"
        width={1600}
        height={900}
        className="aspect-video size-full origin-top object-cover object-top transition-[scale] duration-500 group-hover:scale-[1.04] motion-reduce:group-hover:scale-100"
      />
    </motion.div>
  </a>
);

const tiltSpring = { stiffness: 220, damping: 22 };
const MAX_TILT = 3; // degrees

/**
 * Grid card: the screenshot in a thin frame (it tilts gently toward the pointer, zooms a little and catches a sweep of
 * light on hover), then just the name beside its arrow link and the stack tags (the owner's request; the list has the
 * rest). No tilt or sweep for reduced motion.
 */
const ProjectCard = ({ project }) => {
  const frame = useRef(null);
  const reduceMotion = useReducedMotion();
  const rotateX = useSpring(useMotionValue(0), tiltSpring);
  const rotateY = useSpring(useMotionValue(0), tiltSpring);

  const tilt = (e) => {
    if (reduceMotion) return;
    const rect = frame.current.getBoundingClientRect();
    rotateY.set(((e.clientX - rect.left) / rect.width - 0.5) * MAX_TILT * 2);
    rotateX.set((0.5 - (e.clientY - rect.top) / rect.height) * MAX_TILT * 2);
  };
  const reset = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <RevealItem as="article" className="group">
      <motion.div
        ref={frame}
        onMouseMove={tilt}
        onMouseLeave={reset}
        style={{ rotateX, rotateY, transformPerspective: 1100 }}
        className="relative overflow-hidden rounded-xl border border-line shadow-[0_24px_50px_-30px_rgb(0_0_0/0.55)] transition-[border-color,box-shadow] duration-500 group-hover:border-matcha/60 group-hover:shadow-[0_34px_70px_-30px_rgb(0_0_0/0.65)]"
      >
        <ProjectImage project={project} />
        {/* A light sheen sweeps across the screenshot on hover */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 -skew-x-12 bg-linear-to-r from-transparent via-[rgb(255_255_255/0.22)] to-transparent opacity-0 transition-[translate,opacity] duration-1000 ease-out group-hover:translate-x-[320%] group-hover:opacity-100 motion-reduce:hidden"
        />
      </motion.div>

      <div className="mt-4 flex items-center justify-between gap-5">
        {/* The name, with the year it was made over it as a small label */}
        <div className="min-w-0">
          <p className="font-mono text-label font-medium tracking-[0.08em] text-stone-500 tabular-nums">
            {project.year}
          </p>
          <h3 className="mt-0.5 font-display text-item leading-snug font-bold text-white transition-colors duration-300 group-hover:text-matcha-strong">
            {project.name}
          </h3>
        </div>
        <ViewLink
          project={project}
          className="shrink-0 group-hover:border-transparent group-hover:bg-matcha group-hover:text-ink"
        />
      </div>
      <StackList tools={project.tools} className="mt-3" />
    </RevealItem>
  );
};

/** List view on touch screens: large screenshot beside the details, the image switching sides every row. */
const ProjectRow = ({ project, number, flipped, open, onToggle }) => (
  // The details sit under the row's grid, not in it: as a grid item its gap stayed until they had closed, then vanished
  // at once (a bump), and a negative margin can't cancel a grid gap
  <article className="group">
    <div className="grid items-center gap-5 md:grid-cols-12 md:gap-10">
      <RevealGroup className={`md:col-span-7 ${flipped ? 'md:order-last' : ''}`}>
        <ProjectImage
          project={project}
          className="rounded-xl border border-line shadow-[0_24px_60px_-24px_rgb(0_0_0/0.45)] transition-colors duration-300 group-hover:border-matcha/50"
        />
      </RevealGroup>
      <Reveal delay={0.1} className="md:col-span-5">
        <ProjectInfo project={project} number={number} open={open} onToggle={onToggle} />
      </Reveal>
    </div>
    <ProjectDetails project={project} open={open} space="pt-5 md:pt-10" />
  </article>
);

const pad = (n) => String(n).padStart(2, '0');

/**
 * List view on desktops with a mouse: an index of the projects, one row each (number, name, stack, role and description).
 * The whole row is the link. No picture floats in on hover (the owner removed it); opened details show the picture.
 */
const ProjectIndex = ({ items, offset, opened, toggle }) => (
  <RevealGroup as="ol" stagger={0.08} className="-mt-6">
    {items.map((project, i) => (
      <RevealItem as="li" key={project.name} className="group relative border-b border-line py-6">
        <div className="grid grid-cols-12 items-start gap-6">
          {/* The whole row opens the project: a link stretched over it, under the row's buttons */}
          <a
            href={project.link}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`View ${project.name}`}
            className="absolute inset-0 outline-offset-4"
          />
          <span className="pointer-events-none col-span-1 pt-1.5 font-mono text-label font-medium tracking-[0.08em] text-accent tabular-nums">
            {pad(offset + i + 1)}
          </span>
          {/* The name with the stack under it */}
          <div className="pointer-events-none col-span-5">
            <span className="block font-display text-item leading-snug font-bold text-white transition-[translate,color] duration-500 ease-out group-focus-within:translate-x-2 group-hover:translate-x-2 group-hover:text-matcha-strong motion-reduce:transition-none">
              {project.name}
            </span>
            <StackList tools={project.tools} className="mt-3" />
          </div>
          <div className="pointer-events-none col-span-4 min-w-0">
            <p className="font-mono text-label font-medium tracking-[0.08em] text-accent uppercase">
              {project.role}
              <span className="whitespace-nowrap text-stone-500">&nbsp;· {project.year}</span>
            </p>
            <Description
              project={project}
              open={opened === project.name}
              className="mt-2 text-copy leading-relaxed text-pretty text-stone-300"
            />
          </div>
          {/* At the right edge: the details button, with the live link under it */}
          <div className="pointer-events-none col-span-2 flex flex-col items-end gap-3">
            <DetailsButton
              project={project}
              open={opened === project.name}
              onToggle={() => toggle(project.name)}
              className="pointer-events-auto"
            />
            <span
              aria-hidden
              className="flex size-10 items-center justify-center rounded-full border border-white/20 text-white transition-colors duration-300 group-hover:border-transparent group-hover:bg-matcha group-hover:text-ink"
            >
              <LuArrowUpRight className="size-5 transition-transform duration-300 group-hover:rotate-45 motion-reduce:transition-none" />
            </span>
          </div>
        </div>
        {/* Under the row's grid, with its gap inside the part that opens, so closing ends without a bump */}
        <ProjectDetails project={project} open={opened === project.name} picture space="pt-6" />
      </RevealItem>
    ))}
  </RevealGroup>
);

/** Page controls; hidden when everything fits on one page. */
const Pagination = ({ page, onChange }) => {
  if (pageCount <= 1) return null;

  return (
    <nav aria-label="Project pages" className="mt-12 flex items-center justify-center gap-2">
      <IconButton label="Previous page" icon={LuChevronLeft} disabled={page === 0} onClick={() => onChange(page - 1)} />
      {Array.from({ length: pageCount }, (_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i)}
          aria-label={`Page ${i + 1}`}
          aria-current={i === page ? 'page' : undefined}
          className={`flex size-11 items-center justify-center rounded-full border font-display text-sm font-semibold transition-colors duration-200 ${
            i === page
              ? 'border-transparent bg-linear-to-br from-matcha-strong to-matcha text-ink'
              : 'border-white/20 bg-ink/40 text-stone-300 hover:border-matcha/70 hover:text-white'
          }`}
        >
          {i + 1}
        </button>
      ))}
      <IconButton
        label="Next page"
        icon={LuChevronRight}
        disabled={page === pageCount - 1}
        onClick={() => onChange(page + 1)}
      />
    </nav>
  );
};

const Projects = () => {
  const [view, setView] = useState('grid');
  const [page, setPage] = useState(0);
  const isList = view === 'list';
  // The project whose details are open in the list or on a phone (one at a time)
  const [opened, setOpened] = useState(null);
  const toggle = (name) => setOpened((now) => (now === name ? null : name));
  const detailsProps = (project) => ({ open: opened === project.name, onToggle: () => toggle(project.name) });
  const visibleProjects = projects.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const goToPage = (next) => {
    setPage(next);
    document.getElementById('projects').scrollIntoView({ behavior: 'smooth' });
  };

  const viewToggle = (
    <div className="hidden gap-1 rounded-full border border-white/20 bg-ink/40 p-1 md:flex">
      {viewOptions.map(({ value, label, icon: Icon }) => {
        const active = view === value;
        return (
          <button
            key={value}
            type="button"
            onClick={() => setView(value)}
            aria-pressed={active}
            aria-label={label}
            className={`relative rounded-full p-2 transition-colors duration-200 ${active ? 'text-ink' : 'text-stone-400 hover:text-white'}`}
          >
            {/* Thumb slides between the two options */}
            {active && (
              <motion.span
                layoutId="view-toggle-thumb"
                transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                className="absolute inset-0 rounded-full bg-linear-to-br from-matcha-strong to-matcha shadow-[0_6px_16px_-6px_rgb(163_185_124/0.6)]"
              />
            )}
            <Icon aria-hidden className="relative size-4" />
          </button>
        );
      })}
    </div>
  );

  return (
    <Section id="projects" title="Selected work" action={viewToggle} rule={false}>
      {/* Keyed by page (and view) so items replay their reveal when either changes */}
      {isList ? (
        <>
          {/* Desktop with a mouse: the hover index */}
          <div key={`index-${page}`} className="hidden md:[@media(hover:hover)]:block">
            <ProjectIndex items={visibleProjects} offset={page * PAGE_SIZE} opened={opened} toggle={toggle} />
          </div>
          {/* Touch screens: large alternating rows */}
          <div key={`list-${page}`} className="flex flex-col gap-10 md:gap-12 md:[@media(hover:hover)]:hidden">
            {visibleProjects.map((project, i) => (
              <ProjectRow
                key={project.name}
                project={project}
                number={pad(page * PAGE_SIZE + i + 1)}
                flipped={i % 2 === 1}
                {...detailsProps(project)}
              />
            ))}
          </div>
        </>
      ) : (
        <>
          {/* Phones have no view toggle, so they always get the list rows: in one column the grid would show the
              same image and title but hide the description and stack (the owner noticed the missing details) */}
          <div key={`phone-${page}`} className="flex flex-col gap-10 md:hidden">
            {visibleProjects.map((project, i) => (
              <ProjectRow
                key={project.name}
                project={project}
                number={pad(page * PAGE_SIZE + i + 1)}
                {...detailsProps(project)}
              />
            ))}
          </div>
          <RevealGroup key={`grid-${page}`} className="grid grid-cols-2 gap-x-8 gap-y-12 max-md:hidden">
            {visibleProjects.map((project) => (
              <ProjectCard key={project.name} project={project} />
            ))}
          </RevealGroup>
        </>
      )}

      <Pagination page={page} onChange={goToPage} />
    </Section>
  );
};

export default Projects;
