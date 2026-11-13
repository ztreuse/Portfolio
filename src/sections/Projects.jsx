import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react';
import { LuArrowUpRight, LuChevronDown, LuChevronLeft, LuChevronRight, LuLayoutGrid, LuList } from 'react-icons/lu';
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

/**
 * A description cut to three lines, with a "Show more" / "Show less" toggle that only appears when the text is
 * actually longer (re-checked whenever it resizes). `className` styles the text.
 */
const MoreText = ({ text, className = '' }) => {
  const ref = useRef(null);
  const [expanded, setExpanded] = useState(false);
  const [overflows, setOverflows] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const observer = new ResizeObserver(() => {
      // Only measurable while clamped; once expanded, keep the toggle so it can collapse again
      if (el.classList.contains('line-clamp-3')) setOverflows(el.scrollHeight > el.clientHeight + 1);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <p ref={ref} className={`${className} ${expanded ? '' : 'line-clamp-3'}`}>
        {text}
      </p>
      {/* A control of its own (a small outlined pill with a chevron that flips), not a line of text: as a bare
          uppercase label it read as part of the description */}
      {(overflows || expanded) && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="relative z-10 mt-4 inline-flex items-center gap-1.5 self-start rounded-full border border-white/20 py-1.5 pr-2.5 pl-3.5 font-display text-[0.8125rem] font-bold tracking-[0.12em] text-stone-300 uppercase transition-colors duration-200 hover:border-transparent hover:bg-accent hover:text-ink"
        >
          {expanded ? 'Show less' : 'Show more'}
          <LuChevronDown
            aria-hidden
            className={`size-4 transition-transform duration-300 motion-reduce:transition-none ${expanded ? 'rotate-180' : ''}`}
          />
        </button>
      )}
    </>
  );
};

/**
 * What a project was built with, as small outlined chips like the Skills chips (text only: several brand logos are
 * white versions that vanish on the crema). Shown in the list view, which is the detailed one; the grid stays clean.
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

/**
 * Number and role, the name beside its arrow link (like the grid's caption), the description and the stack; used
 * by the list row. Always left-aligned: rows that alternated to right-aligned paragraphs were hard to read.
 */
const ProjectInfo = ({ project, number }) => (
  <div className="flex flex-col">
    <p className="font-display text-[0.8125rem] font-bold tracking-[0.14em] text-accent uppercase">
      <span className="tabular-nums">{number}</span> — {project.role}
    </p>
    <div className="mt-3 flex items-end justify-between gap-5">
      <h3 className="font-heading text-4xl leading-[0.9] font-black tracking-[0.005em] text-white uppercase transition-[translate,color] duration-500 ease-out group-hover:translate-x-2 group-hover:text-accent-strong motion-reduce:translate-x-0 sm:text-5xl">
        {project.name}
      </h3>
      <ViewLink
        project={project}
        className="shrink-0 group-hover:border-transparent group-hover:bg-accent group-hover:text-ink"
      />
    </div>
    <MoreText text={project.description} className="mt-4 text-base leading-relaxed text-pretty text-stone-300" />
    <StackList tools={project.tools} className="mt-5" />
  </div>
);

/**
 * The screenshot, linking to the project (hidden from keyboard and screen readers, since the arrow duplicates it),
 * framed like a window. Its top edge always sits exactly on the frame's top, so each site's navbar shows whole: the
 * zoom is anchored to the top, and instead of sliding with the scroll (which cropped the navbars) it zooms in
 * slightly (1 to 1.08) as the card crosses the screen, so it still has depth. Still for reduced motion.
 */
