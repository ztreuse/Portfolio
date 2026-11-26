import { LuArrowUp } from 'react-icons/lu';
import Container from '../ui/Container';
import Button from '../ui/Button';
import { profile } from '../../data/site';
import { sectionLink } from '../../hooks/useCleanAnchorLinks';

// The tagline's first sentence reads quiet, the rest bright.
const leadEnd = profile.tagline.indexOf('. ');
const [taglineLead, taglineRest] =
  leadEnd === -1 ? ['', profile.tagline] : [profile.tagline.slice(0, leadEnd + 1), profile.tagline.slice(leadEnd + 2)];

/** A compact sign-off on Contact's colour: the tagline, the copyright line and a way back to the top. */
const Footer = () => (
  <footer className="relative z-10 border-t border-accent/40 bg-ink xl:ml-(--index-w) xl:transition-[margin-left] xl:duration-300">
    <Container className="flex flex-col gap-6 py-10 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="font-display text-item leading-snug font-bold text-balance">
          {/* Each sentence starts its own line */}
          {taglineLead && <span className="block text-stone-500">{taglineLead}</span>}
          <span className="block text-white">{taglineRest}</span>
        </p>
        <p className="mt-4 text-sm text-stone-400">
          &copy; {new Date().getFullYear()} {profile.name}. All rights reserved.
        </p>
        <p className="mt-1 text-sm text-stone-400">Built with React, Vite and Tailwind CSS.</p>
      </div>
      <Button
        variant="outline"
        icon={LuArrowUp}
        nudge="y"
        {...sectionLink('hero')}
        className="shrink-0 self-start sm:self-auto"
      >
        Back to top
      </Button>
    </Container>
  </footer>
);

export default Footer;
