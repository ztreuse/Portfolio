import { useLayoutEffect, useRef } from 'react';
import { motion, useMotionValueEvent, useScroll, useTransform } from 'motion/react';

const clamp01 = (v) => Math.min(Math.max(v, 0), 1);
const smooth = (x) => x * x * (3 - 2 * x);
// The far point the flight heads for, as fractions of the screen; must match the Certifications band's `flyTo` in
// App.jsx
const VANISH = [0.72, 0.3];
const DUST = 110;

// A repeatable random number for speck i
const rand = (i, salt) => {
  const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/**
 * Certifications → Skills as a flight: while the end of Certifications holds still (CremaBand `lightsDown.flyTo`),
 * the camera rushes toward a far point in the upper right. The carousel swells and slides off toward the bottom left
 * as you pass it and the crema fades into the dark smoke; fine taupe specks stream outward from the far point like
 * dust rushing past; far away at that point a small SKILLS appears, comes toward you and grows into the middle of
 * the screen, and you pass through it into the Skills heading. Scroll-scrubbed, so it reverses going back up.
 *
 * The runway is pulled up by a screen plus the Certifications hold (`-mt-[165svh]`; the hold is 65svh), so its pinned
 * stage appears exactly as that hold begins and plays over it (above it, click-through). Only its last part counts as Skills
 * for the navbar. Render it only when motion is allowed.
 */
const SkillsIntro = () => {
  const runway = useRef(null);
  const canvas = useRef(null);
  // The runway's scroll: 0 as the Certifications hold begins, 0.5 as it ends, 1 as Skills arrives
  const { scrollYProgress } = useScroll({ target: runway, offset: ['start start', 'end end'] });

  // Dust: specks at random directions and depths from the far point, rushing outward as the flight speeds along
  const draw = (p) => {
    const el = canvas.current;
    if (!el) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = el.clientWidth;
    const h = el.clientHeight;
    if (el.width !== Math.round(w * dpr) || el.height !== Math.round(h * dpr)) {
      el.width = Math.round(w * dpr);
      el.height = Math.round(h * dpr);
    }
    const ctx = el.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    const visible = smooth(clamp01((p - 0.08) / 0.2)) * (1 - smooth(clamp01((p - 0.86) / 0.14)));
    if (visible <= 0) return;
    const travel = 3.2 * smooth(clamp01(p / 0.95));
    const vx = VANISH[0] * w;
    const vy = VANISH[1] * h;
    const spread = Math.hypot(w, h) * 0.08;
    ctx.lineCap = 'round';
    for (let i = 0; i < DUST; i += 1) {
      const angle = rand(i, 1) * Math.PI * 2;
      // Depth runs 1 (far) → 0 (at the camera), wrapping round as the flight goes on
      const z = 1 - ((rand(i, 2) + travel * (0.5 + rand(i, 3) * 0.5)) % 1);
      const reach = (d) => spread / (d + 0.06);
      const r = reach(z);
      const r0 = reach(Math.min(1, z + 0.05));
      const alpha = visible * clamp01((1 - z) * 1.6) * 0.75;
      ctx.strokeStyle = `rgba(201, 188, 175, ${alpha.toFixed(3)})`;
      ctx.lineWidth = Math.min(3, 0.4 + (1 - z) * 2.2);
      ctx.beginPath();
      ctx.moveTo(vx + Math.cos(angle) * r0, vy + Math.sin(angle) * r0);
      ctx.lineTo(vx + Math.cos(angle) * r, vy + Math.sin(angle) * r);
      ctx.stroke();
    }
  };
  useMotionValueEvent(scrollYProgress, 'change', draw);
  useLayoutEffect(() => draw(scrollYProgress.get()));

  // SKILLS: appears small at the far point, comes toward you to the middle of the screen, then you pass through it
  const approach = useTransform(scrollYProgress, (p) => smooth(clamp01((p - 0.28) / 0.52)));
  const pass = useTransform(scrollYProgress, (p) => smooth(clamp01((p - 0.88) / 0.12)));
  const x = useTransform(approach, (a) => `${(VANISH[0] - 0.5) * 100 * (1 - a)}vw`);
  const y = useTransform(approach, (a) => `${(VANISH[1] - 0.5) * 100 * (1 - a)}vh`);
  const scale = useTransform([approach, pass], ([a, s]) => (1 / (1 + 14 * (1 - a) ** 2)) * (1 + 0.9 * s));
  const opacity = useTransform(
    scrollYProgress,
    (p) => smooth(clamp01((p - 0.26) / 0.14)) * (1 - smooth(clamp01((p - 0.88) / 0.12))),
  );
  const filter = useTransform(pass, (s) => (s > 0 ? `blur(${(s * 12).toFixed(1)}px)` : 'none'));

  return (
    // A navbar glide spends 2 s on the flight, so it plays out (it flashed past in about 0.6 s)
    <div
      ref={runway}
      data-slow-glide="1"
      data-slow-between="certifications skills"
      aria-hidden
      className="pointer-events-none relative -mt-[165svh] h-[230svh]"
    >
      {/* The flight counts as Skills for the navbar from the end of the Certifications hold on */}
      <span data-section-of="skills" className="absolute inset-x-0 bottom-0 h-[130svh]" />
      <div className="sticky top-0 h-svh overflow-hidden">
        <canvas ref={canvas} className="absolute inset-0 size-full" />
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.p
            style={{ x, y, scale, opacity, filter }}
            className="font-heading text-[clamp(5rem,22vw,17rem)] leading-none font-black tracking-[0.01em] text-accent-strong uppercase"
          >
            Skills
          </motion.p>
        </div>
      </div>
    </div>
  );
};

export default SkillsIntro;
