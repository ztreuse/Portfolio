import { useRef } from 'react';
import { motion, useInView, useReducedMotion, useScroll, useTransform } from 'motion/react';
import Section from '../components/ui/Section';
import SectionHeading from '../components/ui/SectionHeading';
import Reveal, { RevealImage } from '../components/ui/Reveal';
import { profile } from '../data/site';
import { education } from '../data/experience';
import profileImg from '../assets/images/profile.jpg';

const About = () => {
  // About rises over the pinned hero, so its content waits until the section has reached the top of the
  // screen (fills the page) instead of revealing while it's still sliding up. The marker covers the whole
  // section and the watch zone is the top 20% of the viewport (at 12%, a navbar link to About, which lands with
  // About's top about 13% down so the big "01" clears the bar, left the content waiting for more scrolling).
  const marker = useRef(null);
  const arrived = useInView(marker, { once: true, margin: '0px 0px -80% 0px' });

  // The photo sits slightly enlarged in its card and drifts as the section scrolls past (a window effect).
  const photo = useRef(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: photo, offset: ['start end', 'end start'] });
  const photoY = useTransform(scrollYProgress, [0, 1], reduceMotion ? ['0%', '0%'] : ['-6%', '6%']);

  return (
    <Section id="about" background={<span ref={marker} aria-hidden className="pointer-events-none absolute inset-0" />}>
      {/* Laid out like the other sections: the heading across the top, then the content on the grid under it */}
      <SectionHeading eyebrow="02 — About" title="Get to know me" play={arrived} />

      <div className="mt-12 grid gap-12 sm:mt-16 md:grid-cols-12 lg:gap-16">
        {/* Hovering twists the photo one way and swings the offset frame behind it the other way */}
        <div
          ref={photo}
          className="group relative mx-auto w-full max-w-sm self-start md:col-span-5 md:max-w-none lg:col-span-4"
        >
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

        {/* As tall as the photo: the paragraph at its top, Education lined up with its bottom edge */}
        <div className="flex flex-col justify-between gap-12 md:col-span-7 lg:col-span-8">
          <Reveal
            as="p"
            play={arrived}
            delay={0.45}
            className="max-w-2xl text-base leading-relaxed text-pretty text-stone-300"
          >
            {profile.about}
          </Reveal>

          {/* Education, built like an Experience row: school and dates on one line, the degree, then the honours */}
          {education.map(({ role, organization, logo, initials, period, points }) => (
            <Reveal key={role} play={arrived} delay={0.6} className="border-t border-white/15 pt-8">
              <p className="font-display text-[0.8125rem] font-bold tracking-[0.14em] text-accent uppercase">Education</p>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
                <div className="flex items-center gap-4">
                  <span className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-line bg-surface shadow-[0_0_18px_-4px_rgb(159_143_129/0.5)]">
                    {logo ? (
                      <img src={logo} alt={`${organization} logo`} className="size-full bg-white object-contain p-1" />
                    ) : (
                      <span aria-hidden className="font-display text-xs font-bold text-accent-strong">
                        {initials}
                      </span>
                    )}
                  </span>
                  <p className="text-lg font-medium text-stone-200">{organization}</p>
                </div>
                <p className="rounded-full border border-accent/35 px-4 py-1.5 font-display text-[0.8125rem] font-bold tracking-[0.14em] text-accent-strong uppercase">
                  {period}
                </p>
              </div>
              <h3 className="mt-5 font-heading text-2xl leading-[0.95] font-extrabold tracking-[0.01em] text-balance text-white uppercase sm:text-3xl">
                {role}
              </h3>
              {points.length > 0 && (
                <p className="mt-4 max-w-2xl text-base leading-relaxed text-pretty text-stone-300">
                  {points.join(' ')}
                </p>
              )}
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  );
};

export default About;
