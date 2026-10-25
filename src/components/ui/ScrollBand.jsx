import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';

/**
 * A full-bleed row of oversized heading type that slides sideways as it scrolls past (a "wordmark bleed"): the
 * items repeat with a taupe dot between them, wider than the screen, so the row always runs off both edges. It's
 * scrubbed by the scroll, so it reverses going back up; still for reduced motion. Decorative only (aria-hidden):
 * when it carries a heading, the heading element around it supplies the accessible name.
 */
const ScrollBand = ({ items, direction = 'left', className = '' }) => {
  const ref = useRef(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const [from, to] = direction === 'left' ? [0, -30] : [-30, 0];
  const x = useTransform(scrollYProgress, (p) => `${reduceMotion ? -15 : from + (to - from) * p}%`);
  const run = [...items, ...items, ...items, ...items];

  return (
    <div ref={ref} aria-hidden className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden">
      <motion.div
        style={{ x }}
        className={`flex w-max items-center font-heading leading-[0.9] font-black whitespace-nowrap uppercase ${className}`}
      >
        {run.map((item, i) => (
          <span key={i} className="flex items-center">
            {item}
            <span aria-hidden className="mx-[0.35em] inline-block size-[0.12em] bg-accent/70" />
          </span>
        ))}
      </motion.div>
    </div>
  );
};

export default ScrollBand;
