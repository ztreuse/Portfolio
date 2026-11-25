import { FaEnvelope, FaGithub, FaLinkedinIn } from 'react-icons/fa6';

export const profile = {
  name: 'Troy Bay',
  role: 'Front-End Developer & UI/UX Designer',
  // Rotated in the hero headline.
  roles: ['Front-End Developer', 'UI/UX Designer', 'Mobile App Developer'],
  about:
    "I shape user-centered interfaces in Figma, then build them into responsive web and mobile applications, so the product that ships matches the product that was designed. I work best in collaborative, cross-functional teams, write clean component-based code, and sweat the details that make an interface feel polished. A BSIT graduate from FEU Tech, ready to contribute full-time.",
  // The hero's small tag; leave it empty ('') to hide it.
  availability: 'Open to full-time roles',
  // Footer sign-off: the first sentence is shown muted, the rest bright.
  tagline: 'From the first sketch to the final commit. I care about every step in between.',
  email: 'tjansenzb2021@gmail.com',
  phone: '+63 976-056-3152',
  // Drives the local time in Contact, which shows the UTC offset only (no city: locations stay off the site).
  timeZone: 'Asia/Manila',
  // BASE_URL keeps the link working under the /Portfolio/ GitHub Pages path.
  resume: `${import.meta.env.BASE_URL}resume.pdf`,
};

export const navLinks = [
  { id: 'hero', label: 'Home' },
  { id: 'projects', label: 'Projects' },
  { id: 'experience', label: 'Experience' },
  { id: 'education', label: 'Education' },
  { id: 'certifications', label: 'Certifications' },
  { id: 'skills', label: 'Skills' },
  { id: 'contact', label: 'Contact' },
];

// Professional profiles only (no personal social media). `handle` is the link text shown in the Contact list; a
// profile without one (Email, which has its own row there) only appears as a round icon.
// `icon` is the one-color mark for the round icon buttons and the Contact list.
export const socials = [
  { label: 'LinkedIn', handle: 'in/troy-bay-57aa90391', href: 'https://www.linkedin.com/in/troy-bay-57aa90391/', icon: FaLinkedinIn },
  { label: 'GitHub', handle: 'github.com/ztreuse', href: 'https://github.com/ztreuse', icon: FaGithub },
  { label: 'Email', href: 'mailto:tjansenzb2021@gmail.com', icon: FaEnvelope },
];

// EmailJS public identifiers (safe to ship to the browser).
export const emailjsConfig = {
  serviceId: 'service_eursqxe',
  templateId: 'template_xup4mje',
  publicKey: 'YLAjLGPR4LkuUI-sq',
};
