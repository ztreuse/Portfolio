import { useEffect, useRef, useState } from 'react';
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useTransform,
} from 'motion/react';
import Container from '../ui/Container';
import SocialIcon from '../ui/SocialIcon';
import useActiveSection from '../../hooks/useActiveSection';
import { navLinks, socials } from '../../data/site';
import logo from '../../assets/images/logo.svg';
import logoMark from '../../assets/images/logo-mark.svg';
import { sectionLink } from '../../hooks/useCleanAnchorLinks';
import { setScrollLocked } from '../../hooks/useSmoothScroll';

const sectionIds = navLinks.map((link) => link.id);

const easeOut = [0.22, 1, 0.36, 1];

// Desktop links appear one after another when the page loads.
const linkListVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.2 } },
};

// Each link sharpens in from a soft blur
const linkItemVariants = {
  hidden: { opacity: 0, y: -6, filter: 'blur(6px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.6, ease: easeOut } },
};

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

// The logo file doubles as a mask, so the shine only paints inside the letterforms.
const logoMask = {
  maskImage: `url(${logo})`,
  WebkitMaskImage: `url(${logo})`,
  maskSize: '100% 100%',
  WebkitMaskSize: '100% 100%',
};

/**
 * Whether the page right under the navbar is light: a visible light surface there (the crema bands' background and
 * the WORK zoom's crema fill, marked `data-nav-light`; Contact and the footer, `.tone-screen`) that the Experience
 * drop isn't covering (it marks itself `data-covers-nav`). Hit-testing couldn't tell: most background layers here are
 * click-through, so it saw through them.
 */
const lightUnderBar = (header) => {
  const y = (header?.offsetHeight ?? 64) + 2;
  if (document.querySelector('[data-covers-nav="1"]')) return false;
  return [...document.querySelectorAll('[data-nav-light], .tone-screen')].some((el) => {
    if (header?.contains(el)) return false;
    const r = el.getBoundingClientRect();
    return r.top <= y && r.bottom >= y && Number(getComputedStyle(el).opacity) >= 0.5;
  });
};

/** The T mark (same as the tab icon) beside the wordmark; a light sweeps across the letters and it lifts on hover. */
const NavLogo = ({ onClick, light }) => (
  <a
    {...sectionLink('hero')}
    onClick={onClick}
    aria-label="Back to top"
    className="group/logo flex shrink-0 items-center gap-2.5 transition-transform duration-300 ease-out hover:scale-105"
  >
    {/* Darkened over light sections */}
    <img
      src={logoMark}
      alt=""
      className={`block h-8 w-auto transition-[filter] duration-500 ${light ? 'brightness-[0.35]' : ''}`}
    />
    <span className="relative block">
      <img
        src={logo}
        alt="Troy Bay"
        className={`block h-8 w-auto transition-[filter] duration-500 ${light ? 'brightness-[0.12]' : ''}`}
      />
      <span
        aria-hidden
        style={logoMask}
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(110deg,transparent_30%,var(--color-accent)_50%,transparent_70%)] bg-size-[250%_100%] bg-position-[100%_0] transition-none group-hover/logo:bg-position-[-50%_0] group-hover/logo:transition-[background-position] group-hover/logo:duration-1000 group-hover/logo:ease-in-out"
      />
    </span>
  </a>
);