const ProjectImage = ({ project, className = '' }) => {
  const ref = useRef(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const scale = useTransform(scrollYProgress, (p) => (reduceMotion ? 1 : 1 + 0.08 * p));

  return (
    <a
      ref={ref}
      href={project.link}
      target="_blank"
      rel="noopener noreferrer"
      tabIndex={-1}
      aria-hidden
      className={`block overflow-hidden ${className}`}
    >
      {/* Image reveal follows the surrounding reveal group's timing */}
      <motion.div variants={imageReveal}>
        <motion.div style={{ scale }} className="origin-top">
          <img
            src={project.image}
            alt=""
            loading="lazy"
            width={1600}
            height={900}
            className="aspect-video size-full origin-top object-cover object-top transition-[scale] duration-500 group-hover:scale-[1.05] motion-reduce:group-hover:scale-100"
          />
        </motion.div>
      </motion.div>
    </a>
  );
};

const tiltSpring = { stiffness: 220, damping: 22 };
const MAX_TILT = 3; // degrees

/**
 * Grid card, laid out like a magazine caption under a photo: the screenshot in a thin frame (it tilts gently toward
 * the pointer, zooms a little and catches a sweep of light on hover), then a caption line with the number, a rule
 * and the role, and the project name large beside the arrow link. Hovering fills the rule in taupe from the left,
 * nudges the name and fills the arrow. No tilt or sweep for reduced motion.
 */
const ProjectCard = ({ project, number }) => {
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
        className="relative overflow-hidden rounded-xl border border-line shadow-[0_24px_50px_-30px_rgb(0_0_0/0.55)] transition-[border-color,box-shadow] duration-500 group-hover:border-accent/60 group-hover:shadow-[0_34px_70px_-30px_rgb(0_0_0/0.65)]"
      >
        <ProjectImage project={project} />
        {/* A light sheen sweeps across the screenshot on hover */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 -skew-x-12 bg-linear-to-r from-transparent via-[rgb(255_255_255/0.22)] to-transparent opacity-0 transition-[translate,opacity] duration-1000 ease-out group-hover:translate-x-[320%] group-hover:opacity-100 motion-reduce:hidden"
        />
      </motion.div>

      {/* Caption line: number, a rule that fills on hover, role */}
      <div className="mt-6 flex items-center gap-4">
        <span className="font-heading text-lg leading-none font-extrabold text-accent tabular-nums">{number}</span>
        <span aria-hidden className="relative h-px min-w-8 flex-1 bg-line">
          <span className="absolute inset-0 origin-left scale-x-0 bg-accent transition-transform duration-700 ease-out group-hover:scale-x-100 motion-reduce:transition-none" />
        </span>
        <p className="max-w-[65%] text-right font-display text-[0.8125rem] leading-snug font-bold tracking-[0.14em] text-accent uppercase">
          {project.role}
        </p>
      </div>

      <div className="mt-3 flex items-end justify-between gap-5">
        <h3 className="font-heading text-4xl leading-[0.9] font-black tracking-[0.005em] text-white uppercase transition-[translate,color] duration-500 ease-out group-hover:translate-x-2 group-hover:text-accent-strong motion-reduce:translate-x-0 sm:text-5xl">
          {project.name}
        </h3>
        <ViewLink
          project={project}
          className="shrink-0 group-hover:border-transparent group-hover:bg-accent group-hover:text-ink"
        />
      </div>
    </RevealItem>
  );
};

/** List view on touch screens: large screenshot beside the details, the image switching sides every row. */
const ProjectRow = ({ project, number, flipped }) => (
  <article className="group grid items-center gap-8 md:grid-cols-12 md:gap-12">
    <RevealGroup className={`md:col-span-7 ${flipped ? 'md:order-last' : ''}`}>
      <ProjectImage
        project={project}
        className="rounded-2xl border border-line shadow-[0_24px_60px_-24px_rgb(0_0_0/0.45)] transition-colors duration-300 group-hover:border-accent/50"
      />
    </RevealGroup>
    <Reveal delay={0.1} className="md:col-span-5">
      <ProjectInfo project={project} number={number} />
    </Reveal>
  </article>
);

const previewSpring = { stiffness: 260, damping: 28, mass: 0.6 };
const pad = (n) => String(n).padStart(2, '0');

/**
 * List view on desktops with a mouse: an editorial index of the projects, one big row each (number, name, role and
 * a short description). Hovering or focusing a row slides its name in and brings up a preview of that project that
 * glides sideways after the cursor while sitting just above the hovered row, so it never covers the name you're
 * pointing at (centred on the cursor, it hid the hovered title); the previews cross-fade as you move between rows.
 * The whole row is the link.
 */
const ProjectIndex = ({ items, offset }) => {
  const ref = useRef(null);
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState(null);
  const x = useSpring(useMotionValue(0), previewSpring);
  const y = useSpring(useMotionValue(0), previewSpring);

  // True while the pointer is over a description, where the preview must not cover the text or its toggle
  const [overText, setOverText] = useState(false);
  const preview = useRef(null);

  // Rests the preview on the row's top edge (dipping 1rem into its top padding), so the row's name stays visible;
  // when there's no room above (the row is near the top of the screen, under the navbar) it hangs below the row
  const rest = (row) => {
    const rect = ref.current.getBoundingClientRect();
    const box = row.getBoundingClientRect();
    const h = preview.current?.offsetHeight ?? 0;
    const above = box.top - h + 16 > 80;
    y.set(above ? box.top - rect.top - h + 16 : box.bottom - rect.top - 16);
  };

  // The preview follows the cursor sideways but stays on the name's side of the row, never over the description
  const follow = (e) => {
    const rect = ref.current.getBoundingClientRect();
    const half = (preview.current?.offsetWidth ?? 0) / 2;
    // The description column starts at 7/12 of the row; keep a gap before it
    x.set(Math.min(Math.max(e.clientX - rect.left, half), (rect.width * 7) / 12 - 32 - half));
    const row = e.target.closest?.('li');
    if (row) rest(row);
  };

  return (
    <div ref={ref} onPointerMove={follow} onPointerLeave={() => setActive(null)} className="relative">
      <RevealGroup as="ol" stagger={0.08} className="border-t border-line">
        {items.map((project, i) => (
          <RevealItem
            as="li"
            key={project.name}
            onPointerEnter={() => setActive(i)}
            className="group relative grid grid-cols-12 items-start gap-6 border-b border-line py-8"
          >
            {/* The whole row opens the project: a link stretched over it, under the "Show more" toggle */}
            <a
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`View ${project.name}`}
              onFocus={(e) => {
                x.set(ref.current.getBoundingClientRect().width * 0.3);
                rest(e.currentTarget.closest('li'));
                setActive(i);
              }}
              onBlur={() => setActive(null)}
              className="absolute inset-0 outline-offset-4"
            />
            <span className="pointer-events-none col-span-1 pt-1 font-heading text-2xl font-extrabold text-accent tabular-nums">
              {pad(offset + i + 1)}
            </span>
            {/* The name with the stack under it, which fills the space that used to sit empty below the name */}
            <div className="pointer-events-none col-span-6">
              <span className="block font-heading text-5xl leading-[0.9] font-black tracking-[0.005em] text-white uppercase transition-[translate,color] duration-500 ease-out group-focus-within:translate-x-4 group-hover:translate-x-4 group-hover:text-accent-strong motion-reduce:transition-none lg:text-7xl">
                {project.name}
              </span>
              <StackList tools={project.tools} className="mt-5" />
            </div>
            <div
              onPointerEnter={() => setOverText(true)}
              onPointerLeave={() => setOverText(false)}
              className="relative z-10 col-span-4 min-w-0"
            >
              <p className="font-display text-[0.8125rem] font-bold tracking-[0.14em] text-accent uppercase">{project.role}</p>
              {/* Body size, like every other section's text (it was a smaller, lighter 14px) */}
              <MoreText
                text={project.description}
                className="mt-2 text-base leading-relaxed text-pretty text-stone-300"
              />
            </div>
            <span
              aria-hidden
              className="pointer-events-none col-span-1 flex size-12 items-center justify-center justify-self-end rounded-full border border-white/20 text-white transition-colors duration-300 group-hover:border-transparent group-hover:bg-accent group-hover:text-ink"
            >
              <LuArrowUpRight className="size-5 transition-transform duration-300 group-hover:rotate-45 motion-reduce:transition-none" />
            </span>
          </RevealItem>
        ))}
      </RevealGroup>

      {/* The floating preview: follows the cursor sideways on a spring (on the name's side), resting on the hovered
          row's top edge (or under the row near the top of the screen), hidden when no row is hovered or the pointer
          is over a description */}
      <motion.div
        ref={preview}
        aria-hidden
        style={{ x, y }}
        initial={false}
        animate={{
          opacity: active === null || overText ? 0 : 1,
          scale: active === null || overText || reduceMotion ? 0.85 : 1,
        }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="pointer-events-none absolute top-0 left-0 z-20 w-[min(30vw,400px)] -translate-x-1/2"
      >
        <div className="relative aspect-video overflow-hidden rounded-xl border border-line shadow-[0_30px_70px_-25px_rgb(0_0_0/0.55)]">
          {items.map((project, i) => (
            <img
              key={project.name}
              src={project.image}
              alt=""
              width={1600}
              height={900}
              className={`absolute inset-0 size-full object-cover transition-opacity duration-300 ${
                active === i ? 'opacity-100' : 'opacity-0'
              }`}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
};

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
    <Section id="projects" eyebrow="01 — Projects" title="Selected work" action={viewToggle}>
      {/* Keyed by page (and view) so items replay their reveal when either changes */}
      {isList ? (
        <>
          {/* Desktop with a mouse: the hover index */}
          <div key={`index-${page}`} className="hidden md:[@media(hover:hover)]:block">
            <ProjectIndex items={visibleProjects} offset={page * PAGE_SIZE} />
          </div>
          {/* Touch screens: large alternating rows */}
          <div key={`list-${page}`} className="flex flex-col gap-14 md:gap-16 md:[@media(hover:hover)]:hidden">
            {visibleProjects.map((project, i) => (
              <ProjectRow
                key={project.name}
                project={project}
                number={pad(page * PAGE_SIZE + i + 1)}
                flipped={i % 2 === 1}
              />
            ))}
          </div>
        </>
      ) : (
        <>
          {/* Phones have no view toggle, so they always get the list rows: in one column the grid would show the
              same image and title but hide the description and stack (the owner noticed the missing details) */}
          <div key={`phone-${page}`} className="flex flex-col gap-14 md:hidden">
            {visibleProjects.map((project, i) => (
              <ProjectRow key={project.name} project={project} number={pad(page * PAGE_SIZE + i + 1)} />
            ))}
          </div>
          <RevealGroup key={`grid-${page}`} className="grid grid-cols-2 gap-8 max-md:hidden">
          {visibleProjects.map((project, i) => (
            <ProjectCard key={project.name} project={project} number={pad(page * PAGE_SIZE + i + 1)} />
          ))}
        </RevealGroup>
        </>
      )}

      <Pagination page={page} onChange={goToPage} />
    </Section>
  );
};

export default Projects;
