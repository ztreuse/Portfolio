# CLAUDE.md

Personal portfolio for Troy Bay (front-end developer & UI/UX designer). Single-page React site deployed to GitHub Pages at https://ztreuse.github.io/Portfolio/.

## Stack

- React 19 + Vite 7, plain JavaScript (JSX), no TypeScript
- Tailwind CSS v4 via `@tailwindcss/vite`; there is no `tailwind.config.js`, and theme tokens live in `src/index.css` under `@theme`
- `motion` (formerly Framer Motion) for animation, imported from `motion/react`
- `react-icons` for all icons (`si` brand logos, `lu` Lucide UI icons, `fa6` profile icons)
- `swiper` for the certifications carousel, `react-type-animation` for the hero name, `@emailjs/browser` for the contact form
- No router. In-page links use `{...sectionLink('id')}` from `hooks/useCleanAnchorLinks.js`. Every section is a normal `#id` anchor (the hash showing for those is fine), except Home (`hero`): it points at the plain site URL and the hook scrolls it to the top and clears the hash, because the owner wants Home to show `/Portfolio/`, not `/Portfolio/#hero`. `scroll-padding-top` in `index.css` clears the fixed navbar.

## Commands

```bash
npm run dev      # http://localhost:5173/Portfolio/  (the /Portfolio/ path is required)
npm run lint
npm run build
npm run deploy   # builds and publishes dist/ to GitHub Pages; only when asked
```

After any change, run `npm run lint` and `npm run build`. Both must pass before saying the work is done.

## Structure

```
src/
├── App.jsx                # composition only: Navbar → <main> sections → Footer, wrapped in MotionConfig
├── index.css              # @import tailwindcss, @theme tokens, base styles, Swiper overrides
├── sections/              # one component per page section (Hero, About, Experience, Certifications, Skills, Projects, Contact)
├── components/layout/     # Navbar, Footer, Preloader
├── components/ui/         # shared primitives: Section, SectionHeading, Container, Button, Tag, SocialIcon, Reveal, IconButton, IconBadge
├── hooks/                 # useActiveSection, useCleanAnchorLinks
├── data/                  # ALL content: site.js, experience.js, projects.js, certifications.js, skills.js
└── assets/                # images/, certifications/, projects/ (kebab-case filenames)
```

## Conventions

- **Content goes in `src/data/`, not in JSX.** Name, contact info, socials, nav links and EmailJS IDs are in `data/site.js`. Hero, Footer, Navbar and Contact read from it; never hardcode those values in a component.
- **Socials are professional profiles only:** LinkedIn, GitHub and JobStreet (`socials` in `data/site.js`, each with a `handle`). The owner removed Facebook and Instagram as unprofessional; don't add personal social media. The same list feeds the hero, footer and phone-menu icons and is also merged into the Contact section's details list as external rows. JobStreet has no brand icon, so it uses `FaBriefcase`.
- **Every page section uses `<Section id eyebrow title description>`.** It provides the spacing (`py-20 sm:py-28`), the `max-w-6xl` container and the heading style. New sections follow the same pattern.
- **Section numbering:** eyebrows read `01 — About`, `02 — Experience` … `06 — Contact` (navbar links are unnumbered). A new section needs a `navLinks` entry in `data/site.js` and renumbered eyebrows.
- **Navbar:** a conventional full-width top bar (`components/layout/Navbar.jsx`), with the logo on the left and links on the right, fixed and always visible.
  - **Shape:** it never changes size or shape. It's transparent at the top and frosted glass (`bg-ink/90`) once scrolled.
  - **Links:** hover is a plain professional fade (text brightens to white over a soft background). The only motion is a glowing underline that slides to the active section.
  - **Phone and tablet:** the two-line toggle opens a compact dropdown panel anchored top-right, not a full-screen menu, which the owner rejected as looking generic.
    - **Panel:** a dark glass card with a taupe glow, the active link marked by a glowing bar and highlighted row, and the social icons along the bottom.
    - **Closing:** a dim backdrop closes it on tap, and Escape closes it too.
  - **Tried and rejected by the owner:** hide-on-scroll, a floating pill that shrinks on scroll, a local-time clock, a scroll-progress line, rolling/flipping or sliding hover effects, numbered links, a "Let's Talk" CTA (redundant with Contact), a left side rail, and a Dynamic Island capsule. Enhance this layout; don't swap it for another concept.
