import { FaBriefcase, FaGithub, FaLinkedinIn } from 'react-icons/fa6';
import linkedinLogo from '../assets/brand-logos/linkedin.svg';
import githubLogo from '../assets/brand-logos/github.svg';
import jobstreetLogo from '../assets/brand-logos/jobstreet.png';

export const profile = {
  name: 'Troy Bay',
  role: 'Web Developer & UI/UX Designer',
  // Rotated in the hero headline.
  roles: ['Web Developer', 'UI/UX Designer', 'Mobile App Developer'],
  about:
    'BSIT-WMA graduate from FEU Tech with hands-on internship experience spanning UI/UX design and front-end engineering. Proven track record of conceptualizing user-centric designs and personally translating them into seamless, responsive web applications. Backed by mobile development experience and a solid full-stack foundation, I am a collaborative, end-to-end builder ready for immediate, full-time deployment.',
  tagline: "Building digital experiences with precision and passion. Let's create something extraordinary together.",
  email: 'tjansenzb2021@gmail.com',
  phone: '+63 976-056-3152',
  // BASE_URL keeps the link working under the /Portfolio/ GitHub Pages path.
  resume: `${import.meta.env.BASE_URL}resume.pdf`,
};

export const navLinks = [
  { id: 'hero', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'experience', label: 'Experience' },
  { id: 'certifications', label: 'Certifications' },
  { id: 'skills', label: 'Skills' },
  { id: 'projects', label: 'Projects' },
  { id: 'contact', label: 'Contact' },
];

// Professional profiles only (no personal social media). `handle` is the text shown in the Contact list.
// `icon` is the one-color mark for round icon buttons; `logo` is the original brand logo for the Contact list.
export const socials = [
  { label: 'LinkedIn', handle: 'Troy Bay', href: 'https://www.linkedin.com/in/troy-bay-57aa90391/', icon: FaLinkedinIn, logo: linkedinLogo },
  { label: 'GitHub', handle: 'ztreuse', href: 'https://github.com/ztreuse', icon: FaGithub, logo: githubLogo },
  { label: 'JobStreet', handle: 'Troy Bay', href: 'https://ph.jobstreet.com/profiles/troy-bay-q77cg9r0z8', icon: FaBriefcase, logo: jobstreetLogo },
];

// EmailJS public identifiers (safe to ship to the browser).
export const emailjsConfig = {
  serviceId: 'service_eursqxe',
  templateId: 'template_xup4mje',
  publicKey: 'YLAjLGPR4LkuUI-sq',
};
