import { useRef, useState } from 'react';
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { TypeAnimation } from 'react-type-animation';
import { LuArrowRight, LuDownload } from 'react-icons/lu';
import Button from '../components/ui/Button';
import Container from '../components/ui/Container';
import FluidImage from '../components/ui/FluidImage';
import SocialIcon from '../components/ui/SocialIcon';
import { RevealGroup, RevealItem } from '../components/ui/Reveal';
import { profile, socials } from '../data/site';
import heroBg from '../assets/images/hero-bg.jpg';
import { sectionLink } from '../hooks/useCleanAnchorLinks';

// Slow drifting glows; each loops on its own timing so the pattern never visibly repeats.
const glows = [
  {
    className: 'top-1/3 left-1/2 size-[24rem] bg-accent-strong/15',
    x: [0, -60, 50, 0],
    y: [0, 40, -40, 0],
    duration: 18,
  },
];

// Fixed positions (left %, top %, delay s) keep renders pure while looking scattered.
const particles = [
  [8, 72, 0],
  [18, 40, 2.5],
  [27, 85, 5],
  [36, 25, 1.2],
  [44, 65, 3.8],
  [53, 90, 6.3],
  [61, 35, 0.8],
  [70, 78, 4.4],
  [78, 20, 2],
  [86, 60, 5.6],
  [93, 45, 3.1],
  [14, 15, 6.8],
];

const HeroBackground = ({ paused, scale, y }) => (
  <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden">
    {/* Everything behind the text zooms in and rises as you scroll: sinking down into the picture, like going underwater */}
    <motion.div style={{ scale, y }} className="absolute inset-0 origin-[50%_70%]">
      <FluidImage
        src={heroBg}
        paused={paused}
        // Darkened inside the shader (not by an overlay) so the coffee ripples and crema show at full strength
        dim={0.85}
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.8, ease: 'easeOut' }}
        className="absolute inset-0 size-full object-cover"
      />

      {glows.map(({ className, x, y, duration }) => (
        <motion.div
          key={className}
          animate={{ x, y }}
          transition={{ duration, repeat: Infinity, ease: 'easeInOut' }}
          className={`absolute rounded-full blur-[120px] ${className}`}
        />
      ))}

      {particles.map(([left, top, delay]) => (
        <motion.span
          key={`${left}-${top}`}
          style={{ left: `${left}%`, top: `${top}%` }}
          animate={{ y: [0, -120], opacity: [0, 0.8, 0] }}
          transition={{ duration: 7, delay, repeat: Infinity, ease: 'easeOut' }}
          className="absolute size-1 rounded-full bg-accent-strong"
        />
      ))}
    </motion.div>
    <div className="absolute inset-x-0 bottom-0 h-40 bg-linear-to-b from-transparent to-ink" />
  </div>
);

