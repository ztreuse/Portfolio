import Section from '../components/ui/Section';
import Timeline from '../components/ui/Timeline';
import { education } from '../data/experience';

/** Degrees, in the same rows as Experience. New entries go in data/experience.js. */
const Education = () => (
  <Section id="education" eyebrow="03 — Education" title="Where I studied">
    <Timeline entries={education} />
  </Section>
);

export default Education;
