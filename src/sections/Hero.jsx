import { useLayoutEffect, useRef, useState } from 'react';
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { TypeAnimation } from 'react-type-animation';
import { LuArrowRight, LuDownload } from 'react-icons/lu';
import Button from '../components/ui/Button';
import Container from '../components/ui/Container';
import FluidImage from '../components/ui/FluidImage';
import MorphText from '../components/ui/MorphText';
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

// Entrance: the photo comes into focus as the preloader lifts (blurred and slightly zoomed, then sharp), like a
// camera pulling focus. It waits for `ready`, so it isn't spent unseen behind the preloader.
const focusPull = (ready, reduceMotion) => ({
  initial: { scale: 1.12, opacity: 0, filter: reduceMotion ? 'blur(0px)' : 'blur(5px)' },
  animate: ready
    ? { scale: 1, opacity: 1, filter: 'blur(0px)' }
    : { scale: 1.12, opacity: 0, filter: reduceMotion ? 'blur(0px)' : 'blur(5px)' },
  transition: { duration: 1.8, ease: [0.22, 1, 0.36, 1] },
});

const HeroBackground = ({ paused, scale, y, ready, reduceMotion }) => (
  <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden">
    {/* Everything behind the text zooms in and rises as you scroll: sinking down into the picture, like going underwater */}
    <motion.div style={{ scale, y }} className="absolute inset-0 origin-[50%_70%]">
      <FluidImage
        src={heroBg}
        paused={paused}
        // Darkened inside the shader (not by an overlay) so the coffee ripples and crema show at full strength
        dim={0.85}
        {...focusPull(ready, reduceMotion)}
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

// Sits in the middle of the bottom strip; hidden on phones and on short screens.
const ScrollCue = () => (
  <a
    {...sectionLink('projects')}
    aria-label="Scroll to Projects"
    className="hidden items-center gap-3 font-heading text-sm font-bold tracking-[0.25em] text-stone-400 uppercase transition-colors hover:text-accent-strong sm:flex [@media(max-height:620px)]:hidden"
  >
    Scroll
    <span className="relative h-8 w-px overflow-hidden bg-line">
      <motion.span
        className="absolute inset-x-0 top-0 h-1/2 bg-accent"
        animate={{ y: ['-100%', '200%'] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
      />
    </span>
  </a>
);

// Hero entrance pieces (children of the hero's RevealGroup, so they follow its timing).
const enterEase = [0.22, 1, 0.36, 1];
const ruleDraw = {
  hidden: { scaleX: 0 },
  visible: { scaleX: 1, transition: { duration: 0.9, ease: enterEase } },
};
// The name's words fade up whole one after the other and sharpen into place, like the section titles. No mask: a
// word caught mid-rise behind one showed only the tops of its letters.
const nameRise = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };
const wordRise = {
  hidden: { opacity: 0, y: '0.25em', filter: 'blur(10px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 1.1, ease: enterEase } },
};

const MaskedWord = ({ className = '', children }) => (
  <motion.span data-morph-word variants={wordRise} className={`inline-block ${className}`}>
    {children}
  </motion.span>
);

const [firstName, ...otherNames] = profile.name.split(' ');

// Each text line floats on its own: a slow vertical bob from the CSS `animate-float` keyframes (GPU, so
// it stays smooth while the water renders). Different heights, durations and start offsets keep the
// lines out of step. `translate` doesn't clash with the reveal's `transform`.
const floatBase = 'animate-float will-change-[translate] motion-reduce:animate-none';
const float = {
  label: `${floatBase} [--float:-5px] [animation-duration:6s] [animation-delay:-0.5s]`,
  name: `${floatBase} [--float:-9px] [animation-duration:7s] [animation-delay:-2s]`,
  actions: `${floatBase} [--float:-6px] [animation-duration:5.5s] [animation-delay:-1.2s]`,
};

/**
 * Sizes the name so it spans the full content width: one line from sm up, "TROY" over "BAY" on phones (the wider
 * word fills the width). It measures the name at a known size and scales, and re-fits only when the width changes
 * (a phone's address bar changing the height must not resize it). Capped by the screen height so the name leaves
 * room for the rest of the hero on short, wide screens.
 */
const useFitName = (boxRef, nameRef) => {
  const [size, setSize] = useState(null);
  useLayoutEffect(() => {
    // Text width scales linearly with font size, so one measurement at the current size gives the fitted size
    const fit = () => {
      const box = boxRef.current;
      const name = nameRef.current;
      if (!box || !name || !name.offsetWidth) return;
      const current = parseFloat(getComputedStyle(box).fontSize);
      const lines = window.matchMedia('(max-width: 639px)').matches ? 2 : 1;
      const maxByHeight = (window.innerHeight * 0.4) / (lines * 0.85);
      setSize(Math.min(((current * box.clientWidth) / name.offsetWidth) * 0.995, maxByHeight));
    };
    fit();
    document.fonts?.ready.then(fit);
    let width = boxRef.current?.clientWidth;
    const observer = new ResizeObserver(() => {
      if (boxRef.current?.clientWidth === width) return;
      width = boxRef.current?.clientWidth;
      fit();
    });
    if (boxRef.current) observer.observe(boxRef.current);
    return () => observer.disconnect();
  }, [boxRef, nameRef]);
  return size;
};

// How many screens of scrolling the dive takes; must match the spacer's h-[140svh] below.
const DIVE_SCREENS = 1.4;

const Hero = ({ ready }) => {
  const ref = useRef(null);
  const [covered, setCovered] = useState(false);
  const reduceMotion = useReducedMotion();
  const nameBox = useRef(null);
  const nameText = useRef(null);
  const nameSize = useFitName(nameBox, nameText);

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
  // Hidden (and its animation paused) only once the panel after it has fully passed over it.
  useMotionValueEvent(scrollY, 'change', () => {
    const panel = document.querySelector('[data-panel]');
    setCovered(!!panel && panel.getBoundingClientRect().top <= 0);
  });

  // Dive: the background zooms deep into the photo while the text rushes past (grows, blurs, clears).
  // Then About rises over the darkened, still-expanding scene.
  const bgScale = useTransform(journey, [0, 1, 2], reduceMotion ? [1, 1, 1] : [1, 2.4, 2.7]);
  // Zooming toward a low point while the scene drifts up makes the dive head downward (sinking, not just pushing in).
  const bgY = useTransform(journey, [0, 1, 2], reduceMotion ? ['0%', '0%', '0%'] : ['0%', '-12%', '-16%']);
  // The scene fades out into the page colour as it dives, fully by the end of the dive, so About then slides up
  // over plain ink and needs no fade of its own (a long dark fade showed horizontal strips).
  const dim = useTransform(journey, [0, 0.3, 1], [0, 0.1, 1]);
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
        <HeroBackground paused={covered} scale={bgScale} y={bgY} ready={ready} reduceMotion={reduceMotion} />
        {/* Fades the background out during the dive, behind the text */}
        <motion.div aria-hidden style={{ opacity: dim }} className="pointer-events-none absolute inset-0 bg-ink" />

        <motion.div
          style={{ y: textY, scale: textScale, opacity: textOpacity, filter: textBlur }}
          className="relative w-full"
        >
          <Container className="pt-10 pb-32 sm:pb-36">
            <RevealGroup play={ready} delay={0.35} stagger={0.12}>
              <RevealItem
                as="p"
                className={`flex items-center gap-4 font-heading text-lg font-bold tracking-[0.18em] text-accent uppercase sm:text-xl ${float.label}`}
              >
                {/* The rule draws itself in from the left as the label appears */}
                <motion.span
                  aria-hidden
                  variants={ruleDraw}
                  className="h-px w-10 origin-left bg-linear-to-r from-accent/0 to-accent sm:w-14"
                />
                Hello there, I'm
              </RevealItem>

              {/* Fitted to the full content width by useFitName (the clamp is only the size before it measures) */}
              <RevealItem
                as="h1"
                ref={nameBox}
                style={nameSize ? { fontSize: nameSize } : undefined}
                variants={nameRise}
                className={`relative mt-3 font-heading text-[clamp(5rem,22vw,13rem)] leading-[0.85] font-black tracking-[0.005em] text-white uppercase ${float.name}`}
              >
                <span ref={nameText} className="inline-block whitespace-nowrap max-sm:whitespace-normal">
                  <MaskedWord className="max-sm:block">{firstName}</MaskedWord>{' '}
                  {/* Solid taupe, not a bg-clip-text gradient: some browsers clip that gradient to the letter's box and
                      cut off the "y" arm that the tight tracking pushes past it */}
                  <MaskedWord className="text-accent-strong max-sm:block">{otherNames.join(' ')}</MaskedWord>
                </span>
                {/* The letters bend like liquid where the cursor touches them */}
                <MorphText fit={nameSize} />
              </RevealItem>

              {/* Equal halves with short labels on phones, natural widths from sm up */}
              <RevealItem className={`mt-8 grid grid-cols-2 gap-3 sm:mt-10 sm:flex sm:gap-4 ${float.actions}`}>
                <Button
                  href={profile.resume}
                  target="_blank"
                  rel="noopener noreferrer"
                  icon={LuDownload}
                  nudge="y"
                  className="max-sm:justify-between max-sm:pl-5"
                >
                  <span className="sm:hidden">Resume</span>
                  <span className="max-sm:hidden">Download Resume</span>
                </Button>
                <Button
                  {...sectionLink('contact')}
                  variant="outline"
                  icon={LuArrowRight}
                  className="max-sm:justify-between max-sm:pl-5"
                >
                  <span className="sm:hidden">Contact</span>
                  <span className="max-sm:hidden">Get in Touch</span>
                </Button>
              </RevealItem>
            </RevealGroup>
          </Container>
        </motion.div>

        {/* Bottom strip on the screen's bottom edge: the cycling role, the scroll cue and the socials above a
            hairline. It leaves the middle to the name and fills the bottom of the first screen. */}
        <motion.div style={{ opacity: textOpacity }} className="absolute inset-x-0 bottom-0">
          <Container>
            <RevealGroup
              play={ready}
              delay={0.9}
              stagger={0.12}
              className="grid grid-cols-[1fr_auto] items-center gap-4 border-t border-white/10 py-5 sm:grid-cols-[1fr_auto_1fr] sm:py-6"
            >
              {/* min-h reserves the line so the layout doesn't jump between roles */}
              <RevealItem
                as="p"
                className="flex min-h-[1.2em] items-center font-heading text-2xl font-semibold tracking-[0.04em] text-stone-200 uppercase sm:text-3xl"
              >
                <span className="sr-only">{profile.role}</span>
                {/* Starts typing only once the hero is shown, so it isn't caught mid-word when the preloader lifts */}
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
                  className="ml-1.5 inline-block h-[0.95em] w-[3px] rounded-full bg-accent animate-caret motion-reduce:animate-none"
                />
              </RevealItem>

              <RevealItem className="max-sm:hidden">
                <ScrollCue />
              </RevealItem>

              <RevealItem as="ul" className="flex justify-end gap-2 sm:gap-3">
                {socials.map((social) => (
                  <li key={social.label}>
                    <SocialIcon {...social} />
                  </li>
                ))}
              </RevealItem>
            </RevealGroup>
          </Container>
        </motion.div>
      </section>
      {/* Scroll room for the dive; skipped for reduced motion so About follows straight away */}
      {!reduceMotion && <div aria-hidden className="h-[140svh]" />}
    </>
  );
};

export default Hero;
