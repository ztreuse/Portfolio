import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useMotionValueEvent, useReducedMotion, useSpring } from 'motion/react';
import { LuArrowUpRight, LuChevronLeft, LuChevronRight } from 'react-icons/lu';
import Button from '../components/ui/Button';
import IconButton from '../components/ui/IconButton';
import Reveal from '../components/ui/Reveal';
import Section from '../components/ui/Section';
import certifications from '../data/certifications';

const formatDate = (isoDate) =>
  new Date(`${isoDate}T00:00:00`).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

const pad = (n) => String(n).padStart(2, '0');
const COUNT = certifications.length;
const STEP = 360 / COUNT; // degrees between cards around the ring
const AUTOPLAY = 5000; // ms per card
const wrap = (n) => ((n % COUNT) + COUNT) % COUNT;
// How far card i is from the front, in cards, the short way round (-COUNT/2 … COUNT/2)
const offsetFrom = (i, turn) => {
  const d = wrap(i - turn + COUNT / 2) - COUNT / 2;
  return d;
};

const TILT = 12; // degrees the active badge leans toward the pointer
const tiltSpring = { stiffness: 200, damping: 20 };

/**
 * The badge panel: the badge artwork, linking to the public Credly verification page (clickable only on the
 * centered card). The active badge spins like a flipped coin when its card arrives, then a glint of light sweeps
 * across it like foil; while the pointer is over the panel it leans toward it in 3D, with a soft glare following
 * the pointer. The shine and glare are masked to the badge's own shape (its PNG), so they only light the badge.
 * No tilt or shine for reduced motion.
 */
const BadgeStage = ({ cert, active }) => {
  const reduceMotion = useReducedMotion();
  const rotateX = useSpring(0, tiltSpring);
  const rotateY = useSpring(0, tiltSpring);
  const glare = useRef(null);

  const lean = (e) => {
    if (!active || reduceMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    rotateY.set((px - 0.5) * TILT * 2);
    rotateX.set((0.5 - py) * TILT * 2);
    glare.current?.style.setProperty('--gx', `${px * 100}%`);
    glare.current?.style.setProperty('--gy', `${py * 100}%`);
  };
  const settle = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  // Clip the light to the badge's opaque pixels
  const badgeShape = {
    maskImage: `url(${cert.image})`,
    WebkitMaskImage: `url(${cert.image})`,
    maskSize: 'contain',
    WebkitMaskSize: 'contain',
    maskRepeat: 'no-repeat',
    WebkitMaskRepeat: 'no-repeat',
    maskPosition: 'center',
    WebkitMaskPosition: 'center',
  };

  return (
    <div
      onPointerMove={lean}
      onPointerLeave={settle}
      // A fixed warm paper white (not a palette colour: inside the crema band "white" turns dark), with a soft
      // spotlight behind the badge, so every badge reads, dark ones included
      className="group/stage relative flex flex-col items-center justify-center bg-[radial-gradient(ellipse_at_50%_42%,#fffdf9_0%,#f4eee6_55%,#e9e0d4_100%)] px-6 pt-8 pb-5"
    >
      <a
        href={`https://www.credly.com/badges/${cert.badgeId}/public_url`}
        target="_blank"
        rel="noopener noreferrer"
        tabIndex={active ? undefined : -1}
        aria-label={`Verify ${cert.name} on Credly`}
        className={`group/badge block rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent ${
          active ? '' : 'pointer-events-none'
        }`}
      >
        <motion.div style={{ rotateX, rotateY, transformPerspective: 900 }}>
          {/* Spins like a flipped coin each time its card becomes the active one */}
          <motion.div
            initial={false}
            animate={{ rotateY: active ? 360 : 0 }}
            transition={active ? { duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.15 } : { duration: 0 }}
            className="relative size-40 transition-[scale] duration-500 ease-out group-hover/badge:scale-105 sm:size-44"
          >
            <img
              src={cert.image}
              alt=""
              loading="lazy"
              className="size-full object-contain drop-shadow-[0_10px_18px_rgb(60_45_30/0.18)]"
            />
            {/* Foil shine: one sweep of light just after the flip */}
            {!reduceMotion && (
              <motion.span
                aria-hidden
                style={badgeShape}
                initial={false}
                animate={{ backgroundPosition: active ? ['140% 0%', '-40% 0%'] : '140% 0%' }}
                transition={active ? { duration: 1.4, delay: 1.05, ease: 'easeInOut' } : { duration: 0 }}
                className="pointer-events-none absolute inset-0 bg-[linear-gradient(110deg,transparent_38%,rgb(255_255_255/0.75)_50%,transparent_62%)] bg-size-[250%_100%] bg-no-repeat mix-blend-screen"
              />
            )}
            {/* Glare that follows the pointer while it's over the panel */}
            {active && !reduceMotion && (
              <span
                ref={glare}
                aria-hidden
                style={badgeShape}
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_var(--gx,50%)_var(--gy,40%),rgb(255_255_255/0.5),transparent_45%)] opacity-0 mix-blend-screen transition-opacity duration-300 group-hover/stage:opacity-100"
              />
            )}
          </motion.div>
        </motion.div>
      </a>
      {/* A soft shadow on the "table" under the badge */}
      <span aria-hidden className="mt-3 h-3 w-32 rounded-[50%] bg-black/15 blur-md sm:w-36" />
    </div>
  );
};

