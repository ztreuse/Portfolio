import { useRef } from 'react';
import { motion, useInView, useReducedMotion, useScroll, useTransform } from 'motion/react';
import Section from '../components/ui/Section';
import SectionHeading from '../components/ui/SectionHeading';
import Reveal, { RevealImage } from '../components/ui/Reveal';
import { profile } from '../data/site';
import profileImg from '../assets/images/profile.jpg';

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
          <Reveal as="p" play={arrived} delay={0.35} className="mt-4 text-base leading-relaxed text-stone-300 sm:text-lg">
            {profile.about}
          </Reveal>
        </div>
      </div>
    </Section>
  );
};

export default About;
