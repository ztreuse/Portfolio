import { isValidElement } from 'react';

// Pill buttons: label on the left, icon in its own circle on the right (same design in the hero and Contact).
const variants = {
  primary: {
    // At rest a green outline only (the owner's request): the border, the label and the icon's circle and icon all
    // matcha, nothing filled. On hover it fills green and the label, border, circle and icon turn black in the dark theme
    // (on the pistachio) and white in the light theme (on a deep green)
    base: 'border border-matcha bg-ink/40 text-matcha-strong backdrop-blur-sm hover:border-matcha-fill hover:bg-matcha-fill hover:text-on-matcha focus-visible:bg-matcha-fill focus-visible:text-on-matcha hover:shadow-[0_12px_30px_-14px_rgb(88_122_58/0.6)]',
    circle: 'border border-matcha text-matcha-strong group-hover:border-on-matcha group-hover:text-on-matcha',
  },
  outline: {
    // Hover: the outline and the label turn matcha green (the owner's request), the icon's circle fills green
    base: 'border border-white/20 bg-ink/40 text-white backdrop-blur-sm hover:border-matcha/70 hover:text-matcha-strong focus-visible:text-matcha-strong',
    circle:
      'border border-white/25 text-accent-strong group-hover:border-matcha group-hover:bg-matcha group-hover:text-ink',
  },
};

// Which way the icon nudges on hover: arrows slide right; a download icon stays centred in its circle and rises
// with the button (a downward dip cancelled the button's lift and left the icon looking stuck).
const nudges = {
  x: 'group-hover:translate-x-0.5',
  y: '',
};

/**
 * Renders an `<a>` when given `href`, otherwise a `<button>`. Pass `icon` (a react-icons component, or a ready
 * element such as a spinner) to show it in the circle; `nudge` picks its hover motion.
 */
const Button = ({ href, variant = 'primary', icon: Icon, nudge = 'x', className = '', children, ...props }) => {
  const style = variants[variant];
  // Sized like the photo's "Hold" pill (the owner's reference; these felt too thick at py-2 and 24px beside the text):
  // a 4px rim round the icon's circle (3px plus the 1px border) and 14px on the text side, 40px tall in all
  const classes = `group inline-flex items-center justify-center gap-2.5 rounded-full font-display text-sm font-semibold transition-[translate,scale,box-shadow,border-color,color,background-color] duration-300 hover:-translate-y-0.5 active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-matcha disabled:pointer-events-none disabled:opacity-70 motion-reduce:hover:translate-y-0 ${
    Icon ? 'py-[3px] pr-[3px] pl-3.5' : 'px-4 py-[9px]'
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
