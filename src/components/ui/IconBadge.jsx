/**
 * Accent icon tile used beside labels (contact details, about facts, timeline headings).
 * Warm gradient + top-edge highlight; glows and tilts when its `group` parent is hovered.
 */
// Pass `logo` (an image URL) to show an original brand logo instead of the accent-colored icon.
const IconBadge = ({ icon: Icon, logo }) => (
  <span className="relative flex size-11 shrink-0 items-center justify-center rounded-xl border border-accent/20 bg-linear-to-br from-accent/25 via-surface to-ink text-accent-strong shadow-[inset_0_1px_0_0_rgb(255_255_255/0.08)] transition-[border-color,box-shadow] duration-300 group-hover:border-accent/50 group-hover:shadow-[inset_0_1px_0_0_rgb(255_255_255/0.08),0_0_22px_-4px_rgb(159_143_129/0.55)]">
    {logo ? (
      <img
        src={logo}
        alt=""
        className="size-5 object-contain transition-transform duration-300 ease-out group-hover:scale-110 group-hover:-rotate-6 motion-reduce:transition-none"
      />
    ) : (
      <Icon
        aria-hidden
        className="size-5 transition-transform duration-300 ease-out group-hover:scale-110 group-hover:-rotate-6 motion-reduce:transition-none"
      />
    )}
  </span>
);

export default IconBadge;
