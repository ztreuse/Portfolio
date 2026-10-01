import { motion } from 'motion/react';

const ease = [0.22, 1, 0.36, 1];

// Trigger a little before the element is fully on screen, and only once.
const viewport = { once: true, margin: '0px 0px -80px 0px' };

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease } },
};

/** Fades and slides a single element in when it scrolls into view. */
const Reveal = ({ as = 'div', x = 0, y = 28, delay = 0, children, ...props }) => {
  const Component = motion[as];

  return (
    <Component
      initial={{ opacity: 0, x, y }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={viewport}
      transition={{ duration: 0.7, ease, delay }}
      {...props}
    >
      {children}
    </Component>
  );
};

/** Container that reveals its `RevealItem` children one after another. */
// `play` (boolean) hands control to the caller instead of scroll, e.g. the hero waits for the preloader.
export const RevealGroup = ({ as = 'div', stagger = 0.1, delay = 0, play, children, ...props }) => {
  const Component = motion[as];
  const trigger = play === undefined ? { whileInView: 'visible', viewport } : { animate: play ? 'visible' : 'hidden' };

  return (
    <Component
      initial="hidden"
      {...trigger}
      variants={{ hidden: {}, visible: { transition: { staggerChildren: stagger, delayChildren: delay } } }}
      {...props}
    >
      {children}
    </Component>
  );
};

/** Child of `RevealGroup`; inherits the group's timing. */
export const RevealItem = ({ as = 'div', children, ...props }) => {
  const Component = motion[as];

  return (
    <Component variants={fadeUp} {...props}>
      {children}
    </Component>
  );
};

export default Reveal;
