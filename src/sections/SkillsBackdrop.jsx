import { useRef } from 'react';
import { motion, useInView, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { FILM_GRADE } from './filmGrade';

const clamp01 = (v) => Math.min(Math.max(v, 0), 1);
const smooth = (x) => x * x * (3 - 2 * x);
const frame = (set, file) => `${import.meta.env.BASE_URL}contact-film/${set}/${file}.webp`;

/** The film's first frame, cover-fit like the film (`tall` on portrait screens); `soft` is its small pre-blurred copy. */
const Photo = ({ file }) => (
  <picture className="absolute inset-0 block">
    <source media="(orientation: portrait)" srcSet={frame('tall', file)} />
    <img src={frame('wide', file)} alt="" className="size-full object-cover" />
  </picture>
);

/**
 * Skills' backdrop: the first frame of the Contact film (the owner's desk at night), fixed to the screen and clipped to
 * Skills (and the half screen after it), blurred and under a dark veil so the cards read over it. As Skills ends, the
 * blur and the veil fade, so the photo comes into focus exactly as the film draws its first frame, and the film takes
 * over an identical picture. The blur is a small pre-blurred copy of the frame (`soft.webp`, 14px blur, 6% zoom and the
 * film's grade baked in) whose opacity fades: a live blur on a full-screen photo made phones stutter. Still and
 * blurred for reduced motion (there's no film then).
 */
const SkillsBackdrop = () => {
  const ref = useRef(null);
  const still = useReducedMotion();
  // The photos load only once Skills is a screen or so away (fixed layers count as on screen, so `lazy` can't tell)
  const near = useInView(ref, { once: true, margin: '150% 0px' });
  // Into focus over the half screen after the cards, done just before the film's stage pins
  const { scrollYProgress: end } = useScroll({ target: ref, offset: ['end 1.35', 'end 1.02'] });
  // A function transform, so motion keeps it on the JS side (a plain opacity map can stick)
  const soft = useTransform(end, (e) => (still ? 1 : 1 - smooth(clamp01(e))));

  return (
    <div ref={ref} aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-ink [clip-path:inset(0)]">
      <div className="fixed inset-x-0 top-0 h-lvh overflow-hidden bg-ink">
        <div style={{ filter: FILM_GRADE }} className="absolute inset-0">
          {near && <Photo file="001" />}
        </div>
        <motion.div style={{ opacity: soft }} className="absolute inset-0">
          {near && <Photo file="soft" />}
          <div className="absolute inset-0 bg-ink/60" />
        </motion.div>
      </div>
    </div>
  );
};

export default SkillsBackdrop;
