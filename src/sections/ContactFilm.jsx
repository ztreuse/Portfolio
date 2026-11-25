import { useEffect, useRef } from 'react';
import { useMotionValueEvent, useScroll } from 'motion/react';
import { FILM_GRADE } from './filmGrade';

const clamp01 = (v) => Math.min(Math.max(v, 0), 1);
const smooth = (x) => x * x * (3 - 2 * x);
const FRAMES = 120;
// Phones load and draw every second frame, at plain resolution and without the focus blur: the dolly still reads as
// smooth on a small screen, with half the download and far less work per scroll step
const LIGHT = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse), (max-width: 767px)').matches;
const STEP = LIGHT ? 2 : 1;
const COUNT = Math.ceil(FRAMES / STEP);
const AHEAD = 8; // frames decoded either side of the current one
const KEEP = 12; // ... and kept
const src = (set, i) => `${import.meta.env.BASE_URL}contact-film/${set}/${String(i + 1).padStart(3, '0')}.webp`;

// Where the left monitor's screen sits in the clip's last frame (fractions of the frame), for the push into it
const SCREEN = { wide: [0.516, 0.46], tall: [0.5, 0.45] };

/**
 * The Skills → Contact film: the owner's desk at night (an AI clip, Hailuo image-to-video from a photo of their real
 * setup: two glowing monitors on a white desk, a lamp, a steaming mug) as 120 WebP frames per orientation in
 * `public/contact-film/` (`wide` 1280×720, cropped to cut out the generator's watermark; `tall` 720×1280, a slice
 * centred on the monitors), scrubbed by the scroll frame by frame like a video. The camera dollies across the dark
 * room toward the desk and the left monitor; after the last frame it keeps pushing into that monitor's glowing screen
 * (a digital zoom) and settles onto the screen's flat colour, which is Contact's background (`screen`, `.tone-screen`),
 * as if you've flown into the screen. The frames are colour-graded toward the site's taupes (baked in: saturate 0.45,
 * sepia 0.12, brightness 0.92; the raw clip read yellow).
 *
 * Into it, a seamless hand-off: Skills' backdrop is this film's first frame, fixed to the screen, and it comes into
 * focus as Skills ends. The runway is pulled up a screen, so the stage pins just as that happens; it stays invisible
 * until it has pinned and drawn a frame, then simply appears over the identical picture and the dolly plays. (While
 * still rising it would draw a second, offset copy of the desk.) At the end Contact, pulled up by 70lvh and see-through
 * there, fades in and rises over the settled colour, so there's no empty screen of it to scroll through. Frames load only when it's near. Render it only when motion is allowed.
 */
