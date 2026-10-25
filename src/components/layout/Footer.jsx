import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { LuArrowUp, LuArrowUpRight } from 'react-icons/lu';
import Container from '../ui/Container';
import IconButton from '../ui/IconButton';
import { profile, socials } from '../../data/site';
import { sectionLink } from '../../hooks/useCleanAnchorLinks';

// The tagline's first sentence reads quiet, the rest bright.
const leadEnd = profile.tagline.indexOf('. ');
const [taglineLead, taglineRest] =
  leadEnd === -1 ? ['', profile.tagline] : [profile.tagline.slice(0, leadEnd + 1), profile.tagline.slice(leadEnd + 2)];
const letters = [...profile.name];

/** One wordmark letter, rising out of the bottom edge with the rest of the name. */
const WordmarkLetter = ({ char, progress, still }) => {
  // All letters rise together and land at 80% of the footer's scroll, so the whole name is up even when a phone's
  // address bar stops the page just short of the very bottom (a per-letter stagger left "Bay" half-risen there).
  const y = useTransform(progress, [0.35, 0.8], still ? ['0%', '0%'] : ['105%', '0%']);

  return (
    // Clipped vertically only (tight tracking pushes glyphs past their box sideways); padding keeps the "y" tail
    <span className="-mb-[0.2em] inline-block overflow-y-clip pb-[0.2em] align-bottom">
      <motion.span
        style={{ y }}
        className="-mx-[0.08em] inline-block bg-linear-to-b from-accent/35 to-transparent bg-clip-text px-[0.08em] whitespace-pre text-transparent"
      >
        {char}
      </motion.span>
    </span>
  );
};

/**
 * Footer, revealed like a curtain: as the page bottom approaches, its content slides up from under Contact (scroll
 * parallax) and the oversized "Troy Bay" wordmark rises letter by letter out of the bottom edge. Everything is
 * scrubbed by the scroll (reverses going back up) and always completes, since the footer's end meets the screen's
 * end at the very bottom of the page. Static for reduced motion.
 */
const Footer = () => {
  const ref = useRef(null);
  const still = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end end'] });
  const contentY = useTransform(scrollYProgress, [0, 1], still ? ['0%', '0%'] : ['-35%', '0%']);
  // A function, not an input/output map: motion would hand a plain opacity map to the browser's native scroll
  // timeline, which got this range wrong and left the footer stuck at 0.2 at the bottom of the page.
  const contentOpacity = useTransform(scrollYProgress, (p) => (still ? 1 : 0.2 + 0.8 * Math.min(p / 0.6, 1)));

  return (
    <footer ref={ref} className="tone-light tone-screen relative z-10 overflow-hidden bg-ink">
      {/* Same screen colour as Contact; just this divider (fading out toward both edges) separates them */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-accent/40 to-transparent"
      />

      <motion.div style={{ y: contentY, opacity: contentOpacity }}>
        <Container className="pt-20 sm:pt-28">
          <div className="grid gap-12 md:grid-cols-12 md:items-end">
            {/* Sign-off line */}
            <p className="font-heading text-4xl leading-[0.95] font-extrabold tracking-[0.01em] text-balance uppercase sm:text-5xl md:col-span-7 lg:text-6xl">
              {taglineLead && <span className="text-stone-500">{taglineLead} </span>}
              <span className="text-white">{taglineRest}</span>
            </p>

            {/* Profiles as a labelled list; each row's line fills taupe on hover */}
            <nav aria-label="Profiles" className="md:col-span-4 md:col-start-9">
              <p className="font-heading text-base font-bold tracking-[0.16em] text-accent uppercase">Find me on</p>
              <ul className="mt-3">
                {socials.map(({ label, href }) => (
                  <li key={label}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative flex items-center justify-between border-b border-line py-4 font-display text-lg font-semibold text-stone-300 transition-colors duration-300 hover:text-white"
                    >
                      {label}
                      <LuArrowUpRight
                        aria-hidden
                        className="size-5 text-stone-500 transition-[translate,color] duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent-strong motion-reduce:transition-none"
                      />
                      <span
                        aria-hidden
                        className="absolute inset-x-0 -bottom-px h-px origin-left scale-x-0 bg-accent transition-transform duration-500 ease-out group-hover:scale-x-100"
                      />
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div className="mt-16 flex items-center justify-between gap-4 text-sm text-stone-400 sm:mt-20">
            <p>
              &copy; {new Date().getFullYear()} {profile.name}. All rights reserved.
            </p>
            <IconButton label="Back to top" icon={LuArrowUp} {...sectionLink('hero')} className="shrink-0" />
          </div>
        </Container>
      </motion.div>

      {/* Oversized signature wordmark, cropped by the bottom edge; its letters rise in with the scroll */}
      <p
        aria-hidden
        className="pointer-events-none mt-8 -mb-[0.2em] text-center font-heading text-[min(24vw,21rem)] leading-none font-black tracking-[0.01em] whitespace-nowrap uppercase select-none"
      >
        {letters.map((char, i) => (
          <WordmarkLetter key={i} char={char} progress={scrollYProgress} still={still} />
        ))}
      </p>
    </footer>
  );
};

export default Footer;
