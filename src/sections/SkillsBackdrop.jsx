import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { FILM_GRADE } from './filmGrade';

const clamp01 = (v) => Math.min(Math.max(v, 0), 1);
const smooth = (x) => x * x * (3 - 2 * x);
const frame = (set) => `${import.meta.env.BASE_URL}contact-film/${set}/001.webp`;

/**
 * Skills' backdrop: the first frame of the Contact film (the owner's desk at night), fixed to the screen, blurred and
 * under a dark veil so the cards read over it. It fades in evenly as Skills arrives (one opacity, so no edge and no
 * banding; it also hides the page smoke). As Skills ends, the blur, the slight zoom and the veil all go, so the photo
 * comes into focus exactly as the film draws its first frame (cover-fit and centred, the `tall` frames on portrait
 * screens like the film), and the film then rises over an identical picture and plays. It stays on until Contact,
 * which has its own background. It replaced layered parallax strata with rolling edges. Still and blurred for
 * reduced motion (there's no film then).
 */
const SkillsBackdrop = () => {
  const ref = useRef(null);
  const still = useReducedMotion();
  // In while the section's top rises from 90% to 30% of the screen, then it stays
  const { scrollYProgress: arrive } = useScroll({ target: ref, offset: ['start 0.9', 'start 0.3'] });
  const cover = useTransform(arrive, (a) => (still ? 1 : smooth(clamp01(a))));
  // Into focus while the section's bottom rises from 85% to 30% of the screen
  const { scrollYProgress: end } = useScroll({ target: ref, offset: ['end 0.85', 'end 0.3'] });
  const soft = useTransform(end, (e) => (still ? 1 : 1 - smooth(clamp01(e))));
  // The film's own grade, so the sharp frame matches it exactly
  const filter = useTransform(soft, (s) => `${FILM_GRADE} blur(${(s * 14).toFixed(2)}px)`);
  const scale = useTransform(soft, (s) => 1 + 0.06 * s);
  const veil = useTransform(soft, (s) => 0.6 * s);

  return (
    <div ref={ref} aria-hidden className="pointer-events-none absolute inset-0 -z-10">
      <motion.div style={{ opacity: cover }} className="fixed inset-0 -z-10 overflow-hidden bg-ink">
        <motion.picture style={{ filter, scale }} className="absolute inset-0 block">
          <source media="(orientation: portrait)" srcSet={frame('tall')} />
          <img src={frame('wide')} alt="" className="size-full object-cover" />
        </motion.picture>
        <motion.div style={{ opacity: veil }} className="absolute inset-0 bg-ink" />
      </motion.div>
    </div>
  );
};

export default SkillsBackdrop;
