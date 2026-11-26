import useTheme from '../../hooks/useTheme';
// desk.webp, pre-blurred (a live blur made phones stutter), and the same with its night tones remapped to crema
import deskDark from '../../assets/images/desk-soft.webp';
import deskLight from '../../assets/images/desk-soft-light.webp';

/**
 * The owner's desk at night (their own setup, the same scene as the Contact film, graded to the site's taupes), softly
 * blurred: under a dark veil in the dark theme, and as a crema version of the same photo under a lighter crema veil in
 * the light one, its mirror. From tablets up it stays put while the section
 * scrolls over it, like looking through a window (a fixed layer clipped to the section); on phones it's a plain
 * background.
 */
const DeskBackdrop = () => {
  const { theme } = useTheme();
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden bg-dimension [clip-path:inset(0)]"
    >
      <div className="absolute inset-0 md:fixed xl:left-(--index-w) xl:transition-[left] xl:duration-300">
        <img
          src={theme === 'light' ? deskLight : deskDark}
          decoding="async"
          alt=""
          width="1600"
          height="900"
          className="absolute inset-0 size-full object-cover"
        />
        {/* The dark theme dims it toward espresso, the light one, its mirror, softens it toward crema */}
        <div className={`absolute inset-0 ${theme === 'dark' ? 'bg-dimension/70' : 'bg-ink/50'}`} />
      </div>
    </div>
  );
};

// Over the photo, muted text steps up one shade, keeping its order: in the dark, white titles, light grey text and a light
// tan accent. The light theme mirrors it over its crema veil: near-black titles and text (descriptions, tags, buttons; the dark
// theme has them near-white) and a mid brown accent for the roles.
const ON_DESK = [
  '[--color-accent:var(--color-accent-strong)] [--color-stone-400:var(--color-stone-300)] [--color-stone-300:var(--color-stone-200)]',
  'light:[--color-accent:inherit] light:[--color-stone-300:var(--color-white)]',
].join(' ');

/** The second section (Projects) sits on the desk photo. It was Experience's until the two swapped places. */
const Desk = ({ children }) => (
  <div className={`relative isolate ${ON_DESK}`}>
    <DeskBackdrop />
    {children}
  </div>
);

export default Desk;
