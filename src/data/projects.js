import tipsyTavern from '../assets/projects/tipsy-tavern.webp';
import ticap from '../assets/projects/ticap.webp';
import tourisla from '../assets/projects/tourisla.webp';
import ecocool from '../assets/projects/ecocool.webp';
import grooveGrounds from '../assets/projects/groove-grounds.webp';
import nirvana from '../assets/projects/nirvana.webp';

// `year` is when it was made (a range when it ran across two). `details` opens in place under the project ("View details"): the idea, what I did, the flow as short steps and what
// makes it work. Keep it short and true (it comes from the resume and each project's own docs). Every project
// has `idea` and `did`; `flow` and `points` (the "How it works" tab) only where there's something to say.
const projects = [
  {
    name: 'Nirvana',
    year: '2026',
    role: 'UI/UX Designer & Full-Stack Developer',
    image: nirvana,
    description:
      'A manhwa reading website under an animated aurora sky, with a full-screen reader, a personal library, a community feed and Aura, a comet mascot who guides you around. Built in Laravel and Tailwind, deployed on Vercel.',
    tools: [
      'Laravel',
      'PHP',
      'Blade',
      'Tailwind CSS',
      'JavaScript',
      'PostgreSQL',
      'Neon',
      'Vercel',
      'MangaDex API',
      'Pest',
    ],
    link: 'https://nirvana-reader.vercel.app',
    details: {
      idea: 'A calm place to read Korean manhwa in English, with no ads, paywalls or popups.',
      did: [
        'Designed the night-sky look: the moving aurora, the icons and Aura, the mascot.',
        'Built the reader, library, reviews and community in Laravel and Blade.',
        'Covered the main features with Pest tests.',
      ],
      flow: ['MangaDex API', 'Cached by Laravel', 'Series page', 'Reader', 'Library and community'],
      points: [
        'API responses are cached, because MangaDex limits requests and every visitor shares them.',
        'Chapter images load straight from MangaDex, with the scanlation group credited.',
        'Shelves, reading progress, reviews and threads live in its own database.',
      ],
    },
  },
  {
    name: 'Groove Grounds',
    year: '2026',
    role: 'UI/UX Designer & Full-Stack Developer',
    image: grooveGrounds,
    description:
      "A dance-themed coffee ordering web app where every drink is a dance style: the menu is The Lineup, the cart is your Playlist, and checkout is Showtime, with a Plain words switch for anyone who doesn't dance. Customers customize drinks or build their own, order for pickup now or book a time slot, and follow a live order tracker that updates in real time as staff move the order along in a Backstage dashboard. It includes group orders with quotes, loyalty points and levels, drink ratings, Google sign-in, and an owner dashboard with sales reports, a menu manager and schedule settings. Built from my own product spec and design system in Next.js, TypeScript, Supabase and Tailwind, and deployed on Vercel.",
    tools: ['Next.js', 'TypeScript', 'Supabase', 'PostgreSQL', 'Drizzle', 'Tailwind CSS', 'Motion', 'Vercel'],
    link: 'https://groove-grounds.vercel.app',
    details: {
      idea: 'Every label speaks dance, but someone who has never danced must still be able to order without confusion.',
      did: [
        'Wrote the product spec and design system, then built the full site from them.',
        'Developed drink customization, slot booking and the live order tracker.',
        'Added group orders, loyalty points, ratings and an owner dashboard.',
      ],
      flow: ['Menu', 'Customize', 'Cart', 'Checkout', 'Staff queue', 'Live tracker'],
      points: [
        'One switch swaps every label between dance terms and plain words, and remembers the choice.',
        'The customer sees each step live as staff move the order along.',
        'Prices are recalculated on the server at checkout.',
      ],
    },
  },
  {
    name: 'Tourisla',
    year: '2024–2025',
    role: 'Project Manager & Mobile Developer',
    image: tourisla,
    description:
      'A full-stack web and mobile tourism platform for Bantayan, Cebu, serving administrators, local businesses and visitors. It features an interactive map of attractions that hands off to Google Maps for turn-by-turn navigation, a registration portal with PayMongo fee processing, a QR-code scanning module staff use to verify visitors and track demographics, automated guide and operator accreditation with payment verification and Google Calendar sync, safety advisories, emergency incident logs, and a digital archive of local cultural media.',
    tools: ['React.js', 'React Native', 'PostgreSQL', 'Node.js', 'Express.js', 'Tailwind CSS', 'shadcn/ui'],
    link: 'https://tourisla.net/',
    details: {
      idea: 'One web and mobile platform for the visitors, local businesses and administrators of Bantayan, Cebu.',
      did: [
        'Managed the project and co-developed the platform.',
        'Built the mobile app for tourists, for easier access to Tourisla, and for tourism staff, who scan QR codes to track visitors.',
        'Implemented PayMongo registration and QR-code scanning.',
      ],
      flow: [
        'Visitor registers',
        'Pays with PayMongo',
        'Staff scan the QR code',
        'Visitor verified',
        'Demographics tracked',
      ],
      points: [
        'Guide and operator accreditation is automated, with payment checks and Google Calendar sync.',
        'Safety advisories and incident logs keep administrators informed.',
        'A digital archive preserves local cultural media.',
      ],
    },
  },
  {
    name: 'Eco-Cool',
    year: '2024',
    role: 'UI/UX Designer',
    image: ecocool,
    description:
      'A high-fidelity Figma prototype for an eco-friendly brand. Users can buy mini fans with seed pockets, customize seed choices, donate seeds to environmental NGOs, find NGO-verified planting areas on a map, and track their personal reforestation contributions.',
    tools: ['Figma', 'Photoshop', 'Canva'],
    details: {
      idea: 'An eco-friendly brand where buying a mini fan also supports reforestation.',
      did: [
        'Designed the high-fidelity prototype and its user flows in Figma.',
        'Mapped the flows for buying, customizing seeds and donating them to NGOs.',
      ],
      flow: ['Buy a mini fan', 'Choose the seeds', 'Plant or donate', 'Track your contribution'],
      points: [
        'A map shows planting areas verified by NGOs.',
        "A tracker page visualizes each user's reforestation contributions.",
      ],
    },
    link: 'https://www.figma.com/proto/HLNCpuLjMihp36PbUrBKOo/ECO-COOL-DRAFT?node-id=77-720&p=f&t=Q0pHWvJxtKTeO1QA-0&scaling=contain&content-scaling=fixed&page-id=0%3A1',
  },
  {
    name: 'Tipsy Tavern',
    year: '2023',
    role: 'Front-End Developer',
    image: tipsyTavern,
    description:
      'A responsive liquor retail website built for our Advanced Web Design course, showcasing whiskey, wine, beer, and other spirits, with a working add-to-cart system and a custom dark mode toggle.',
    tools: ['HTML', 'CSS', 'JavaScript'],
    link: 'https://seeejaay.github.io/Tipsy-Tavern/',
    details: {
      idea: 'A liquor retail website for our Advanced Web Design course.',
      did: ['Built the front end in HTML, CSS and JavaScript.'],
    },
  },
  {
    name: 'TICAP 20 Awards Night Certificate',
    year: '2025',
    role: 'Graphic Designer',
    image: ticap,
    description:
      'An elegant certificate of recognition for the TICAP (Technology Innovation in Capstone Project) 20 Awards Night, designed for both FEU Institute of Technology and FEU Diliman.',
    tools: ['Canva', 'Photoshop'],
    link: 'https://www.canva.com/design/DAG0Jpo9hYg/irqoPNDgeEOC7DlISoi4eA/edit',
    details: {
      idea: 'One certificate of recognition for both FEU Institute of Technology and FEU Diliman.',
      did: ['Designed the certificate in Canva and Photoshop.'],
    },
  },
];

export default projects;
