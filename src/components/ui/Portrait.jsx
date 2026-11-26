import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'motion/react';
import { LuFingerprint } from 'react-icons/lu';
import profileImg from '../../assets/images/profile.webp';

const PAD = 72; // px: how far the particles may fly past the frame
const TOUCH_WAIT = 160; // ms: a touch becomes a hold only if it stays put (a swipe scrolls the page)

// The particles' code is heavy (Three.js), so it loads only when someone reaches for the photo
let loading;
const load = () => (loading ??= import('../../three/tamaraw'));

/**
 * The grad photo in a thin taupe frame. Press and hold it (a dial in the corner fills while held) and it breaks into particles
 * that gather into the FEU Tech tamaraw, with the frame gone; let go and they flow back into the photo (see three/tamaraw.js). Works with a mouse, a touch or the
 * Space and Enter keys. Without WebGL or with reduced motion it's just the photo. On phones the frame is as wide as the
 * text and crops to head and shoulders.
 */
const Portrait = () => {
  const reduceMotion = useReducedMotion();
  const image = useRef(null);
  const canvas = useRef(null);
  const scene = useRef(null); // a promise of the particles, once asked for
  const held = useRef(false);
  const wait = useRef(0);
  const [away, setAway] = useState(false); // the photo is particles
  const [pressed, setPressed] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(
    () => () => {
      clearTimeout(wait.current);
      scene.current?.then((s) => s?.dispose());
    },
    [],
  );

  const getScene = () => {
    scene.current ??= load()
      .then((m) =>
        m.createTamaraw({
          canvas: canvas.current,
          image: image.current,
          pad: PAD,
          onStart: () => setAway(true),
          onRest: () => setAway(false),
        }),
      )
      .catch(() => {
        setFailed(true);
        return null;
      });
    return scene.current;
  };

  const start = async (x, y) => {
    held.current = true;
    setPressed(true);
    const s = await getScene();
    if (held.current) s?.hold(x, y); // let go while it loaded: nothing to do
  };
  const stop = () => {
    clearTimeout(wait.current);
    held.current = false;
    setPressed(false);
    scene.current?.then((s) => s?.release());
  };

  const onPointerDown = (e) => {
    if (e.button !== 0) return;
    const r = image.current.getBoundingClientRect();
    const point = [e.clientX - r.left, e.clientY - r.top];
    if (e.pointerType === 'mouse') {
      e.currentTarget.setPointerCapture(e.pointerId); // keeps holding if the cursor slips off the photo
      start(...point);
    } else {
      load();
      wait.current = setTimeout(() => start(...point), TOUCH_WAIT);
    }
  };
  const isKey = (e) => e.key === ' ' || e.key === 'Enter';
  const playful = !reduceMotion && !failed;

  return (
    <div className="group relative aspect-5/4 w-full sm:aspect-4/5">
      <div
        className={`absolute inset-0 rounded-2xl border transition-colors duration-300 ${
          away ? 'border-transparent' : 'border-accent bg-surface'
        }`}
      >
        <img
          ref={image}
          src={profileImg}
          alt="Troy Bay in an FEU Tech graduation toga"
          width="760"
          height="1140"
          draggable={false}
          className={`size-full rounded-[15px] object-cover object-[50%_11%] select-none sm:object-[50%_22%] ${
            away ? 'opacity-0' : ''
          }`}
        />
      </div>

      {playful && (
        <>
          {/* Overhangs the frame (by PAD, plus its 1px border) so the particles can fly past it */}
          <canvas
            ref={canvas}
            aria-hidden
            className={`pointer-events-none absolute -inset-[71px] z-10 h-[calc(100%+142px)] w-[calc(100%+142px)] ${
              away ? '' : 'invisible'
            }`}
          />
          <button
            type="button"
            aria-label="Hold to turn the photo into the FEU Tech tamaraw"
            onPointerEnter={(e) => e.pointerType === 'mouse' && load()}
            onPointerDown={onPointerDown}
            onPointerUp={stop}
            onPointerCancel={stop}
            // However the press ends (released outside the window, say), let go
            onLostPointerCapture={stop}
            onPointerMove={(e) => held.current && e.pointerType === 'mouse' && e.buttons === 0 && stop()}
            onContextMenu={(e) => e.preventDefault()}
            onKeyDown={(e) => {
              if (!isKey(e)) return;
              e.preventDefault();
              if (!e.repeat) start(image.current.clientWidth / 2, image.current.clientHeight / 2);
            }}
            onKeyUp={(e) => isKey(e) && stop()}
            onBlur={stop}
            className="absolute inset-0 z-20 touch-pan-y rounded-2xl select-none [-webkit-touch-callout:none]"
          >
            {/* The hint: a small dial in the corner whose matcha ring fills while it's held, over the time the logo takes
                to form (1.9 s, HOLD_TIME in three/tamaraw.js), then it fades; let go early and the ring drains back */}
            <span
              className={`absolute right-3 bottom-3 flex items-center gap-2 rounded-full bg-[#161513]/65 py-1 pr-3 pl-1 font-mono text-label font-medium text-[#f4ece3] backdrop-blur-sm transition-opacity ${
                pressed ? 'opacity-0 delay-[1900ms] duration-300' : 'duration-300'
              }`}
            >
              <span className="relative flex size-8 items-center justify-center">
                <svg viewBox="0 0 32 32" aria-hidden className="absolute inset-0 size-full -rotate-90">
                  <circle
                    cx="16"
                    cy="16"
                    r="14.5"
                    fill="none"
                    stroke="#f4ece3"
                    strokeOpacity="0.25"
                    strokeWidth="1.5"
                  />
                  <circle
                    cx="16"
                    cy="16"
                    r="14.5"
                    fill="none"
                    stroke="#a3b97c"
                    strokeWidth="2"
                    pathLength="1"
                    strokeDasharray="1"
                    className={`transition-[stroke-dashoffset] ease-linear ${
                      pressed ? '[stroke-dashoffset:0] duration-[1900ms]' : '[stroke-dashoffset:1] duration-500'
                    }`}
                  />
                </svg>
                <LuFingerprint aria-hidden className="size-4 text-[#a3b97c]" />
              </span>
              Hold
            </span>
          </button>
        </>
      )}
    </div>
  );
};

export default Portrait;
