/**
 * Round social link: it stays put (a magnetic pull toward the cursor was removed as irritating, like a joystick), fills
 * taupe while its icon rolls, and shows its label on hover or focus.
 */
const SocialIcon = ({ label, href, icon: Icon }) => {
  const hoverClass =
    'group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100';

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="group relative flex size-11 items-center justify-center rounded-full border border-line bg-ink/50 text-stone-300 transition-colors duration-300 hover:border-matcha hover:text-ink focus-visible:border-matcha focus-visible:text-ink focus-visible:outline-none"
    >
      <span
        aria-hidden
        className="absolute inset-0 scale-0 rounded-full bg-matcha transition-transform duration-300 ease-out group-hover:scale-100 group-focus-visible:scale-100"
      />

      <span aria-hidden className="relative block size-4.5 overflow-hidden">
        <Icon className="size-4.5 transition-transform duration-300 ease-out group-hover:-translate-y-full group-focus-visible:-translate-y-full motion-reduce:transition-none" />
        <Icon className="absolute inset-0 size-4.5 translate-y-full transition-transform duration-300 ease-out group-hover:translate-y-0 group-focus-visible:translate-y-0 motion-reduce:transition-none" />
      </span>

      <span
        aria-hidden
        className={`pointer-events-none absolute bottom-full left-1/2 mb-2.5 -translate-x-1/2 translate-y-1 rounded-md border border-line bg-surface px-2 py-1 text-xs font-medium whitespace-nowrap text-stone-200 opacity-0 shadow-lg shadow-black/40 transition-all duration-200 ${hoverClass}`}
      >
        {label}
      </span>
    </a>
  );
};

export default SocialIcon;
