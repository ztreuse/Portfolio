# Troy Bay — Portfolio

Personal portfolio built with React, Vite, and Tailwind CSS v4. Deployed to GitHub Pages at https://ztreuse.github.io/Portfolio/.

## Scripts

```bash
npm run dev      # start the dev server
npm run build    # production build into dist/
npm run lint     # ESLint
npm run deploy   # build and publish dist/ to GitHub Pages
```

## Project structure

```
src/
├── main.jsx                 # entry point
├── App.jsx                  # page composition (Navbar → sections → Footer)
├── index.css                # Tailwind import + design tokens (@theme) + base styles
├── sections/                # one file per page section
│   ├── Hero.jsx
│   ├── About.jsx
│   ├── Certifications.jsx
│   ├── Skills.jsx
│   ├── Projects.jsx
│   └── Contact.jsx
├── components/
│   ├── layout/              # Navbar, Footer
│   └── ui/                  # shared building blocks: Section, SectionHeading, Container, Button, Tag
├── hooks/                   # useActiveSection (navbar highlight)
├── data/                    # all content lives here: site, projects, certifications, skills
└── assets/
    ├── images/              # logo, profile, section backgrounds
    ├── certifications/
    └── projects/
```

## Editing content

Content is separated from layout. To add a project, certificate, or skill, edit the matching file in `src/data/`. Name, contact details, social links, and nav links are in `src/data/site.js`.

## Design system

Colors and fonts are defined once as Tailwind theme tokens in `src/index.css`:

| Token           | Value     | Use                     |
| --------------- | --------- | ----------------------- |
| `ink`           | `#161513` | page background         |
| `ink-deep`      | `#0f0e0d` | footer                  |
| `surface`       | `#1f1d1a` | cards, inputs           |
| `line`          | `#2d2925` | borders, dividers       |
| `accent`        | `#9f8f81` | brand accent            |
| `accent-strong` | `#c9bcaf` | accent text and hovers  |

Fonts: **Zalando Sans Expanded** (headings, nav, buttons and labels; `font-display`) and **Poppins** (body text; `font-sans`).

Every section is wrapped in `<Section>`, which provides the same spacing, max width, and heading style throughout the page.
