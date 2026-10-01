import { LuArrowUp } from 'react-icons/lu';
import Container from '../ui/Container';
import SocialIcon from '../ui/SocialIcon';
import { profile, socials } from '../../data/site';
import { sectionLink } from '../../hooks/useCleanAnchorLinks';
import logo from '../../assets/images/logo.svg';

const Footer = () => (
  <footer className="relative overflow-hidden bg-ink-deep">
    {/* Hairline that fades out toward both edges */}
    <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-accent/40 to-transparent" />

    <Container className="pt-20">
      {/* Brand on the left, profile links on the right (stacked on phones) */}
      <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <div>
          <img src={logo} alt="Troy Bay" className="h-10 w-auto" />
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-stone-400">{profile.tagline}</p>
        </div>
        <ul className="flex gap-3">
          {socials.map((social) => (
            <li key={social.label}>
              <SocialIcon {...social} />
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-16 flex flex-col-reverse items-center gap-4 border-t border-line pt-8 text-sm text-stone-500 sm:flex-row sm:justify-between">
        <p>
          &copy; {new Date().getFullYear()} {profile.name}. All rights reserved.
        </p>
        <a
          {...sectionLink('hero')}
          className="group inline-flex items-center gap-2 font-display text-xs font-semibold tracking-[0.14em] text-accent uppercase transition-colors hover:text-white"
        >
          Back to top
          <span className="flex size-8 items-center justify-center rounded-full border border-line transition-colors group-hover:border-accent group-hover:bg-accent group-hover:text-ink">
            <LuArrowUp aria-hidden className="size-4" />
          </span>
        </a>
      </div>
    </Container>

    {/* Oversized signature wordmark, cropped by the bottom edge. Static on purpose: it sits at the very
        bottom of the page, so a scroll-triggered reveal would never fire on short screens. */}
    <p
      aria-hidden
      className="pointer-events-none mt-10 -mb-[0.22em] text-center font-display text-[12vw] leading-none font-bold tracking-tight whitespace-nowrap select-none lg:text-[10.5rem]"
    >
      <span className="bg-linear-to-b from-accent/30 to-transparent bg-clip-text text-transparent">{profile.name}</span>
    </p>
  </footer>
);

export default Footer;
