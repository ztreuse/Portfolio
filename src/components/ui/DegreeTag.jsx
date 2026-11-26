import { useEffect, useId, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { LuChevronDown, LuGraduationCap } from 'react-icons/lu';
import { education } from '../../data/experience';

const [{ role, short, organization, logo, period, points }] = education;

/**
 * The hero's degree tag: my education at a glance, with the rest (school, dates, full degree, honours) in a small card
 * that opens on hover, on a tap, or with Enter. It replaced the Education section, which mostly repeated the tag.
 */
const DegreeTag = () => {
  const [open, setOpen] = useState(false);
  const tag = useRef(null);
  const cardId = useId();

  // Escape or a tap anywhere else closes it
  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => !tag.current?.contains(e.target) && setOpen(false);
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <li
      ref={tag}
      onPointerEnter={(e) => e.pointerType === 'mouse' && setOpen(true)}
      onPointerLeave={(e) => e.pointerType === 'mouse' && setOpen(false)}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setOpen(false)}
      className="relative"
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls={cardId}
        // A mouse has already opened it by hovering, so its click shouldn't close it
        onClick={(e) => setOpen(e.nativeEvent.pointerType === 'mouse' || !open)}
        className={`flex cursor-default items-center gap-2 rounded-full border px-3 py-1.5 transition-colors duration-200 ${
          open ? 'border-matcha bg-matcha/15 text-white' : 'border-white/15 bg-ink/40'
        }`}
      >
        <LuGraduationCap aria-hidden className="size-3.5 text-accent" />
        {short}
        <LuChevronDown
          aria-hidden
          className={`size-3.5 text-accent transition-transform duration-200 motion-reduce:transition-none ${open ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          // The padding bridges the gap, so moving the cursor onto the card doesn't close it
          <motion.div
            id={cardId}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4, transition: { duration: 0.12 } }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="absolute top-full left-0 z-20 w-88 max-w-[calc(100vw-2.5rem)] pt-2"
          >
            <div className="rounded-xl border border-line bg-surface p-5 shadow-[0_24px_50px_-24px_rgb(0_0_0/0.55)]">
              <div className="flex items-center gap-3">
                {logo && (
                  <img
                    src={logo}
                    alt=""
                    className="size-10 shrink-0 rounded-full border border-line bg-[#fff] object-contain p-1"
                  />
                )}
                <div>
                  <p className="text-copy font-semibold text-white">{organization}</p>
                  <p className="mt-0.5 font-mono text-label font-medium tracking-[0.08em] text-accent uppercase">{period}</p>
                </div>
              </div>
              <p className="mt-4 text-sm leading-relaxed font-medium text-pretty text-stone-200">{role}</p>
              <ul className="mt-3 space-y-1.5 border-t border-white/10 pt-3 text-sm leading-relaxed text-stone-400">
                {points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
};

export default DegreeTag;
