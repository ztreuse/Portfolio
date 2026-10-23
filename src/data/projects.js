import tipsyTavern from '../assets/projects/tipsy-tavern.webp';
import ticap from '../assets/projects/ticap.webp';
import tourisla from '../assets/projects/tourisla.webp';
import ecocool from '../assets/projects/ecocool.webp';
import grooveGrounds from '../assets/projects/groove-grounds.webp';

const projects = [
  {
    name: 'Groove Grounds',
    role: 'UI/UX Designer & Full-Stack Developer',
    image: grooveGrounds,
    description:
      "A dance-themed coffee ordering web app where every drink is a dance style: the menu is The Lineup, the cart is your Playlist, and checkout is Showtime, with a Plain words switch for anyone who doesn't dance. Customers customize drinks or build their own, order for pickup now or book a time slot, and follow a live order tracker that updates in real time as staff move the order along in a Backstage dashboard. It includes group orders with quotes, loyalty points and levels, drink ratings, Google sign-in, and an owner dashboard with sales reports, a menu manager and schedule settings. Built from my own product spec and design system in Next.js, TypeScript, Supabase and Tailwind, and deployed on Vercel.",
    tools: ['Next.js', 'TypeScript', 'Supabase', 'PostgreSQL', 'Drizzle', 'Tailwind CSS', 'Motion', 'Vercel'],
    link: 'https://groove-grounds.vercel.app',
  },
  {
    name: 'Tourisla',
    role: 'Project Manager & Mobile Developer',
    image: tourisla,
    description:
      'A full-stack web and mobile tourism platform for Bantayan, Cebu, serving administrators, local businesses and visitors. It features an interactive map of attractions that hands off to Google Maps for turn-by-turn navigation, a registration portal with PayMongo fee processing, a QR-code scanning module staff use to verify visitors and track demographics, automated guide and operator accreditation with payment verification and Google Calendar sync, safety advisories, emergency incident logs, and a digital archive of local cultural media.',
    tools: ['React.js', 'React Native', 'PostgreSQL', 'Node.js', 'Express.js', 'Tailwind CSS', 'shadcn/ui'],
    link: 'https://tourisla.net/',
  },
  {
    name: 'Eco-Cool',
    role: 'UI/UX Designer',
    image: ecocool,
    description:
      'A high-fidelity Figma prototype for an eco-friendly brand. Users can buy mini fans with seed pockets, customize seed choices, donate seeds to environmental NGOs, find NGO-verified planting areas on a map, and track their personal reforestation contributions.',
    tools: ['Figma', 'Photoshop', 'Canva'],
    link: 'https://www.figma.com/proto/HLNCpuLjMihp36PbUrBKOo/ECO-COOL-DRAFT?node-id=77-720&p=f&t=Q0pHWvJxtKTeO1QA-0&scaling=contain&content-scaling=fixed&page-id=0%3A1',
  },
  {
    name: 'Tipsy Tavern',
    role: 'Front-End Developer',
    image: tipsyTavern,
    description:
      'A responsive liquor retail website built for our Advanced Web Design course, showcasing whiskey, wine, beer, and other spirits, with a working add-to-cart system and a custom dark mode toggle.',
    tools: ['HTML', 'CSS', 'JavaScript'],
    link: 'https://seeejaay.github.io/TroyKingdom-FEUTECH-AWD-TW24/index.html',
  },
  {
    name: 'TICAP 20 Awards Night Certificate',
    role: 'Graphic Designer',
    image: ticap,
    description:
      'An elegant certificate of recognition for the TICAP (Technology Innovation in Capstone Project) 20 Awards Night, designed for both FEU Institute of Technology and FEU Diliman.',
    tools: ['Canva', 'Photoshop'],
    link: 'https://www.canva.com/design/DAG0Jpo9hYg/irqoPNDgeEOC7DlISoi4eA/edit',
  },
];

export default projects;
