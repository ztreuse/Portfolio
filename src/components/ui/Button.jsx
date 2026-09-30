const variants = {
  primary: 'bg-accent text-ink hover:bg-accent-strong',
  outline: 'border border-accent/60 text-accent-strong hover:border-accent hover:bg-accent hover:text-ink',
};

/** Renders an `<a>` when given `href`, otherwise a `<button>`. */
const Button = ({ href, variant = 'primary', className = '', children, ...props }) => {
  const classes = `inline-flex items-center justify-center gap-2 rounded-lg px-5 py-3 font-display text-sm font-semibold transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`;

  return href ? (
    <a href={href} className={classes} {...props}>
      {children}
    </a>
  ) : (
    <button className={classes} {...props}>
      {children}
    </button>
  );
};

export default Button;
