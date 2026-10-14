import { FaBriefcase, FaGithub, FaLinkedinIn } from 'react-icons/fa6';
import linkedinLogo from '../assets/brand-logos/linkedin.svg';
import githubLogo from '../assets/brand-logos/github.svg';
import jobstreetLogo from '../assets/brand-logos/jobstreet.png';

export const profile = {
  name: 'Troy Bay',
  role: 'Front-End Developer & UI/UX Designer',
  // Rotated in the hero headline.
  roles: ['Front-End Developer', 'UI/UX Designer', 'Mobile App Developer'],
  about:
    "Front-end developer and UI/UX designer who bridges design and code. I shape user-centered interfaces in Figma, then build them into responsive web and mobile applications, so the product that ships matches the product that was designed. I work best in collaborative, cross-functional teams, write clean component-based code, and sweat the details that make an interface feel polished. A BSIT graduate from FEU Tech, ready to contribute full-time.",
  // Footer sign-off: the first sentence is shown muted, the rest bright.
  tagline: 'From the first sketch to the final commit. I care about every step in between.',
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
