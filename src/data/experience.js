// Logos are picked up by filename from src/assets/logos/ (e.g. feu-tech.png, simplevia.svg).
// Until a file exists, the timeline shows the `initials` monogram instead.
const logos = import.meta.glob('../assets/logos/*.{png,jpg,jpeg,svg,webp}', { eager: true, import: 'default' });
const logoFor = (name) => Object.entries(logos).find(([path]) => path.split('/').pop().startsWith(`${name}.`))?.[1];

export const experience = [
  {
    role: 'Web Development Intern (Front-End)',
    organization: 'Simplevia Technologies Inc.',
    logo: logoFor('simplevia'),
    initials: 'SV',
    period: 'Jan 2026 – Jul 2026',
    points: [
      'Collaborated with a cross-functional team to build and optimize user interfaces for internal software systems.',
      'Translated Figma mockups into production-ready front-end code using Tailwind CSS and Mantine.',
      'Followed component-based architecture and organized file structures to keep modules consistent.',
      'Used Git and GitHub for version control and team workflows.',
      'Tested and optimized applications for cross-browser compatibility.',
    ],
  },
];

export const education = [
  {
    role: 'BS Information Technology, Specialization in Web and Mobile Applications',
    organization: 'FEU Institute of Technology',
    logo: logoFor('feu-tech'),
    initials: 'FEU',
    period: '2022 – 2026',
    points: [
      'Completed all academic and internship requirements; graduating September 2026.',
      "CCSMA Dean's Lister (Bronze), August 2024 and April 2025.",
    ],
  },
];