const ContactFilm = () => {
  const runway = useRef(null);
  const stage = useRef(null);
  const canvas = useRef(null);
  const wash = useRef(null);
  const blobs = useRef([]); // the downloaded frames, still compressed
  const bitmaps = useRef(new Map()); // frame -> decoded picture, for the frames around the current one
  const wanted = useRef(0);
  const set = useRef('wide');
  // 0 as the stage pins (its top reaches the top of the screen), 1 as it lets go (Contact's top at the bottom)
  const { scrollYProgress } = useScroll({ target: runway, offset: ['start start', 'end end'] });
  const { scrollY } = useScroll();

  // Decode the frames around the current one ahead of time, off the main thread (decoding a picture at the moment it's
  // drawn made phones stutter), and let go of the ones left behind so they don't pile up in memory
  const prepare = (i) => {
    wanted.current = i;
    bitmaps.current.forEach((bitmap, j) => {
      if (j >= i - KEEP && j <= i + KEEP) return;
      bitmap?.close?.();
      bitmaps.current.delete(j);
    });
    for (let j = Math.max(0, i - AHEAD); j <= Math.min(COUNT - 1, i + AHEAD); j += 1) {
      if (!blobs.current[j] || bitmaps.current.has(j)) continue;
      bitmaps.current.set(j, null); // on its way
      createImageBitmap(blobs.current[j])
        .then((bitmap) => {
          // Scrolled on meanwhile?
          if (!bitmaps.current.has(j)) {
            bitmap.close();
            return;
          }
          bitmaps.current.set(j, bitmap);
          if (j === wanted.current) draw();
        })
        .catch(() => bitmaps.current.delete(j));
    }
  };
  // The decoded frame nearest to i
  const nearest = (i) => {
    for (let d = 0; d <= KEEP; d += 1) {
      const bitmap = bitmaps.current.get(i - d) ?? bitmaps.current.get(i + d);
      if (bitmap) return bitmap;
    }
    return null;
  };

  const draw = () => {
    const el = canvas.current;
    if (!el || !stage.current) return;
    const p = scrollYProgress.get();
    // Hidden until it has pinned (Skills' backdrop shows the same first frame until then)
    const pinned = stage.current.getBoundingClientRect().top <= 0.5;
    if (!pinned) stage.current.style.opacity = '0';
    const play = clamp01(p / 0.52);
    // Then the push into the left monitor's screen, settling onto its flat colour (Contact's background)
    const push = smooth(clamp01((p - 0.5) / 0.2));
    const dim = smooth(clamp01((p - 0.54) / 0.16));
    // Once it has settled on Contact's light colour, the navbar turns to light glass over it too
    stage.current.toggleAttribute('data-nav-light', dim > 0.5);
    // Contact, rising over the film's end, fades in as the film settles (see Contact)
    // (straight on the section: a CSS variable on the page made the browser restyle everything, every frame)
    const contact = runway.current.nextElementSibling;
    if (contact) contact.style.opacity = dim.toFixed(3);
    // The clip itself slows down as the camera nears the monitor, so the scroll moves through the later frames
    // faster (three times the pace of the start by the end)
    const i = Math.round((0.5 * play + 0.5 * play * play) * (COUNT - 1));
    prepare(i);
    const img = nearest(i);
    // Even if the frames fail to load, the settled colour must be there for Contact to rise onto
    if (pinned && dim > 0) {
      stage.current.style.opacity = '1';
      wash.current.style.opacity = dim.toFixed(3);
    }
    if (!img) return;
    if (pinned) stage.current.style.opacity = '1';
    const dpr = LIGHT ? 1 : Math.min(window.devicePixelRatio || 1, 2);
    const w = el.clientWidth;
    const h = el.clientHeight;
    if (el.width !== Math.round(w * dpr) || el.height !== Math.round(h * dpr)) {
      el.width = Math.round(w * dpr);
      el.height = Math.round(h * dpr);
    }
    const ctx = el.getContext('2d');
    // Cover the screen, like object-cover, zoomed in toward the monitor's screen during the push
    const zoom = 1 + 1.8 * push;
    const scale = Math.max(el.width / img.width, el.height / img.height) * zoom;
    const dw = img.width * scale;
    const dh = img.height * scale;
    const [sx, sy] = SCREEN[set.current];
    // The screen's point moves from where cover-fit puts it toward the middle of the view as it zooms
    const x = el.width / 2 - sx * dw + ((sx - 0.5) * dw * (1 - push)) / zoom;
    const y = el.height / 2 - sy * dh + ((sy - 0.5) * dh * (1 - push)) / zoom;
    // A soft focus pull as it pushes in, which also hides the compression blocks of a frame enlarged nearly 3×
    ctx.filter = !LIGHT && push > 0.01 ? `blur(${(push * 10 * dpr).toFixed(1)}px)` : 'none';
    ctx.drawImage(img, x, y, dw, dh);
    ctx.filter = 'none';
    // Contact's background, as its own layer over the canvas, so the canvas's colour grade doesn't touch it
    wash.current.style.opacity = dim.toFixed(3);
  };
  // On every scroll (the progress stays at 0 while the film is still rising, but it has to know when it pins)
  useMotionValueEvent(scrollY, 'change', draw);

  // Load the frames for this screen's shape once the film is within a couple of screens
  useEffect(() => {
    const decoded = bitmaps.current;
    set.current = window.innerHeight > window.innerWidth ? 'tall' : 'wide';
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || blobs.current.length) return;
        blobs.current = new Array(COUNT).fill(null);
        for (let i = 0; i < COUNT; i += 1) {
          fetch(src(set.current, i * STEP))
            .then((r) => (r.ok ? r.blob() : null))
            .then((blob) => {
              blobs.current[i] = blob;
              if (blob && Math.abs(i - wanted.current) <= AHEAD) draw();
            })
            .catch(() => {});
        }
        observer.disconnect();
      },
      { rootMargin: '200% 0px' },
    );
    if (runway.current) observer.observe(runway.current);
    const onResize = () => draw();
    window.addEventListener('resize', onResize);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', onResize);
      decoded.forEach((bitmap) => bitmap?.close?.());
      decoded.clear();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      ref={runway}
      // A navbar glide between Skills and Contact spends 1 s on the film, so it still plays out
      data-slow-glide="1"
      data-slow-between="skills contact"
      aria-hidden
      className="pointer-events-none relative -mt-[100lvh] h-[200lvh]"
    >
      {/* Counts as Contact for the navbar once Skills has gone */}
      <span data-section-of="contact" className="absolute inset-x-0 bottom-0 h-[160lvh]" />
      {/* Its start, while the film is still rising after Skills, still counts as Skills (unmarked, the pinned hero made
          the navbar show Home) */}
      <span data-section-of="skills" className="absolute inset-x-0 top-0 h-[40lvh]" />
      {/* lvh throughout (also in Skills, its backdrop and Contact): the screen with the phone's browser bar hidden. Sized
          by svh, hiding the bar left a dark strip under the film */}
      <div ref={stage} className="sticky top-0 h-lvh overflow-hidden bg-ink opacity-0">
        {/* The grade is a CSS filter on the canvas: drawn per frame inside it, Safari ignores it and phones can't keep up */}
        <canvas ref={canvas} style={{ filter: FILM_GRADE }} className="absolute inset-0 size-full" />
        <div ref={wash} className="absolute inset-0 bg-crema opacity-0" />
      </div>
    </div>
  );
};

export default ContactFilm;
