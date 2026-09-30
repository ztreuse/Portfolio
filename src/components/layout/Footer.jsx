import { LuArrowUp, LuMail } from 'react-icons/lu';
import Container from '../ui/Container';
import { navLinks, profile, socials } from '../../data/site';
import logo from '../../assets/images/logo.svg';

const headingClass = 'font-display text-xs font-semibold tracking-[0.14em] text-accent uppercase';
const linkClass = 'inline-flex items-center gap-2 text-stone-400 transition-colors hover:text-white';

const Footer = () => (
  <footer className="border-t border-line bg-ink-deep">
    <Container className="py-16">
      <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr]">
        <div className="sm:col-span-2 lg:col-span-1">
          <img src={logo} alt="Troy Bay" className="h-12 w-auto" />
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-stone-400">{profile.tagline}</p>
        </div>

        <nav aria-label="Footer">
          <h2 className={headingClass}>Navigation</h2>
          <ul className="mt-5 space-y-3 text-sm">
            {navLinks.map(({ id, label }) => (
              <li key={id}>
                <a href={`#${id}`} className={linkClass}>
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className={headingClass}>Connect</h2>
          <ul className="mt-5 space-y-3 text-sm">
            {socials.map(({ label, href, icon: Icon }) => (
              <li key={label}>
                <a href={href} target="_blank" rel="noopener noreferrer" className={linkClass}>
                  <Icon aria-hidden className="size-4" />
                  {label}
                </a>
              </li>
            ))}
            <li>
              <a href={`mailto:${profile.email}`} className={linkClass}>
                <LuMail aria-hidden className="size-4" />
                Email
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-14 flex flex-col-reverse items-center gap-4 border-t border-line pt-8 text-sm text-stone-500 sm:flex-row sm:justify-between">
        <p>
          &copy; {new Date().getFullYear()} {profile.name}. All rights reserved.
        </p>
        <a href="#hero" className="inline-flex items-center gap-1.5 font-medium text-accent transition-colors hover:text-white">
          Back to top <LuArrowUp aria-hidden className="size-4" />
        </a>
      </div>
    </Container>
  </footer>
);

export default Footer;
