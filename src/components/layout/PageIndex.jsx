import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { LuArrowRight, LuClock, LuFileDown, LuPanelLeftClose, LuPanelLeftOpen } from 'react-icons/lu';
import CopyEmail from '../ui/CopyEmail';
import ThemeToggle from '../ui/ThemeToggle';
import LocalTime from '../ui/LocalTime';
import { navLinks, profile, socials } from '../../data/site';
import { sectionLink } from '../../hooks/useCleanAnchorLinks';

// Every section, the intro (the hero) first as 00, so the rest keep their headings' numbers
const sections = navLinks;
const ROW = 44; // px: a row's height (h-11)

// Collapsed, each section is a dot (after onins.dev's side index, rounded rather than square), and the column responds to
// how close the pointer is, like a dock: every dot (and its name beside it) grows with the pointer's distance from it, not
// just when it's on it, so moving along or away swells and shrinks them gradually. The one you're in is always the
// biggest, solid taupe. Each value glides toward its target every frame (written straight onto the elements, no React
// renders), so leaving eases off instead of snapping.
const RAIL_ROW = 32; // px: a dot's row (h-8)
const REACH = 2.2; // rows: how far the pointer's pull reaches (the names show for about three: the nearest and its two)
const SMALL = 0.42; // a far dot's scale; 0.7 beside the current one, 1 at full size
const SETTLE = 0.11; // s: how quickly values catch up (an exponential ease)
const pull = (rows) => (rows >= REACH ? 0 : (Math.cos((Math.PI * rows) / REACH) + 1) / 2);

const circle =
  'flex size-9 shrink-0 items-center justify-center rounded-full border border-white/15 text-stone-400 transition-colors duration-200 hover:border-matcha hover:bg-matcha hover:text-ink';

/** While the index is collapsed, a control's name pops out beside it on hover or keyboard focus (its parent is `group/tip`). */
const Tip = ({ show, children }) =>
  show && (
    <span
      aria-hidden
      className="pointer-events-none absolute top-1/2 left-full z-10 ml-3 -translate-x-1 -translate-y-1/2 rounded-md border border-line bg-surface px-2 py-1 font-display text-xs font-medium whitespace-nowrap text-stone-200 opacity-0 shadow-lg shadow-black/30 transition-[opacity,translate] duration-200 group-hover/tip:translate-x-0 group-hover/tip:opacity-100 group-focus-visible/tip:translate-x-0 group-focus-visible/tip:opacity-100"
    >
      {children}
    </span>
  );

// Remembered per visitor (a convenience: without storage it simply starts open). index.html applies it before the first
// paint so the page doesn't jump; `--index-w` in index.css is the column's width, which the page and the photos sit beside.
const startsMin = () => document.documentElement.dataset.index === 'min';

/**
 * The desktop navigation: a quiet page index down the left side, part of the page rather than floating over it (the page
 * sits beside it). The logo and the first row (Intro, 00) go to the top, with the headline and local time under it; the sections carry the same numbers as
 * their headings. The current one sits in the phone menu's soft taupe box, which glides from row to row; a fainter box
 * glides to the row under the pointer (or keyboard focus). At the bottom the profiles, the résumé, the theme switch and
 * how to reach me. The button by the logo collapses it into a narrow rail: the mark, the numbers and round controls, each
 * showing its name in a small tooltip on hover. Over the night video (`dark`) it goes dark with the room in both themes.
 * Phones and tablets have the top bar with the menu.
 */
