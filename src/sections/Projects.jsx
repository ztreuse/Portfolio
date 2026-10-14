import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useReducedMotion, useSpring } from 'motion/react';
import { LuArrowUpRight, LuChevronLeft, LuChevronRight, LuLayoutGrid, LuList } from 'react-icons/lu';
import IconButton from '../components/ui/IconButton';
import Section from '../components/ui/Section';
import Reveal, { RevealGroup, RevealItem } from '../components/ui/Reveal';
import { imageReveal } from '../components/ui/revealVariants';
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

/** Role, name and description, plus the link; used by the list row. */
const ProjectInfo = ({ project, alignRight = false }) => (
  <div className={`flex flex-col ${alignRight ? 'md:items-end md:text-right' : ''}`}>
    <p className="font-display text-xs font-semibold tracking-[0.14em] text-accent uppercase">{project.role}</p>
    <h3 className="mt-2 font-display text-xl font-semibold text-white sm:text-2xl">{project.name}</h3>
    <p className="mt-3 leading-relaxed text-stone-400">{project.description}</p>
    <ViewLink project={project} className="mt-6" />
  </div>
);

/** Screenshot linking to the project; hidden from keyboard and screen readers since the button duplicates it. */
const ProjectImage = ({ project, className = '' }) => (
  <a
    href={project.link}
    target="_blank"
    rel="noopener noreferrer"
    tabIndex={-1}
    aria-hidden
    data-cursor="View"
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
        className="aspect-video size-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
    </motion.div>
  </a>
);

/**
 * Description clamped to three lines, with a "Read more" toggle that only appears when the text is actually cut off
 * (re-checked whenever the card resizes). Used in the caption, where the grid/list switch isn't available.
 */
const ExpandableText = ({ text }) => {
  const ref = useRef(null);
  const [expanded, setExpanded] = useState(false);
  const [overflows, setOverflows] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const observer = new ResizeObserver(() => {
      // Only measurable while clamped; once expanded, keep the toggle so it can collapse again.
      if (el.classList.contains('line-clamp-3')) setOverflows(el.scrollHeight > el.clientHeight + 1);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <p ref={ref} className={`mt-2 text-sm leading-relaxed text-stone-400 ${expanded ? '' : 'line-clamp-3'}`}>
        {text}
      </p>
      {(overflows || expanded) && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="mt-2 font-display text-xs font-semibold tracking-[0.14em] text-accent-strong uppercase transition-colors hover:text-white"
        >
          {expanded ? 'Show less' : 'Read more'}
        </button>
      )}
    </>
  );
};

const tiltSpring = { stiffness: 220, damping: 22 };
const MAX_TILT = 5; // degrees

/**
 * Grid card: just the screenshot. With a mouse, hovering (or keyboard focus) fades in a gradient and slides up the
 * details: role, name, description and an icon link (from md up, where the list view is available for full details).
 * Below md, and on touch screens, the details are a caption under the image whose description can expand. The card tilts toward the pointer, with a soft light that follows it.
 */
