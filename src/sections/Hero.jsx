import { useRef } from 'react';
import { motion, useInView, useReducedMotion } from 'motion/react';
import { TypeAnimation } from 'react-type-animation';
import { LuArrowDown, LuArrowRight, LuClock, LuFileDown, LuMapPin } from 'react-icons/lu';
import Button from '../components/ui/Button';
import Container from '../components/ui/Container';
import DegreeTag from '../components/ui/DegreeTag';
import FluidImage from '../components/ui/FluidImage';
import LocalTime from '../components/ui/LocalTime';
import Portrait from '../components/ui/Portrait';
import SocialIcon from '../components/ui/SocialIcon';
import { RevealGroup, RevealItem } from '../components/ui/Reveal';
import { imageReveal } from '../components/ui/revealVariants';
import { profile, socials } from '../data/site';
import heroBg from '../assets/images/hero-bg.jpg';
import { sectionLink } from '../hooks/useCleanAnchorLinks';
import useTheme from '../hooks/useTheme';

// The page colour (--color-ink) per theme for the hero's shader, which can't read CSS; module constants, so they keep
// the same identity between renders
const PAGE = { dark: [0.086, 0.082, 0.075], light: [0.902, 0.867, 0.824] };

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

// Entrance: the photo comes into focus as the page opens, like a camera pulling focus.
const focusPull = (ready, reduceMotion) => {
  const soft = { scale: 1.08, opacity: 0, filter: reduceMotion ? 'blur(0px)' : 'blur(5px)' };
  return {
    initial: soft,
    animate: ready ? { scale: 1, opacity: 1, filter: 'blur(0px)' } : soft,
    transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1] },
  };
};

const HeroBackground = ({ paused, ready, reduceMotion, theme }) => (
  <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden">
    <FluidImage
      src={heroBg}
      paused={paused}
      // Faded into the page inside the shader (not by an overlay) so the coffee ripples show at full strength
      dim={theme === 'light' ? 0.93 : 0.88}
      base={PAGE[theme]}
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
 * typing only once the hero is shown, so it always starts from the first role. `min-h` reserves the line
 * so the layout doesn't jump between roles.
 */
// Exactly one line tall even while empty, between roles (`1lh`): its old 1.4em minimum was 2px short of the line, so
// the content under it jumped up and back each time a role was erased
const RoleLine = ({ ready }) => (
  <RevealItem
    as="p"
    className="mt-4 flex min-h-[1lh] items-center font-display text-item font-semibold text-accent-strong"
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
      className="ml-1.5 inline-block h-[0.95em] w-[2px] animate-caret rounded-full bg-matcha motion-reduce:animate-none"
    />
  </RevealItem>
);

// A plain link to the work with a round down arrow, the counterpart of the footer's "Back to top"; the generic
// "SCROLL" word over a running line read as an AI template.
const ScrollCue = () => (
  <a
    {...sectionLink('projects')}
    className="group flex items-center gap-3 font-mono text-label font-medium tracking-[0.08em] text-stone-400 uppercase transition-colors hover:text-matcha-strong"
  >
    See my work
    <span className="flex size-9 items-center justify-center overflow-hidden rounded-full border border-white/20 bg-ink/40 transition-colors duration-300 group-hover:border-matcha group-hover:bg-matcha group-hover:text-ink">
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

const Fact = ({ icon: Icon, children }) => (
  <li className="flex items-center gap-2 rounded-full border border-white/15 bg-ink/40 px-3 py-1.5">
    <Icon aria-hidden className="size-3.5 text-accent" />
    {children}
  </li>
);

const [firstName, ...otherNames] = profile.name.split(' ');

/**
 * The first screen answers who, what and how to reach me at once: name, cycling role, quick facts, a short introduction,
 * the resume and contact buttons, profiles and photo, over the rippling coffee photo. It took over the About section
 * (its text and photo), whose own screen was mostly empty, and Education (the degree tag's card).
 */
const Hero = ({ ready = true }) => {
  const ref = useRef(null);
  const reduceMotion = useReducedMotion();
  const onScreen = useInView(ref);
  const { theme } = useTheme();

  // In the light theme the text that's near-white in the dark one is near-black (the owner's request), not dark grey
  return (
    <section
      ref={ref}
      id="hero"
      className="relative isolate flex min-h-svh items-center overflow-hidden pt-16 light:[--color-stone-200:var(--color-white)] light:[--color-stone-300:var(--color-white)] xl:pt-0"
    >
      <HeroBackground paused={!onScreen} ready={ready} reduceMotion={reduceMotion} theme={theme} />

      <Container className="py-12 pb-20 sm:pb-24">
        <RevealGroup
          play={ready}
          delay={0.15}
          stagger={0.07}
          className="grid gap-8 sm:grid-cols-12 sm:items-start sm:gap-8 lg:items-center lg:gap-12"
        >
          <RevealItem variants={imageReveal} className="sm:order-last sm:col-span-5">
            <Portrait />
          </RevealItem>

          <div className="sm:col-span-7">
            <RevealItem
              as="p"
              className="flex items-center gap-4 font-mono text-label font-medium tracking-[0.08em] text-accent uppercase"
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
            {/* The facts at a glance: degree (its card has the rest), where I am, my time there, and that I'm available */}
            <RevealItem
              as="ul"
              className="relative z-10 mt-4 flex flex-wrap gap-2 font-mono text-label font-medium text-stone-300"
            >
              <DegreeTag />
              <Fact icon={LuMapPin}>{profile.location}</Fact>
              <Fact icon={LuClock}>
                <LocalTime />
              </Fact>
              {profile.availability && (
                // In the matcha green: available, go
                <li className="flex items-center gap-2 rounded-full border border-matcha/50 bg-matcha/12 px-3 py-1.5 text-matcha">
                  <span aria-hidden className="size-1.5 rounded-full bg-matcha" />
                  {profile.availability}
                </li>
              )}
            </RevealItem>

            <RevealItem as="p" className="mt-6 max-w-2xl text-copy leading-relaxed text-pretty text-stone-300">
              {profile.about}
            </RevealItem>

            {/* Natural widths, the same labels on every screen (the owner didn't want them shortened on phones) */}
            <RevealItem className="mt-8 flex flex-wrap gap-3 sm:gap-4">
              <Button href={profile.resume} target="_blank" rel="noopener noreferrer" icon={LuFileDown} nudge="y">
                Download Resume
              </Button>
              <Button {...sectionLink('contact')} variant="outline" icon={LuArrowRight}>
                Get in Touch
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