// Each part of the active card's text rises into place in turn whenever the card becomes the active one
const playIn = {
  hidden: { opacity: 0, y: 16, filter: 'blur(6px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

/**
 * A portrait card standing on the ring: the badge on its lit panel on top (BadgeStage), then the card's number as a
 * big outlined numeral, issuer, title, date and a "Verify on Credly" button. Each time it becomes the front card,
 * that text plays in, one part after another. Its depth (dimming and greying around the ring) is set by the ring.
 */
const CertificationCard = ({ cert, number, isActive }) => (
  <article
    className={`flex h-full flex-col overflow-hidden rounded-2xl border bg-surface transition-[border-color,box-shadow] duration-700 ease-out ${
      isActive ? 'border-accent/30 shadow-[0_30px_80px_-30px_rgb(60_45_30/0.55)]' : 'border-line'
    }`}
  >
    <BadgeStage cert={cert} active={isActive} />

    {/* Remounted when the card comes to the front, so its text plays in again; other cards just show it */}
    <motion.div
      key={isActive ? 'active' : 'idle'}
      initial={isActive ? 'hidden' : false}
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.08, delayChildren: 0.2 } } }}
      className="relative flex flex-1 flex-col justify-between gap-6 p-6 sm:p-8"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute top-5 right-6 font-heading text-6xl leading-none font-black text-transparent [-webkit-text-stroke:1.5px_color-mix(in_oklab,var(--color-accent)_45%,transparent)] select-none sm:text-7xl"
      >
        {number}
      </span>
      <div className="relative">
        <motion.p variants={playIn} className="font-heading text-base font-bold tracking-[0.16em] text-accent uppercase">
          Issued by {cert.issuer}
        </motion.p>
        <motion.h3
          variants={playIn}
          className="mt-3 pr-16 font-heading text-3xl leading-[0.95] font-extrabold tracking-[0.01em] text-balance text-white uppercase sm:pr-20 sm:text-4xl"
        >
          {cert.name}
        </motion.h3>
        <motion.p variants={playIn} className="mt-3 text-sm text-stone-400">
          Earned {formatDate(cert.date)}
        </motion.p>
      </div>

      <motion.div variants={playIn}>
        <Button
          href={`https://www.credly.com/badges/${cert.badgeId}/public_url`}
          target="_blank"
          rel="noopener noreferrer"
          variant="outline"
          icon={LuArrowUpRight}
          tabIndex={isActive ? undefined : -1}
          className={isActive ? '' : 'pointer-events-none'}
        >
          Verify on Credly
        </Button>
      </motion.div>
    </motion.div>
  </article>
);

const RING_SPRING = { stiffness: 90, damping: 20, mass: 1 };

