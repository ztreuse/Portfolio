import { useState } from 'react';
import { useReducedMotion } from 'motion/react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { A11y, Autoplay, Keyboard, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import { LuBadgeCheck, LuChevronLeft, LuChevronRight } from 'react-icons/lu';
import IconButton from '../components/ui/IconButton';
import Reveal from '../components/ui/Reveal';
import Section from '../components/ui/Section';
import certifications from '../data/certifications';

const formatDate = (isoDate) =>
  new Date(`${isoDate}T00:00:00`).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

const pad = (n) => String(n).padStart(2, '0');

/** Badge artwork linking to the public Credly verification page (clickable only on the centered card). */
const CredlyBadge = ({ cert, interactive }) => (
  <a
    href={`https://www.credly.com/badges/${cert.badgeId}/public_url`}
    target="_blank"
    rel="noopener noreferrer"
    tabIndex={interactive ? undefined : -1}
    aria-label={`Verify ${cert.name} on Credly`}
    className={`group/badge block rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent ${
      interactive ? '' : 'pointer-events-none'
    }`}
  >
    <img
      src={cert.image}
      alt=""
      loading="lazy"
      className="size-44 object-contain drop-shadow-[0_12px_24px_rgb(0_0_0/0.18)] transition-transform duration-500 ease-out group-hover/badge:scale-105 sm:size-52 lg:size-60"
    />
  </a>
);

/** The centered card is full size; its neighbors shrink, dim and desaturate. */
const CertificationCard = ({ cert, isActive }) => (
  <article
    className={`grid h-full overflow-hidden rounded-2xl border bg-surface transition-[scale,opacity,filter,border-color,box-shadow] duration-700 ease-out md:grid-cols-2 ${
      isActive
        ? 'border-accent/30 opacity-100 shadow-[0_24px_70px_-24px_rgb(159_143_129/0.45)]'
        : 'scale-90 border-line opacity-35 grayscale'
    }`}
  >
    <div className="flex items-center justify-center bg-white px-6 py-10 md:order-last md:min-h-96">
      <CredlyBadge cert={cert} interactive={isActive} />
    </div>

    <div className="flex flex-col justify-between gap-8 p-6 sm:p-10">
      <div>
        <p className="font-display text-xs font-semibold tracking-[0.14em] text-accent uppercase">Issued by {cert.issuer}</p>
        <h3 className="mt-3 font-display text-xl leading-tight font-semibold text-white sm:text-2xl lg:text-3xl">
          {cert.name}
        </h3>
        <p className="mt-4 text-sm text-stone-400">{formatDate(cert.date)}</p>
      </div>

      <p className="flex items-center gap-2 text-sm text-stone-400">
        <LuBadgeCheck aria-hidden className="size-4.5 shrink-0 text-accent" />
        Click the badge to verify on Credly
      </p>
    </div>
  </article>
);

const Certifications = () => {
  const [swiper, setSwiper] = useState(null);
  const [index, setIndex] = useState(0);
  const reduceMotion = useReducedMotion();

  return (
    <Section
      id="certifications"
      eyebrow="03 — Certifications"
      title="Certifications"
      description="Industry-recognized credentials from Certiport, Cisco, and the Project Management Institute."
    >
      <Reveal>
        {/* Full-bleed track; the mask fades the peeking neighbors into the page at both edges */}
        <div className="relative left-1/2 w-screen -translate-x-1/2 mask-[linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
          <Swiper
            modules={[A11y, Autoplay, Keyboard, Pagination]}
            slidesPerView="auto"
            centeredSlides
            loop
            spaceBetween={16}
            speed={700}
            grabCursor
            slideToClickedSlide
            keyboard={{ enabled: true }}
            autoplay={reduceMotion ? false : { delay: 5000, disableOnInteraction: false, pauseOnMouseEnter: true }}
            pagination={{ el: '.certs-pagination', clickable: true }}
            onSwiper={setSwiper}
            onRealIndexChange={(s) => setIndex(s.realIndex)}
            className="py-6!"
          >
            {certifications.map((cert) => (
              <SwiperSlide key={cert.name} className="h-auto! w-[86vw]! max-w-5xl md:w-[72vw]!">
                {({ isActive }) => <CertificationCard cert={cert} isActive={isActive} />}
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        <div className="mt-6 flex items-center justify-between gap-6">
          <p className="font-display text-sm font-semibold whitespace-nowrap text-stone-500 tabular-nums">
            <span className="text-white">{pad(index + 1)}</span> / {pad(certifications.length)}
          </p>
          <div className="certs-pagination hidden justify-center sm:flex" />
          <div className="flex gap-3">
            <IconButton label="Previous certification" icon={LuChevronLeft} onClick={() => swiper?.slidePrev()} />
            <IconButton label="Next certification" icon={LuChevronRight} onClick={() => swiper?.slideNext()} />
          </div>
        </div>
      </Reveal>
    </Section>
  );
};

export default Certifications;
