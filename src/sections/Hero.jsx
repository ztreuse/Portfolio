import { useRef } from 'react';
import { motion, useMotionTemplate, useMotionValue, useScroll, useTransform } from 'motion/react';
import { TypeAnimation } from 'react-type-animation';
import { LuArrowRight, LuDownload } from 'react-icons/lu';
import Button from '../components/ui/Button';
import Container from '../components/ui/Container';
import SocialIcon from '../components/ui/SocialIcon';
import { RevealGroup, RevealItem } from '../components/ui/Reveal';
import { profile, socials } from '../data/site';
import heroBg from '../assets/images/hero-bg.jpg';
import { sectionLink } from '../hooks/useCleanAnchorLinks';

// Slow drifting glows; each loops on its own timing so the pattern never visibly repeats.
const glows = [
  { className: '-top-40 -left-32 size-[36rem] bg-accent/35', x: [0, 90, -30, 0], y: [0, 60, 110, 0], duration: 20 },
  { className: '-right-24 -bottom-40 size-[32rem] bg-[#614d35]/60', x: [0, -70, 40, 0], y: [0, -50, 30, 0], duration: 24 },
  { className: 'top-1/3 left-1/2 size-[24rem] bg-accent-strong/15', x: [0, -60, 50, 0], y: [0, 40, -40, 0], duration: 18 },
];

// Fixed positions (left %, top %, delay s) keep renders pure while looking scattered.
const particles = [
  [8, 72, 0], [18, 40, 2.5], [27, 85, 5], [36, 25, 1.2], [44, 65, 3.8], [53, 90, 6.3],
  [61, 35, 0.8], [70, 78, 4.4], [78, 20, 2], [86, 60, 5.6], [93, 45, 3.1], [14, 15, 6.8],
];

const HeroBackground = ({ bgY, spotlight }) => (
  <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden">
    <motion.img
      src={heroBg}
      alt=""
      style={{ y: bgY }}
      initial={{ scale: 1.1 }}
      animate={{ scale: 1 }}
      transition={{ duration: 1.8, ease: 'easeOut' }}
      className="absolute inset-x-0 -top-[15%] h-[130%] w-full object-cover"
    />
    <div className="absolute inset-0 bg-ink/85" />

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

    <motion.div style={{ background: spotlight }} className="absolute inset-0" />
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

const Hero = ({ ready }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });

  // Background drifts slower than the page; content lifts and fades as the hero scrolls away.
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '12%']);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  // Soft light that follows the cursor (starts off-screen until the mouse moves).
  const mouseX = useMotionValue(-1000);
  const mouseY = useMotionValue(-1000);
  const spotlight = useMotionTemplate`radial-gradient(520px circle at ${mouseX}px ${mouseY}px, rgb(159 143 129 / 0.12), transparent 70%)`;

  const trackMouse = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  return (
    <section
      ref={ref}
      id="hero"
      onMouseMove={trackMouse}
      className="relative isolate flex min-h-svh items-center overflow-hidden pt-16"
    >
      <HeroBackground bgY={bgY} spotlight={spotlight} />

      <motion.div style={{ y: contentY, opacity: contentOpacity }} className="w-full">
        <Container className="py-20">
          <RevealGroup play={ready} delay={0.35} stagger={0.12}>
            <RevealItem as="p" className="font-display text-sm font-semibold tracking-[0.14em] text-accent uppercase sm:text-base">
              Hello there, I'm
            </RevealItem>

            <RevealItem
              as="h1"
              className="mt-3 font-display text-6xl leading-[1.05] font-bold tracking-tight text-white sm:text-7xl lg:text-8xl"
            >
              {firstName}{' '}
              <span className="bg-linear-to-r from-accent-strong to-accent bg-clip-text text-transparent">
                {otherNames.join(' ')}
              </span>
            </RevealItem>

            {/* min-h reserves the line so the layout doesn't jump between roles */}
            <RevealItem as="p" className="mt-5 min-h-[1.4em] font-display text-2xl text-stone-300 sm:text-3xl">
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

            <RevealItem className="mt-10 flex flex-wrap gap-4">
              <Button href={profile.resume} target="_blank" rel="noopener noreferrer">
                <LuDownload aria-hidden className="size-4" />
                Download Resume
              </Button>
              <Button {...sectionLink('contact')} variant="outline">
                Get in Touch
                <LuArrowRight aria-hidden className="size-4" />
              </Button>
            </RevealItem>

            <RevealItem as="ul" className="mt-12 flex gap-3">
              {socials.map((social) => (
                <li key={social.label}>
                  <SocialIcon {...social} />
                </li>
              ))}
            </RevealItem>
          </RevealGroup>
        </Container>
      </motion.div>

      <motion.div style={{ opacity: contentOpacity }}>
        <ScrollCue />
      </motion.div>
    </section>
  );
};

export default Hero;
