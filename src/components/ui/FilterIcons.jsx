/**
 * Our own icons for the Certifications filters, drawn like the theme switch's (a 1.75 line, round ends, one solid part
 * as the accent), so they read as part of the site rather than a stock set.
 */
const Svg = ({ className = '', children, strokeWidth = 1.75 }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    className={className}
  >
    {children}
  </svg>
);

/** Who issued it: an institution, its roof solid over four columns and two steps. */
export const IssuerIcon = ({ className }) => (
  <Svg className={className}>
    <path d="M12 3.25 3.75 7.75h16.5Z" fill="currentColor" strokeWidth="1.25" />
    <path d="M6.25 10.5v6M10.1 10.5v6M13.9 10.5v6M17.75 10.5v6" />
    <path d="M4.75 17.75h14.5M3.5 20.75h17" />
  </Svg>
);

/** When: a calendar with its binder rings, one day filled in. */
export const YearIcon = ({ className }) => (
  <Svg className={className}>
    <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
    <path d="M8 3v3.75M16 3v3.75M3.5 9.75h17" />
    <rect x="13.75" y="13" width="3.5" height="3.5" rx="0.9" fill="currentColor" stroke="none" />
  </Svg>
);

/** The chosen option. */
export const CheckIcon = ({ className }) => (
  <Svg className={className} strokeWidth="2.25">
    <path d="M5 12.75 9.75 17.5 19 7.5" />
  </Svg>
);

/** Opens the menu (turned over while it's open). */
export const ChevronIcon = ({ className }) => (
  <Svg className={className} strokeWidth="2">
    <path d="M6.5 9.5 12 15l5.5-5.5" />
  </Svg>
);
