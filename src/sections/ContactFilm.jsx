import { useEffect, useRef } from 'react';
import { useMotionValueEvent, useScroll } from 'motion/react';

const clamp01 = (v) => Math.min(Math.max(v, 0), 1);
const smooth = (x) => x * x * (3 - 2 * x);
const FRAMES = 120;
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
 * Into it, a soft edge: the runway starts right after Skills (no overlap, so there's breathing room between the last
 * cards and the monitors), and the film rises up the screen with a feathered top edge (a mask that fades its top 40% of a screen into Skills), which tightens to a
 * crisp edge as the film reaches the top and pins, then the dolly plays. At the end the stage simply scrolls away into
 * Contact's matching background. Frames load only when it's near. Render it only when motion is allowed.
 */
const ContactFilm = () => {
  const runway = useRef(null);
  const stage = useRef(null);
  const canvas = useRef(null);
  const images = useRef([]);
  const set = useRef('wide');
  // 0 as the stage pins (its top reaches the top of the screen), 1 as it lets go (Contact's top at the bottom)
  const { scrollYProgress } = useScroll({ target: runway, offset: ['start start', 'end end'] });
  const { scrollY } = useScroll();

  const draw = () => {
    const el = canvas.current;
    if (!el || !stage.current) return;
    const p = scrollYProgress.get();
    // The feathered top edge while the film rises over the end of Skills, crisp once it reaches the top
    const vh = window.innerHeight;
    const top = stage.current.getBoundingClientRect().top;
    const feather = 0.4 * vh * smooth(clamp01(top / (0.4 * vh)));
    const mask = feather > 1 ? `linear-gradient(to bottom, transparent, black ${feather.toFixed(0)}px)` : 'none';
    stage.current.style.maskImage = mask;
    stage.current.style.webkitMaskImage = mask;
    const play = clamp01(p / 0.6);
    // Then the push into the left monitor's screen, settling onto its flat colour (Contact's background)
    const push = smooth(clamp01((p - 0.6) / 0.22));
    const dim = smooth(clamp01((p - 0.68) / 0.18));
    // Once it has settled on Contact's light colour, the navbar turns to light glass over it too
    stage.current.toggleAttribute('data-nav-light', dim > 0.5);
    let i = Math.round(play * (FRAMES - 1));
    // Draw the nearest frame that has loaded
    while (i > 0 && !images.current[i]?.complete) i -= 1;
    const img = images.current[i];
    if (!img?.complete || !img.naturalWidth) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = el.clientWidth;
    const h = el.clientHeight;
    if (el.width !== Math.round(w * dpr) || el.height !== Math.round(h * dpr)) {
      el.width = Math.round(w * dpr);
      el.height = Math.round(h * dpr);
    }
    const ctx = el.getContext('2d');
    // Cover the screen, like object-cover, zoomed in toward the monitor's screen during the push
    const zoom = 1 + 1.8 * push;
    const scale = Math.max(el.width / img.naturalWidth, el.height / img.naturalHeight) * zoom;
    const dw = img.naturalWidth * scale;
    const dh = img.naturalHeight * scale;
    const [sx, sy] = SCREEN[set.current];
    // The screen's point moves from where cover-fit puts it toward the middle of the view as it zooms
    const x = el.width / 2 - sx * dw + ((sx - 0.5) * dw * (1 - push)) / zoom;
    const y = el.height / 2 - sy * dh + ((sy - 0.5) * dh * (1 - push)) / zoom;
    // A soft focus pull as it pushes in, which also hides the compression blocks of a frame enlarged nearly 3×
    const filters = [];
    if (push > 0.01) filters.push(`blur(${(push * 10 * dpr).toFixed(1)}px)`);
    ctx.filter = filters.length ? filters.join(' ') : 'none';
    ctx.drawImage(img, x, y, dw, dh);
    ctx.filter = 'none';
    if (dim > 0) {
      ctx.fillStyle = `rgba(194, 177, 154, ${dim.toFixed(3)})`; // the screen colour, Contact's background
      ctx.fillRect(0, 0, el.width, el.height);
    }
  };
  // On every scroll (the progress stays at 0 while the film is still rising, but its edge has to follow)
  useMotionValueEvent(scrollY, 'change', draw);

  // Load the frames for this screen's shape once the film is within a couple of screens
  useEffect(() => {
    set.current = window.innerHeight > window.innerWidth ? 'tall' : 'wide';
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || images.current.length) return;
        images.current = Array.from({ length: FRAMES }, (_, i) => {
          const img = new Image();
          img.decoding = 'async';
          img.onload = draw;
          img.src = src(set.current, i);
          return img;
        });
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
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      ref={runway}
      // A navbar glide between Skills and Contact spends 2.5 s on the film, so it plays out
      data-slow-glide="2.5"
      data-slow-between="skills contact"
      aria-hidden
      className="pointer-events-none relative h-[260svh]"
    >
      {/* Counts as Contact for the navbar once Skills has gone */}
      <span data-section-of="contact" className="absolute inset-x-0 bottom-0 h-[220svh]" />
      {/* Its start, while the film is still rising after Skills, still counts as Skills (unmarked, the pinned hero made
          the navbar show Home) */}
      <span data-section-of="skills" className="absolute inset-x-0 top-0 h-[40svh]" />
      <div ref={stage} className="sticky top-0 h-svh overflow-hidden bg-ink">
        <canvas ref={canvas} className="absolute inset-0 size-full" />
      </div>
    </div>
  );
};

export default ContactFilm;
