import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion, useSpring } from 'motion/react';
import { LuArrowUpRight, LuBuilding2, LuCalendar, LuCheck, LuChevronDown } from 'react-icons/lu';
import { intros } from '../data/site';
import Section from '../components/ui/Section';
import { RevealGroup, RevealItem } from '../components/ui/Reveal';
import certifications from '../data/certifications';

const formatDate = (isoDate) =>
  new Date(`${isoDate}T00:00:00`).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  });

// Newest first, all issuers together (each card names its issuer)
const sorted = [...certifications].sort((a, b) => b.date.localeCompare(a.date));
const yearOf = (cert) => cert.date.slice(0, 4);

// The filters' options, from the data: issuers with the most credentials first, years newest first. A long issuer name
// gets a short label (the full name is its tooltip)
const SHORT = { 'Project Management Institute': 'PMI' };
const issuerOptions = [...new Set(sorted.map((c) => c.issuer))]
  .map((issuer) => ({ value: issuer, label: SHORT[issuer] ?? issuer, full: issuer }))
  .sort((a, b) => sorted.filter((c) => c.issuer === b.value).length - sorted.filter((c) => c.issuer === a.value).length);
const yearOptions = [...new Set(sorted.map(yearOf))].map((year) => ({ value: year, label: year }));
const matches = (cert, issuer, year) => (!issuer || cert.issuer === issuer) && (!year || yearOf(cert) === year);
const SHOWN = 6; // cards before the rest fold behind "View all" (even, so no row is left half empty)

const TILT = 14; // degrees a badge leans toward the pointer
const tiltSpring = { stiffness: 220, damping: 20 };

/**
 * One credential: its badge, name, issuer and dates; the whole card opens its Credly verification page. Pointing at it leans the
 * badge toward the pointer in 3D with a glint that follows it, masked to the badge's own shape like foil. No tilt for
 * reduced motion (and none on touch, where there's no pointer to follow).
 */
const Credential = ({ cert }) => {
  const reduceMotion = useReducedMotion();
  const rotateX = useSpring(0, tiltSpring);
  const rotateY = useSpring(0, tiltSpring);
  const glint = useRef(null);

  const lean = (e) => {
    if (reduceMotion || e.pointerType !== 'mouse') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    rotateY.set((px - 0.5) * TILT * 2);
    rotateX.set((0.5 - py) * TILT * 2);
    glint.current?.style.setProperty('--gx', `${px * 100}%`);
    glint.current?.style.setProperty('--gy', `${py * 100}%`);
  };
  const settle = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  // Clip the glint to the badge's opaque pixels
  const badgeShape = {
    maskImage: `url(${cert.image})`,
    WebkitMaskImage: `url(${cert.image})`,
    maskSize: 'contain',
    WebkitMaskSize: 'contain',
    maskRepeat: 'no-repeat',
    WebkitMaskRepeat: 'no-repeat',
    maskPosition: 'center',
    WebkitMaskPosition: 'center',
  };

  return (
    <a
      href={`https://www.credly.com/badges/${cert.badgeId}/public_url`}
      target="_blank"
      rel="noopener noreferrer"
      onPointerMove={lean}
      onPointerLeave={settle}
      className="group flex h-full flex-col rounded-xl border border-line p-4 transition-[translate,border-color] duration-300 ease-out hover:-translate-y-1 hover:border-matcha/60 motion-reduce:hover:translate-y-0 sm:p-5"
    >
      <span className="flex items-start gap-4">
        {/* A fixed warm paper white (in the light theme "white" is dark), so dark badges like CCST read too */}
        <span className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-[radial-gradient(ellipse_at_50%_42%,#fffdf9_0%,#f4eee6_60%,#e9e0d4_100%)] sm:size-16">
          <motion.span
            style={{ rotateX, rotateY, transformPerspective: 500 }}
            className="relative block size-11 sm:size-13"
          >
            <img src={cert.image} alt="" loading="lazy" width="192" height="192" className="size-full object-contain" />
            <span
              ref={glint}
              aria-hidden
              style={badgeShape}
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_var(--gx,50%)_var(--gy,40%),rgb(255_255_255/0.7),transparent_50%)] opacity-0 mix-blend-screen transition-opacity duration-300 group-hover:opacity-100"
            />
          </motion.span>
        </span>
        <span className="min-w-0 pt-0.5">
          <span className="block font-display text-copy leading-snug font-semibold text-balance text-white">
            {cert.name}
          </span>
          <span className="mt-1 block text-sm text-stone-400">{cert.issuer}</span>
        </span>
      </span>

      {/* Issued and expiry over a hairline (their labels a size under the usual 13px, tight to the date), pushed to the bottom so the cards in a row line up */}
      <span className="mt-auto pt-5">
        <span className="grid grid-cols-2 gap-4 border-t border-white/10 pt-3.5">
          <span>
            <span className="block font-mono text-[0.6875rem] leading-none font-medium tracking-[0.08em] text-accent uppercase">
              Issued
            </span>
            <span className="mt-1 block text-sm leading-snug text-stone-300">{formatDate(cert.date)}</span>
          </span>
          <span>
            <span className="block font-mono text-[0.6875rem] leading-none font-medium tracking-[0.08em] text-accent uppercase">
              Expires
            </span>
            <span className={`mt-1 block text-sm leading-snug ${cert.expires ? 'text-stone-300' : 'text-stone-500'}`}>
              {cert.expires ? formatDate(cert.expires) : 'No expiry'}
            </span>
          </span>
        </span>
      </span>

      {/* What clicking does, across the card's foot. Its hover is its own: pointing at the card only outlines the card,
          and the pill fills green only while the pointer is on the pill itself (or the card has keyboard focus) */}
      <span className="group/pill mt-4 flex items-center justify-center gap-1 rounded-full border border-white/15 px-3 py-1.5 text-sm font-medium whitespace-nowrap text-stone-300 transition-colors duration-300 hover:border-transparent hover:bg-matcha hover:text-ink group-focus-visible:border-transparent group-focus-visible:bg-matcha group-focus-visible:text-ink">
        Verify credential
        <LuArrowUpRight
          aria-hidden
          className="size-3.5 transition-[translate] duration-300 group-hover/pill:translate-x-0.5 group-hover/pill:-translate-y-0.5 motion-reduce:transition-none"
        />
      </span>
    </a>
  );
};

