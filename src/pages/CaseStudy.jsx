import { MotionConfig } from 'motion/react';
import { LuArrowLeft, LuArrowUpRight } from 'react-icons/lu';
import Button from '../components/ui/Button';
import Container from '../components/ui/Container';
import Reveal from '../components/ui/Reveal';
import ThemeToggle from '../components/ui/ThemeToggle';
import { profile } from '../data/site';
import caseStudies from '../data/caseStudies';
import logoHelmet from '../assets/images/logo-helmet.svg';

const home = import.meta.env.BASE_URL;

const Header = () => (
  <header className="sticky top-0 z-50 border-b border-white/15 bg-ink/80 backdrop-blur-xl">
    <Container className="flex h-16 items-center justify-between gap-4">
      <a href={home} aria-label={`${profile.name}, home`} className="flex items-center gap-2.5">
        <img src={logoHelmet} alt="" width="28" height="36" className="h-9 w-auto light:brightness-[0.35]" />
        <span className="font-heading text-xl leading-none font-black tracking-[0.08em] text-white uppercase">
          {profile.name}
        </span>
      </a>
      <div className="flex items-center gap-3 sm:gap-5">
        <a
          href={`${home}#projects`}
          className="flex items-center gap-2 font-display text-label font-bold tracking-[0.12em] text-stone-300 uppercase transition-colors hover:text-white"
        >
          <LuArrowLeft aria-hidden className="size-4" />
          <span className="max-sm:sr-only">All projects</span>
        </a>
        <ThemeToggle />
      </div>
    </Container>
  </header>
);

const Figure = ({ src, alt, caption, phone }) => (
  <figure className="min-w-0">
    <img
      src={src}
      alt={alt}
      loading="lazy"
      width={phone ? 780 : 1440}
      height={phone ? 1688 : 900}
      className={`h-auto w-full border border-line ${phone ? 'rounded-2xl' : 'rounded-xl'}`}
    />
    {caption && <figcaption className="mt-2.5 text-sm text-stone-400">{caption}</figcaption>}
  </figure>
);

const Block = ({ text, points, figures }) => {
  if (figures) {
    const phones = figures[0].phone;
    const columns = phones ? 'grid-cols-3 gap-3 sm:gap-5 max-w-2xl' : figures.length > 1 ? 'gap-5 sm:grid-cols-2' : '';
    return (
      <div className={`grid items-start ${columns}`}>
        {figures.map((figure) => (
          <Figure key={figure.src} {...figure} />
        ))}
      </div>
    );
  }
  if (points) {
    return (
      <ul className="space-y-2">
        {points.map((point) => (
          <li key={point} className="relative max-w-2xl pl-5 text-copy leading-relaxed text-pretty text-stone-300">
            <span aria-hidden className="absolute top-[0.8em] left-0 h-px w-2.5 bg-accent" />
            {point}
          </li>
        ))}
      </ul>
    );
  }
  return <p className="max-w-2xl text-copy leading-relaxed text-pretty text-stone-300">{text}</p>;
};

/** A project's case study (data/caseStudies.js): the same rows as the main page, title on the left, story on the right. */
const CaseStudy = ({ slug }) => {
  const { title, summary, facts, links, cover, sections } = caseStudies[slug];

  return (
    <MotionConfig reducedMotion="user">
      <Header />
      <main>
        <Container className="py-12 sm:py-16">
          <p className="font-display text-label font-bold tracking-[0.14em] text-accent uppercase">Case study</p>
          <h1 className="mt-3 font-heading text-name leading-[0.88] font-black tracking-[0.005em] text-balance text-white uppercase">
            {title}
          </h1>
          <p className="mt-5 max-w-2xl text-item leading-relaxed text-pretty text-stone-200">{summary}</p>

          <dl className="mt-8 grid gap-x-8 gap-y-5 border-y border-white/15 py-5 sm:grid-cols-2 lg:grid-cols-4">
            {facts.map(([label, value]) => (
              <div key={label}>
                <dt className="font-display text-label font-bold tracking-[0.14em] text-accent uppercase">{label}</dt>
                <dd className="mt-1 text-copy text-pretty text-white">{value}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-6 flex flex-wrap gap-3">
            {links.map(([label, href], i) => (
              <Button
                key={href}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                variant={i === 0 ? 'primary' : 'outline'}
                icon={LuArrowUpRight}
              >
                {label}
              </Button>
            ))}
          </div>

          <img
            src={cover.src}
            alt={cover.alt}
            width="1600"
            height="900"
            className="mt-10 h-auto w-full rounded-xl border border-line"
          />

          <div className="mt-6">
            {sections.map((section) => (
              <section
                key={section.title}
                className="grid gap-5 border-b border-white/15 py-10 last:border-b-0 md:grid-cols-12 md:gap-8"
              >
                <h2 className="font-display text-item leading-snug font-bold text-balance text-white md:sticky md:top-24 md:col-span-3 md:self-start">
                  {section.title}
                </h2>
                <div className="min-w-0 space-y-5 md:col-span-9">
                  {section.blocks.map((block, i) => (
                    <Reveal key={i}>
                      <Block {...block} />
                    </Reveal>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </Container>
      </main>

      <footer className="border-t border-accent/40">
        <Container className="flex flex-col gap-5 py-10 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-stone-400">
            &copy; {new Date().getFullYear()} {profile.name}. All rights reserved.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button href={`${home}#projects`} variant="outline" icon={LuArrowLeft}>
              More projects
            </Button>
            <Button href={`${home}#contact`} icon={LuArrowUpRight}>
              Get in touch
            </Button>
          </div>
        </Container>
      </footer>
    </MotionConfig>
  );
};

export default CaseStudy;
