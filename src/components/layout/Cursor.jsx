import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useMotionValue, useSpring } from 'motion/react';

const follow = { stiffness: 500, damping: 40, mass: 0.6 };

// Only for mouse/trackpad users who haven't asked for reduced motion.
const canUseCursor = () =>
  window.matchMedia('(pointer: fine)').matches && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Hides the system cursor while the custom one shows (lg and up, matching it; links set their own cursor, hence `*`).
const hideSystemCursor = ['lg:cursor-none', 'lg:[&_*]:cursor-none!'];

/**
 * Replaces the system cursor (desktop / fine pointers only): a small dot sits exactly on the pointer and a
 * taupe ring trails it. The ring swells over links and buttons, and shows a label over elements with
 * `data-cursor="View"` etc.
 */
const Cursor = () => {
  const [enabled] = useState(canUseCursor);
  const [state, setState] = useState({
    label: null,
    interactive: false,
    visible: false,
    pressed: false,
  });
  const pointerX = useMotionValue(-100);
  const pointerY = useMotionValue(-100);
  const x = useSpring(pointerX, follow);
  const y = useSpring(pointerY, follow);

  useEffect(() => {
    if (!enabled) return undefined;

    const move = (e) => {
      pointerX.set(e.clientX);
      pointerY.set(e.clientY);
      const labelled = e.target.closest('[data-cursor]');
      const interactive = !!e.target.closest('a, button, input, textarea, label');
      setState((s) => {
        const label = labelled?.dataset.cursor ?? null;
        return s.label === label && s.interactive === interactive && s.visible
          ? s
          : { ...s, label, interactive, visible: true };
      });
    };
    const leave = () => setState((s) => ({ ...s, visible: false }));
    const down = () => setState((s) => ({ ...s, pressed: true }));
    const up = () => setState((s) => ({ ...s, pressed: false }));

    document.documentElement.classList.add(...hideSystemCursor);
    window.addEventListener('pointermove', move);
    document.documentElement.addEventListener('pointerleave', leave);
    window.addEventListener('pointerdown', down);
    window.addEventListener('pointerup', up);
    return () => {
      document.documentElement.classList.remove(...hideSystemCursor);
      window.removeEventListener('pointermove', move);
      document.documentElement.removeEventListener('pointerleave', leave);
      window.removeEventListener('pointerdown', down);
      window.removeEventListener('pointerup', up);
    };
  }, [enabled, pointerX, pointerY]);

  if (!enabled) return null;

  const { label, interactive, visible, pressed } = state;
  const size = label ? 84 : interactive ? 44 : 28;

  return (
    <>
      <motion.div
        aria-hidden
        style={{ x: pointerX, y: pointerY }}
        animate={{
          opacity: visible && !label ? 1 : 0,
          scale: pressed ? 0.6 : 1,
        }}
        transition={{ duration: 0.15 }}
        className="pointer-events-none fixed top-0 left-0 z-90 hidden size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-strong mix-blend-difference lg:block"
      />
      <motion.div
        aria-hidden
        style={{ x, y }}
        className={`pointer-events-none fixed top-0 left-0 z-90 hidden lg:block ${label ? '' : 'mix-blend-difference'}`}
      >
        <motion.div
          animate={{
            width: size,
            height: size,
            opacity: visible ? 1 : 0,
            scale: pressed ? 0.8 : 1,
            backgroundColor: label ? 'rgb(201 188 175 / 0.95)' : 'rgb(201 188 175 / 0)',
            borderColor: label ? 'rgb(201 188 175 / 0)' : 'rgb(201 188 175 / 0.7)',
          }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border"
        >
          <AnimatePresence>
            {label && (
              <motion.span
                key={label}
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.6 }}
                className="font-display text-[11px] font-semibold tracking-[0.14em] text-ink uppercase"
              >
                {label}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </>
  );
};

export default Cursor;
