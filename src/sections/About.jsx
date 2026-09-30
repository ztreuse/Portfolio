import { LuMapPin } from 'react-icons/lu';
import Section from '../components/ui/Section';
import SectionHeading from '../components/ui/SectionHeading';
import Reveal from '../components/ui/Reveal';
import { profile } from '../data/site';
import profileImg from '../assets/images/profile.jpg';

const About = () => (
  <Section id="about">
    <div className="grid items-center gap-12 md:grid-cols-12 lg:gap-16">
      <Reveal x={-40} y={0} className="mx-auto w-full max-w-sm md:col-span-5 md:max-w-none">
        <img
          src={profileImg}
          alt="Troy Bay in an FEU Tech graduation toga"
          className="aspect-4/5 w-full rounded-2xl border border-line object-cover object-[50%_25%] shadow-2xl shadow-black/40"
        />
      </Reveal>

      <div className="md:col-span-7">
        <SectionHeading eyebrow="01 — About" title="About me" description={profile.about} />

        <Reveal as="p" delay={0.2} className="mt-6 flex items-center gap-2 text-stone-300">
          <LuMapPin aria-hidden className="size-4.5 text-accent" />
          Based in {profile.locationShort}
        </Reveal>
      </div>
    </div>
  </Section>
);

export default About;
