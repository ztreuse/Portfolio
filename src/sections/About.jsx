import { useRef } from 'react';
import { motion, useInView, useReducedMotion, useScroll, useTransform } from 'motion/react';
import Section from '../components/ui/Section';
import SectionHeading from '../components/ui/SectionHeading';
import Reveal, { RevealImage } from '../components/ui/Reveal';
import { profile } from '../data/site';
import { education } from '../data/experience';
import profileImg from '../assets/images/profile.jpg';

// The first sentence becomes the pull statement; the rest is the paragraph under it.
const [statement, ...restOfAbout] = profile.about.split('. ');
const aboutRest = restOfAbout.join('. ');

const About = () => {
  // About rises over the pinned hero, so its content waits until the section has reached the top of the
  // screen (fills the page) instead of revealing while it's still sliding up. The marker covers the whole
  // section and the watch zone is the top 12% of the viewport.
  const marker = useRef(null);
  const arrived = useInView(marker, { once: true, margin: '0px 0px -88% 0px' });

  // The photo sits slightly enlarged in its card and drifts as the section scrolls past (a window effect).
  const photo = useRef(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: photo, offset: ['start end', 'end start'] });
  const photoY = useTransform(scrollYProgress, [0, 1], reduceMotion ? ['0%', '0%'] : ['-6%', '6%']);

  return (
    <Section id="about" background={<span ref={marker} aria-hidden className="pointer-events-none absolute inset-0" />}>
      <div className="grid items-center gap-12 md:grid-cols-12 lg:gap-16">
        {/* Hovering twists the photo one way and swings the offset frame behind it the other way */}
        <div ref={photo} className="group relative mx-auto w-full max-w-sm md:col-span-5 md:max-w-none">
          <Reveal play={arrived} delay={0.45} y={0} className="absolute inset-0">
            <span
              aria-hidden
              className="block size-full translate-3 rounded-2xl border border-accent/40 transition-[translate,rotate] duration-500 ease-out group-hover:translate-5 group-hover:rotate-2 motion-reduce:transition-none sm:translate-4 sm:group-hover:translate-6"
            />
          </Reveal>

          <RevealImage
            play={arrived}
            className="relative overflow-hidden rounded-2xl border border-line shadow-2xl shadow-black/40 transition-[rotate] duration-500 ease-out group-hover:-rotate-2 motion-reduce:transition-none"
          >
            <motion.img
              src={profileImg}
              alt="Troy Bay in an FEU Tech graduation toga"
              style={{ y: photoY }}
              className="aspect-4/5 w-full scale-115 object-cover object-[50%_25%]"
            />
          </RevealImage>
        </div>

        <div className="md:col-span-7">
          <SectionHeading eyebrow="01 — About" title="Get to know me" play={arrived} />
          {/* Magazine-style: the opening line as a pull statement, the rest as body text */}
          <Reveal
            as="p"
            play={arrived}
            delay={0.3}
            className="mt-8 border-l-2 border-accent pl-5 font-heading text-3xl leading-[0.95] font-extrabold tracking-[0.01em] text-balance text-accent-strong uppercase sm:text-4xl lg:text-[2.75rem]"
          >
            {statement}.
          </Reveal>
          <Reveal
            as="p"
            play={arrived}
            delay={0.45}
            className="mt-6 text-base leading-relaxed text-stone-300 sm:text-lg"
          >
            {aboutRest}
          </Reveal>

          {/* Education, compact: one entry doesn't need a timeline of its own */}
          {education.map(({ role, organization, logo, initials, period, points }) => (
            <Reveal key={role} play={arrived} delay={0.6} className="mt-10 flex gap-5 border-t border-white/10 pt-6">
              <span className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-line bg-surface">
                {logo ? (
                  <img src={logo} alt={`${organization} logo`} className="size-full bg-white object-contain p-1" />
                ) : (
                  <span aria-hidden className="font-display text-xs font-bold text-accent-strong">
                    {initials}
                  </span>
                )}
              </span>
              <div>
                <p className="font-heading text-base font-bold tracking-[0.16em] text-accent uppercase">
                  Education · {period}
                </p>
                <h3 className="mt-1.5 font-heading text-xl leading-[0.95] font-extrabold tracking-[0.01em] text-white uppercase sm:text-2xl">
                  {role}
                </h3>
                <p className="mt-1 text-stone-300">{organization}</p>
                {points.length > 0 && (
                  <p className="mt-2 text-sm leading-relaxed text-stone-400">{points.join(' ')}</p>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  );
};

export default About;
