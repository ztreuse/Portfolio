import { useState } from 'react';
import { motion } from 'motion/react';
import { LuArrowUpRight, LuChevronLeft, LuChevronRight, LuLayoutGrid, LuList } from 'react-icons/lu';
import Button from '../components/ui/Button';
import IconButton from '../components/ui/IconButton';
import Section from '../components/ui/Section';
import Tag from '../components/ui/Tag';
import Reveal, { RevealGroup, RevealItem } from '../components/ui/Reveal';
import projects from '../data/projects';

const PAGE_SIZE = 6;
const pageCount = Math.ceil(projects.length / PAGE_SIZE);

const viewOptions = [
  { value: 'grid', label: 'Grid view', icon: LuLayoutGrid },
  { value: 'list', label: 'List view', icon: LuList },
];

/** Role, name, description, tools and link; shared by the grid card and the list row. */
const ProjectInfo = ({ project, alignRight = false, pinButton = false }) => (
  <div className={`flex flex-col ${alignRight ? 'md:items-end md:text-right' : ''} ${pinButton ? 'flex-1' : ''}`}>
    <p className="font-display text-xs font-semibold tracking-[0.14em] text-accent uppercase">{project.role}</p>
    <h3 className="mt-2 font-display text-xl font-semibold text-white sm:text-2xl">{project.name}</h3>
    <p className="mt-3 leading-relaxed text-stone-400">{project.description}</p>
    <ul className={`mt-5 flex flex-wrap gap-2 ${alignRight ? 'md:justify-end' : ''}`}>
      {project.tools.map((tool) => (
        <li key={tool}>
          <Tag>{tool}</Tag>
        </li>
      ))}
    </ul>
    {/* In grid cards only the button drops to the bottom, so buttons line up across a row */}
    <div className={pinButton ? 'mt-auto pt-6' : 'mt-6'}>
      <Button href={project.link} variant="outline" target="_blank" rel="noopener noreferrer">
        View Project
        <LuArrowUpRight aria-hidden className="size-4" />
      </Button>
    </div>
  </div>
);

/** Screenshot linking to the project; hidden from keyboard and screen readers since the button duplicates it. */
const ProjectImage = ({ project, className = '' }) => (
  <a href={project.link} target="_blank" rel="noopener noreferrer" tabIndex={-1} aria-hidden className={`block overflow-hidden ${className}`}>
    <img
      src={project.image}
      alt=""
      loading="lazy"
      className="aspect-video size-full object-cover transition-transform duration-500 group-hover:scale-105"
    />
  </a>
);

const ProjectCard = ({ project }) => (
  <RevealItem
    as="article"
    className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-surface transition-colors duration-300 hover:border-accent/50"
  >
    <ProjectImage project={project} />
    <div className="flex flex-1 flex-col p-6 sm:p-8">
      <ProjectInfo project={project} pinButton />
    </div>
  </RevealItem>
);

/** List view: large screenshot beside the details, switching sides every row. */
const ProjectRow = ({ project, flipped }) => (
  <article className="group grid items-center gap-8 md:grid-cols-12 md:gap-12">
    <Reveal
      x={flipped ? 48 : -48}
      y={0}
      className={`md:col-span-7 ${flipped ? 'md:order-last' : ''}`}
    >
      <ProjectImage
        project={project}
        className="rounded-2xl border border-line shadow-[0_24px_60px_-20px_rgb(0_0_0/0.8)] transition-colors duration-300 group-hover:border-accent/50"
      />
    </Reveal>
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
              ? 'border-accent bg-accent text-ink'
              : 'border-line bg-surface text-stone-400 hover:border-accent hover:text-white'
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
    <div className="hidden gap-1 rounded-xl border border-line bg-linear-to-b from-surface to-ink p-1 shadow-[inset_0_1px_0_0_rgb(255_255_255/0.05)] md:flex">
      {viewOptions.map(({ value, label, icon: Icon }) => {
        const active = view === value;
        return (
          <button
            key={value}
            type="button"
            onClick={() => setView(value)}
            aria-pressed={active}
            aria-label={label}
            className={`relative rounded-lg p-2.5 transition-colors duration-200 ${active ? 'text-ink' : 'text-stone-400 hover:text-white'}`}
          >
            {/* Thumb slides between the two options */}
            {active && (
              <motion.span
                layoutId="view-toggle-thumb"
                transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                className="absolute inset-0 rounded-lg bg-linear-to-br from-accent-strong to-accent shadow-[inset_0_1px_0_0_rgb(255_255_255/0.35),0_6px_16px_-6px_rgb(159_143_129/0.7)]"
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
      title="Featured Projects"
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
