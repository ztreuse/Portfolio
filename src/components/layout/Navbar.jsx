import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'motion/react';
import Container from '../ui/Container';
import SocialIcon from '../ui/SocialIcon';
import useActiveSection from '../../hooks/useActiveSection';
import { navLinks, socials } from '../../data/site';
import logo from '../../assets/images/logo.svg';
import { sectionLink } from '../../hooks/useCleanAnchorLinks';

const sectionIds = navLinks.map((link) => link.id);

const spring = { type: 'spring', stiffness: 380, damping: 32 };
const easeOut = [0.22, 1, 0.36, 1];

// Desktop links fade in one after another when the page loads.
const linkListVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.2 } },
};

const linkItemVariants = {
  hidden: { opacity: 0, y: -8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: easeOut } },
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

/** Logo with a light sweep across the letters and a slight lift on hover. */
const NavLogo = ({ onClick }) => (
  <a
    {...sectionLink('hero')}
    onClick={onClick}
    aria-label="Back to top"
    className="group/logo relative block shrink-0 transition-transform duration-300 ease-out hover:scale-105"
  >
    <img src={logo} alt="Troy Bay" className="block h-8 w-auto" />
    <span
      aria-hidden
      style={logoMask}
      className="pointer-events-none absolute inset-0 bg-[linear-gradient(110deg,transparent_30%,var(--color-accent)_50%,transparent_70%)] bg-size-[250%_100%] bg-position-[100%_0] transition-none group-hover/logo:bg-position-[-50%_0] group-hover/logo:transition-[background-position] group-hover/logo:duration-1000 group-hover/logo:ease-in-out"
    />
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
                className={`relative flex items-center rounded-xl px-4 py-3 font-display text-sm font-medium transition-colors duration-200 ${
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

    <motion.ul variants={menuItemVariants} className="mt-2 flex justify-center gap-2 border-t border-line px-2 pt-3 pb-1">
      {socials.map((social) => (
        <li key={social.label}>
          <SocialIcon {...social} />
        </li>
      ))}
    </motion.ul>
  </motion.div>
);

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(() => window.scrollY > 24);
  const activeId = useActiveSection(sectionIds);
  const { scrollY } = useScroll();

  // Switch from transparent to frosted glass once the page leaves the top.
  useMotionValueEvent(scrollY, 'change', (y) => setScrolled(y > 24));

  // Lock page scroll behind the mobile menu; close it on Escape or when resizing up to desktop.
  useEffect(() => {
    if (!menuOpen) return;
    const desktop = window.matchMedia('(min-width: 1024px)');
    const close = () => setMenuOpen(false);
    const onKeyDown = (e) => e.key === 'Escape' && close();
    const onResize = (e) => e.matches && close();

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    desktop.addEventListener('change', onResize);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKeyDown);
      desktop.removeEventListener('change', onResize);
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);
  const solid = scrolled || menuOpen;

  return (
    <>
      <motion.header
        initial={{ y: -64, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: easeOut }}
        className={`fixed inset-x-0 top-0 z-50 transition-[background-color,backdrop-filter,box-shadow] duration-300 ${
          solid ? 'bg-ink/90 shadow-[0_10px_30px_-15px_rgb(0_0_0/0.8)] backdrop-blur-lg' : 'bg-transparent'
        }`}
      >
        <Container className="relative flex h-16 items-center justify-between">
          <NavLogo onClick={closeMenu} />

          <nav aria-label="Main" className="hidden lg:block">
            <motion.ul
              variants={linkListVariants}
              initial="hidden"
              animate="visible"
              className="flex items-center gap-1"
            >
              {navLinks.map(({ id, label }) => {
                const active = activeId === id;
                return (
                  <motion.li key={id} variants={linkItemVariants} className="relative">
                    <a
                      {...sectionLink(id)}
                      aria-current={active ? 'true' : undefined}
                      className={`block rounded-lg px-3.5 py-2 font-display text-sm font-medium transition-colors duration-200 hover:bg-white/5 hover:text-white focus-visible:bg-white/5 focus-visible:text-white focus-visible:outline-none lg:px-4 ${
                        active ? 'text-white' : 'text-stone-400'
                      }`}
                    >
                      {label}
                    </a>
                    {active && (
                      <motion.span
                        layoutId="nav-underline"
                        transition={spring}
                        className="absolute inset-x-3.5 -bottom-[13px] h-0.5 rounded-full bg-accent shadow-[0_0_12px_2px_rgb(159_143_129/0.55)] lg:inset-x-4"
                      />
                    )}
                  </motion.li>
                );
              })}
            </motion.ul>
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
