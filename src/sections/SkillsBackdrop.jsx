import { useEffect, useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';

const clamp01 = (v) => Math.min(Math.max(v, 0), 1);
const smooth = (x) => x * x * (3 - 2 * x);

// One stratum's outline at time t (s) in a 2000 × 1000 box: a wavy top edge filled down to the bottom. Three waves
// of different lengths travel along the edge at the layer's own speed (`flow`, negative = leftward) and the long
// one swells and settles, so the edge keeps rolling like a slow liquid. It's wider than the screen so it can slide
// sideways without showing its ends.
const EDGE = 120;
const stratum = (seed, t, flow) => {
  let d = 'M0 1000 ';
  const swell = 1 + 0.35 * Math.sin(t * 0.4 * Math.abs(flow) + seed);
  for (let x = 0; x <= 2000; x += 20) {
    const y =
      EDGE +
      44 * swell * Math.sin(x * 0.004 + seed + t * 0.5 * flow) +
      20 * Math.sin(x * 0.011 + seed * 2.3 - t * 0.9 * flow) +
      8 * Math.sin(x * 0.027 + seed * 4.1 + t * 1.6 * flow);
    d += `L${x} ${y.toFixed(1)} `;
  }
  return `${d}L2000 1000 Z`;
};

// Back to front: where each layer's edge sits (% down the section), its tone (far ones lighter, like a paper-cut
// scene; the front one is the page ink), how far it drifts up and sideways over the section's scroll (px), and its
// own continuous sway: how far sideways and up and down (px), how long one sweep takes (s) and where it starts (s),
// and how fast its waves roll along the edge (`flow`; the far ones slow, the near ones faster, alternating ways)
const LAYERS = [
  { top: 14, fill: '#2a2520', rise: 60, slide: 40, sway: [70, 8, 23, -4], flow: 0.35, seed: 1 },
  { top: 30, fill: '#25211d', rise: 140, slide: -70, sway: [-110, 14, 17, -11], flow: -0.55, seed: 2.4 },
  { top: 47, fill: '#201d1a', rise: 230, slide: 100, sway: [150, 10, 13, -2], flow: 0.75, seed: 3.7 },
  { top: 64, fill: '#1b1917', rise: 330, slide: -130, sway: [-90, 18, 9.5, -7], flow: -0.95, seed: 5.1 },
  { top: 80, fill: '#161513', rise: 440, slide: 160, sway: [200, 12, 11, -5], flow: 1.2, seed: 6.6 },
];

const Stratum = ({ layer, progress, still, pathRef }) => {
  const y = useTransform(progress, (p) => (still ? 0 : (0.5 - p) * layer.rise * 2));
  const x = useTransform(progress, (p) => (still ? 0 : (p - 0.5) * layer.slide * 2));
  const [swayX, swayY, duration, delay] = layer.sway;
  return (
    <motion.div style={{ y, x, top: `${layer.top}%` }} className="absolute -inset-x-[30%] -bottom-[30%]">
      {/* Its own continuous drift on top of the scroll parallax, each layer at a different pace and distance */}
      <svg
        viewBox="0 0 2000 1000"
        preserveAspectRatio="none"
        style={{
          '--sway-x': `${swayX}px`,
          '--sway-y': `${swayY}px`,
          animationDuration: `${duration}s`,
          animationDelay: `${delay}s`,
        }}
        className="size-full animate-sway drop-shadow-[0_-8px_14px_rgb(0_0_0/0.35)] motion-reduce:animate-none"
      >
        <path ref={pathRef} d={stratum(layer.seed, 0, layer.flow)} fill={layer.fill} />
      </svg>
    </motion.div>
  );
};

/**
 * Skills' backdrop: five layered strata with wavy edges, like a paper-cut scene in the site's dark taupes (the far
 * ones lighter, the front one the page ink), each with a soft shadow along its edge. As you scroll through the
 * section every layer rises at its own speed and slides sideways, alternating directions, so they move past each
 * other in depth. They also move on their own all the time: each edge's waves roll along it like a slow liquid
 * (each layer at its own speed and direction) and each layer sways sideways and up and down at its own pace. The page smoke doesn't show here: a `fixed` ink layer fades in evenly as Skills arrives (one opacity,
 * so no edge and no banding) and then stays, all the way into the Contact film (fading it out as Skills left showed the
 * smoke during the transition; Contact and the footer have their own solid background, so it never needs to go). Flat colours only. Still for reduced motion.
 */
const SkillsBackdrop = () => {
  const ref = useRef(null);
  const still = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  // The smoke cover: in while the section's top rises from 90% to 30% of the screen, then it stays
  const { scrollYProgress: arrive } = useScroll({ target: ref, offset: ['start 0.9', 'start 0.3'] });
  const cover = useTransform(arrive, (a) => smooth(clamp01(a)));

  // Roll every layer's waves along its edge, at 30fps, only while the section is on screen
  const paths = useRef([]);
  useEffect(() => {
    if (still) return undefined;
    let frame = 0;
    let visible = false;
    let last = 0;
    const start = performance.now();
    const tick = (now) => {
      frame = visible && !document.hidden ? requestAnimationFrame(tick) : 0;
      if (now - last < 1000 / 30) return;
      last = now;
      const t = (now - start) / 1000;
      LAYERS.forEach((layer, i) => paths.current[i]?.setAttribute('d', stratum(layer.seed, t, layer.flow)));
    };
    const wake = () => {
      if (visible && !document.hidden && !frame) frame = requestAnimationFrame(tick);
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      wake();
    });
    if (ref.current) observer.observe(ref.current);
    document.addEventListener('visibilitychange', wake);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      document.removeEventListener('visibilitychange', wake);
    };
  }, [still]);

  return (
    <div ref={ref} aria-hidden className="pointer-events-none absolute inset-0 -z-10">
      <motion.div style={{ opacity: still ? 1 : cover }} className="fixed inset-0 -z-10 bg-ink" />
      {/* Runs 60% of a screen past Skills' bottom, under the Contact film's feathered top edge, so the waves don't stop
          in a line where Skills ends */}
      <motion.div
        style={{ opacity: still ? 1 : cover }}
        className="absolute inset-x-0 top-0 -bottom-[60svh] overflow-clip"
      >
        {LAYERS.map((layer, i) => (
          <Stratum
            key={layer.seed}
            layer={layer}
            progress={scrollYProgress}
            still={still}
            pathRef={(node) => {
              paths.current[i] = node;
            }}
          />
        ))}
      </motion.div>
    </div>
  );
};

export default SkillsBackdrop;
