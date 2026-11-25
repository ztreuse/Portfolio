import { useRef } from 'react';
import { motion, useInView, useReducedMotion } from 'motion/react';
import { TypeAnimation } from 'react-type-animation';
import { LuArrowDown, LuArrowRight, LuDownload } from 'react-icons/lu';
import Button from '../components/ui/Button';
import Container from '../components/ui/Container';
import FluidImage from '../components/ui/FluidImage';
import SocialIcon from '../components/ui/SocialIcon';
import { RevealGroup, RevealItem } from '../components/ui/Reveal';
import { imageReveal } from '../components/ui/revealVariants';
import { profile, socials } from '../data/site';
import { education } from '../data/experience';
import heroBg from '../assets/images/hero-bg.jpg';
import profileImg from '../assets/images/profile.webp';
import { sectionLink } from '../hooks/useCleanAnchorLinks';

// Fixed positions (left %, top %, delay s) keep renders pure while looking scattered.
const particles = [
  [8, 72, 0],
  [27, 85, 5],
  [36, 25, 1.2],
  [53, 90, 6.3],
  [61, 35, 0.8],
  [78, 20, 2],
  [86, 60, 5.6],
  [14, 15, 6.8],
];

// Entrance: the photo comes into focus as the preloader lifts, like a camera pulling focus.
const focusPull = (ready, reduceMotion) => {
  const soft = { scale: 1.08, opacity: 0, filter: reduceMotion ? 'blur(0px)' : 'blur(5px)' };
  return {
    initial: soft,
    animate: ready ? { scale: 1, opacity: 1, filter: 'blur(0px)' } : soft,
    transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1] },
  };
};

const HeroBackground = ({ paused, ready, reduceMotion }) => (
  <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden">
    <FluidImage
      src={heroBg}
      paused={paused}
      // Darkened inside the shader (not by an overlay) so the coffee ripples and crema show at full strength
      dim={0.88}
      {...focusPull(ready, reduceMotion)}
      className="absolute inset-0 size-full object-cover"
    />
    {/* Rising particles: not on phones, where every extra moving layer costs scroll smoothness */}
    <div className="absolute inset-0 max-md:hidden">
      {!paused &&
        particles.map(([left, top, delay]) => (
          <motion.span
            key={`${left}-${top}`}
            style={{ left: `${left}%`, top: `${top}%` }}
            animate={{ y: [0, -120], opacity: [0, 0.8, 0] }}
            transition={{ duration: 7, delay, repeat: Infinity, ease: 'easeOut' }}
            className="absolute size-1 rounded-full bg-accent-strong"
          />
        ))}
    </div>
  </div>
);

/**
 * The cycling role ("Front-End Developer", "UI/UX Designer", ...), typed out with a slim taupe caret. It starts
 * typing only once the hero is shown, so it isn't caught mid-word when the preloader lifts. `min-h` reserves the line
 * so the layout doesn't jump between roles.
 */
const RoleLine = ({ ready }) => (
  <RevealItem
    as="p"
    className="mt-4 flex min-h-[1.4em] items-center font-display text-item font-semibold text-accent-strong"
  >
    <span className="sr-only">{profile.role}</span>
    {ready && (
      <TypeAnimation
        aria-hidden
        sequence={profile.roles.flatMap((role) => [role, 2200])}
        wrapper="span"
        speed={50}
        deletionSpeed={70}
        repeat={Infinity}
        cursor={false}
      />
    )}
    {/* Slim taupe caret instead of the default "|" */}
    <span
      aria-hidden
      className="ml-1.5 inline-block h-[0.95em] w-[2px] animate-caret rounded-full bg-accent motion-reduce:animate-none"
    />
  </RevealItem>
);

// A plain link to the work with a round down arrow, the counterpart of the footer's "Back to top"; the generic
// "SCROLL" word over a running line read as an AI template.
const ScrollCue = () => (
  <a
    {...sectionLink('projects')}
    className="group flex items-center gap-3 font-display text-label font-bold tracking-[0.14em] text-stone-400 uppercase transition-colors hover:text-accent-strong"
  >
    See my work
    <span className="flex size-9 items-center justify-center overflow-hidden rounded-full border border-white/20 bg-ink/40 transition-colors duration-300 group-hover:border-accent group-hover:bg-accent group-hover:text-ink">
      {/* On hover the arrow drops out of the circle and a new one drops in from the top */}
      <span className="relative block size-4">
        <LuArrowDown
          aria-hidden
          className="absolute inset-0 size-4 transition-transform duration-300 group-hover:translate-y-6 motion-reduce:transition-none"
        />
        <LuArrowDown
          aria-hidden
          className="absolute inset-0 size-4 -translate-y-6 transition-transform duration-300 group-hover:translate-y-0 motion-reduce:transition-none"
        />
      </span>
    </span>
  </a>
);

