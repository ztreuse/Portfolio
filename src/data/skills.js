import {
  SiAdobephotoshop,
  SiBootstrap,
  SiCodeigniter,
  SiCss3,
  SiDatabricks,
  SiExpo,
  SiFigma,
  SiFirebase,
  SiFramer,
  SiGit,
  SiGithub,
  SiHtml5,
  SiJavascript,
  SiMantine,
  SiPhp,
  SiPostgresql,
  SiPython,
  SiReact,
  SiTableau,
  SiTailwindcss,
} from 'react-icons/si';
import { LuChartBar, LuClipboardCheck, LuCloud, LuCode, LuNetwork, LuShieldCheck, LuVideo } from 'react-icons/lu';

// `color` is the official brand color, used for the icon and its hover glow.
const skillGroups = [
  {
    title: 'Programming Languages',
    items: [
      { name: 'HTML5', description: 'Markup', icon: SiHtml5, color: '#E34F26' },
      { name: 'CSS3', description: 'Styling', icon: SiCss3, color: '#1572B6' },
      { name: 'JavaScript', description: 'Language', icon: SiJavascript, color: '#F7DF1E' },
      { name: 'Python', description: 'General purpose', icon: SiPython, color: '#3776AB' },
      { name: 'PHP', description: 'Server-side language', icon: SiPhp, color: '#777BB4' },
    ],
  },
  {
    title: 'Front-End Development',
    items: [
      { name: 'React', description: 'UI library', icon: SiReact, color: '#61DAFB' },
      { name: 'React Native', description: 'Mobile apps', icon: SiReact, color: '#61DAFB' },
      { name: 'Tailwind CSS', description: 'Utility-first CSS', icon: SiTailwindcss, color: '#06B6D4' },
      { name: 'Mantine UI', description: 'Component library', icon: SiMantine, color: '#339AF0' },
      { name: 'Bootstrap', description: 'CSS framework', icon: SiBootstrap, color: '#7952B3' },
      { name: 'Expo', description: 'React Native toolchain', icon: SiExpo, color: '#FFFFFF' },
    ],
  },
  {
    title: 'Back-End & Databases',
    items: [
      { name: 'CodeIgniter', description: 'PHP framework', icon: SiCodeigniter, color: '#EF4223' },
      { name: 'PostgreSQL', description: 'Relational database', icon: SiPostgresql, color: '#4169E1' },
      { name: 'Firebase', description: 'Backend platform', icon: SiFirebase, color: '#FFCA28' },
    ],
  },
  {
    title: 'Design, Animation & Tools',
    items: [
      { name: 'Figma', description: 'UI/UX design', icon: SiFigma, color: '#F24E1E' },
      { name: 'Framer Motion', description: 'Animation library', icon: SiFramer, color: '#E93DE0' },
      { name: 'Photoshop', description: 'Image editing', icon: SiAdobephotoshop, color: '#31A8FF' },
      { name: 'CapCut', description: 'Video editing', icon: LuVideo, color: '#FFFFFF' },
      { name: 'VS Code', description: 'Code editor', icon: LuCode, color: '#007ACC' },
      { name: 'Git', description: 'Version control', icon: SiGit, color: '#F05032' },
      { name: 'GitHub', description: 'Code hosting', icon: SiGithub, color: '#FFFFFF' },
    ],
  },
  {
    title: 'Other Expertise',
    items: [
      { name: 'Networking', description: 'Cisco CCNA', icon: LuNetwork, color: '#049FD9' },
      { name: 'Cybersecurity', description: 'CCST, CyberOps', icon: LuShieldCheck, color: '#10B981' },
      { name: 'Project Management', description: 'PMI certified', icon: LuClipboardCheck, color: '#F97316' },
    ],
  },
  {
    title: 'Data & Analytics (Upskilling)',
    items: [
      { name: 'Power BI', description: 'Dashboards', icon: LuChartBar, color: '#F2C811' },
      { name: 'Tableau', description: 'Data visualization', icon: SiTableau, color: '#E97627' },
      { name: 'Azure Data Factory', description: 'Data pipelines', icon: LuCloud, color: '#0078D4' },
      { name: 'Databricks', description: 'Data lakes & warehouses', icon: SiDatabricks, color: '#FF3621' },
    ],
  },
];

export default skillGroups;