- **Styling:** Tailwind utility classes only; no new `.css` files and no inline styles, except for dynamic values such as an imported background image URL. Global CSS in `index.css` is limited to tokens, base styles and third-party overrides.
- **Resume is the source of truth for content.** The downloadable file is `public/resume.pdf`. When the owner updates the resume, sync `data/` (experience, skills, projects with `role`) to match. Every project needs an `image`, a `link`, and a `role`.
  - **Left out on purpose** (don't re-add from the resume): senior high school, seminars and trainings, and the FEU TECH Borrowing System project.
- **About:** grad photo plus `profile.about` text. No location line: the owner removed their city and province from About, the footer and the Contact section so it doesn't put off recruiters. Don't show a location anywhere on the site. The owner removed the four fact cards (degree, experience, certifications, location) as redundant; don't bring back a facts grid.
- **Preloader:** `components/layout/Preloader.jsx` shows a shaded, 3D-style SVG glass mug on a saucer, drawn only in the site palette (taupe/bronze coffee, `accent-strong` crema and edge light, dark saucer with a taupe rim) over the hero's glow and faded grid so it blends in. Don't use realistic browns or a cream saucer. The coffee rises with a widening crema surface and steam, and the only text is the percentage counter; the owner removed the label, so keep it text-free. Animate SVG geometry through attributes, not `style`, for Safari.
  - **Timing:** it waits for window load and fonts, shows for at least 2.2 s and never more than 6 s, then fades out (the owner prefers a fade over a slide-up). `App` locks body scroll while it's showing and passes `ready` to the hero.
- **Hero:** animated background (drifting glows, faded grid, rising particles, cursor spotlight) over the photo. It shows a plain "Hello there, I'm" label and a static two-tone name, with the typed text cycling `profile.roles`. Keep the name static; don't retype it. The owner removed the waving-hand emoji, the "Open to full-time roles" badge, and the intro paragraph (it duplicated the About description).
- **Experience logos:** organization logos live in `src/assets/logos/` and are picked up by filename through `logoFor()` in `data/experience.js` (currently `feu-tech.*` and `simplevia.*`). A missing file falls back to the `initials` monogram badge on the timeline.
- **Projects:** grid view is always two equal columns; there is no full-width featured card, which the owner rejected. In grid cards, tags sit directly under the description and only the "View Project" button is pinned to the bottom. List view alternates: a large screenshot (7/12) beside the details (5/12), with sides swapping every row; when the image is on the left, the text is right-aligned. Projects are paginated at `PAGE_SIZE = 6` in both views, and the page controls only render once there is more than one page.
- **Certifications show Credly badge artwork.** Each entry in `data/certifications.js` has:
  - `badgeId`: the `data-share-badge-id` from Credly's embed code. It builds the public link `https://www.credly.com/badges/<id>/public_url`.
  - `image`: the badge PNG, downloaded into `src/assets/certifications/` and resized to 340px.
  - **No Credly widget:** the owner wants the badge image only, not Credly's embed (iframe or `embed.js`) with its title, issuer and "Provided by Credly" frame.
  - **Adding a badge:** get the image URL from `https://www.credly.com/embedded_badge/<id>` (the `images.credly.com` src), then download and resize it.
  - **Inactive slides:** the link is `pointer-events-none` so drag and slide-to-click still work.
- **Certifications carousel:** a full-bleed Swiper with `slidesPerView="auto"`, centered slides, loop, and autoplay (5 s, pauses on hover, off for reduced motion).
  - **Look:** an edge mask fades the peeking neighbors. Inactive cards are `scale-90`, dimmed and grayscale; the active card glows.
  - **Controls:** the counter, dots and prev/next buttons sit below the track. The dots render into `.certs-pagination`, and their overrides live in `index.css`.
- **Skills:** each skill in `data/skills.js` has `name`, `description` (2–3 words), a brand `logo` (or a Lucide `icon` for generic skills), and its official brand `color`. The color tints the icon box and drives the hover glow. Groups, in order: Core Languages, Front-End & Mobile, Back-End & Databases, Design & Animation, Tools & AI, Data & Analytics (Upskilling), Certified Foundations (Networking, Cybersecurity, PM; deliberately not called "expertise") and Other Languages (Basic Knowledge) for C++ and Java. Categories are open headings with a fading rule, not boxed cards, and tiles sit in a 2-column grid inside each category. New skills need all four fields.
- **Footer:** minimal on purpose.
  - **Layout:** a hairline top edge that fades out at both ends, then one row with the logo and tagline on the left and the `SocialIcon` row on the right (stacked on phones).
  - **Bottom:** a bar with the copyright and a "Back to top" pill, then an oversized faded "Troy Bay" wordmark cropped by the bottom edge. The wordmark is static, not scroll-revealed, because at the page bottom a reveal never fires on short screens.
  - **Removed as redundant:** a navigation list (the navbar is always visible) and a "Get in Touch" column (the Contact section sits right above). Don't re-add them.
- **Full-height sections:** `<Section>` is `min-h-svh` with content centered vertically; every section is at least one screen tall.
- **Scroll animation:** use `components/ui/Reveal.jsx` so motion stays consistent.
  - `<Reveal>` fades or slides a single element in on scroll; `x`/`y`/`delay` props tune it.
  - `<RevealGroup>` with `<RevealItem>` children staggers lists and grids. Pass `play={boolean}` to control it manually instead of on scroll; the hero uses `play={ready}` so it animates as the preloader lifts.
  - Section headings already reveal through `SectionHeading`.
  - The Hero has parallax and fades out on scroll.
  - Don't hand-roll new `whileInView` animations elsewhere.
- **Reuse `Button`** (`primary` / `outline` variants; renders `<a>` when given `href`), **`Tag`** (text-only chip, used for project tools), and **`SocialIcon`** (magnetic round social link with tooltip) and **`IconButton`** (round arrow button for carousel and pagination), and **`IconBadge`** (accent icon tile beside labels in Contact and Experience headings; give its parent `group` so the hover glow and tilt trigger). Don't hand-roll plain `bg-surface` icon boxes instead of restyling buttons, chips, and social links by hand.
- **Components:** arrow functions with `export default` at the bottom of the file, single quotes, semicolons, 2-space indent. No `import React`.
- **Icons:** UI icons come from `react-icons`. Decorative icons get `aria-hidden`; icon-only links and buttons get an `aria-label`.
  - **Original brand logos:** the Skills tiles and the Contact profile rows use full-color logo files from `src/assets/brand-logos/` (the owner wants original logos, not one-color brand icons).
    - **Sources:** SVGs come from the Iconify `logos` set (`https://api.iconify.design/logos/<name>.svg`; prefer the `-icon` variants over wordmarks). Brands whose mark is black (GitHub, Expo, Framer, CapCut) use the white version so they show on the dark theme. JobStreet and CapCut are PNGs taken from their sites.
    - **Generic skills** (Networking, Cybersecurity, PM) keep Lucide icons.
    - **Round social buttons** (`SocialIcon`) stay one-color `fa6` icons.
- **Animation:** use `motion/react`. `MotionConfig reducedMotion="user"` in App.jsx already honours reduced-motion settings; for CSS transitions add `motion-reduce:` variants where the movement is large.

## Design system

| Token (`src/index.css`) | Value     | Use                          |
| ----------------------- | --------- | ---------------------------- |
| `ink`                   | `#161513` | page background              |
| `ink-deep`              | `#0f0e0d` | footer                       |
| `surface`               | `#1f1d1a` | cards, inputs                |
| `line`                  | `#2d2925` | borders, dividers            |
| `accent`                | `#9f8f81` | brand accent (taupe)         |
| `accent-strong`         | `#c9bcaf` | accent text, hover states    |

- **Fonts:** `font-display` is **Zalando Sans Expanded** (the owner's original font). It's used for headings, the name, nav links, buttons, skill names and uppercase labels. `font-sans` is **Poppins**, for paragraphs, body text and tags. Both load in `index.html`.
  - **Rejected:** Space Grotesk, Inter and JetBrains Mono looked too generic. Don't reintroduce them or any monospace font.
  - **Width:** the expanded face is wide, so check that headings don't overflow at 360px.
- **Palette experiments:** a subtle matcha green secondary accent (`#9caf88` on the hero glow, eyebrow numbers, nav underline and icon hovers) was tried and reverted because the owner found it too minimal. Don't reintroduce it unasked; if the idea returns, it needs a bolder treatment.
- **Text colors:** headings `text-white`, body `text-stone-300`/`text-stone-400`, muted `text-stone-500`.
- **Repeated patterns:**
  - Eyebrow label: `font-display text-xs font-semibold tracking-[0.14em] text-accent uppercase`
  - Card: `rounded-2xl border border-line bg-surface`
- **Tokens:** don't name one `base` or `xs`; it collides with Tailwind size utilities such as `text-base`.
- **Responsive:** the layout must work at 390px with no horizontal scroll. `<main>` has `overflow-x-clip` so slide-in reveals can't widen the page; don't remove it, and don't move it onto `body` (browsers apply a body overflow setting to the whole window, where it doesn't clip reliably). Build mobile-first and add `sm:`/`md:`/`lg:` breakpoints on top.

## Gotchas

- **Base path is `/Portfolio/`** (`vite.config.js`). Files in `public/` must be linked through `import.meta.env.BASE_URL` (see `profile.resume`), not `/file.pdf`.
- **ESLint** doesn't see JSX usage for destructured or namespaced components, so the `no-unused-vars` rule ignores names starting with a capital letter and `motion`. Keep using `icon: Icon` destructuring and `motion.*`.
- **EmailJS:** the contact form field names (`user_name`, `user_email`, `subject`, `message`) must match the EmailJS template. Don't rename them.
- **Swiper CSS is unlayered,** so overrides for it must also be unlayered (outside `@layer`) in `index.css`, or use Tailwind's `!` suffix (`h-auto!`).
- **Windows, case-insensitive filesystem:** keep folders lowercase (`components/`, not `Components/`). Imports are case-sensitive on the Linux build server.
- **Dev server:** after changing `vite.config.js` or installing packages, it needs a full restart (Ctrl+C, then `npm run dev`); a browser refresh isn't enough.
- **Large images:** several are 1–2 MB PNGs. Prefer WebP for new images, and use `loading="lazy"` on images below the fold.

## Working preferences

- The owner is iterating section by section on the UI. Keep changes scoped to the section asked about, and match the existing design system rather than introducing new colors, fonts or spacing scales.
- Explain visual changes in plain terms (what it looks like and how it behaves), and check that the layout works at both desktop and phone width.
- Don't commit, push or deploy unless asked.
