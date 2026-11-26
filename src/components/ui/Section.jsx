import Container from './Container';
import SectionHeading from './SectionHeading';

/**
 * Standard page section: as tall as its content, with one vertical rhythm, container width and heading style.
 * `intro` is the short line under the title. `background` renders behind the content (the section is `isolate`, so `-z-10` layers stay inside it).
 */
const Section = ({ id, title, intro, action, background, className = '', children }) => (
  <section id={id} className={`relative isolate py-16 sm:py-24 ${className}`}>
    {background}
    <Container>
      <SectionHeading title={title} intro={intro} action={action} />
      <div className="mt-8 sm:mt-10">{children}</div>
    </Container>
  </section>
);

export default Section;