/** The grad photo in its card; hovering twists it one way and swings the offset frame behind it the other way. */
const Portrait = () => (
  <RevealItem variants={imageReveal} className="group relative w-28 sm:w-36 lg:w-full">
    <span
      aria-hidden
      className="absolute inset-0 translate-2 rounded-2xl border border-accent/40 transition-[translate,rotate] duration-500 ease-out group-hover:translate-4 group-hover:rotate-2 motion-reduce:transition-none lg:translate-4 lg:group-hover:translate-6"
    />
    <div className="relative overflow-hidden rounded-2xl border border-line transition-[rotate] duration-500 ease-out group-hover:-rotate-2 motion-reduce:transition-none">
      <img
        src={profileImg}
        alt="Troy Bay in an FEU Tech graduation toga"
        className="aspect-4/5 w-full object-cover object-[50%_25%]"
      />
    </div>
  </RevealItem>
);

const [firstName, ...otherNames] = profile.name.split(' ');

/**
 * The first screen answers who, what and how to reach me at once: name, cycling role, degree, a short introduction,
 * the resume and contact buttons, profiles and photo, over the rippling coffee photo. It took over the About section
 * (its text and photo), whose own screen was mostly empty; Education is a row in Experience.
 */
const Hero = ({ ready }) => {
  const ref = useRef(null);
  const reduceMotion = useReducedMotion();
  const onScreen = useInView(ref);

  return (
    <section ref={ref} id="hero" className="relative isolate flex min-h-svh items-center overflow-hidden pt-16">
      <HeroBackground paused={!onScreen} ready={ready} reduceMotion={reduceMotion} />

      <Container className="py-12 pb-20 sm:pb-24">
        <RevealGroup
          play={ready}
          delay={0.15}
          stagger={0.07}
          className="flex flex-col gap-8 lg:grid lg:grid-cols-12 lg:items-center lg:gap-16"
        >
          <div className="order-first lg:order-last lg:col-span-4">
            <Portrait />
          </div>

          <div className="lg:col-span-8">
            <RevealItem
              as="p"
              className="flex items-center gap-4 font-display text-label font-bold tracking-[0.14em] text-accent uppercase"
            >
              <span aria-hidden className="h-px w-10 bg-linear-to-r from-accent/0 to-accent" />
              Hello there, I'm
            </RevealItem>

            <RevealItem
              as="h1"
              className="mt-3 font-heading text-name leading-[0.88] font-black tracking-[0.005em] text-white uppercase"
            >
              {firstName}{' '}
              {/* Solid taupe, not a bg-clip-text gradient: some browsers clip that gradient to the letter's box and
                  cut off the "y" arm that the tight tracking pushes past it */}
              <span className="text-accent-strong">{otherNames.join(' ')}</span>
            </RevealItem>

            <RoleLine ready={ready} />
            <RevealItem
              as="p"
              className="mt-2 font-display text-label font-bold tracking-[0.04em] text-balance text-stone-400 uppercase sm:tracking-[0.14em]"
            >
              {education[0].short}
            </RevealItem>

            <RevealItem as="p" className="mt-6 max-w-2xl text-copy leading-relaxed text-pretty text-stone-300">
              {profile.about}
            </RevealItem>

            {/* Natural widths (short labels on phones); stretched into equal halves they looked odd */}
            <RevealItem className="mt-8 flex flex-wrap gap-3 sm:gap-4">
              <Button href={profile.resume} target="_blank" rel="noopener noreferrer" icon={LuDownload} nudge="y">
                <span className="sm:hidden">Resume</span>
                <span className="max-sm:hidden">Download Resume</span>
              </Button>
              <Button {...sectionLink('contact')} variant="outline" icon={LuArrowRight}>
                <span className="sm:hidden">Contact</span>
                <span className="max-sm:hidden">Get in Touch</span>
              </Button>
            </RevealItem>

            <RevealItem className="mt-8 flex max-w-2xl flex-wrap items-center justify-between gap-5 border-t border-white/10 pt-5">
              <ul className="flex gap-2 sm:gap-3">
                {socials.map((social) => (
                  <li key={social.label}>
                    <SocialIcon {...social} />
                  </li>
                ))}
              </ul>
              <ScrollCue />
            </RevealItem>
          </div>
        </RevealGroup>
      </Container>
    </section>
  );
};

export default Hero;
