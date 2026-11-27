import { cloneElement, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { LuDownload, LuExternalLink } from 'react-icons/lu';
import { profile } from '../../data/site';

const OPEN_DELAY = 120; // ms the pointer rests on the button before the preview shows (a pass across it shows nothing)
const CLOSE_DELAY = 160; // long enough to move from the button into the card
const CARD_H = 470; // about how tall the card is, to choose above or below the button
const EDGE = 16; // the least room kept between the card and the window's edge
const FILE_NAME = 'Troy-Bay-Resume.pdf';

// The card's two actions: small pills like the "View details" button (faint at rest, outline and text green on hover)
const actionClass =
  'flex items-center justify-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-sm font-medium whitespace-nowrap text-stone-300 transition-colors duration-200 hover:border-matcha-strong hover:text-matcha-strong focus-visible:border-matcha-strong focus-visible:text-matcha-strong';

// Where the card goes, in window coordinates. `side` is the side of the button it's on; the 12px gap to the button
// is padding on the card's outer layer (on that side), so the pointer never leaves the card's area on its way in
const place = (rect, placement) => {
  if (placement === 'right') {
    // Beside the button, bottoms lined up (the side index's résumé pill sits low), kept inside the window
    const bottom = Math.max(EDGE, Math.min(window.innerHeight - rect.bottom, window.innerHeight - CARD_H - EDGE));
    return { side: 'right', style: { left: rect.right, bottom } };
  }
  if (rect.top < CARD_H + EDGE) return { side: 'below', style: { left: rect.left, top: rect.bottom } };
  return { side: 'above', style: { left: rect.left, bottom: window.innerHeight - rect.top } };
};
const pad = { above: 'pb-3 origin-bottom-left', below: 'pt-3 origin-top-left', right: 'pl-3 origin-bottom-left' };
const from = { above: { y: 6 }, below: { y: -6 }, right: { x: -6 } };

/**
 * Wraps a résumé link (the hero's View Resume, the side index's Resume pill): resting the mouse on it, or tabbing to
 * it, shows a card with the résumé's page as an image (`profile.resumePreview`, rendered from the PDF) and two
 * actions, open it in a new tab or download it right away (for anyone who wants the file without opening it first).
 * The card is drawn in a portal on the body, fixed to the window, so no section or panel can cover or clip it; it
 * follows the link while the page scrolls. `placement` is "auto" (above the link, or below without room) or "right"
 * (beside it, for the side index). It stays open while the pointer moves from the link into it and closes once it has
 * left both; Escape closes it too. Mouse and keyboard only: on touch the tap simply opens the PDF.
 */
const ResumePeek = ({ children, placement = 'auto', className = '' }) => {
  const [open, setOpen] = useState(false);
  const [spot, setSpot] = useState(null);
  const root = useRef(null);
  const card = useRef(null);
  const timer = useRef(0);
  const noteId = useId();
  useEffect(() => () => clearTimeout(timer.current), []);

  // Keep the card on the link while it's open (the page can scroll under a resting mouse)
  useLayoutEffect(() => {
    if (!open) return undefined;
    const follow = () => root.current && setSpot(place(root.current.getBoundingClientRect(), placement));
    follow();
    window.addEventListener('scroll', follow, { passive: true });
    window.addEventListener('resize', follow);
    return () => {
      window.removeEventListener('scroll', follow);
      window.removeEventListener('resize', follow);
    };
  }, [open, placement]);

  const show = () => {
    clearTimeout(timer.current);
    if (open) return; // already showing: just cancel a pending close
    timer.current = setTimeout(() => setOpen(true), OPEN_DELAY);
  };
  const hide = () => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpen(false), CLOSE_DELAY);
  };
  const inside = (node) => root.current?.contains(node) || card.current?.contains(node);

  // Shared by the link's wrapper and the card (which sits elsewhere in the page)
  const handlers = {
    onPointerEnter: (e) => e.pointerType === 'mouse' && show(),
    onPointerLeave: (e) => e.pointerType === 'mouse' && hide(),
    onFocus: (e) => e.target.matches(':focus-visible') && show(),
    onBlur: (e) => !inside(e.relatedTarget) && hide(),
    onKeyDown: (e) => {
      if (e.key !== 'Escape' || !open) return;
      setOpen(false);
      root.current?.querySelector('a')?.focus();
    },
  };

  return (
    <span ref={root} className={`relative inline-flex ${className}`} {...handlers}>
      {/* The link is described for screen readers whether or not the card is showing */}
      {cloneElement(children, { 'aria-describedby': noteId })}
      <span id={noteId} className="sr-only">
        Opens the PDF in a new tab
      </span>
      {createPortal(
        <AnimatePresence>
          {open && spot && (
            <motion.span
              ref={card}
              role="group"
              aria-label="Resume"
              {...handlers}
              initial={{ opacity: 0, scale: 0.97, ...from[spot.side] }}
              animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, ...from[spot.side] }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
              style={spot.style}
              className={`fixed z-[60] block w-68 ${pad[spot.side]}`}
            >
              <span className="block rounded-xl border border-line bg-surface p-2 shadow-[0_24px_50px_-24px_rgb(0_0_0/0.55)]">
                {/* A fixed paper white behind the page, so it reads as paper in both themes */}
                <img
                  src={profile.resumePreview}
                  alt="Preview of my resume"
                  width="720"
                  height="1019"
                  className="block h-auto w-full rounded-lg bg-[#fff]"
                />
                <span className="flex items-center justify-between gap-2 px-1.5 pt-2.5">
                  <span className="text-sm font-medium text-white">Resume</span>
                  <span className="font-mono text-[0.6875rem] font-medium tracking-[0.08em] whitespace-nowrap text-accent uppercase">
                    PDF · 1 page
                  </span>
                </span>
                <span className="mt-2 grid grid-cols-2 gap-1.5">
                  <a href={profile.resume} target="_blank" rel="noopener noreferrer" className={actionClass}>
                    <LuExternalLink aria-hidden className="size-3.5" />
                    New tab
                  </a>
                  <a href={profile.resume} download={FILE_NAME} className={actionClass}>
                    <LuDownload aria-hidden className="size-3.5" />
                    Download
                  </a>
                </span>
              </span>
            </motion.span>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </span>
  );
};

export default ResumePeek;
