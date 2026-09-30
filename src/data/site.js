import { FaFacebookF, FaGithub, FaInstagram, FaLinkedinIn } from 'react-icons/fa6';

export const profile = {
  name: 'Troy Bay',
  role: 'Web Developer & UI/UX Designer',
  // Rotated in the hero headline.
  roles: ['Web Developer', 'UI/UX Designer', 'Mobile App Developer'],
  intro:
    'BSIT-WMA graduate from FEU Tech who designs user-centric interfaces and turns them into seamless, responsive web and mobile apps.',
  about:
    'BSIT-WMA graduate from FEU Tech with hands-on internship experience spanning UI/UX design and front-end engineering. Proven track record of conceptualizing user-centric designs and personally translating them into seamless, responsive web applications. Backed by mobile development experience and a solid full-stack foundation, I am a collaborative, end-to-end builder ready for immediate, full-time deployment.',
  tagline: "Building digital experiences with precision and passion. Let's create something extraordinary together.",
  email: 'tjansenzb2021@gmail.com',
  phone: '+63 976-056-3152',
  location: 'Meycauayan City, Bulacan, Philippines',
  locationShort: 'Bulacan, Philippines',
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

export const socials = [
  { label: 'GitHub', href: 'https://github.com/ztreuse', icon: FaGithub },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/troy-bay-57aa90391/', icon: FaLinkedinIn },
  { label: 'Instagram', href: 'https://www.instagram.com/tjzbay13/', icon: FaInstagram },
  { label: 'Facebook', href: 'https://www.facebook.com/troyjansen.bay', icon: FaFacebookF },
];

// EmailJS public identifiers (safe to ship to the browser).
export const emailjsConfig = {
  serviceId: 'service_eursqxe',
  templateId: 'template_xup4mje',
  publicKey: 'YLAjLGPR4LkuUI-sq',
};
