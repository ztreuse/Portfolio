import { useEffect } from 'react';
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from 'motion/react';

const MIN_DURATION = 2200; // ms: long enough for the cup to fill
const MAX_DURATION = 6000; // ms: never block the site longer than this on slow connections

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const pageLoaded = () =>
  new Promise((resolve) => {
    if (document.readyState === 'complete') resolve();
    else window.addEventListener('load', resolve, { once: true });
  });

// Mug geometry (viewBox units). The glass tapers from the rim (y 40) to the base (y 128).
const RIM_Y = 40;
const BASE_Y = 128;
const RIM_RX = 42;
const BASE_RX = 36;
const CX = 72;
const EMPTY_Y = 126; // coffee surface when empty
const FULL_Y = 52; // coffee surface when full

// Half-width of the glass at a given height, so the coffee surface widens as it rises.
const widthAt = (y) => BASE_RX + ((BASE_Y - y) / (BASE_Y - RIM_Y)) * (RIM_RX - BASE_RX);

const steamPaths = ['M58 30 q-6 -8 0 -16 t0 -16', 'M72 32 q-6 -8 0 -16 t0 -16', 'M86 30 q-6 -8 0 -16 t0 -16'];

/** Shaded glass mug on a ceramic saucer; the coffee level follows `progress` (0–100). */
const CoffeeCup = ({ progress, reduceMotion }) => {
  const surfaceY = useTransform(progress, [0, 100], [EMPTY_Y, FULL_Y]);
  const surfaceRx = useTransform(surfaceY, (y) => widthAt(y) - 1);
  const surfaceRy = useTransform(surfaceRx, (rx) => rx * 0.2);
  const coffeeHeight = useTransform(surfaceY, (y) => BASE_Y + 10 - y);
  const steamOpacity = useTransform(progress, [45, 75], [0, 1]);

  return (
    <svg viewBox="0 0 160 160" className="w-48 sm:w-56" aria-hidden>
      <defs>
        {/* Inside of the glass: coffee is clipped to this shape */}
        <clipPath id="mug-inside">
          <path d={`M${CX - RIM_RX + 1} ${RIM_Y} L${CX - BASE_RX + 1} ${BASE_Y - 1} A${BASE_RX - 1} 7 0 0 0 ${CX + BASE_RX - 1} ${BASE_Y - 1} L${CX + RIM_RX - 1} ${RIM_Y} Z`} />
        </clipPath>
        {/* Coffee body: darker at the edges, lighter off-center, so the column reads as round */}
        <linearGradient id="coffee-body" x1="0" x2="1">
          <stop offset="0%" stopColor="#1f1d1a" />
          <stop offset="30%" stopColor="#614d35" />
          <stop offset="55%" stopColor="#4a3b2c" />
          <stop offset="100%" stopColor="#161513" />
        </linearGradient>
        <radialGradient id="crema" cx="45%" cy="40%" r="65%">
          <stop offset="0%" stopColor="#c9bcaf" />
          <stop offset="55%" stopColor="#9f8f81" />
          <stop offset="100%" stopColor="#614d35" />
        </radialGradient>
        <linearGradient id="glass" x1="0" x2="1">
          <stop offset="0%" stopColor="#c9bcaf" stopOpacity="0.14" />
          <stop offset="35%" stopColor="#c9bcaf" stopOpacity="0.02" />
          <stop offset="80%" stopColor="#c9bcaf" stopOpacity="0.04" />
          <stop offset="100%" stopColor="#c9bcaf" stopOpacity="0.16" />
        </linearGradient>
        <linearGradient id="shine" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c9bcaf" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="saucer" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2d2925" />
          <stop offset="100%" stopColor="#161513" />
        </linearGradient>
        <filter id="soft-shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" />
        </filter>
      </defs>

      {/* Steam */}
      <motion.g style={{ opacity: steamOpacity }}>
        {steamPaths.map((d, i) => (
          <motion.path
            key={d}
            d={d}
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth="2.5"
            strokeLinecap="round"
            animate={reduceMotion ? undefined : { y: [6, -6], opacity: [0, 0.7, 0] }}
            transition={{ duration: 2.2, delay: i * 0.45, repeat: Infinity, ease: 'easeOut' }}
          />
        ))}
      </motion.g>

      {/* Saucer with a soft shadow beneath */}
      <ellipse cx={CX} cy="146" rx="60" ry="8" fill="#000" opacity="0.55" filter="url(#soft-shadow)" />
      <ellipse cx={CX} cy="138" rx="62" ry="12" fill="url(#saucer)" stroke="#9f8f81" strokeOpacity="0.45" />
      <ellipse cx={CX} cy="135" rx="44" ry="7" fill="#161513" stroke="#9f8f81" strokeOpacity="0.2" />

      {/* Handle (drawn behind the glass) */}
      <path
        d={`M${CX + RIM_RX - 4} 58 C142 54 144 104 ${CX + BASE_RX + 2} 108`}
        fill="none"
        stroke="#c9bcaf"
        strokeOpacity="0.28"
        strokeWidth="8"
        strokeLinecap="round"
      />

      {/* Coffee */}
      <g clipPath="url(#mug-inside)">
        <motion.rect x={CX - RIM_RX} y={surfaceY} width={RIM_RX * 2} height={coffeeHeight} fill="url(#coffee-body)" />
        <motion.ellipse cx={CX} cy={surfaceY} rx={surfaceRx} ry={surfaceRy} fill="url(#crema)" />
      </g>

      {/* Glass body, base and rim */}
      <path
        d={`M${CX - RIM_RX} ${RIM_Y} L${CX - BASE_RX} ${BASE_Y} A${BASE_RX} 8 0 0 0 ${CX + BASE_RX} ${BASE_Y} L${CX + RIM_RX} ${RIM_Y}`}
        fill="url(#glass)"
        stroke="#c9bcaf"
        strokeOpacity="0.5"
        strokeWidth="1.5"
      />
      <ellipse cx={CX} cy={BASE_Y} rx={BASE_RX} ry="8" fill="#c9bcaf" fillOpacity="0.08" />
      <ellipse cx={CX} cy={RIM_Y} rx={RIM_RX} ry="9" fill="none" stroke="#c9bcaf" strokeOpacity="0.6" strokeWidth="1.5" />

      {/* Reflections */}
      <path d="M36 50 L41 118 Q43 121 45 118 L41 50 Q38 46 36 50 Z" fill="url(#shine)" />
      <path d="M106 52 L103 104" stroke="#c9bcaf" strokeOpacity="0.3" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
};

/** Full-screen intro: a coffee cup fills while the site loads, then the overlay fades out. */
const Preloader = ({ onDone }) => {
  const reduceMotion = useReducedMotion();
  const progress = useMotionValue(0);
  const percent = useTransform(progress, (v) => `${Math.round(v)}%`);

  useEffect(() => {
    let cancelled = false;
    const fill = animate(progress, 90, { duration: (reduceMotion ? 600 : MIN_DURATION) / 1000, ease: 'easeOut' });
    const ready = Promise.all([pageLoaded(), document.fonts?.ready, wait(reduceMotion ? 600 : MIN_DURATION)]);

    Promise.race([ready, wait(MAX_DURATION)]).then(() => {
      if (cancelled) return;
      fill.stop();
      animate(progress, 100, { duration: 0.4, ease: 'easeOut', onComplete: () => !cancelled && setTimeout(onDone, 250) });
    });

    return () => {
      cancelled = true;
      fill.stop();
    };
  }, [onDone, progress, reduceMotion]);

  return (
    <motion.div
      role="status"
      aria-label="Loading"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="fixed inset-0 z-100 flex flex-col items-center justify-center gap-4 overflow-hidden bg-ink"
    >
      {/* Same warm glow as the hero, so the fade-out blends straight into it */}
      <div aria-hidden className="absolute size-[28rem] rounded-full bg-accent/15 blur-[110px]" />
      <div className="relative flex flex-col items-center gap-4">
        <CoffeeCup progress={progress} reduceMotion={reduceMotion} />
        <motion.p className="font-display text-2xl font-bold tracking-wide text-accent-strong tabular-nums">{percent}</motion.p>
      </div>
    </motion.div>
  );
};

export default Preloader;
