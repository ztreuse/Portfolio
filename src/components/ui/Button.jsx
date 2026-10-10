import { isValidElement } from 'react';

// Pill buttons: label on the left, icon in its own circle on the right (same design in the hero and Contact).
const variants = {
  primary: {
    base: 'border border-transparent bg-linear-to-br from-accent-strong to-accent text-ink shadow-[0_10px_30px_-12px_rgb(159_143_129/0.8)] hover:shadow-[0_14px_36px_-12px_rgb(159_143_129/0.9)]',
    circle: 'bg-ink text-accent-strong',
  },
  outline: {
    base: 'border border-white/20 bg-ink/40 text-white backdrop-blur-sm hover:border-accent/70',
    circle:
      'border border-white/25 text-accent-strong group-hover:border-accent group-hover:bg-accent group-hover:text-ink',
  },
};

// Which way the icon nudges on hover: arrows slide right, a download icon dips down.
const nudges = {
  x: 'group-hover:translate-x-0.5',
  y: 'group-hover:translate-y-0.5',
};

/**
 * Renders an `<a>` when given `href`, otherwise a `<button>`. Pass `icon` (a react-icons component, or a ready
 * element such as a spinner) to show it in the circle; `nudge` picks its hover motion.
 */
const Button = ({ href, variant = 'primary', icon: Icon, nudge = 'x', className = '', children, ...props }) => {
  const style = variants[variant];
  const classes = `group inline-flex items-center justify-center gap-3 rounded-full py-2 font-display text-sm font-semibold transition-[translate,box-shadow,border-color] duration-300 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:pointer-events-none disabled:opacity-70 motion-reduce:hover:translate-y-0 ${
    Icon ? 'pr-2 pl-6' : 'px-6'
  } ${style.base} ${className}`;

  const content = (
    <>
      {children}
      {Icon && (
        <span
          className={`flex size-8 shrink-0 items-center justify-center rounded-full transition-colors duration-300 ${style.circle}`}
        >
          {isValidElement(Icon) ? (
            Icon
          ) : (
            <Icon
              aria-hidden
              className={`size-4 transition-transform duration-300 motion-reduce:transition-none ${nudges[nudge]}`}
            />
          )}
        </span>
      )}
    </>
  );

  return href ? (
    <a href={href} className={classes} {...props}>
      {content}
    </a>
  ) : (
    <button className={classes} {...props}>
      {content}
    </button>
  );
};

export default Button;
