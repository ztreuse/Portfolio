import { FaEnvelope, FaGithub, FaLinkedinIn } from 'react-icons/fa6';

export const profile = {
  name: 'Troy Bay',
  role: 'Front-End Developer & UI/UX Designer',
  // Rotated in the hero headline.
  roles: ['Front-End Developer', 'UI/UX Designer', 'Mobile App Developer'],
  about:
    'I shape user-centered interfaces in Figma, then build them into responsive web and mobile applications, so the product that ships matches the product that was designed. I work best in collaborative, cross-functional teams, write clean component-based code, and sweat the details that make an interface feel polished. A BSIT graduate from FEU Tech, ready to contribute full-time.',
  // Under the name in the desktop side index (the projects' role says Full-Stack too)
  headline: 'Full-Stack Developer',
  // Over the email at the bottom of the desktop side index
  reachOut: 'For roles, projects or just a hello, reach me at',
  // The hero's small tag; leave it empty ('') to hide it.
  availability: 'Open to full-time roles',
  // Footer sign-off: the first sentence is shown muted, the rest bright.
  tagline: 'From the first sketch to the final commit. I care about every step in between.',
  email: 'tjansenzb2021@gmail.com',
  phone: '+63 976-056-3152',
  // Drives the local time (Contact, the side index and the menu show it with the UTC offset)
  timeZone: 'Asia/Manila',
  // City and country only, in the hero's time chip (the owner's call; no street, province or anything finer)
  location: 'Manila, PH',
  // BASE_URL keeps the link working under the /Portfolio/ GitHub Pages path.
  resume: `${import.meta.env.BASE_URL}resume.pdf`,
  // Page 1 of the résumé as an image, shown when the View Resume button is pointed at (re-make it when the PDF changes)
  resumePreview: `${import.meta.env.BASE_URL}resume-preview.webp`,
};

// The short line under a section's title, in my own words (only what's true)
export const intros = {
  experience: "Roles I've held and the work I did in them.",
  certifications: 'Verified on Credly, newest first.',
  skills: "What I design, build and ship with, plus what I'm learning next.",
};

export const navLinks = [
  { id: 'hero', label: 'Introduction' },
  { id: 'experience', label: 'Experience' },
  { id: 'projects', label: 'Projects' },
  { id: 'certifications', label: 'Certifications' },
  { id: 'skills', label: 'Tech Stack' },
  { id: 'contact', label: 'Contact' },
];

// Professional profiles only (no personal social media). `handle` is the link text shown in the Contact list; a
// profile without one (Email, which has its own row there) only appears as a round icon.
// `icon` is the one-color mark for the round icon buttons and the Contact list.
export const socials = [
  {
    label: 'LinkedIn',
    handle: 'in/troy-bay-57aa90391',
    href: 'https://www.linkedin.com/in/troy-bay-57aa90391/',
    icon: FaLinkedinIn,
  },
  { label: 'GitHub', handle: 'github.com/ztreuse', href: 'https://github.com/ztreuse', icon: FaGithub },
  { label: 'Email', href: 'mailto:tjansenzb2021@gmail.com', icon: FaEnvelope },
];

// EmailJS public identifiers (safe to ship to the browser).
export const emailjsConfig = {
  serviceId: 'service_eursqxe',
  templateId: 'template_xup4mje',
  publicKey: 'YLAjLGPR4LkuUI-sq',
};