const PageIndex = ({ activeId, ready, dark, logo }) => {
  const reduceMotion = useReducedMotion();
  const current = sections.findIndex(({ id }) => id === activeId);
  const [hovered, setHovered] = useState(-1);
  const [min, setMin] = useState(startsMin);
  const glide = reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 380, damping: 36 };

  useEffect(() => {
    document.documentElement.dataset.index = min ? 'min' : 'open';
    try {
      localStorage.setItem('index', min ? 'min' : 'open');
    } catch {
      /* private mode: it just isn't remembered */
    }
  }, [min]);

  // The rail's dots, tints and names, and the pointer's height over the column (null when it's away)
  const dots = useRef([]);
  const tints = useRef([]);
  const names = useRef([]);
  const nav = useRef(null);
  const rail = useRef({ y: null, current, values: [], frame: 0, last: 0 });

  const settle = useCallback(() => {
    const r = rail.current;
    if (r.frame) return;
    r.last = performance.now();
    const step = (now) => {
      const k = reduceMotion ? 1 : 1 - Math.exp(-Math.min((now - r.last) / 1000, 0.05) / SETTLE);
      r.last = now;
      let moving = false;
      sections.forEach((_, i) => {
        const near = r.y === null ? 0 : pull(Math.abs(r.y - (i + 0.5) * RAIL_ROW) / RAIL_ROW);
        const resting = i === r.current ? 1 : r.y === null && Math.abs(i - r.current) === 1 ? 0.7 : SMALL;
        const target = [Math.max(resting, SMALL + (1 - SMALL) * near), near];
        const v = (r.values[i] ??= [resting, 0]);
        target.forEach((t, j) => {
          v[j] += (t - v[j]) * k;
          if (Math.abs(t - v[j]) > 0.002) moving = true;
          else v[j] = t;
        });
        if (dots.current[i]) dots.current[i].style.scale = v[0];
        if (tints.current[i]) tints.current[i].style.opacity = v[1];
        if (names.current[i]) {
          names.current[i].style.opacity = Math.max(0, (v[1] - 0.12) / 0.88);
          names.current[i].style.translate = `${(v[1] - 1) * 6}px -50%`;
        }
      });
      r.frame = moving ? requestAnimationFrame(step) : 0;
    };
    r.frame = requestAnimationFrame(step);
  }, [reduceMotion]);

  // A new current section (scrolling), or the rail just opened: ease to it
  useEffect(() => {
    rail.current.current = current;
    if (min) settle();
  }, [current, min, settle]);
  // Stop the loop on unmount, and mark it stopped: React's dev double-mount would otherwise leave a stale frame id
  // behind and the dots would never move again
  useEffect(() => {
    const r = rail.current;
    return () => {
      cancelAnimationFrame(r.frame);
      r.frame = 0;
    };
  }, []);

  const pointAt = (y) => {
    rail.current.y = y;
    settle();
  };
  const ToggleIcon = min ? LuPanelLeftOpen : LuPanelLeftClose;
  const profiles = socials.filter(({ href }) => href.startsWith('http'));

  return (
    <motion.aside
      initial={{ x: -32, opacity: 0 }}
      animate={ready ? { x: 0, opacity: 1 } : { x: -32, opacity: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: ready ? 0.15 : 0 }}
      onPointerMove={(e) => min && nav.current && pointAt(e.clientY - nav.current.getBoundingClientRect().top)}
      onPointerLeave={() => min && pointAt(null)}
      className={`fixed inset-y-0 left-0 z-40 hidden w-(--index-w) flex-col border-r border-white/10 bg-ink py-7 transition-[background-color,border-color,width] duration-300 motion-reduce:transition-none xl:flex ${
        min ? 'items-center px-3' : 'overflow-x-hidden overflow-y-auto px-4'
      } ${dark ? 'tone-dark' : ''}`}
    >
      <div className={min ? 'flex flex-col items-center gap-5' : 'w-48 px-3'}>
        <div className={min ? 'contents' : 'flex items-center justify-between'}>
          {logo}
          <button
            type="button"
            onClick={() => setMin((m) => !m)}
            aria-label={min ? 'Expand the side menu' : 'Collapse the side menu'}
            aria-expanded={!min}
            title={min ? undefined : 'Collapse'}
            className={`group/tip relative flex size-9 shrink-0 items-center justify-center rounded-full text-stone-500 transition-colors duration-200 hover:bg-white/5 hover:text-white ${
              min ? '' : '-mr-1.5'
            }`}
          >
            <ToggleIcon aria-hidden className="size-4" />
            <Tip show={min}>Expand</Tip>
          </button>
        </div>
        {!min && (
          <>
            <p className="mt-3 font-display text-sm font-semibold whitespace-nowrap text-stone-300">
              {profile.headline}
            </p>
            <p className="mt-1 flex items-center gap-1.5 font-mono text-label font-medium whitespace-nowrap text-stone-500">
              <LuClock aria-hidden className="size-3" />
              <LocalTime />
            </p>
          </>
        )}
      </div>

      <nav
        ref={nav}
        aria-label="Main"
        className={`relative mt-10 ${min ? 'w-9' : 'w-48'}`}
        onMouseLeave={() => setHovered(-1)}
      >
        {/* The row under the pointer: a faint box that glides between rows (not over the current one). Open only: collapsed,
            the dots show it */}
        {!min && (
          <>
            <motion.span
              aria-hidden
              initial={false}
              animate={{ y: Math.max(hovered, 0) * ROW, opacity: hovered < 0 || hovered === current ? 0 : 1 }}
              transition={{ ...glide, opacity: { duration: 0.2 } }}
              className="absolute inset-x-0 top-0 h-11 rounded-r-xl bg-white/[0.04]"
            />
            {/* The current section's box */}
            <motion.span
              aria-hidden
              initial={false}
              animate={{ y: Math.max(current, 0) * ROW, opacity: current < 0 ? 0 : 1 }}
              transition={glide}
              className="absolute inset-x-0 top-0 h-11 overflow-hidden rounded-r-xl border border-l-0 border-matcha/30 bg-matcha/15"
            >
              {/* Square on the left, where a green line runs its full height like a tab's spine, gliding with it */}
              <span className="absolute inset-y-0 left-0 w-[3px] bg-matcha" />
            </motion.span>
          </>
        )}
        <ul className="relative">
          {sections.map(({ id, label }, i) => {
            const active = i === current;
            return (
              <li key={id}>
                <a
                  {...sectionLink(id)}
                  aria-current={active ? 'true' : undefined}
                  // Collapsed, only a dot shows, so the link is named by its label
                  aria-label={min ? label : undefined}
                  onMouseEnter={() => setHovered(i)}
                  onFocus={() => {
                    setHovered(i);
                    if (min) pointAt((i + 0.5) * RAIL_ROW);
                  }}
                  onBlur={() => {
                    setHovered(-1);
                    if (min) pointAt(null);
                  }}
                  className={`group group/tip relative flex items-center gap-3.5 font-display text-sm whitespace-nowrap transition-colors duration-200 ${
                    min ? 'h-8 w-9 justify-center rounded-full' : 'h-11 rounded-r-xl px-3'
                  } ${active ? 'font-semibold text-white' : 'font-medium text-stone-400 hover:text-white focus-visible:text-white'}`}
                >
                  {min ? (
                    // The dot: grey, with a taupe tint that comes up as the pointer nears (the current one is solid taupe)
                    <span
                      ref={(el) => (dots.current[i] = el)}
                      aria-hidden
                      className={`relative size-3.5 rounded-full ${active ? 'bg-matcha' : 'bg-stone-500/50'}`}
                    >
                      {!active && (
                        <span
                          ref={(el) => (tints.current[i] = el)}
                          className="absolute inset-0 rounded-full bg-matcha opacity-0"
                        />
                      )}
                    </span>
                  ) : (
                    <span
                      aria-hidden
                      className={`font-mono text-label tabular-nums transition-colors duration-200 ${
                        active
                          ? 'text-accent-strong'
                          : 'text-stone-500 group-hover:text-matcha group-focus-visible:text-matcha'
                      }`}
                    >
                      {String(i).padStart(2, '0')}
                    </span>
                  )}
                  {min ? (
                    <span
                      ref={(el) => (names.current[i] = el)}
                      aria-hidden
                      className="pointer-events-none absolute top-1/2 left-full z-10 ml-3 -translate-y-1/2 rounded-md border border-line bg-surface px-2 py-1 font-display text-xs font-medium whitespace-nowrap text-matcha-strong opacity-0 shadow-lg shadow-black/30"
                    >
                      {label}
                    </span>
                  ) : (
                    <>
                      <span className="flex-1">{label}</span>
                      {/* Where you are: a small taupe dot at the row's end; an arrow hints at the jump on the others */}
                      {active ? (
                        <span aria-hidden className="size-1.5 rounded-full bg-matcha" />
                      ) : (
                        <LuArrowRight
                          aria-hidden
                          className="size-3.5 -translate-x-1 text-accent-strong opacity-0 transition-[opacity,translate] duration-200 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100 motion-reduce:transition-none"
                        />
                      )}
                    </>
                  )}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>

      {min ? (
        // Collapsed: the same things as round controls in a column, each named in a tooltip
        <div className="mt-auto flex flex-col items-center gap-1.5 pt-8">
          {profiles.map(({ label, href, icon: Icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className={`group/tip relative ${circle}`}
            >
              <Icon aria-hidden className="size-3.5" />
              <Tip show>{label}</Tip>
            </a>
          ))}
          <a
            href={profile.resume}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Résumé"
            className={`group/tip relative ${circle}`}
          >
            <LuFileDown aria-hidden className="size-3.5" />
            <Tip show>Résumé</Tip>
          </a>
          <span aria-hidden className="my-2 h-px w-8 bg-white/10" />
          <ThemeToggle vertical />
          <span aria-hidden className="my-2 h-px w-8 bg-white/10" />
          <CopyEmail size="size-9" tip={Tip} />
        </div>
      ) : (
        <div className="mt-auto w-48 space-y-2.5 pt-8">
          {/* The profiles as small circles and the résumé on one line */}
          <div className="flex gap-1.5">
            {profiles.map(({ label, href, icon: Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                title={label}
                className={circle}
              >
                <Icon aria-hidden className="size-3.5" />
              </a>
            ))}
            <a
              href={profile.resume}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-9 flex-1 items-center justify-center gap-2 rounded-full border border-white/15 font-display text-sm font-medium whitespace-nowrap text-stone-300 transition-colors duration-200 hover:border-matcha hover:bg-matcha hover:text-ink"
            >
              <LuFileDown aria-hidden className="size-3.5" />
              Résumé
            </a>
          </div>

          <ThemeToggle stretch />

          {/* Contact, the way in I most want people to take: a line in my words, then the address, underlined; the
              button by the label copies it */}
          <div className="!mt-4 border-t border-white/10 pt-4">
            <div className="flex items-center justify-between">
              <p className="font-mono text-label font-medium tracking-[0.08em] text-stone-500 uppercase">Contact</p>
              <CopyEmail />
            </div>
            <p className="mt-2 font-display text-sm leading-relaxed text-stone-400">{profile.reachOut}</p>
            {/* Plain text, not a mail link (the owner didn't want it opening a mail app): one click selects it whole */}
            <p className="mt-1 font-display text-sm font-semibold break-all text-white underline decoration-accent/60 decoration-1 underline-offset-4 transition-colors duration-200 select-all hover:text-matcha-strong hover:decoration-matcha">
              {profile.email}
            </p>
          </div>
        </div>
      )}
    </motion.aside>
  );
};

export default PageIndex;
