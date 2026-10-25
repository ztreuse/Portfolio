import { useEffect, useRef, useState } from 'react';
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from 'motion/react';

const MIN_DURATION = 2200; // ms: long enough for the cup to fill
const MAX_DURATION = 6000; // ms: never block the site longer than this on slow connections

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
// The finale once the cup is full: it overflows (SPILL), then coffee floods the screen (FLOOD, starting part-way
// through the spill), then the site is revealed with a ripple splash in the hero's coffee.
const SPILL = 1.0; // s
const FLOOD_AT = 550; // ms after full
const FLOOD = 0.95; // s
const REVEAL_AT = FLOOD_AT + FLOOD * 1000 + 120; // ms after full
// The flood's colour: a dark coffee close to the hero's dimmed photo, so the cross-fade into it is seamless.
const FLOOD_COLOR = '#2a231d';
// The 3D scene (Three.js, its own chunk) needs WebGL2 and is skipped for reduced motion.
const canUse3D = () => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  try {
    return !!document.createElement('canvas').getContext('webgl2');
  } catch {
    return false;
  }
};
// Start downloading the 3D scene as soon as the app starts (this module loads with App), not when the preloader
// mounts. Resolves to null if it can't be used or fails to load.
const scene3DModule = canUse3D() ? import('../../three/coffeeScene.js').catch(() => null) : Promise.resolve(null);
// While the scene loads only the counter shows. If it isn't ready by then (slow network) the flat cup takes over
// for good, so the cup never swaps mid-load.
const SCENE_WAIT = 2500; // ms
// 3D finale: the scene's dive into the coffee ends at 4.4s (FINALE_END in coffeeScene.js); the screen fades to
// coffee over its last moments.
const DIVE_FADE_AT = 3900; // ms after full

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

// One crest-to-crest wave repeated across 400 units (the flood SVG is twice the screen wide and slides by half).
const WAVE = 'M0 22 Q25 6 50 22 T100 22 T150 22 T200 22 T250 22 T300 22 T350 22 T400 22';

const steamPaths = ['M58 30 q-6 -8 0 -16 t0 -16', 'M72 32 q-6 -8 0 -16 t0 -16', 'M86 30 q-6 -8 0 -16 t0 -16'];

// Drips that run down the glass when it overflows: down the left wall, down the front, and over the handle side.
const drips = [
  {
    d: `M${CX - RIM_RX + 1} ${RIM_Y + 1} L${CX - BASE_RX} ${BASE_Y - 2} Q${CX - BASE_RX - 4} 133 ${CX - BASE_RX - 12} 135`,
    from: 0.12,
  },
  { d: `M${CX - 9} ${RIM_Y + 8} Q${CX - 11} 90 ${CX - 8} ${BASE_Y + 7} L${CX - 7} 137`, from: 0.2 },
  {
    d: `M${CX + RIM_RX - 2} ${RIM_Y + 2} L${CX + BASE_RX + 1} ${BASE_Y - 2} Q${CX + BASE_RX + 5} 133 ${CX + BASE_RX + 13} 135`,
    from: 0.3,
  },
];

/** One drip: it runs down its path over part of the spill. */
const Drip = ({ d, from, spill }) => {
  const length = useTransform(spill, [from, from + 0.45], [0, 1]);
  const opacity = useTransform(spill, [from, from + 0.05], [0, 1]);
  return (
    <motion.path
      d={d}
      fill="none"
      stroke="#8a7158"
      strokeWidth="4"
      strokeLinecap="round"
      style={{ pathLength: length, opacity }}
    />
  );
};

/**
 * Shaded glass mug on a ceramic saucer; the coffee level follows `progress` (0–100). Once full, `spill` (0–1) makes
 * it overflow: the surface rises to the rim and bulges over it, drips run down the glass and a pool spreads on the
 * saucer.
 */