const ProjectCard = ({ project }) => {
  const ref = useRef(null);
  const reduceMotion = useReducedMotion();
  const rotateX = useSpring(useMotionValue(0), tiltSpring);
  const rotateY = useSpring(useMotionValue(0), tiltSpring);

  const tilt = (e) => {
    const rect = ref.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    ref.current.style.setProperty('--mx', `${px * 100}%`);
    ref.current.style.setProperty('--my', `${py * 100}%`);
    if (reduceMotion) return;
    rotateY.set((px - 0.5) * MAX_TILT * 2);
    rotateX.set((0.5 - py) * MAX_TILT * 2);
  };

  const reset = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <RevealItem
      as="article"
      ref={ref}
      onMouseMove={tilt}
      onMouseLeave={reset}
      style={{ rotateX, rotateY, transformPerspective: 1000 }}
      className="group relative overflow-hidden rounded-2xl border border-line bg-surface transition-colors duration-300 hover:border-accent/50"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(420px_circle_at_var(--mx,50%)_var(--my,0%),rgb(201_188_175/0.10),transparent_60%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />
      <ProjectImage project={project} />

      {/* Hover / focus details (devices that can hover) */}
      <div className="pointer-events-none absolute inset-0 z-20 hidden flex-col justify-end bg-linear-to-t from-ink via-ink/80 to-ink/10 p-6 opacity-0 transition-opacity duration-300 group-focus-within:opacity-100 group-hover:opacity-100 sm:p-7 md:[@media(hover:hover)]:flex">
        <div className="flex translate-y-4 items-end gap-5 transition-[translate] duration-500 ease-out group-focus-within:translate-y-0 group-hover:translate-y-0 motion-reduce:translate-y-0">
          <div className="min-w-0 flex-1">
            <p className="font-display text-xs font-semibold tracking-[0.14em] text-accent uppercase">{project.role}</p>
            <h3 className="mt-2 font-display text-xl font-semibold text-white sm:text-2xl">{project.name}</h3>
            <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-stone-300">{project.description}</p>
          </div>
          <ViewLink project={project} className="pointer-events-auto shrink-0" />
        </div>
      </div>

      {/* Small screens and touch screens: a caption under the image instead (its description can expand) */}
      <div className="flex items-start gap-4 p-5 md:[@media(hover:hover)]:hidden">
        <div className="min-w-0 flex-1">
          <p className="font-display text-xs font-semibold tracking-[0.14em] text-accent uppercase">{project.role}</p>
          <h3 className="mt-1.5 font-display text-lg font-semibold text-white">{project.name}</h3>
          <ExpandableText text={project.description} />
        </div>
        <ViewLink project={project} className="shrink-0" />
      </div>
    </RevealItem>
  );
};

/** List view: large screenshot beside the details, switching sides every row. */
const ProjectRow = ({ project, flipped }) => (
  <article className="group grid items-center gap-8 md:grid-cols-12 md:gap-12">
    <RevealGroup className={`md:col-span-7 ${flipped ? 'md:order-last' : ''}`}>
      <ProjectImage
        project={project}
        className="rounded-2xl border border-line shadow-[0_24px_60px_-20px_rgb(0_0_0/0.8)] transition-colors duration-300 group-hover:border-accent/50"
      />
    </RevealGroup>
    <Reveal delay={0.1} className="md:col-span-5">
      <ProjectInfo project={project} alignRight={!flipped} />
    </Reveal>
  </article>
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
              ? 'border-transparent bg-linear-to-br from-accent-strong to-accent text-ink'
              : 'border-white/20 bg-ink/40 text-stone-300 hover:border-accent/70 hover:text-white'
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
  const visibleProjects = projects.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const goToPage = (next) => {
    setPage(next);
    document.getElementById('projects').scrollIntoView({ behavior: 'smooth' });
  };

  const viewToggle = (
    <div className="hidden gap-1 rounded-full border border-white/20 bg-ink/40 p-1 backdrop-blur-sm md:flex">
      {viewOptions.map(({ value, label, icon: Icon }) => {
        const active = view === value;
        return (
          <button
            key={value}
            type="button"
            onClick={() => setView(value)}
            aria-pressed={active}
            aria-label={label}
            className={`relative rounded-full p-2.5 transition-colors duration-200 ${active ? 'text-ink' : 'text-stone-400 hover:text-white'}`}
          >
            {/* Thumb slides between the two options */}
            {active && (
              <motion.span
                layoutId="view-toggle-thumb"
                transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                className="absolute inset-0 rounded-full bg-linear-to-br from-accent-strong to-accent shadow-[0_6px_16px_-6px_rgb(159_143_129/0.7)]"
              />
            )}
            <Icon aria-hidden className="relative size-5" />
          </button>
        );
      })}
    </div>
  );

  return (
    <Section
      id="projects"
      eyebrow="05 — Projects"
      title="Selected work"
      description="A selection of web, mobile, and design work."
      action={viewToggle}
    >
      {/* Keyed by page (and view) so items replay their reveal when either changes */}
      {isList ? (
        <div key={`list-${page}`} className="flex flex-col gap-20 md:gap-28">
          {visibleProjects.map((project, i) => (
            <ProjectRow key={project.name} project={project} flipped={i % 2 === 1} />
          ))}
        </div>
      ) : (
        <RevealGroup key={`grid-${page}`} className="grid gap-8 md:grid-cols-2">
          {visibleProjects.map((project) => (
            <ProjectCard key={project.name} project={project} />
          ))}
        </RevealGroup>
      )}

      <Pagination page={page} onChange={goToPage} />
    </Section>
  );
};

export default Projects;