const CredentialGrid = ({ items }) => (
  <RevealGroup as="ul" stagger={0.05} className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
    {items.map((cert) => (
      <RevealItem as="li" key={cert.badgeId}>
        <Credential cert={cert} />
      </RevealItem>
    ))}
  </RevealGroup>
);

/**
 * One filter as a dropdown: a pill with its icon, its name and the current choice ("Issuer · All"), opening a small
 * menu of options. Each option shows how many credentials it would leave, given the other filter, and one that would
 * leave none is disabled, so a choice never ends on an empty grid. While a filter is set its pill is outlined green.
 * Keyboard: the arrows move through the options, Escape closes and returns to the pill; a click outside closes it.
 */
const Filter = ({ id, label, icon: Icon, options, value, onChange, count }) => {
  const [open, setOpen] = useState(false);
  const root = useRef(null);
  const trigger = useRef(null);
  const items = useRef([]);
  const all = [{ value: null, label: 'All' }, ...options];
  const current = all.find((o) => o.value === value) ?? all[0];

  // Close on a click outside; on opening, focus the chosen option
  useEffect(() => {
    if (!open) return undefined;
    const outside = (e) => !root.current?.contains(e.target) && setOpen(false);
    document.addEventListener('pointerdown', outside);
    const chosen = all.findIndex((o) => o.value === value);
    items.current[Math.max(chosen, 0)]?.focus();
    return () => document.removeEventListener('pointerdown', outside);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const close = () => {
    setOpen(false);
    trigger.current?.focus();
  };
  const onKeyDown = (e) => {
    if (e.key === 'Escape') return close();
    if (e.key === 'Tab') return setOpen(false);
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return undefined;
    e.preventDefault();
    const enabled = items.current.filter((el) => el && !el.disabled);
    const at = enabled.indexOf(document.activeElement);
    const next = (at + (e.key === 'ArrowDown' ? 1 : -1) + enabled.length) % enabled.length;
    return enabled[next]?.focus();
  };

  return (
    <div ref={root} className="relative" onKeyDown={onKeyDown}>
      <button
        ref={trigger}
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={`${id}-menu`}
        onClick={() => setOpen((v) => !v)}
        className={`group inline-flex items-center gap-2 rounded-full border bg-ink/40 py-1.5 pr-2.5 pl-3 text-sm whitespace-nowrap transition-colors duration-200 hover:border-matcha-strong ${
          value || open ? 'border-matcha' : 'border-white/15'
        }`}
      >
        <Icon aria-hidden className="size-4 text-accent transition-colors duration-200 group-hover:text-matcha-strong" />
        <span className="text-stone-400">{label}</span>
        <span className={`font-medium ${value ? 'text-matcha-strong' : 'text-white'}`}>{current.label}</span>
        <LuChevronDown
          aria-hidden
          className={`size-3.5 text-stone-400 transition-transform duration-300 motion-reduce:transition-none ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            id={`${id}-menu`}
            role="group"
            aria-label={label}
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            className="absolute top-full left-0 z-30 mt-2 min-w-52 origin-top-left rounded-xl border border-line bg-surface p-1.5 shadow-[0_18px_40px_-20px_rgb(0_0_0/0.45)]"
          >
            {all.map((option, i) => {
              const active = option.value === value;
              const n = count(option.value);
              return (
                <button
                  key={option.label}
                  ref={(node) => {
                    items.current[i] = node;
                  }}
                  type="button"
                  aria-pressed={active}
                  disabled={!n}
                  title={option.full}
                  onClick={() => {
                    onChange(option.value);
                    close();
                  }}
                  className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors duration-150 enabled:hover:bg-white/5 enabled:hover:text-matcha-strong disabled:cursor-not-allowed disabled:opacity-35 focus-visible:bg-white/5 ${
                    active ? 'text-matcha-strong' : 'text-stone-300'
                  }`}
                >
                  <LuCheck aria-hidden className={`size-3.5 shrink-0 text-matcha ${active ? '' : 'invisible'}`} />
                  <span className="flex-1 whitespace-nowrap">{option.full ?? option.label}</span>
                  <span className="font-mono text-[0.6875rem] text-stone-500">{n}</span>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/**
 * Every credential in one grid, newest first, each card a link to its Credly page: badge, name and issuer, then when
 * it was issued and when it expires, then "Verify credential". Two filters over it, by issuer and by year. Past six the
 * rest fold behind "View all". It replaced issuer groups, which left a wide empty column and half-empty rows.
 */
const Certifications = () => {
  const [all, setAll] = useState(false);
  const [issuer, setIssuer] = useState(null);
  const [year, setYear] = useState(null);
  const shown = sorted.filter((c) => matches(c, issuer, year));
  const folds = shown.length > SHOWN;
  // The grid is remounted when a filter changes, so the cards that are left play their reveal again
  const key = `${issuer}-${year}`;

  return (
    <Section id="certifications" title="Credentials I've earned" intro={intros.certifications} rule={false}>
      <div className="relative z-20 mb-6 flex flex-wrap gap-2.5">
        <Filter
          id="cert-issuer"
          label="Issuer"
          icon={LuBuilding2}
          options={issuerOptions}
          value={issuer}
          onChange={setIssuer}
          count={(v) => sorted.filter((c) => matches(c, v, year)).length}
        />
        <Filter
          id="cert-year"
          label="Year"
          icon={LuCalendar}
          options={yearOptions}
          value={year}
          onChange={setYear}
          count={(v) => sorted.filter((c) => matches(c, issuer, v)).length}
        />
      </div>
      <p className="sr-only" aria-live="polite">
        {shown.length} {shown.length === 1 ? 'credential' : 'credentials'} shown
      </p>
      <CredentialGrid key={key} items={shown.slice(0, SHOWN)} />
      {/* Its own list, so it reveals when it opens */}
      {all && folds && (
        <div className="mt-4">
          <CredentialGrid key={key} items={shown.slice(SHOWN)} />
        </div>
      )}
      {folds && (
        <button
          type="button"
          onClick={() => setAll((v) => !v)}
          aria-expanded={all}
          // The same button as Projects' "View details": a faint outline at rest, outline and text green on hover or focus
          className="mt-6 inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3.5 py-1.5 font-display text-sm font-medium whitespace-nowrap text-stone-500 transition-colors duration-200 hover:border-matcha-strong hover:text-matcha-strong focus-visible:border-matcha-strong focus-visible:text-matcha-strong"
        >
          {all ? 'Show fewer' : 'View all'}
          <LuChevronDown
            aria-hidden
            className={`size-3.5 transition-transform duration-300 motion-reduce:transition-none ${all ? 'rotate-180' : ''}`}
          />
        </button>
      )}
    </Section>
  );
};

export default Certifications;
