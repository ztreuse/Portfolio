import { LuClipboardCheck, LuNetwork, LuShieldCheck } from 'react-icons/lu';
import html5 from '../assets/brand-logos/html5.svg';
import css3 from '../assets/brand-logos/css3.svg';
import javascript from '../assets/brand-logos/javascript.svg';
import python from '../assets/brand-logos/python.svg';
import php from '../assets/brand-logos/php.svg';
import react from '../assets/brand-logos/react.svg';
import tailwindcss from '../assets/brand-logos/tailwindcss.svg';
import mantine from '../assets/brand-logos/mantine.svg';
import bootstrap from '../assets/brand-logos/bootstrap.svg';
import expo from '../assets/brand-logos/expo.svg';
import codeigniter from '../assets/brand-logos/codeigniter.svg';
import postgresql from '../assets/brand-logos/postgresql.svg';
import firebase from '../assets/brand-logos/firebase.svg';
import figma from '../assets/brand-logos/figma.svg';
import framer from '../assets/brand-logos/framer.svg';
import photoshop from '../assets/brand-logos/photoshop.svg';
import capcut from '../assets/brand-logos/capcut.png';
import vscode from '../assets/brand-logos/vscode.svg';
import git from '../assets/brand-logos/git.svg';
import github from '../assets/brand-logos/github.svg';
import powerBi from '../assets/brand-logos/power-bi.svg';
import tableau from '../assets/brand-logos/tableau.svg';
import azure from '../assets/brand-logos/azure.svg';
import databricks from '../assets/brand-logos/databricks.svg';
import nodejs from '../assets/brand-logos/nodejs.svg';
import claude from '../assets/brand-logos/claude.svg';
import cplusplus from '../assets/brand-logos/cplusplus.svg';
import java from '../assets/brand-logos/java.svg';

// Brands use their original full-color `logo` (white versions for black marks like GitHub, so they
// show on the dark theme). Generic skills use a Lucide `icon` instead. `color` tints the tile and drives the glow.
// Ordered so the two-column layout pairs related groups; "Other Languages" is basic knowledge only.
const skillGroups = [
  {
    title: 'Core Languages',
    items: [
      { name: 'HTML5', description: 'Markup', logo: html5, color: '#E34F26' },
      { name: 'CSS3', description: 'Styling', logo: css3, color: '#1572B6' },
      { name: 'JavaScript', description: 'Language', logo: javascript, color: '#F7DF1E' },
      { name: 'PHP', description: 'Server-side language', logo: php, color: '#777BB4' },
      { name: 'Python', description: 'General purpose', logo: python, color: '#3776AB' },
    ],
  },
  {
    title: 'Front-End & Mobile',
    items: [
      { name: 'React', description: 'UI library', logo: react, color: '#61DAFB' },
      { name: 'React Native', description: 'Mobile apps', logo: react, color: '#61DAFB' },
      { name: 'Tailwind CSS', description: 'Utility-first CSS', logo: tailwindcss, color: '#06B6D4' },
      { name: 'Mantine UI', description: 'Component library', logo: mantine, color: '#339AF0' },
      { name: 'Bootstrap', description: 'CSS framework', logo: bootstrap, color: '#7952B3' },
      { name: 'Expo', description: 'React Native toolchain', logo: expo, color: '#FFFFFF' },
    ],
  },
  {
    title: 'Back-End & Databases',
    items: [
      { name: 'Node.js', description: 'JavaScript runtime', logo: nodejs, color: '#5FA04E' },
      { name: 'CodeIgniter', description: 'PHP framework', logo: codeigniter, color: '#EF4223' },
      { name: 'PostgreSQL', description: 'Relational database', logo: postgresql, color: '#4169E1' },
      { name: 'Firebase', description: 'Backend platform', logo: firebase, color: '#FFCA28' },
    ],
  },
  {
    title: 'Design & Animation',
    items: [
      { name: 'Figma', description: 'UI/UX design', logo: figma, color: '#F24E1E' },
      { name: 'Framer Motion', description: 'Animation library', logo: framer, color: '#E93DE0' },
      { name: 'Photoshop', description: 'Image editing', logo: photoshop, color: '#31A8FF' },
      { name: 'CapCut', description: 'Video editing', logo: capcut, color: '#FFFFFF' },
    ],
  },
  {
    title: 'Tools & AI',
    items: [
      { name: 'VS Code', description: 'Code editor', logo: vscode, color: '#007ACC' },
      { name: 'Git', description: 'Version control', logo: git, color: '#F05032' },
      { name: 'GitHub', description: 'Code hosting', logo: github, color: '#FFFFFF' },
      { name: 'Claude', description: 'AI-assisted development', logo: claude, color: '#D97757' },
    ],
  },
  {
    title: 'Data & Analytics (Upskilling)',
    items: [
      { name: 'Power BI', description: 'Dashboards', logo: powerBi, color: '#F2C811' },
      { name: 'Tableau', description: 'Data visualization', logo: tableau, color: '#E97627' },
      { name: 'Azure Data Factory', description: 'Data pipelines', logo: azure, color: '#0078D4' },
      { name: 'Databricks', description: 'Data lakes & warehouses', logo: databricks, color: '#FF3621' },
    ],
  },
  {
    // Areas backed by certifications rather than claimed expertise.
    title: 'Certified Foundations',
    items: [
      { name: 'Networking', description: 'Cisco CCNA', icon: LuNetwork, color: '#049FD9' },
      { name: 'Cybersecurity', description: 'CCST, CyberOps', icon: LuShieldCheck, color: '#10B981' },
      { name: 'Project Management', description: 'PMI certified', icon: LuClipboardCheck, color: '#F97316' },
    ],
  },
  {
    title: 'Other Languages (Basic Knowledge)',
    items: [
      { name: 'C++', description: 'Systems programming', logo: cplusplus, color: '#00599C' },
      { name: 'Java', description: 'Object-oriented', logo: java, color: '#ED8B00' },
    ],
  },
];

export default skillGroups;