const MenuToggle = ({ open, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    aria-expanded={open}
    aria-controls="mobile-menu"
    aria-label={open ? 'Close menu' : 'Open menu'}
    className="-mr-2 flex size-10 flex-col items-end justify-center gap-1.5 px-2.5 text-white lg:hidden"
  >
    <span
      className={`h-0.5 w-5 rounded-full bg-current transition-transform duration-300 ${open ? 'translate-y-1 rotate-45' : ''}`}
    />
    <span
      className={`h-0.5 rounded-full bg-current transition-all duration-300 ${open ? 'w-5 -translate-y-1 -rotate-45' : 'w-3'}`}
    />
  </button>
);

/** Compact dropdown panel anchored under the menu button (phones and tablets). */
const MobileMenu = ({ activeId, onNavigate }) => (
  <motion.div
    id="mobile-menu"
    variants={menuVariants}
    initial="hidden"
    animate="visible"
    exit="exit"
    className="absolute top-full right-3 mt-2 w-64 origin-top-right rounded-2xl border border-line bg-ink/95 p-2 shadow-[inset_0_1px_0_0_rgb(255_255_255/0.06),0_24px_60px_-20px_rgb(0_0_0/0.9),0_0_40px_-14px_rgb(159_143_129/0.4)] backdrop-blur-xl sm:right-6 lg:hidden"
  >
    <nav aria-label="Mobile">
      <ul>
        {navLinks.map(({ id, label }) => {
          const active = activeId === id;
          return (
            <motion.li key={id} variants={menuItemVariants}>
              <a
                {...sectionLink(id)}
                onClick={onNavigate}
                aria-current={active ? 'true' : undefined}
                className={`relative flex items-center rounded-xl px-4 py-2.5 font-heading text-lg font-bold tracking-[0.12em] uppercase transition-colors duration-200 ${
                  active ? 'bg-white/[0.06] text-white' : 'text-stone-400 hover:bg-white/[0.04] hover:text-white'
                }`}
              >
                {active && (
                  <span
                    aria-hidden
                    className="absolute top-1/2 left-0 h-5 w-0.5 -translate-y-1/2 rounded-full bg-accent shadow-[0_0_10px_2px_rgb(159_143_129/0.6)]"
                  />
                )}
                {label}
              </a>
            </motion.li>
          );
        })}
      </ul>
    </nav>

    <motion.ul
      variants={menuItemVariants}
      className="mt-2 flex justify-center gap-2 border-t border-line px-2 pt-3 pb-1"
    >
      {socials.map((social) => (
        <li key={social.label}>
          <SocialIcon {...social} />
        </li>
      ))}
    </motion.ul>
  </motion.div>
);

// The dash under the active link: its ends move on their own springs, a quick one for the end heading toward the new
// link and a slower one for the end that follows, so it stretches across like liquid and settles back into a dash
const DASH = 18;
const LEAD = { type: 'spring', stiffness: 520, damping: 40 };
const TRAIL = { type: 'spring', stiffness: 150, damping: 24 };

const ElasticDash = ({ items, activeId }) => {
  const left = useMotionValue(0);
  const right = useMotionValue(0);
  const width = useTransform([left, right], ([l, r]) => Math.max(0, r - l));
  const placed = useRef(false);
  const fontsChecked = useRef(false);
  const shown = useMotionValue(0);

  useEffect(() => {
    const place = (instant) => {
      const el = items.current[activeId];
      if (!el) {
        animate(shown, 0, { duration: 0.2 });
        return;
      }
      const center = el.offsetLeft + el.offsetWidth / 2;
      const l = center - DASH / 2;
      const r = center + DASH / 2;
      if (instant || !placed.current) {
        left.jump(l);
        right.jump(r);
        placed.current = true;
      } else {
        const toRight = r > right.get();
        animate(left, l, toRight ? TRAIL : LEAD);
        animate(right, r, toRight ? LEAD : TRAIL);
      }
      animate(shown, 1, { duration: 0.3 });
    };
    place(false);
    const onResize = () => place(true);
    window.addEventListener('resize', onResize);
    // Once the display font has loaded the links' widths settle; snap to them then (only on the first placement, or
    // it would cut short every stretch)
    if (!fontsChecked.current) {
      fontsChecked.current = true;
      document.fonts?.ready.then(() => place(true));
    }
    return () => window.removeEventListener('resize', onResize);
  }, [activeId]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <motion.span
      aria-hidden
      style={{ x: left, width, opacity: shown }}
      className="pointer-events-none absolute -bottom-[6px] left-0 h-[2px] rounded-full bg-accent-strong shadow-[0_0_10px_1px_color-mix(in_oklab,var(--color-accent)_70%,transparent)]"
    />
  );
};

// `ready` holds the entrance until the preloader lifts (otherwise it plays unseen behind it).
const Navbar = ({ ready = true }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(() => window.scrollY > 24);
  const [light, setLight] = useState(false);
  const header = useRef(null);
  const linkItems = useRef({});
  const activeId = useActiveSection(sectionIds);
  const { scrollY } = useScroll();

  // Switch from transparent to frosted glass once the page leaves the top, and to light glass over light sections
  // (checked once per frame at most)
  const checking = useRef(false);
  useMotionValueEvent(scrollY, 'change', (y) => {
    setScrolled(y > 24);
    if (checking.current) return;
    checking.current = true;
    requestAnimationFrame(() => {
      checking.current = false;
      setLight(lightUnderBar(header.current));
    });
  });

  // Lock page scroll behind the mobile menu; close it on Escape or when resizing up to desktop.
  useEffect(() => {
    if (!menuOpen) return;
    const desktop = window.matchMedia('(min-width: 1024px)');
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
      {/* Fine see-through glass with a hairline once scrolled; over light sections (`tone-light` re-points the palette)
          it turns to warm light glass with dark text and a dark logo, crossfading as you scroll */}
      <motion.header
        ref={header}
        initial={{ y: -64, opacity: 0 }}
        animate={ready ? { y: 0, opacity: 1 } : { y: -64, opacity: 0 }}
        transition={{ duration: 0.7, ease: easeOut, delay: ready ? 0.15 : 0 }}
        className={`fixed inset-x-0 top-0 z-50 transition-[background-color,backdrop-filter,color] duration-500 ${
          solid ? 'bg-ink/60 backdrop-blur-xl backdrop-saturate-150' : 'bg-transparent'
        } ${light && solid ? 'tone-light' : ''}`}
      >
        <span
          aria-hidden
          className={`pointer-events-none absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-white/15 to-transparent transition-opacity duration-500 ${
            solid ? 'opacity-100' : 'opacity-0'
          }`}
        />
        <Container className="relative flex h-16 items-center justify-between">
          <NavLogo onClick={closeMenu} light={light && solid} />

          <nav aria-label="Main" className="relative hidden lg:block">
            <motion.ul
              variants={linkListVariants}
              initial="hidden"
              animate={ready ? 'visible' : 'hidden'}
              className="flex items-center gap-0.5"
            >
              {navLinks.map(({ id, label }) => {
                const active = activeId === id;
                return (
                  <motion.li
                    key={id}
                    ref={(node) => {
                      linkItems.current[id] = node;
                    }}
                    variants={linkItemVariants}
                    className="relative"
                  >
                    {/* Display type like the section labels; on hover the letters breathe apart and brighten. An
                        invisible copy at the widest spacing holds the width, so hovering never shifts the links. */}
                    <a
                      {...sectionLink(id)}
                      aria-current={active ? 'true' : undefined}
                      className={`group/link grid justify-items-center px-3 py-2 font-heading text-[15px] font-bold uppercase transition-colors duration-300 ease-out hover:text-white focus-visible:text-white focus-visible:outline-none xl:px-3.5 ${
                        active ? 'text-white' : 'text-stone-400'
                      }`}
                    >
                      <span aria-hidden className="invisible tracking-[0.2em] [grid-area:1/1]">
                        {label}
                      </span>
                      <span className="tracking-[0.14em] transition-[letter-spacing] duration-300 ease-out [grid-area:1/1] group-hover/link:tracking-[0.2em] group-focus-visible/link:tracking-[0.2em] motion-reduce:transition-none">
                        {label}
                      </span>
                    </a>
                  </motion.li>
                );
              })}
            </motion.ul>
            <ElasticDash items={linkItems} activeId={activeId} />
          </nav>

          <MenuToggle open={menuOpen} onClick={() => setMenuOpen((open) => !open)} />

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
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] lg:hidden"
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
