import { motion, useMotionValue, useReducedMotion, useSpring } from 'motion/react';

const MAGNET_STRENGTH = 0.35;
const magnetSpring = { stiffness: 300, damping: 18, mass: 0.5 };

/**
 * Round social link: magnetic pull toward the cursor, accent fill, rolling icon swap,
 * and a label tooltip on hover/focus.
 */
const SocialIcon = ({ label, href, icon: Icon }) => {
  const reduceMotion = useReducedMotion();
  const x = useSpring(useMotionValue(0), magnetSpring);
  const y = useSpring(useMotionValue(0), magnetSpring);

  const pull = (e) => {
    if (reduceMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - rect.left - rect.width / 2) * MAGNET_STRENGTH);
    y.set((e.clientY - rect.top - rect.height / 2) * MAGNET_STRENGTH);
  };

  const release = () => {
    x.set(0);
    y.set(0);
  };

  const hoverClass = 'group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100';

  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      style={{ x, y }}
      onMouseMove={pull}
      onMouseLeave={release}
      className="group relative flex size-11 items-center justify-center rounded-full border border-line bg-ink/50 text-stone-300 transition-colors duration-300 hover:border-accent hover:text-ink focus-visible:border-accent focus-visible:text-ink focus-visible:outline-none"
    >
      <span
        aria-hidden
        className="absolute inset-0 scale-0 rounded-full bg-accent transition-transform duration-300 ease-out group-hover:scale-100 group-focus-visible:scale-100"
      />

      <span aria-hidden className="relative block size-4.5 overflow-hidden">
        <Icon className="size-4.5 transition-transform duration-300 ease-out group-hover:-translate-y-full group-focus-visible:-translate-y-full motion-reduce:transition-none" />
        <Icon className="absolute inset-0 size-4.5 translate-y-full transition-transform duration-300 ease-out group-hover:translate-y-0 group-focus-visible:translate-y-0 motion-reduce:transition-none" />
      </span>

      <span
        aria-hidden
        className={`pointer-events-none absolute bottom-full left-1/2 mb-2.5 -translate-x-1/2 translate-y-1 rounded-md border border-line bg-surface px-2 py-1 text-xs font-medium whitespace-nowrap text-stone-200 opacity-0 shadow-lg shadow-black/40 transition-all duration-200 ${hoverClass}`}
      >
        {label}
      </span>
    </motion.a>
  );
};

export default SocialIcon;