/**
 * The certifications as a rotating 3D ring: every card stands around a large cylinder seen slightly from above,
 * the front card facing you and the rest turning away around the ring, shrinking into the distance and fading.
 * Arrows, left/right keys, swiping or dragging, and a 5 s autoplay (paused on hover, while dragging, off screen or
 * for reduced motion) spin the ring on a spring; clicking a side card brings it to the front. Below: the count, a
 * segmented progress bar (the active segment fills over the autoplay) and the arrows.
 */
const Certifications = () => {
  const reduceMotion = useReducedMotion();
  const scene = useRef(null);
  const stage = useRef(null);
  const cards = useRef([]);
  const bar = useRef(null);
  const [radius, setRadius] = useState(900);
  const [active, setActive] = useState(0);

  // Where the ring should face (in cards, unbounded so it can keep turning one way) and where it is
  const target = useMotionValue(0);
  const turn = useSpring(target, reduceMotion ? { duration: 0 } : RING_SPRING);

  const goTo = (next) => {
    target.set(next);
    setActive(wrap(Math.round(next)));
  };
  const step = (by) => goTo(Math.round(target.get()) + by);
  // Bring card i to the front the short way round
  const bringToFront = (i) => goTo(target.get() + offsetFrom(i, target.get()));

  // The ring's radius: just wide enough that neighbouring cards don't touch
  useLayoutEffect(() => {
    const measure = () => {
      const width = cards.current[0]?.offsetWidth ?? 480;
      setRadius(width / 2 / Math.tan(Math.PI / COUNT) + 28);
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  // Turn the ring and set each card's depth: the further round the ring, the dimmer and greyer
  const place = (t) => {
    if (stage.current) stage.current.style.transform = `translateZ(${-radius}px) rotateX(-5deg) rotateY(${-t * STEP}deg)`;
    cards.current.forEach((el, i) => {
      if (!el) return;
      const away = Math.abs(offsetFrom(i, t));
      el.style.opacity = String(Math.max(0, 1 - away * 0.32));
      el.style.filter = `grayscale(${Math.min(1, away)}) brightness(${1 - Math.min(0.35, away * 0.12)})`;
      el.style.visibility = away > 3.2 ? 'hidden' : 'visible';
    });
  };
  useMotionValueEvent(turn, 'change', place);
  useLayoutEffect(() => place(turn.get()));

  // Autoplay with a countdown on the active progress segment; it pauses while hovered, dragged, off screen or hidden
  const paused = useRef(false);
  const visible = useRef(false);
  useEffect(() => {
    if (reduceMotion) return undefined;
    const observer = new IntersectionObserver(([e]) => {
      visible.current = e.isIntersecting;
    });
    if (scene.current) observer.observe(scene.current);
    let start = performance.now();
    let last = start;
    let frame = 0;
    const tick = (now) => {
      if (paused.current || !visible.current || document.hidden) start += now - last;
      last = now;
      const progress = Math.min(1, (now - start) / AUTOPLAY);
      bar.current?.style.setProperty('--autoplay-progress', String(progress));
      if (progress >= 1) {
        step(1);
        start = now;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [reduceMotion, active]); // eslint-disable-line react-hooks/exhaustive-deps

  // Drag or swipe to spin; a short press is a click (on a side card, it comes to the front)
  const drag = useRef(null);
  const onPointerDown = (e) => {
    if (e.button !== 0) return;
    drag.current = { x: e.clientX, from: target.get(), moved: false, id: e.pointerId };
  };
  const onPointerMove = (e) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    if (!d.moved && Math.abs(dx) > 6) {
      d.moved = true;
      paused.current = true;
      scene.current?.setPointerCapture(d.id);
    }
    if (d.moved) target.set(d.from - dx / ((cards.current[0]?.offsetWidth ?? 480) * 0.9));
  };
  const onPointerUp = () => {
    const d = drag.current;
    drag.current = null;
    if (d?.moved) {
      goTo(Math.round(target.get()));
      paused.current = false;
      justDragged.current = true;
      setTimeout(() => {
        justDragged.current = false;
      }, 0);
    }
  };
  // Swallow the click that ends a drag, so letting go over a link or a side card doesn't act on it
  const justDragged = useRef(false);
  const onClickCapture = (e) => {
    if (!justDragged.current) return;
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <Section
      id="certifications"
      eyebrow="04 — Certifications"
      title="Credentials I've earned"
    >
      <Reveal>
        {/* Full-bleed stage; the mask fades the cards turning away at both edges into the page. A mask also clips
            whatever pokes outside the box, so the bottom padding leaves room for the ring's tilt (it cut the cards off) */}
        <div
          ref={scene}
          role="region"
          aria-roledescription="carousel"
          aria-label="Certifications"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'ArrowRight') step(1);
            if (e.key === 'ArrowLeft') step(-1);
          }}
          onPointerEnter={() => {
            paused.current = true;
          }}
          onPointerLeave={() => {
            paused.current = false;
            onPointerUp();
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onClickCapture={onClickCapture}
          className="relative left-1/2 w-screen -translate-x-1/2 cursor-grab touch-pan-y pt-10 pb-24 mask-[linear-gradient(to_right,transparent,black_14%,black_86%,transparent)] select-none [perspective:2200px] active:cursor-grabbing"
        >
          {/* The ring: cards stand around a cylinder; the stage turns it */}
          {/* The cards all share one grid cell, so the ring is as tall as its tallest card and every card stretches to
              match: long titles (or browser zoom) grow the cards instead of pushing the button out of them */}
          <div className="relative mx-auto w-[min(72vw,26rem)] [transform-style:preserve-3d] sm:w-[min(80vw,28rem)]">
            <div ref={stage} className="grid [transform-style:preserve-3d]">
              {certifications.map((cert, i) => (
                <div
                  key={cert.name}
                  ref={(node) => {
                    cards.current[i] = node;
                  }}
                  aria-hidden={i !== active}
                  onClick={() => i !== active && bringToFront(i)}
                  style={{ transform: `rotateY(${i * STEP}deg) translateZ(${radius}px)` }}
                  className={`[grid-area:1/1] [backface-visibility:hidden] ${i === active ? '' : 'cursor-pointer'}`}
                >
                  <CertificationCard cert={cert} number={pad(i + 1)} isActive={i === active} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* One floating control pill under the ring: previous, the count, the progress segments, next */}
        <div className="relative z-10 -mt-12 flex justify-center sm:-mt-2">
          <div className="flex items-center gap-3 rounded-full border border-white/15 bg-ink/60 p-1.5 shadow-[0_18px_40px_-20px_rgb(60_45_30/0.45)] backdrop-blur-md sm:gap-5">
            <IconButton label="Previous certification" icon={LuChevronLeft} onClick={() => step(-1)} />
            <p className="min-w-14 text-center font-display text-sm font-semibold whitespace-nowrap text-stone-400 tabular-nums">
              <span className="text-white">{pad(active + 1)}</span> / {pad(COUNT)}
            </p>
            {/* One segment per credential; the active one fills up as autoplay counts down to the next */}
            <div ref={bar} className="hidden items-center gap-[3px] sm:flex">
              {certifications.map((cert, i) => (
                <button
                  key={cert.name}
                  type="button"
                  aria-label={`Show ${cert.name}`}
                  aria-current={i === active ? 'true' : undefined}
                  onClick={() => bringToFront(i)}
                  className={`relative h-[3px] overflow-hidden rounded-full transition-[width,background-color] duration-400 ${
                    i === active ? 'w-12 bg-accent/35' : 'w-[18px] bg-white/20 hover:bg-white/40'
                  }`}
                >
                  {i === active && (
                    <span className="absolute inset-0 origin-left scale-x-(--autoplay-progress) bg-accent-strong" />
                  )}
                </button>
              ))}
            </div>
            <IconButton label="Next certification" icon={LuChevronRight} onClick={() => step(1)} />
          </div>
        </div>
      </Reveal>
    </Section>
  );
};

export default Certifications;
