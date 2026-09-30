import Container from './Container';
import SectionHeading from './SectionHeading';

/**
 * Standard page section: at least one screen tall with content centered vertically,
 * plus consistent vertical rhythm, container width and heading.
 * `background` renders behind the content (the section is `isolate`, so `-z-10` layers stay inside it).
 */
const Section = ({ id, eyebrow, title, description, action, background, className = '', children }) => (
  <section id={id} className={`relative isolate flex min-h-svh flex-col justify-center py-20 sm:py-28 ${className}`}>
    {background}
    <Container>
      {title && <SectionHeading eyebrow={eyebrow} title={title} description={description} action={action} />}
      <div className={title ? 'mt-12 sm:mt-16' : ''}>{children}</div>
    </Container>
  </section>
);

export default Section;
