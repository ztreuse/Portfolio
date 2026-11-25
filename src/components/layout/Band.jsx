/**
 * The wave that leads the Projects band in over the hero: a strip twice the screen wide sliding slowly sideways in CSS,
 * so it costs no scroll and next to no work. It's one crest-to-crest wave repeated; sliding by half loops it.
 */
const WAVE = 'M0 22 Q25 6 50 22 T100 22 T150 22 T200 22 T250 22 T300 22 T350 22 T400 22 V41 H0 Z';

const WaveTop = () => (
  <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-full -mb-px h-8 overflow-hidden sm:h-12">
    <svg
      viewBox="0 0 400 40"
      preserveAspectRatio="none"
      className="h-full w-[200%] animate-roll motion-reduce:animate-none"
    >
      <path d={WAVE} className="fill-band" />
    </svg>
  </div>
);

/** A section a shade off the page, so neighbouring sections read apart. `wave` gives it a rolling top edge (Projects). */
const Band = ({ wave = false, children }) => (
  <div className="relative z-10 bg-band">
    {wave && <WaveTop />}
    {children}
  </div>
);

export default Band;
