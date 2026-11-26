import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'motion/react';
import { LuClock, LuFileDown } from 'react-icons/lu';
import PageIndex from './PageIndex';
import Container from '../ui/Container';
import CopyEmail from '../ui/CopyEmail';
import LocalTime from '../ui/LocalTime';
import ThemeToggle from '../ui/ThemeToggle';
import useActiveSection from '../../hooks/useActiveSection';
import useTheme from '../../hooks/useTheme';
import { navLinks, profile, socials } from '../../data/site';
import logoHelmet from '../../assets/images/logo-helmet.svg';
import { sectionLink } from '../../hooks/useCleanAnchorLinks';
import { setScrollLocked } from '../../hooks/useSmoothScroll';

const sectionIds = navLinks.map((link) => link.id);

const easeOut = [0.22, 1, 0.36, 1];

// Mobile dropdown grows out of the menu button's corner, then its links slide in one by one.
const menuVariants = {
  hidden: { opacity: 0, scale: 0.92, y: -8 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 420, damping: 32, staggerChildren: 0.04, delayChildren: 0.05 },
  },
  exit: { opacity: 0, scale: 0.96, y: -6, transition: { duration: 0.15 } },
};

const menuItemVariants = {
  hidden: { opacity: 0, x: 12 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: easeOut } },
};

/**
 * Whether the night video (or its first frame, behind the end of Skills) is at this height on the screen: those mark
 * themselves `data-nav-dark` while they show; `data-nav-clear` is the video once it has settled on Contact's colour, on
 * top of them. The bar and the index stay light-on-dark over the night in both themes.
 */
const nightAt = (y) => {
  const under = (selector) =>
    [...document.querySelectorAll(selector)].some((el) => {
      const r = el.getBoundingClientRect();
      return r.top <= y && r.bottom >= y;
    });
  return under('[data-nav-dark]') && !under('[data-nav-clear]');
};

/**
 * The helmeted horse head (a redraw of the owner's reference: a solid taupe silhouette with its engraved lines cut out
 * as transparent gaps) beside the name. In the light theme the mark is darkened. The tab icon is the same mark.
 */
const NavLogo = ({ onClick, light }) => (
  <a
    {...sectionLink('hero')}
    onClick={onClick}
    aria-label="Back to top"
    className="group/logo flex shrink-0 items-center gap-2.5 transition-transform duration-300 ease-out hover:scale-105"
  >
    <img
      src={logoHelmet}
      alt=""
      width="28"
      height="36"
      className={`block h-9 w-auto transition-[filter,rotate] duration-500 group-hover/logo:-rotate-3 ${light ? 'brightness-[0.35]' : ''}`}
    />
    {/* Only the mark in the collapsed side index */}
    <span className="font-heading text-xl leading-none font-black tracking-[0.08em] text-white uppercase transition-colors duration-500 xl:index-min:hidden">
      {profile.name}
    </span>
  </a>
);

/**
 * The menu button: our own drawn icon in a round button like the site's other controls. A long line over a shorter one
 * led by a small taupe dot (the dot that marks the current section in the menu and the side index). On hover the short
 * line stretches to full length and the dot shrinks away; open, both lines swing into an X. Each line turns about its own
 * middle and then moves to the centre (`transform-box: view-box`; turning about the icon's centre left the X 2px off), while
 * the short one stretches from its right end (`fill-box`).
 */
const MenuToggle = ({ open, onClick }) => {
  const swing =
    'transition-transform duration-500 ease-[cubic-bezier(0.65,0,0.35,1)] [transform-box:view-box] motion-reduce:transition-none';
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={open}
      aria-controls="mobile-menu"
      aria-label={open ? 'Close menu' : 'Open menu'}
      className={`group flex size-10 items-center justify-center rounded-full border text-white backdrop-blur-sm transition-colors duration-300 xl:hidden ${
        open ? 'border-accent/50 bg-accent/15' : 'border-white/20 bg-ink/40 hover:border-matcha/60'
      }`}
    >
      <svg viewBox="0 0 24 24" aria-hidden className="size-6 overflow-visible">
        <g className={`${swing} origin-[12px_9px] ${open ? 'translate-y-[3px] rotate-45' : ''}`}>
          <rect x="5" y="8.25" width="14" height="1.5" rx="0.75" fill="currentColor" />
        </g>
        <g className={`${swing} origin-[12px_15px] ${open ? '-translate-y-[3px] -rotate-45' : ''}`}>
          <rect
            x="5"
            y="14.25"
            width="14"
            height="1.5"
            rx="0.75"
            fill="currentColor"
            className={`origin-right transition-transform duration-500 ease-[cubic-bezier(0.65,0,0.35,1)] [transform-box:fill-box] motion-reduce:transition-none ${
              open ? 'scale-x-100' : 'scale-x-[0.6] group-hover:scale-x-100'
            }`}
          />
        </g>
        <circle
          cx="6.25"
          cy="15"
          r="1.35"
          className={`fill-matcha transition-[scale,opacity] duration-300 [transform-box:fill-box] origin-center motion-reduce:transition-none ${
            open ? 'scale-0 opacity-0' : 'group-hover:scale-0 group-hover:opacity-0'
          }`}
        />
      </svg>
    </button>
  );
};

