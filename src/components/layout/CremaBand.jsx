/**
 * The crema wave that leads the Projects band in over the hero: a strip twice the screen wide sliding slowly sideways
 * in CSS, so it costs no scroll and next to no work. It's one crest-to-crest wave repeated; sliding by half loops it.
 */
const WAVE = 'M0 22 Q25 6 50 22 T100 22 T150 22 T200 22 T250 22 T300 22 T350 22 T400 22 V41 H0 Z';

const WaveTop = () => (
  <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-full -mb-px h-8 overflow-hidden sm:h-12">
    <svg
      viewBox="0 0 400 40"
      preserveAspectRatio="none"
      className="h-full w-[200%] animate-roll motion-reduce:animate-none"
    >
      <path d={WAVE} className="fill-crema" />
    </svg>
  </div>
);

/**
 * A light "crema" stretch of the page between dark sections. `tone-light` re-points the palette for everything inside
 * (see index.css), so the sections in it render light without their own styling; `bg-ink` here therefore paints
 * crema. `wave` gives it a rolling top edge (Projects, over the hero); otherwise its edges are plain.
 */
const CremaBand = ({ wave = false, children }) => (
  <div data-nav-light className="tone-light relative z-10 bg-ink">
    {wave && <WaveTop />}
    {children}
  </div>
);

export default CremaBand;
