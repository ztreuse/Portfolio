import { useRef } from 'react';
import { motion, useReducedMotion, useSpring } from 'motion/react';
import { LuArrowUpRight } from 'react-icons/lu';
import { intros } from '../data/site';
import Section from '../components/ui/Section';
import { RevealGroup, RevealItem } from '../components/ui/Reveal';
import certifications from '../data/certifications';

const formatDate = (isoDate) =>
  new Date(`${isoDate}T00:00:00`).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

// Every credential under its issuer: the issuer with the most first, and newest first within each
const issuers = [...new Set(certifications.map((c) => c.issuer))]
  .map((issuer) => ({
    issuer,
    items: certifications.filter((c) => c.issuer === issuer).sort((a, b) => b.date.localeCompare(a.date)),
  }))
  .sort((a, b) => b.items.length - a.items.length);

const TILT = 14; // degrees a badge leans toward the pointer
const tiltSpring = { stiffness: 220, damping: 20 };

/**
 * One credential: its badge, name and date; the whole card opens its Credly verification page. Pointing at it leans the
 * badge toward the pointer in 3D with a glint that follows it, masked to the badge's own shape like foil. No tilt for
 * reduced motion (and none on touch, where there's no pointer to follow).
 */
const Credential = ({ cert }) => {
  const reduceMotion = useReducedMotion();
  const rotateX = useSpring(0, tiltSpring);
  const rotateY = useSpring(0, tiltSpring);
  const glint = useRef(null);

  const lean = (e) => {
    if (reduceMotion || e.pointerType !== 'mouse') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    rotateY.set((px - 0.5) * TILT * 2);
    rotateX.set((0.5 - py) * TILT * 2);
    glint.current?.style.setProperty('--gx', `${px * 100}%`);
    glint.current?.style.setProperty('--gy', `${py * 100}%`);
  };
  const settle = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  // Clip the glint to the badge's opaque pixels
  const badgeShape = {
    maskImage: `url(${cert.image})`,
    WebkitMaskImage: `url(${cert.image})`,
    maskSize: 'contain',
    WebkitMaskSize: 'contain',
    maskRepeat: 'no-repeat',
    WebkitMaskRepeat: 'no-repeat',
    maskPosition: 'center',
    WebkitMaskPosition: 'center',
  };

  return (
    <a
      href={`https://www.credly.com/badges/${cert.badgeId}/public_url`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Verify ${cert.name} on Credly`}
      onPointerMove={lean}
      onPointerLeave={settle}
      className="group flex h-full items-stretch gap-4 rounded-2xl border border-line bg-surface p-2.5 pr-4 sm:p-3 sm:pr-4 transition-[border-color,box-shadow] duration-300 hover:border-matcha/60 hover:shadow-[0_18px_40px_-24px_rgb(60_45_30/0.6)]"
    >
      {/* A fixed warm paper white (in the light theme "white" is dark), so dark badges like CCST read too */}
      <span className="flex size-16 shrink-0 items-center justify-center self-center rounded-xl sm:size-20 bg-[radial-gradient(ellipse_at_50%_42%,#fffdf9_0%,#f4eee6_60%,#e9e0d4_100%)]">
        <motion.span
          style={{ rotateX, rotateY, transformPerspective: 500 }}
          className="relative block size-13 sm:size-16"
        >
          <img src={cert.image} alt="" loading="lazy" width="192" height="192" className="size-full object-contain" />
          <span
            ref={glint}
            aria-hidden
            style={badgeShape}
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_var(--gx,50%)_var(--gy,40%),rgb(255_255_255/0.7),transparent_50%)] opacity-0 mix-blend-screen transition-opacity duration-300 group-hover:opacity-100"
          />
        </motion.span>
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-2 py-0.5">
        <span className="block font-display text-copy leading-snug font-semibold text-balance text-white">
          {cert.name}
        </span>
        <span className="-mt-1.5 block text-sm text-stone-400">{formatDate(cert.date)}</span>
        {/* What clicking does, alone in the bottom-right corner of every card; it fills taupe while the card is pointed at */}
        <span className="mt-auto inline-flex items-center gap-1 self-end rounded-full border border-white/15 px-3 py-1 text-sm font-medium whitespace-nowrap text-stone-300 transition-colors duration-300 group-hover:border-transparent group-hover:bg-matcha group-hover:text-ink group-focus-visible:border-transparent group-focus-visible:bg-matcha group-focus-visible:text-ink">
          Verify credential
          <LuArrowUpRight
            aria-hidden
            className="size-3.5 transition-[translate] duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none"
          />
        </span>
      </span>
    </a>
  );
};

/**
 * Every credential at once, grouped by issuer in rows like Experience (issuer and count on the left, its credentials
 * on the right), with nothing to operate: the whole card is the link. It replaced a rotating 3D ring that showed one
 * card at a time and needed arrows, dragging and autoplay.
 */
const Certifications = () => (
  <Section id="certifications" title="Credentials I've earned" intro={intros.certifications}>
    {issuers.map(({ issuer, items }) => (
      <div
        key={issuer}
        className="grid gap-4 border-b border-line py-7 first:pt-0 last:border-b-0 last:pb-0 lg:grid-cols-12 lg:gap-8"
      >
        <div className="flex items-baseline justify-between gap-4 lg:col-span-3 lg:block">
          <h3 className="font-display text-item leading-snug font-bold text-balance text-white">{issuer}</h3>
          <p className="shrink-0 font-mono text-label font-medium tracking-[0.08em] text-accent uppercase lg:mt-1">
            {items.length} {items.length === 1 ? 'credential' : 'credentials'}
          </p>
        </div>
        <RevealGroup as="ul" stagger={0.05} className="grid gap-3 md:grid-cols-2 lg:col-span-9">
          {items.map((cert) => (
            <RevealItem as="li" key={cert.badgeId}>
              <Credential cert={cert} />
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    ))}
  </Section>
);

export default Certifications;
