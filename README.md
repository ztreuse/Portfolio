# Troy Bay — Portfolio

My personal portfolio: a single-page site built with React 19, Vite 7 and Tailwind CSS v4, with Motion for animation,
Lenis for smooth scrolling and Three.js for a hidden touch on the photo.

- Vercel: https://portfolio-ztreuse.vercel.app (deploys on every push to `main`; other branches get a preview)
- GitHub Pages: https://ztreuse.github.io/Portfolio/ (published with `npm run deploy`)

## The page

An introduction, then Experience, Projects, Certifications, Tech Stack and Contact, in a dark (espresso) and a light
(crema) theme that follows your device until you pick one.

- **Navigation:** on wide screens a page index down the left, which collapses into a rail of dots that swell as your
  pointer nears them; on phones and tablets a top bar with a dropdown menu.
- **Hero:** coffee-like ripples follow the cursor over the background, and pressing and holding the photo breaks it into
  particles that form the FEU Tech tamaraw.
- **Projects:** a grid or a list, with each project's details opening in place.
- **Contact:** reached through a scroll-driven film of my desk at night.

## Scripts

```bash
npm install
npm run dev      # http://localhost:5173/Portfolio/ (the /Portfolio/ path is required)
npm run build    # production build into dist/
npm run lint     # ESLint
npm run deploy   # build and publish dist/ to GitHub Pages
```

## Project structure

```
index.html               # fonts, link-preview tags, theme set before the first paint
vite.config.js           # base path per host, link-preview address
public/                  # resume.pdf, favicon, og.jpg, contact-film/ (the desk film's frames)
src/
├── App.jsx              # page composition
├── index.css            # Tailwind import, design tokens, both themes
├── sections/            # Hero, Experience, Projects, Certifications, Skills, Contact (+ the desk film)
├── components/
│   ├── layout/          # Navbar and phone menu, PageIndex (side index), Footer, Band, Desk
│   └── ui/              # Section, SectionHeading, Button, ThemeToggle, Timeline, Portrait, FluidImage, Reveal…
├── hooks/               # useTheme, useSmoothScroll, useCleanAnchorLinks, useActiveSection
├── data/                # all content: site, experience, projects, certifications, skills
├── three/               # the photo's particle logo
└── assets/              # images, projects, certifications, logos, brand-logos
```

## Editing content

Content is kept apart from layout. Edit the matching file in `src/data/`:

- `site.js`: name, roles, introduction, contact details, links, availability, section subtitles, navigation
- `experience.js`: jobs and the degree (newest first)
- `projects.js`: each project's screenshot, link, role, year, stack and details
- `certifications.js`, `skills.js`

## Design system

Colours, fonts and the type scale are tokens in `src/index.css`. The light theme re-points the same tokens, so
components use palette utilities (`bg-ink`, `text-white`, `text-matcha`…) and never hard-coded colours.

The palette is coffee browns with a matcha green: **brown is what you read** (backgrounds, text, labels, lines) and
**green is what you touch** (buttons, hovers, the current section, focus) or what's live (availability, learning).

| Token | Dark | Light | Use |
| --- | --- | --- | --- |
| `ink` | `#161513` | `#e6ddd2` | page |
| `band` | `#1d1b18` | `#efe8df` | every other section |
| `surface` | `#24211d` | `#f7f2eb` | cards |
| `line` | `#37322d` | `#cfc3b5` | borders, dividers |
| `accent` / `accent-strong` | `#a89888` / `#c9bcaf` | `#6a5b4e` / `#4b3f36` | taupe labels and accents |
| `matcha` / `matcha-strong` | `#a3b97c` / `#c4d4a2` | `#557000` / `#4a6600` | interactive and live |

Type: **Big Shoulders Display** for the name and section titles, **Manrope** for everything else and **JetBrains Mono**
for small labels, in five sizes (`text-name`, `text-title`, `text-item`, `text-copy`, `text-label`).