const ScrollCue = () => (
  <motion.a
    {...sectionLink('about')}
    aria-label="Scroll to About"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 1.6, duration: 0.6 }}
    className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-3 text-[11px] font-semibold tracking-[0.25em] text-stone-500 uppercase transition-colors hover:text-accent-strong sm:flex [@media(max-height:700px)]:hidden"
  >
    Scroll
    <span className="relative h-10 w-px overflow-hidden bg-line">
      <motion.span
        className="absolute inset-x-0 top-0 h-1/2 bg-accent"
        animate={{ y: ['-100%', '200%'] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
      />
    </span>
  </motion.a>
);

const [firstName, ...otherNames] = profile.name.split(' ');

// Each text line floats on its own: a slow vertical bob from the CSS `animate-float` keyframes (GPU, so
// it stays smooth while the water renders). Different heights, durations and start offsets keep the
// lines out of step. `translate` doesn't clash with the reveal's `transform`.
const floatBase = 'animate-float will-change-[translate] motion-reduce:animate-none';
const float = {
  label: `${floatBase} [--float:-5px] [animation-duration:6s] [animation-delay:-0.5s]`,
  name: `${floatBase} [--float:-9px] [animation-duration:7s] [animation-delay:-2s]`,
  role: `${floatBase} [--float:-7px] [animation-duration:6.5s] [animation-delay:-3.5s]`,
  actions: `${floatBase} [--float:-6px] [animation-duration:5.5s] [animation-delay:-1.2s]`,
  socials: `${floatBase} [--float:-5px] [animation-duration:7.5s] [animation-delay:-4.6s]`,
};

// How many screens of scrolling the dive takes; must match the spacer's h-[140svh] below.
const DIVE_SCREENS = 1.4;

const Hero = ({ ready }) => {
  const ref = useRef(null);
  const [covered, setCovered] = useState(false);
  const reduceMotion = useReducedMotion();

  // The hero is pinned (sticky) and followed by a spacer, so scrolling plays a "dive" first and only then
  // lets About slide up. journey: 0 -> 1 dives into the picture (over DIVE_SCREENS screens, so each scroll
  // step zooms gently), 1 -> 2 About covers it (one screen).
  const { scrollY } = useScroll();
  const journey = useTransform(scrollY, (y) => {
    const screen = ref.current?.offsetHeight || window.innerHeight;
    const dive = screen * DIVE_SCREENS;
    const value = y <= dive ? y / dive : 1 + (y - dive) / screen;
    return Math.min(Math.max(value, 0), 2);
  });
  // Hidden (and its animation paused) only once About's solid part has fully passed over it.
  useMotionValueEvent(scrollY, 'change', () => {
    const about = document.getElementById('about');
    setCovered(!!about && about.getBoundingClientRect().top <= 0);
  });

  // Dive: the background zooms deep into the photo while the text rushes past (grows, blurs, clears).
  // Then About rises over the darkened, still-expanding scene.
  const bgScale = useTransform(journey, [0, 1, 2], reduceMotion ? [1, 1, 1] : [1, 2.4, 2.7]);
  // Zooming toward a low point while the scene drifts up makes the dive head downward (sinking, not just pushing in).
  const bgY = useTransform(journey, [0, 1, 2], reduceMotion ? ['0%', '0%', '0%'] : ['0%', '-12%', '-16%']);
  const dim = useTransform(journey, [0, 1, 2], [0, 0.35, 0.7]);
  const textScale = useTransform(journey, [0, 0.8], reduceMotion ? [1, 1] : [1, 1.6]);
  const textY = useTransform(journey, [0, 0.8], reduceMotion ? [0, 0] : [0, -220]);
  const textOpacity = useTransform(journey, [0, 0.25, 0.7], reduceMotion ? [1, 1, 1] : [1, 1, 0]);
  const textBlur = useTransform(
    journey,
    [0.1, 0.7],
    reduceMotion ? ['blur(0px)', 'blur(0px)'] : ['blur(0px)', 'blur(10px)'],
  );

  return (
    <>
      <section
        ref={ref}
        id="hero"
        className={`sticky top-0 isolate flex min-h-svh items-center overflow-hidden pt-16 ${covered ? 'invisible' : ''}`}
      >
        <HeroBackground paused={covered} scale={bgScale} y={bgY} />
        {/* Darkens only the background, behind the text */}
        <motion.div aria-hidden style={{ opacity: dim }} className="pointer-events-none absolute inset-0 bg-ink" />

        <motion.div
          style={{ y: textY, scale: textScale, opacity: textOpacity, filter: textBlur }}
          className="relative w-full"
        >
          <Container className="py-20">
            <RevealGroup play={ready} delay={0.35} stagger={0.12}>
              <RevealItem
                as="p"

                className={`font-display text-sm font-semibold tracking-[0.14em] text-accent uppercase sm:text-base ${float.label}`}
              >
                Hello there, I'm
              </RevealItem>

              <RevealItem
                as="h1"

                className={`mt-3 font-display text-6xl leading-[1.05] font-bold tracking-[-0.06em] text-white sm:text-7xl lg:text-8xl ${float.name}`}
              >
                {firstName}{' '}
                {/* Extra right padding (cancelled by the margin) so the tight tracking doesn't clip the last letter out of the gradient */}
                <span className="-mr-[0.1em] bg-linear-to-r from-accent-strong to-accent bg-clip-text pr-[0.1em] text-transparent">
                  {otherNames.join(' ')}
                </span>
              </RevealItem>

              {/* min-h reserves the line so the layout doesn't jump between roles */}
              <RevealItem
                as="p"

                className={`mt-5 min-h-[1.4em] font-display text-2xl text-stone-300 sm:text-3xl ${float.role}`}
              >
                <span className="sr-only">{profile.role}</span>
                <TypeAnimation
                  aria-hidden
                  sequence={profile.roles.flatMap((role) => [role, 2200])}
                  wrapper="span"
                  speed={50}
                  deletionSpeed={70}
                  repeat={Infinity}
                />
              </RevealItem>

              <RevealItem className={`mt-10 flex flex-wrap gap-4 ${float.actions}`}>
                <Button href={profile.resume} target="_blank" rel="noopener noreferrer" icon={LuDownload} nudge="y">
                  Download Resume
                </Button>
                <Button {...sectionLink('contact')} variant="outline" icon={LuArrowRight}>
                  Get in Touch
                </Button>
              </RevealItem>

              <RevealItem as="ul" className={`mt-12 flex gap-3 ${float.socials}`}>
                {socials.map((social) => (
                  <li key={social.label}>
                    <SocialIcon {...social} />
                  </li>
                ))}
              </RevealItem>
            </RevealGroup>
          </Container>
        </motion.div>

        <motion.div style={{ opacity: textOpacity }}>
          <ScrollCue />
        </motion.div>
      </section>
      {/* Scroll room for the dive; skipped for reduced motion so About follows straight away */}
      {!reduceMotion && <div aria-hidden className="h-[140svh]" />}
    </>
  );
};

export default Hero;
