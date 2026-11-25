import { useState } from 'react';
import { LuChevronDown } from 'react-icons/lu';
import Section from '../components/ui/Section';
import Timeline from '../components/ui/Timeline';
import { experience } from '../data/experience';
import desk from '../assets/images/desk-soft.webp'; // desk.webp, pre-blurred (a live blur made phones stutter)

const SHOWN = 3; // roles before the rest fold behind "Show earlier roles"

/**
 * The owner's desk at night (their own setup, the same scene as the Contact film, graded to the site's taupes), softly
 * blurred under a veil in the theme's colour so the text stays readable. From tablets up it stays put while the section
 * scrolls over it, like looking through a window (a fixed layer clipped to the section); on phones it's a plain
 * background.
 */
const DeskBackdrop = () => (
  <div
    aria-hidden
    className="pointer-events-none absolute inset-0 -z-10 overflow-hidden bg-dimension [clip-path:inset(0)]"
  >
    <div className="absolute inset-0 md:fixed">
      <img src={desk} alt="" width="640" height="360" className="absolute inset-0 size-full object-cover" />
      <div className="absolute inset-0 bg-dimension/70 light:bg-dimension/88" />
    </div>
  </div>
);

// Over the desk photo, muted text steps up one shade
const ON_DESK =
  '[--color-accent:var(--color-accent-strong)] [--color-stone-400:var(--color-stone-300)] [--color-stone-300:var(--color-stone-200)]';

/**
 * Work only, newest first; new jobs go in data/experience.js. Past three, the older ones fold away, so the section stays
 * short however many there are (Education has its own section, so it never gets pushed down by them).
 */
const Experience = () => {
  const [all, setAll] = useState(false);
  const folds = experience.length > SHOWN;

  return (
    <Section
      id="experience"
      eyebrow="02 — Experience"
      title="Where I've worked"
      className={ON_DESK}
      background={<DeskBackdrop />}
    >
      <Timeline entries={experience.slice(0, SHOWN)} />
      {/* Its own list, so it reveals when it opens (added to the one above, which has already played, it stayed hidden) */}
      {all && (
        <div className="mt-7 border-t border-white/15 pt-7">
          <Timeline entries={experience.slice(SHOWN)} />
        </div>
      )}
      {folds && (
        <button
          type="button"
          onClick={() => setAll((v) => !v)}
          aria-expanded={all}
          className="mt-8 inline-flex items-center gap-1.5 rounded-full border border-white/20 py-1.5 pr-2.5 pl-3.5 font-display text-label font-bold tracking-[0.12em] text-stone-300 uppercase transition-colors duration-200 hover:border-transparent hover:bg-accent hover:text-ink"
        >
          {all ? 'Show fewer roles' : `Show ${experience.length - SHOWN} earlier`}
          <LuChevronDown
            aria-hidden
            className={`size-4 transition-transform duration-300 motion-reduce:transition-none ${all ? 'rotate-180' : ''}`}
          />
        </button>
      )}
    </Section>
  );
};

export default Experience;
