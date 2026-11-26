import { motion, useReducedMotion } from 'motion/react';
import useTheme, { setTheme } from '../../hooks/useTheme';

// Our own icons (not a library's). Light: an empty disc ringed with dots of light. Dark: a solid crescent moon with two
// dot stars. Device: a screen
// whose glass is half solid, half light and half dark. Drawn on a 24px grid in currentColor, so they follow the button's colour.
const Glyph = ({ children }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
    className="size-[1.125rem]"
  >
    {children}
  </svg>
);

const Disc = ({ children }) => (
  <Glyph>
    <circle cx="12" cy="12" r="5" />
    {children}
  </Glyph>
);

const LightIcon = () => (
  <Disc>
    <circle cx="20.30" cy="12.00" r="1.1" fill="currentColor" stroke="none" />
    <circle cx="17.87" cy="17.87" r="1.1" fill="currentColor" stroke="none" />
    <circle cx="12.00" cy="20.30" r="1.1" fill="currentColor" stroke="none" />
    <circle cx="6.13" cy="17.87" r="1.1" fill="currentColor" stroke="none" />
    <circle cx="3.70" cy="12.00" r="1.1" fill="currentColor" stroke="none" />
    <circle cx="6.13" cy="6.13" r="1.1" fill="currentColor" stroke="none" />
    <circle cx="12.00" cy="3.70" r="1.1" fill="currentColor" stroke="none" />
    <circle cx="17.87" cy="6.13" r="1.1" fill="currentColor" stroke="none" />
  </Disc>
);

// A crescent moon of our own: a disc with a second circle cut out of its upper right (drawn as two arcs), and two
// small dot stars in the space it leaves, like the dots round the light icon
const DarkIcon = () => (
  <Glyph>
    <path d="M11.72 5.01A7 7 0 1 0 18.87 13.35A5.5 5.5 0 0 1 11.72 5.01Z" fill="currentColor" strokeWidth="1.25" />
    <circle cx="18.4" cy="4.4" r="1.1" fill="currentColor" stroke="none" />
    <circle cx="21.1" cy="8.2" r="0.8" fill="currentColor" stroke="none" />
  </Glyph>
);

const DeviceIcon = () => (
  <Glyph>
    <path d="M12 4.5H5.5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2H12z" fill="currentColor" stroke="none" />
    <rect x="3.5" y="4.5" width="17" height="11" rx="2" />
    <path d="M12 15.5v4M8.5 19.5h7" />
  </Glyph>
);

const options = [
  { value: 'system', label: 'Match my device', icon: DeviceIcon },
  { value: 'light', label: 'Light theme', icon: LightIcon },
  { value: 'dark', label: 'Dark theme', icon: DarkIcon },
];

/**
 * Theme switch: device, light or dark. The new theme spreads out from the button pressed (see setTheme). The chosen one
 * sits in a soft taupe pill that slides between the three. `stretch` fills its container's width with three equal
 * segments (the side index); `vertical` stacks them (the collapsed index).
 */
const ThemeToggle = ({ stretch = false, vertical = false, className = '' }) => {
  const { choice } = useTheme();
  const reduceMotion = useReducedMotion();
  const index = Math.max(
    options.findIndex(({ value }) => value === choice),
    0,
  );

  return (
    <div
      role="group"
      aria-label="Theme"
      className={`relative grid rounded-full ${vertical ? 'grid-rows-3' : 'grid-cols-3'} border border-white/15 p-0.5 ${
        stretch ? 'w-full bg-white/[0.03]' : 'w-fit'
      } ${className}`}
    >
      {/* The chosen theme's pill, a third of the inner width, slid along by whole widths */}
      <motion.span
        aria-hidden
        initial={false}
        animate={vertical ? { y: `${index * 100}%` } : { x: `${index * 100}%` }}
        transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 34 }}
        className={`absolute top-0.5 left-0.5 rounded-full border border-matcha/35 bg-matcha/20 ${
          vertical ? 'inset-x-0.5 h-[calc((100%-0.25rem)/3)]' : 'inset-y-0.5 w-[calc((100%-0.25rem)/3)]'
        }`}
      />
      {options.map(({ value, label, icon: Icon }) => {
        const active = choice === value;
        return (
          <button
            key={value}
            type="button"
            aria-pressed={active}
            aria-label={label}
            title={label}
            onClick={(e) => {
              const box = e.currentTarget.getBoundingClientRect();
              setTheme(value, { x: box.left + box.width / 2, y: box.top + box.height / 2 });
            }}
            className={`relative flex items-center justify-center rounded-full transition-colors duration-200 ${
              vertical ? 'size-7.5' : stretch ? 'h-8' : 'size-8'
            } ${active ? 'text-white' : 'text-stone-400 hover:text-white'}`}
          >
            <Icon />
          </button>
        );
      })}
    </div>
  );
};

export default ThemeToggle;
