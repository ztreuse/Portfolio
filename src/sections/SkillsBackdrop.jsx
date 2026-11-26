import { useRef, useState } from 'react';
import { motion, useInView, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from 'motion/react';
import useTheme from '../hooks/useTheme';
import { FILM_GRADE } from './filmGrade';

const clamp01 = (v) => Math.min(Math.max(v, 0), 1);
const smooth = (x) => x * x * (3 - 2 * x);
const frame = (set, file) => `${import.meta.env.BASE_URL}contact-film/${set}/${file}.webp`;

/** The film's first frame, cover-fit like the film (`tall` on portrait screens); `soft` is its small pre-blurred copy. */
const Photo = ({ file }) => (
  <picture className="absolute inset-0 block">
    <source media="(orientation: portrait)" srcSet={frame('tall', file)} />
    <img src={frame('wide', file)} alt="" decoding="async" className="size-full object-cover" />
  </picture>
);

/**
 * Skills' backdrop: the first frame of the Contact film (the owner's desk at night), fixed to the screen and clipped to
 * Skills (and the half screen after it), blurred and under a dark veil so the cards read over it. As Skills ends, the
 * blur and the veil fade, so the photo comes into focus exactly as the film draws its first frame, and the film takes
 * over an identical picture. The blur is a small pre-blurred copy of the frame (`soft.webp`, 14px blur, 6% zoom and the
 * film's grade baked in) whose opacity fades: a live blur on a full-screen photo made phones stutter. With a mouse
 * (desktops), the sharp photo under it also comes out of a live blur and a slight zoom as the copy fades, so it reads as
 * a focus pull rather than two pictures crossfading (which looked like a skipped frame). In the light
 * theme it's a crema version of the same picture (`soft-light.webp`, night tones remapped) with no veil, so it shows as
 * well as in the dark one. Still and blurred for reduced motion (there's no film then).
 */
const SkillsBackdrop = () => {
  const ref = useRef(null);
  const still = useReducedMotion();
  const { theme } = useTheme();
  // The photos load only once Skills is a screen or so away (fixed layers count as on screen, so `lazy` can't tell)
  const near = useInView(ref, { once: true, margin: '150% 0px' });
  // Into focus from the last row of cards over the half screen after them, done just before the film's stage pins (over
  // a third of a screen it took about three notches of a mouse wheel and looked like a skip)
  const { scrollYProgress: end } = useScroll({ target: ref, offset: ['end 1.75', 'end 1.02'] });
  // Desktops pull focus live; phones only fade the blurred copy
  const [live] = useState(() => !still && window.matchMedia('(hover: hover) and (pointer: fine)').matches);
  // A function transform, so motion keeps it on the JS side (a plain opacity map can stick)
  const soft = useTransform(end, (e) => (still ? 1 : 1 - smooth(clamp01(e))));
  // Once the night photo shows, the navbar over it stays dark in the light theme too
  useMotionValueEvent(soft, 'change', (v) => ref.current?.toggleAttribute('data-nav-dark', v < 0.6));
  const focus = useTransform(soft, (v) => (live ? `${FILM_GRADE} blur(${(v * 14).toFixed(2)}px)` : FILM_GRADE));
  const zoom = useTransform(soft, (v) => (live ? 1 + 0.06 * v : 1));

  return (
    <div ref={ref} aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-ink [clip-path:inset(0)]">
      <div className="fixed inset-x-0 top-0 h-lvh overflow-hidden xl:left-(--index-w) xl:transition-[left] xl:duration-300 bg-ink">
        <motion.div style={{ filter: focus, scale: zoom }} className="absolute inset-0">
          {near && <Photo file="001" />}
        </motion.div>
        <motion.div style={{ opacity: soft }} className="absolute inset-0">
          {near && <Photo file={theme === 'light' ? 'soft-light' : 'soft'} />}
          {theme === 'dark' && <div className="absolute inset-0 bg-ink/60" />}
        </motion.div>
      </div>
    </div>
  );
};

export default SkillsBackdrop;
