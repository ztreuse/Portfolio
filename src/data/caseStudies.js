import grooveCover from '../assets/projects/groove-grounds.webp';
import lineupDance from '../assets/case-studies/groove-grounds/lineup-dance.webp';
import lineupPlain from '../assets/case-studies/groove-grounds/lineup-plain.webp';
import drinkRemix from '../assets/case-studies/groove-grounds/drink-remix.webp';
import freestyle from '../assets/case-studies/groove-grounds/freestyle.webp';
import dictionary from '../assets/case-studies/groove-grounds/dictionary.webp';
import phoneDance from '../assets/case-studies/groove-grounds/m-dance.webp';
import phonePlain from '../assets/case-studies/groove-grounds/m-plain.webp';
import phoneRemix from '../assets/case-studies/groove-grounds/m-remix.webp';

// One entry per case study, keyed by the slug in its address (/groove-grounds/). To add one: an entry here, a
// `caseStudy` slug on its project in projects.js, and a <slug>/index.html copied from groove-grounds/.
// Everything in an entry must be true of the project: no invented research, metrics or quotes. Each section has a title
// and blocks: { text }, { points }, or { figures } (shown side by side; `phone` ones keep a phone's shape).
const caseStudies = {
  // Sources: the project's README, docs/PROJECT.md, docs/DESIGN.md, docs/WALKTHROUGH.md, PROMPTS.md and commit history
  'groove-grounds': {
    title: 'Groove Grounds',
    summary:
      'A concept coffee shop where every drink is a dance style and every button speaks dance. The design problem: someone who has never danced still has to order a latte without thinking about it.',
    facts: [
      ['Role', 'UI/UX Designer & Full-Stack Developer'],
      ['Type', 'Concept project, working demo'],
      ['When', 'October 2026'],
      ['Built with', 'Next.js, TypeScript, Supabase, Tailwind CSS'],
    ],
    links: [
      ['Open the live site', 'https://groove-grounds.vercel.app'],
      ['View the code', 'https://github.com/ztreuse/groove-grounds'],
    ],
    cover: {
      src: grooveCover,
      alt: 'Groove Grounds home page with the headline Coffee with a beat over a photo of a dancer',
    },
    sections: [
      {
        title: 'The problem',
        blocks: [
          {
            text: 'The hook is a vocabulary. The menu is The Lineup, the cart is your Playlist and checkout is Showtime. It gives the shop its personality, and it could easily leave a non-dancer lost.',
          },
          {
            text: 'It is made for dancers, dance students and studio crews, but anyone must be able to order without confusion. The rule for every label: the dance term comes first, with the plain meaning right under it or a tap away.',
          },
          {
            points: [
              'One shop, pickup only, no delivery.',
              'The whole order flow had to work end to end, with no real money moving.',
            ],
          },
        ],
      },
      {
        title: 'Two languages, one layout',
        blocks: [
          {
            text: 'A switch in the header swaps every label between dance terms and plain words, and the site remembers the choice. The layout, icons and order of things stay where people expect them. Only the wording changes.',
          },
          {
            figures: [
              { src: lineupDance, alt: 'The menu page in dance terms, titled The Lineup', caption: 'Dance terms' },
              { src: lineupPlain, alt: 'The same menu page in plain words, titled Menu', caption: 'Plain words' },
            ],
          },
          {
            points: [
              'Drink names stay as dance styles in both, because they are the brand. Each one carries a plain description, such as "vanilla latte".',
              'Every label lives in one of two dictionaries with the same keys, never inside a component.',
              'Screen readers always get the plain word.',
            ],
          },
        ],
      },
      {
        title: 'Meaning where you need it',
        blocks: [
          {
            text: 'The dance wording explains itself too. Labels carry a small plain line underneath, and any button that commits money or time always shows both words.',
          },
          {
            figures: [
              {
                src: drinkRemix,
                alt: 'The drink customization panel, where Foundation is labelled Milk and Flavor is labelled Syrups and flavors',
                caption: 'Customizing a drink: each option says what it means, with a "?" for why',
              },
              {
                src: dictionary,
                alt: 'The Dance Dictionary page, listing each term with its plain meaning',
                caption: 'The Dance Dictionary explains every term',
              },
            ],
          },
          {
            points: [
              'A three-step welcome on the first visit points out the menu, the cart and the switch. It can be skipped and shows once.',
              'A "?" beside a term opens its meaning and why it fits.',
              'The footer uses plain words in both modes.',
            ],
          },
        ],
      },
      {
        title: 'A club-night poster',
        blocks: [
          {
            text: 'The look is a printed flyer for a dance night: condensed poster capitals, cream and espresso, square sections with thin dividers, and real photos of drinks and dancers.',
          },
          {
            figures: [
              {
                src: freestyle,
                alt: 'Freestyle, the dark build-your-own-drink page with a live cup preview',
                caption: 'Freestyle, the build-your-own page, is staged like a spotlight',
              },
            ],
          },
          {
            points: [
              'Purple is the single accent, kept for actions, selection and prices.',
              'Hot, iced and blended each have their own color, used only on their icons.',
              'The written design system lists which text and background pairs are allowed, all chosen to meet WCAG AA, and a 44-pixel minimum for anything you tap.',
            ],
          },
        ],
      },
      {
        title: 'On a phone',
        blocks: [
          {
            text: 'Screens were planned from 375 pixels up. Plain labels are often longer than dance ones, so titles and chips had to wrap without breaking the page in either wording.',
          },
          {
            figures: [
              { src: phoneDance, alt: 'The phone menu in dance terms', caption: 'Dance terms', phone: true },
              { src: phonePlain, alt: 'The phone menu in plain words', caption: 'Plain words', phone: true },
              { src: phoneRemix, alt: 'Customizing a drink on a phone', caption: 'Customizing', phone: true },
            ],
          },
        ],
      },
      {
        title: 'Both sides of the counter',
        blocks: [
          {
            text: 'Staff have their own side, Backstage, with an order queue, menu and schedule editors, group-order requests and sales reports. When they move an order forward, the customer sees it live.',
          },
          {
            points: [
              'Anyone can open a demo Backstage and move only their own orders, so a visitor can play both sides.',
              'Prices are worked out again on the server at checkout. The total in the browser is only a preview.',
              'Pickup slots are 15 minutes and hold six drinks. A full slot says so and can no longer be picked.',
            ],
          },
        ],
      },
      {
        title: 'What changed along the way',
        blocks: [
          {
            points: [
              'Cartoon decorations gave way to real product photos.',
              'The site got its own icon set, first in a flyer-print style and then redrawn as solid glyphs made like small logos.',
              'The hero photo faded into the page in two versions before ending on a clean edge.',
              'Menu filters gained their plain meanings underneath, and layouts were reworked so the longer plain titles no longer overlap.',
            ],
          },
        ],
      },
      {
        title: 'How it was built',
        blocks: [
          {
            text: 'It started as a written spec covering the pages, flows, glossary and data, with a design system alongside it. I built it with Claude Code from those documents, one feature per step, against the same checklist each time: both wordings, 375 and 1280 pixels, contrast and tap sizes.',
          },
        ],
      },
      {
        title: 'Where it stands',
        blocks: [
          {
            text: 'The full loop works: browse, customize, order now or book a slot, track it live, earn points and order again. Group orders go from request to quote to a real order in the queue.',
          },
          {
            points: [
              'It is a demo. Payment is simulated, and the shop, address and baristas are fictional.',
              'Emailed sign-in links only reach my own address for now. Password, Google and the one-tap demo account work for everyone.',
            ],
          },
        ],
      },
    ],
  },
};

export default caseStudies;