const MENU_ROW = 44; // px: a section row (h-11)

/**
 * The phone and tablet menu: a compact dropdown under the menu button (a full-screen menu was rejected), built as a
 * pocket copy of the desktop side index so the site has one navigation: the headline and local time, the sections as
 * numbered rows (00 Intro … 05 Contact) with the current one in the soft taupe box (it glides into place as the menu
 * opens) and a taupe dot at its end, then the profiles and the résumé, the theme switch, and the email with a copy
 * button. No dock dots here: they answer a hovering pointer, which touch screens don't have. Scrolls inside if a short
 * screen can't fit it.
 */
const MobileMenu = ({ activeId, onNavigate }) => {
  const current = navLinks.findIndex(({ id }) => id === activeId);
  const profiles = socials.filter(({ href }) => href.startsWith('http'));

  return (
    <motion.div
      id="mobile-menu"
      variants={menuVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="absolute top-full right-3 mt-2 max-h-[calc(100svh-5rem)] w-80 origin-top-right overflow-y-auto overscroll-contain rounded-2xl border border-line bg-ink/95 p-2.5 shadow-[inset_0_1px_0_0_rgb(255_255_255/0.06),0_24px_60px_-20px_rgb(0_0_0/0.9),0_0_40px_-14px_rgb(159_143_129/0.4)] backdrop-blur-xl sm:right-6 xl:hidden"
    >
      <motion.div variants={menuItemVariants} className="px-3 pt-1.5 pb-3">
        <p className="font-display text-sm font-semibold text-stone-300">{profile.headline}</p>
        <p className="mt-1 flex items-center gap-1.5 font-mono text-label font-medium text-stone-500">
          <LuClock aria-hidden className="size-3" />
          <LocalTime />
        </p>
      </motion.div>

      <nav aria-label="Mobile" className="relative">
        {/* The current section's box: it glides from the top into place as the menu opens */}
        {current >= 0 && (
          <motion.span
            aria-hidden
            initial={{ y: 0, opacity: 0 }}
            animate={{ y: current * MENU_ROW, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 32, delay: 0.12 }}
            className="absolute inset-x-0 top-0 h-11 overflow-hidden rounded-r-xl border border-l-0 border-matcha/30 bg-matcha/15"
          >
            {/* Square on the left, where a green line runs its full height like a tab's spine, gliding with it */}
            <span className="absolute inset-y-0 left-0 w-[3px] bg-matcha" />
          </motion.span>
        )}
        <ul className="relative">
          {navLinks.map(({ id, label }, i) => {
            const active = i === current;
            return (
              <motion.li key={id} variants={menuItemVariants}>
                <a
                  {...sectionLink(id)}
                  onClick={onNavigate}
                  aria-current={active ? 'true' : undefined}
                  className={`flex h-11 items-center gap-3.5 rounded-r-xl px-3 font-display text-sm transition-colors duration-200 ${
                    active
                      ? 'font-semibold text-white'
                      : 'font-medium text-stone-400 hover:bg-white/[0.04] hover:text-white active:bg-white/[0.06]'
                  }`}
                >
                  <span
                    aria-hidden
                    className={`font-mono text-label tabular-nums ${active ? 'text-accent-strong' : 'text-stone-500'}`}
                  >
                    {String(i).padStart(2, '0')}
                  </span>
                  <span className="flex-1">{label}</span>
                  {active && <span aria-hidden className="size-1.5 rounded-full bg-matcha" />}
                </a>
              </motion.li>
            );
          })}
        </ul>
      </nav>

      <motion.div variants={menuItemVariants} className="mt-3 space-y-2.5 border-t border-line px-1 pt-3.5 pb-1">
        {/* The profiles as small circles and the résumé, like the side index */}
        <div className="flex gap-1.5">
          {profiles.map(({ label, href, icon: Icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="flex size-10 shrink-0 items-center justify-center rounded-full border border-white/15 text-stone-400 transition-colors duration-200 hover:border-matcha hover:bg-matcha hover:text-ink"
            >
              <Icon aria-hidden className="size-4" />
            </a>
          ))}
          <a
            href={profile.resume}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-10 flex-1 items-center justify-center gap-2 rounded-full border border-white/15 font-display text-sm font-medium text-stone-300 transition-colors duration-200 hover:border-matcha hover:bg-matcha hover:text-ink"
          >
            <LuFileDown aria-hidden className="size-4" />
            Résumé
          </a>
        </div>

        <ThemeToggle stretch />

        {/* How to reach me: the address as plain text (one tap selects it) and a copy button */}
        <div className="!mt-3.5 border-t border-line px-1 pt-3.5">
          <div className="flex items-center justify-between">
            <p className="font-mono text-label font-medium tracking-[0.08em] text-stone-500 uppercase">Contact</p>
            <CopyEmail size="size-8" />
          </div>
          <p className="mt-1.5 font-display text-sm font-semibold break-all text-white underline decoration-accent/60 decoration-1 underline-offset-4 transition-colors duration-200 select-all hover:text-matcha-strong hover:decoration-matcha">
            {profile.email}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

// `ready` holds the entrance until the preloader lifts (otherwise it plays unseen behind it).
const Navbar = ({ ready = true }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(() => window.scrollY > 24);
  const [night, setNight] = useState(false); // under the bar
  const [nightIndex, setNightIndex] = useState(false); // beside the index
  const { theme } = useTheme();
  const header = useRef(null);
  const activeId = useActiveSection(sectionIds);
  const { scrollY } = useScroll();

  // Switch from transparent to frosted glass once the page leaves the top, and to dark glass over the night video in
  // the light theme (checked once per frame at most)
  const checking = useRef(false);
  useMotionValueEvent(scrollY, 'change', (y) => {
    setScrolled(y > 24);
    if (checking.current) return;
    checking.current = true;
    requestAnimationFrame(() => {
      checking.current = false;
      setNight(nightAt((header.current?.offsetHeight ?? 64) + 2));
      setNightIndex(nightAt(window.innerHeight / 2));
    });
  });

  // Lock page scroll behind the mobile menu; close it on Escape or when resizing up to desktop.
  useEffect(() => {
    if (!menuOpen) return;
    const desktop = window.matchMedia('(min-width: 1280px)');
    const close = () => setMenuOpen(false);
    const onKeyDown = (e) => e.key === 'Escape' && close();
    const onResize = (e) => e.matches && close();

    setScrollLocked(true);
    window.addEventListener('keydown', onKeyDown);
    desktop.addEventListener('change', onResize);
    return () => {
      setScrollLocked(false);
      window.removeEventListener('keydown', onKeyDown);
      desktop.removeEventListener('change', onResize);
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);
  const solid = scrolled || menuOpen;

  return (
    <>
      {/* Desktop: the index down the left side. Phones and tablets: a top bar, fine see-through glass with a hairline once scrolled */}
      <PageIndex
        activeId={activeId}
        ready={ready}
        dark={nightIndex}
        logo={<NavLogo light={theme === 'light' && !nightIndex} />}
      />
      <motion.header
        ref={header}
        initial={{ y: -64, opacity: 0 }}
        animate={ready ? { y: 0, opacity: 1 } : { y: -64, opacity: 0 }}
        transition={{ duration: 0.7, ease: easeOut, delay: ready ? 0.15 : 0 }}
        className={`fixed inset-x-0 top-0 z-50 xl:hidden transition-[background-color,backdrop-filter,color] duration-500 ${
          solid ? 'bg-ink/60 backdrop-blur-xl backdrop-saturate-150' : 'bg-transparent'
        } ${night ? 'tone-dark' : ''}`}
      >
        <span
          aria-hidden
          className={`pointer-events-none absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-white/15 to-transparent transition-opacity duration-500 ${
            solid ? 'opacity-100' : 'opacity-0'
          }`}
        />
        <Container className="relative flex h-16 items-center justify-between">
          <NavLogo onClick={closeMenu} light={theme === 'light' && !night} />

          {/* Just the menu button: the theme switch lives in the menu, like the side index's */}
          <div className="flex items-center gap-3">
            <MenuToggle open={menuOpen} onClick={() => setMenuOpen((open) => !open)} />
          </div>

          <AnimatePresence>{menuOpen && <MobileMenu activeId={activeId} onNavigate={closeMenu} />}</AnimatePresence>
        </Container>
      </motion.header>

      {/* Tap outside the dropdown to close it */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeMenu}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] xl:hidden"
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
