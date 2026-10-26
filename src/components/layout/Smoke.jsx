import { useState } from 'react';
import { motion, useMotionValueEvent, useScroll, useTransform } from 'motion/react';
import SmokeCanvas from '../ui/SmokeCanvas';

// Light taupe smoke on the dark page (Experience's lighter circle has its own, darker smoke).
const SMOKE_COLOR = [0.66, 0.6, 0.54];
const clamp01 = (v) => Math.min(1, Math.max(0, v));

/**
 * Smoky backdrop for everything after the hero, footer included: one full-screen `fixed` WebGL smoke layer at z-5,
 * above the pinned hero but below the section panel and the footer (both z-10 and transparent). It fades in as the panel
 * rises (the hero has faded to ink by then) and stays on to the bottom of the page; it pauses while invisible.
 */
const Smoke = () => {
  const [visible, setVisible] = useState(false);
  const { scrollY } = useScroll();
  // A function transform (not an input/output map), so motion doesn't hand it to the browser's scroll timeline.
  const opacity = useTransform(scrollY, () => {
    // The panel that slides up over the hero (it starts with the WORK flood, which floats on this smoke)
    const panel = document.querySelector('[data-panel]');
    if (!panel) return 0;
    const vh = window.innerHeight;
    return clamp01((vh - panel.getBoundingClientRect().top) / vh);
  });
  useMotionValueEvent(opacity, 'change', (v) => setVisible(v > 0.01));

  return (
    <motion.div aria-hidden style={{ opacity }} className="pointer-events-none fixed inset-0 z-[5]">
      <SmokeCanvas color={SMOKE_COLOR} strength={0.2} seed={0} paused={!visible} />
    </motion.div>
  );
};

export default Smoke;