const CoffeeCup = ({ progress, spill, reduceMotion }) => {
  // Fills with `progress`, then rises the last bit to the rim during the first part of the spill.
  const surfaceY = useTransform(() => {
    const filled = EMPTY_Y + ((FULL_Y - EMPTY_Y) * Math.min(progress.get(), 100)) / 100;
    return filled + (RIM_Y + 1 - FULL_Y) * Math.min(spill.get() / 0.3, 1);
  });
  const overflowing = useTransform(spill, [0.2, 0.32], [0, 1]);
  const poolRx = useTransform(spill, [0.45, 1], [0, 54]);
  const poolRy = useTransform(poolRx, (rx) => rx * 0.18);
  const surfaceRx = useTransform(surfaceY, (y) => widthAt(y) - 1);
  const surfaceRy = useTransform(surfaceRx, (rx) => rx * 0.2);
  const coffeeHeight = useTransform(surfaceY, (y) => BASE_Y + 10 - y);
  // Steam rises once the pour ends (during the pour it crossed the stream): the cup is ready.
  const steamOpacity = useTransform(progress, [90, 100], [0, 1]);
  // A thin stream pours into the cup while it fills. At the end its top falls to the surface, so the pour stops.
  const streamTop = useTransform(progress, [94, 100], [-6, FULL_Y]);
  const pouring = useTransform(progress, [96, 100], [1, 0]);

  return (
    <svg viewBox="0 0 160 160" className="w-48 sm:w-56" aria-hidden>
      <defs>
        {/* Inside of the glass: coffee is clipped to this shape */}
        <clipPath id="mug-inside">
          <path
            d={`M${CX - RIM_RX + 1} ${RIM_Y} L${CX - BASE_RX + 1} ${BASE_Y - 1} A${BASE_RX - 1} 7 0 0 0 ${CX + BASE_RX - 1} ${BASE_Y - 1} L${CX + RIM_RX - 1} ${RIM_Y} Z`}
          />
        </clipPath>
        {/* Coffee body: darker at the edges, lighter off-center, so the column reads as round */}
        <linearGradient id="coffee-body" x1="0" x2="1">
          <stop offset="0%" stopColor="#1f1d1a" />
          <stop offset="30%" stopColor="#614d35" />
          <stop offset="55%" stopColor="#4a3b2c" />
          <stop offset="100%" stopColor="#161513" />
        </linearGradient>
        {/* Depth: the coffee darkens toward the bottom of the glass */}
        <linearGradient id="coffee-depth" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#161513" stopOpacity="0" />
          <stop offset="100%" stopColor="#161513" stopOpacity="0.55" />
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
        <linearGradient id="stream" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="120">
          <stop offset="0%" stopColor="#614d35" stopOpacity="0" />
          <stop offset="25%" stopColor="#614d35" />
          <stop offset="100%" stopColor="#9f8f81" />
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
        <motion.rect x={CX - RIM_RX} y={surfaceY} width={RIM_RX * 2} height={coffeeHeight} fill="url(#coffee-depth)" />
        <motion.ellipse cx={CX} cy={surfaceY} rx={surfaceRx} ry={surfaceRy} fill="url(#crema)" />
        {/* Meniscus: a soft light edge where the coffee meets the glass */}
        <motion.ellipse
          cx={CX}
          cy={surfaceY}
          rx={surfaceRx}
          ry={surfaceRy}
          fill="none"
          stroke="#ece4dc"
          strokeOpacity="0.35"
          strokeWidth="0.8"
        />
        {/* Rings spreading on the crema where the stream lands */}
        {!reduceMotion && (
          <motion.g style={{ opacity: pouring }}>
            {[0, 0.45].map((delay) => (
              <motion.ellipse
                key={delay}
                cx={CX}
                cy={surfaceY}
                fill="none"
                stroke="#c9bcaf"
                strokeWidth="1"
                initial={{ rx: 3, ry: 0.8, opacity: 0.7 }}
                animate={{ rx: [3, 22], ry: [0.8, 4.4], opacity: [0.7, 0] }}
                transition={{ duration: 0.9, delay, repeat: Infinity, ease: 'easeOut' }}
              />
            ))}
          </motion.g>
        )}
      </g>

      {/* The pouring stream */}
      {!reduceMotion && (
        <motion.line
          x1={CX}
          x2={CX}
          y1={streamTop}
          y2={surfaceY}
          stroke="url(#stream)"
          strokeWidth="3"
          strokeLinecap="round"
          style={{ opacity: pouring }}
        />
      )}

      {/* Overflow: a pool spreading on the saucer, drips running down the glass, crema bulging over the rim */}
      {!reduceMotion && (
        <>
          <motion.ellipse
            cx={CX}
            cy="136"
            rx={poolRx}
            ry={poolRy}
            fill="#4a3b2c"
            stroke="#9f8f81"
            strokeOpacity="0.5"
          />
          {drips.map((drip) => (
            <Drip key={drip.d} {...drip} spill={spill} />
          ))}
          <motion.ellipse
            cx={CX}
            cy={RIM_Y - 1}
            rx={RIM_RX + 1}
            ry="10"
            fill="url(#crema)"
            stroke="#ece4dc"
            strokeOpacity="0.35"
            style={{ opacity: overflowing }}
          />
        </>
      )}

      {/* Glass body, base and rim */}
      <path
        d={`M${CX - RIM_RX} ${RIM_Y} L${CX - BASE_RX} ${BASE_Y} A${BASE_RX} 8 0 0 0 ${CX + BASE_RX} ${BASE_Y} L${CX + RIM_RX} ${RIM_Y}`}
        fill="url(#glass)"
        stroke="#c9bcaf"
        strokeOpacity="0.5"
        strokeWidth="1.5"
      />
      <ellipse cx={CX} cy={BASE_Y} rx={BASE_RX} ry="8" fill="#c9bcaf" fillOpacity="0.08" />
      <ellipse
        cx={CX}
        cy={RIM_Y}
        rx={RIM_RX}
        ry="9"
        fill="none"
        stroke="#c9bcaf"
        strokeOpacity="0.6"
        strokeWidth="1.5"
      />

      {/* Reflections */}
      <path d="M36 50 L41 118 Q43 121 45 118 L41 50 Q38 46 36 50 Z" fill="url(#shine)" />
      <path d="M106 52 L103 104" stroke="#c9bcaf" strokeOpacity="0.3" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
};

/**
 * The flood: a wall of coffee with a rolling, crema-edged wave on top rises from the bottom of the screen until it
 * covers everything. One solid colour (a long dark gradient here would show banding lines).
 */
const Flood = ({ flood }) => {
  // Starts fully below the screen, wave included (the wave sits above the layer's top edge, at most 4rem tall)
  const y = useTransform(flood, [0, 1], ['115%', '0%']);
  return (
    <motion.div aria-hidden style={{ y }} className="pointer-events-none absolute inset-0">
      {/* The wave sits just above the rising coffee; the SVG is twice the screen wide and slides for a rolling crest */}
      <div className="absolute inset-x-0 bottom-full h-12 overflow-hidden sm:h-16">
        <motion.svg
          viewBox="0 0 400 40"
          preserveAspectRatio="none"
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' }}
          className="h-full w-[200%]"
        >
          <path d={WAVE + ' V40 H0 Z'} fill={FLOOD_COLOR} />
          <path
            d={WAVE}
            fill="none"
            stroke="#c9bcaf"
            strokeOpacity="0.7"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          />
        </motion.svg>
      </div>
      <div className="absolute inset-0" style={{ backgroundColor: FLOOD_COLOR }} />
    </motion.div>
  );
};

/**
 * Full-screen intro: coffee pours into a cup while the site loads. When it's full it overflows, coffee floods the
 * screen, and the overlay dissolves into the hero while a ripple splash spreads across the hero's coffee surface
 * (the `coffee-splash` event FluidImage listens for). Reduced motion: a plain fade.
 */
const Preloader = ({ onDone }) => {
  const reduceMotion = useReducedMotion();
  const spill = useMotionValue(0);
  const flood = useMotionValue(0);
  const progress = useMotionValue(0);
  const percent = useTransform(progress, (v) => `${Math.round(v)}%`);
  const number = useTransform(progress, (v) => Math.round(v));
  const fill = useTransform(progress, (v) => v / 100);
  const counterOpacity = useMotionValue(1);
  const diveFade = useMotionValue(0);
  const canvasRef = useRef(null);
  const frameRef = useRef(null);
  const sceneRef = useRef(null);
  // 'pending' (only the counter shows) -> '3d' once the scene is ready, or 'flat' if it can't be used or is too slow.
  const [mode, setMode] = useState(() => (canUse3D() ? 'pending' : 'flat'));
  const has3D = mode === '3d';
  const showFlat = mode === 'flat';

  useEffect(() => {
    let cancelled = false;
    let settled = false;
    const cleanups = [];
    const fallback = setTimeout(() => {
      if (settled) return;
      settled = true;
      setMode('flat');
    }, SCENE_WAIT);
    scene3DModule.then((module) => {
      if (cancelled || settled) return;
      settled = true;
      clearTimeout(fallback);
      if (!module || !canvasRef.current) {
        setMode('flat');
        return;
      }
      // Safety: if the scene loads but never gets its first frames drawn (a graphics failure), use the flat cup
      // instead. Generous, since building the shaders on a slow GPU can take a couple of seconds.
      const noFrame = setTimeout(() => {
        if (cancelled) return;
        sceneRef.current?.dispose();
        sceneRef.current = null;
        setMode('flat');
      }, 3500);
      cleanups.push(() => clearTimeout(noFrame));
      sceneRef.current = module.createCoffeeScene(canvasRef.current, {
        getProgress: () => progress.get(),
        frameEl: frameRef.current,
        onReady: () => {
          clearTimeout(noFrame);
          if (!cancelled) setMode('3d');
        },
      });
    });
    return () => {
      cancelled = true;
      clearTimeout(fallback);
      cleanups.forEach((fn) => fn());
      sceneRef.current?.dispose();
      sceneRef.current = null;
    };
  }, [progress]);

  // Counting starts only once the cup is on screen, so the cup and the count begin together.
  const started = mode !== 'pending';
  useEffect(() => {
    if (!started) return undefined;
    let cancelled = false;
    const timers = [];
    const fill = animate(progress, 90, { duration: (reduceMotion ? 600 : MIN_DURATION) / 1000, ease: 'easeOut' });
    const ready = Promise.all([pageLoaded(), document.fonts?.ready, wait(reduceMotion ? 600 : MIN_DURATION)]);

    Promise.race([ready, wait(MAX_DURATION)]).then(() => {
      if (cancelled) return;
      fill.stop();
      animate(progress, 100, {
        duration: 0.4,
        ease: 'easeOut',
        onComplete: () => {
          if (cancelled) return;
          if (reduceMotion) {
            timers.push(setTimeout(onDone, 250));
            return;
          }
          const scene3D = sceneRef.current;
          if (scene3D) {
            // 3D: overflow, swoop and dive into the coffee, fading to coffee, then the splash reveal.
            animate(counterOpacity, 0, { duration: 0.4 });
            timers.push(setTimeout(() => animate(diveFade, 1, { duration: 0.5, ease: 'easeIn' }), DIVE_FADE_AT));
            scene3D.finale(() => {
              if (cancelled) return;
              window.dispatchEvent(new CustomEvent('coffee-splash'));
              onDone();
            });
            return;
          }
          animate(spill, 1, { duration: SPILL, ease: 'easeOut' });
          timers.push(
            setTimeout(() => animate(flood, 1, { duration: FLOOD, ease: [0.55, 0, 0.35, 1] }), FLOOD_AT),
            setTimeout(() => {
              window.dispatchEvent(new CustomEvent('coffee-splash'));
              onDone();
            }, REVEAL_AT),
          );
        },
      });
    });

    return () => {
      cancelled = true;
      fill.stop();
      timers.forEach(clearTimeout);
    };
  }, [counterOpacity, diveFade, flood, onDone, progress, reduceMotion, spill, started]);

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
      {/* The loading indicator: a huge faint percentage behind the cup, in the same heavy, tight type as the
          sections' ghost numbers. It appears with the cup. */}
      <div
        aria-hidden
        // Behind the cup on wide screens; on phones the tall cup would hide it, so it sits below the saucer there.
        className={`pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 transition-opacity duration-700 max-md:top-auto max-md:bottom-[5%] max-md:translate-y-0 ${
          showFlat ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <motion.p
          style={{ opacity: counterOpacity }}
          className="flex items-start justify-center font-heading leading-none font-black text-accent-strong/[0.14] tabular-nums select-none"
        >
          <motion.span className="text-[clamp(9rem,34vw,26rem)]">{number}</motion.span>
          <span className="mt-[0.6em] ml-1 text-[clamp(2rem,6vw,4.5rem)]">%</span>
        </motion.p>
      </div>
      <span className="sr-only">
        <motion.span>{percent}</motion.span>
      </span>
      {/* The 3D scene fills the screen (so the camera can dive into the cup); it fades in once its first frame is drawn */}
      <canvas
        ref={canvasRef}
        aria-hidden
        className={`absolute inset-0 size-full transition-opacity duration-1000 ease-out ${has3D ? 'opacity-100' : 'opacity-0'}`}
      />
      {/* 3D loading indicator: the scene sizes this invisible box to the cup and saucer every frame; the percentage
          sits large in front of the saucer's front edge, like a label on a product shot, with a thin line beneath
          that fills with the load. */}
      <motion.div
        ref={frameRef}
        aria-hidden
        style={{ opacity: counterOpacity }}
        className="pointer-events-none absolute"
      >
        {/* The label follows the cup in (after it's visible), so the number never shows on an empty screen. Its
            show/hide class sits here, not beside the inline opacity above, which would override it. */}
        <div
          className={`absolute top-full left-1/2 flex -translate-x-1/2 -translate-y-[30%] flex-col items-center gap-3 transition-opacity duration-700 ${
            has3D ? 'opacity-100 delay-500' : 'opacity-0'
          }`}
        >
          <p className="flex items-start font-heading leading-none font-black text-white tabular-nums select-none">
            <motion.span className="text-[clamp(3.5rem,9vw,6.5rem)]">{number}</motion.span>
            <span className="mt-[0.35em] ml-1 text-[clamp(1.1rem,2.4vw,1.6rem)] tracking-normal text-accent">%</span>
          </p>
          <span className="relative h-px w-28 overflow-hidden rounded-full bg-white/15 sm:w-36">
            <motion.span style={{ scaleX: fill }} className="absolute inset-0 origin-left bg-accent-strong" />
          </span>
        </div>
      </motion.div>
      {/* As the overlay fades, the cup sinks back a little and softens, handing over to the hero coming into focus */}
      {showFlat && (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.92, filter: 'blur(6px)' }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          <CoffeeCup progress={progress} spill={spill} reduceMotion={reduceMotion} />
        </motion.div>
      )}
      {/* 3D finale: the screen goes coffee-dark as the camera dives in */}
      <motion.div
        aria-hidden
        style={{ opacity: diveFade, backgroundColor: FLOOD_COLOR }}
        className="absolute inset-0"
      />
      {!reduceMotion && showFlat && <Flood flood={flood} />}
    </motion.div>
  );
};

export default Preloader;
