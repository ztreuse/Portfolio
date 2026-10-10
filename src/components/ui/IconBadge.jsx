/**
 * Round icon badge beside labels (Experience timeline headings), matching the icon circles in the pill buttons:
 * soft white border, translucent dark fill, taupe icon. Glows and tilts when its `group` parent is hovered.
 * Pass `logo` (an image URL) to show an original brand logo instead of the icon.
 */
const IconBadge = ({ icon: Icon, logo }) => (
  <span className="relative flex size-11 shrink-0 items-center justify-center rounded-full border border-white/20 bg-ink/40 text-accent-strong backdrop-blur-sm transition-[border-color,box-shadow] duration-300 group-hover:border-accent/70 group-hover:shadow-[0_0_22px_-4px_rgb(159_143_129/0.55)]">
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
