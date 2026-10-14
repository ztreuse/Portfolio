/** Round icon-only button (carousel and pagination arrows, project links). Renders an <a> when given `href`. */
const IconButton = ({ label, icon: Icon, href, className = '', ...props }) => {
  const Component = href ? 'a' : 'button';

  return (
    <Component
      {...(href ? { href } : { type: 'button' })}
      aria-label={label}
      className={`flex size-11 items-center justify-center rounded-full border border-white/20 bg-ink/40 text-stone-200 backdrop-blur-sm transition-[color,background-color,border-color,scale] duration-200 active:scale-[0.94] hover:border-accent hover:bg-accent hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:pointer-events-none disabled:opacity-30 ${className}`}
      {...props}
    >
      <Icon aria-hidden className="size-5" />
    </Component>
  );
};

export default IconButton;
