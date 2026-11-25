# Troy Bay — Portfolio

Personal portfolio built with React 19, Vite 7 and Tailwind CSS v4, with Motion for animation, Lenis for smooth scrolling and Three.js for the coffee intro.

- Vercel: https://portfolio-ztreuse.vercel.app (deploys on every push to `main`; other branches get a preview)
- GitHub Pages: https://ztreuse.github.io/Portfolio/ (published with `npm run deploy`)

## Scripts

```bash
npm install
npm run dev      # http://localhost:5173/Portfolio/ (the /Portfolio/ path is required)
npm run build    # production build into dist/
npm run lint     # ESLint
npm run deploy   # build and publish dist/ to GitHub Pages
```

## The page

Home (which includes the introduction), Projects, Experience, Education, Certifications, Skills and Contact, in a light (crema) and a dark (espresso) theme. The theme follows the device until the visitor picks one. A short coffee intro plays once per visit, and a scroll-driven film of my desk leads into Contact.

## Project structure

```
index.html               # meta and link-preview tags, theme set before first paint
vite.config.js           # base path per host, link-preview address
public/                  # resume.pdf, favicon, og.jpg, contact-film/ (the desk film's frames)
src/
├── App.jsx              # page composition
├── index.css            # Tailwind import, design tokens, both themes
├── sections/            # Hero, Projects, Experience, Education, Certifications, Skills, Contact (+ ContactFilm)
├── components/
│   ├── layout/          # Navbar, Footer, Preloader, Band
│   └── ui/              # Section, SectionHeading, Timeline, Button, ThemeToggle, FluidImage, Reveal...
├── hooks/               # useTheme, useSmoothScroll, useCleanAnchorLinks, useActiveSection
├── data/                # all content: site, experience, projects, certifications, skills
├── three/               # the 3D coffee cup
└── assets/              # images, certifications, projects, logos, brand-logos
```

## Editing content

Content is separate from layout. Edit the matching file in `src/data/`:

- `site.js`: name, introduction, contact details, links, availability tag, navigation
- `experience.js`: jobs and degrees (newest first)
- `projects.js`, `certifications.js`, `skills.js`

## Design system

Colors, fonts and the type scale are tokens in `src/index.css`. The light theme re-points the same color tokens, so components use palette utilities only (`bg-ink`, `text-white`, `text-stone-300`...) and never hard-coded colors.

| Token           | Dark      | Light     | Use                    |
| --------------- | --------- | --------- | ---------------------- |
| `ink`           | `#161513` | `#e6ddd2` | page                   |
| `band`          | `#1d1b18` | `#efe8df` | every other section    |
| `surface`       | `#24211d` | `#f7f2eb` | cards                  |
| `line`          | `#37322d` | `#cfc3b5` | borders, dividers      |
| `accent`        | `#a89888` | `#6a5b4e` | accent                 |
| `accent-strong` | `#c9bcaf` | `#4b3f36` | accent text and hovers |

Type: **Big Shoulders Display** for the name and section titles, **Manrope** for everything else, in five sizes (`text-name`, `text-title`, `text-item`, `text-copy`, `text-label`).
