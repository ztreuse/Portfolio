/** Round icon-only button (carousel and pagination arrows). */
const IconButton = ({ label, icon: Icon, className = '', ...props }) => (
  <button
    type="button"
    aria-label={label}
    className={`flex size-11 items-center justify-center rounded-full border border-line bg-surface text-stone-300 transition-colors duration-200 hover:border-accent hover:bg-accent hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:pointer-events-none disabled:opacity-30 ${className}`}
    {...props}
  >
    <Icon aria-hidden className="size-5" />
  </button>
);

export default IconButton;
