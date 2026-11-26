import { useState } from 'react';
import { LuChevronDown } from 'react-icons/lu';
import { intros } from '../data/site';
import Section from '../components/ui/Section';
import Timeline from '../components/ui/Timeline';
import { experience } from '../data/experience';

const SHOWN = 3; // roles before the rest fold behind "Show earlier roles"

/**
 * Work only, newest first; new jobs go in data/experience.js. Past three, the older ones fold away, so the section stays
 * short however many there are.
 */
const Experience = () => {
  const [all, setAll] = useState(false);
  const folds = experience.length > SHOWN;

  return (
    <Section id="experience" title="Where I've worked" intro={intros.experience}>
      <Timeline entries={experience.slice(0, SHOWN)} />
      {/* Its own list, so it reveals when it opens (added to the one above, which has already played, it stayed hidden) */}
      {all && (
        <div className="mt-7">
          <Timeline entries={experience.slice(SHOWN)} />
        </div>
      )}
      {folds && (
        <button
          type="button"
          onClick={() => setAll((v) => !v)}
          aria-expanded={all}
          className="mt-6 inline-flex items-center gap-1.5 rounded-full border border-white/20 py-1.5 pr-2.5 pl-3.5 font-mono text-label font-medium tracking-[0.08em] text-stone-300 uppercase transition-colors duration-200 hover:border-transparent hover:bg-matcha hover:text-ink"
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
