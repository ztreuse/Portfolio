# CLAUDE.md

Personal portfolio for Troy Bay (front-end / full-stack developer and UI/UX designer). A single-page React site, deployed to
GitHub Pages (https://ztreuse.github.io/Portfolio/) and Vercel (https://portfolio-ztreuse.vercel.app). Work happens on the
`calmer-redesign` branch.

This file describes the site **as it is now**. Each note says what to keep and, where the owner turned something down,
what not to bring back. The owner's plain-language guide is the private "Troy Bay Portfolio Handbook" artifact
(https://claude.ai/artifact/Hge7AzSWkunkWkLexjUEvc); update it when a section or effect changes a lot. `README.md` is
the public overview.

## Working with the owner

- Don't commit, push or deploy unless asked. The owner says when to go live.
- After every change run `npm run lint` and `npm run build`; both must pass before saying it's done.
- Keep `npm run dev` running on 5173 (and a `vite preview` on 4199 if one is up); don't kill them after tests.
- Keep changes to the part asked about, and match the design system rather than adding colours, fonts or spacings.
- Explain visual changes plainly (what it looks like and how it behaves) and check desktop and phone, both themes.
- Record decisions in this file, and rejections when they're likely to come up again.
- Content must be true: the résumé (`public/resume.pdf`) is the source of truth. Ask for facts that aren't in it rather
  than guessing (project years came from the owner and the projects' git history).

## Stack

- React 19 + Vite 7, plain JavaScript (JSX), no TypeScript, no router.
- Tailwind CSS v4 via `@tailwindcss/vite`: no `tailwind.config.js`; tokens live in `src/index.css` under `@theme`.
- `motion` (import from `motion/react`) for animation; `MotionConfig reducedMotion="user"` in `App`.
- `lenis` for smooth scrolling on desktops (`hooks/useSmoothScroll.js`; off on touch screens and for reduced motion).
- `three` for the photo's particle tamaraw (`three/tamaraw.js`, `three/webgpu` + `three/tsl`), a lazy chunk loaded only
  when someone reaches for the photo.
- `react-icons` (`lu` Lucide UI icons, `fa6` profile icons), `react-type-animation` (the hero's role line),
  `@emailjs/browser` (the contact form). `swiper` is still in `package.json` but nothing imports it.

```bash
npm run dev      # http://localhost:5173/Portfolio/  (the /Portfolio/ path is required)
npm run lint
npm run build
npm run deploy   # builds and publishes dist/ to GitHub Pages; only when asked
```

## Structure

```
index.html                 # fonts, link-preview tags, and an inline script that sets the theme and the side index
                           # state before the first paint
src/
├── App.jsx                # skip link, Navbar, <main> sections, Footer
├── index.css              # @theme tokens (both themes), variants, base styles, keyframes
├── sections/              # Hero, Experience, Projects (+ ProjectDetails), Certifications, Skills (+ SkillsBackdrop),
│                          # Contact (+ ContactFilm, filmGrade.js)
├── components/layout/     # Navbar (top bar + phone menu), PageIndex (desktop side index), Footer, Band, Desk
├── components/ui/         # Section, SectionHeading, Button, IconButton, SocialIcon, ThemeToggle, CopyEmail,
│                          # LocalTime, DegreeTag, Timeline, Portrait, FluidImage, Reveal, revealVariants.js
├── hooks/                 # useTheme, useSmoothScroll, useCleanAnchorLinks, useActiveSection
├── data/                  # ALL content: site, experience, projects, certifications, skills
├── three/                 # tamaraw (the photo's particle logo)
└── assets/                # images, projects, certifications, logos, brand-logos (kebab-case names)
public/                    # resume.pdf, favicon.svg, og.jpg, contact-film/ (wide/ and tall/ WebP frames)
```

## Page order

`App`: Hero, then `Band wave` › Experience, `Desk` › Projects, `Band` › Certifications, Skills (titled "Tech stack"),
Contact (with the desk film before it), Footer. Navigation labels and ids are `navLinks` in `data/site.js`:
Introduction (`hero`), Experience, Projects, Certifications, Tech Stack (`skills`), Contact, numbered 00–05 in the
navigation only.

- **The only scroll-driven transition is the desk film into Contact.** No other runways, pins, holds or section intros.
- Sections are `py-16 sm:py-24` and as tall as their content (no `min-h-svh`).
- `Band` is a background a shade off the page (`bg-band`); `Band wave` adds a CSS-only rolling top edge (Experience,
  over the hero). `Desk` puts the owner's desk photo behind its section (Projects): fixed, pre-blurred
  (`desk-soft.webp`, light theme `desk-soft-light.webp`) under a veil (`bg-dimension/70` dark, `bg-ink/50` light), with
  `ON_DESK` lifting the text a step so it reads over the photo.

## Design system

### Colour: brown is what you read, green is what you touch

Every token has a dark (espresso) and a light (crema) value: `:root[data-theme='light']` in `index.css` re-points the
palette. **Use palette utilities only** (no hard-coded hex), so both themes work. `text-white` is the strongest text in
either theme (near-black in light), `bg-ink` the page, `white/15` a faint line.

| Token | Dark | Light | Use |
| --- | --- | --- | --- |
| `ink` | `#161513` | `#e6ddd2` | page |
| `band` | `#1d1b18` | `#efe8df` | every other section |
| `surface` | `#24211d` | `#f7f2eb` | cards |
| `line` | `#37322d` | `#cfc3b5` | borders |
| `accent` / `accent-strong` | `#a89888` / `#c9bcaf` | `#6a5b4e` / `#4b3f36` | taupe: labels, dates, roles, "BAY" |
| `matcha` / `matcha-strong` | `#a3b97c` / `#c4d4a2` | `#3f7417` / `#2e6410` | green: interactive and live |
| `matcha-fill` / `on-matcha` | `#a3b97c` / `#161513` | `#3f7417` / `#f6f1e8` | primary button hover fill / its text |
| `dimension` | `#403b37` | `#dfd4c7` | the veil over the desk photo |

- The light greens are saturated on purpose (the owner found the old olive `#557538` hard to see on crema): they keep
  AA contrast on every light background and read as clearly green, as the pistachio does on espresso.
- **Brown** (the surfaces, text, `accent`) is the structure: backgrounds, cards, lines, labels, dates, roles, outlines,
  the Experience dashes, the hero's name accent and photo frame. **Every background and card stays brown**: matcha
  bands, green cards and an olive tint were tried and reverted.
- **Green** (`matcha`) is for what you touch and what's live: every `hover:` / `group-hover:` / `focus-visible:` colour,
  the primary button, the current section in the navigation (box, its left line, dots, the collapsed rail's names), the
  theme switch's pill, the Projects view toggle and detail tabs, the open degree chip, the typing caret, the photo's
  Hold dial, the menu icon's dot, section-title bars, the focus ring, `::selection`, the skip link, and status touches
  (the availability chip, the "Currently Learning" card, the copied tick, the sent message).
- `.tone-dark` keeps a part dark in both themes (the side index and top bar over the night film). The `light:` variant
  handles exceptions; in the Hero, Contact and the desk section, `light:[--color-stone-300:var(--color-white)]` makes the
  dark theme's near-white text near-black in light (not dark grey).
- Brand logos that are white are `mono` in `data/skills.js` (inverted in light) or have a `logoLight`.

### Type

- Fonts (Google Fonts in `index.html`): **Big Shoulders Display** for the hero name and section titles only,
  **Manrope** for everything else, **JetBrains Mono** for labels.
- Scale (`@theme`): `text-name` (hero), `text-title` (section titles), `text-item` (19px: project, job, issuer and group
  titles, the role line), `text-copy` (15px body), `text-label` (13px). Use only these plus `text-sm`.
- Every label is `font-mono text-label font-medium tracking-[0.08em]`, plus `uppercase` where it's a label.
  One exception: the Issued / Expires labels on the certification cards are 11px (`text-[0.6875rem]`), set tight over
  their dates (the owner asked for them smaller).
- No gradient text on the name (a browser clipped the "y"); no per-letter effects; no cursive or extra fonts.

### Shapes and controls

- **Cards and pop-ups share one radius, `rounded-xl` (12px)**, after the project cards: the certification, Tech stack
  and project-detail cards, the Certifications filter menus, the degree card and the phone menu. Things nested inside
  them step down to `rounded-lg` (the badge tile, menu options). Only the hero photo frame keeps `rounded-2xl`.
- Controls are round: buttons are pills, icon buttons and toggles circles (`border-white/20 bg-ink/40`). The one
  exception is the skill chips (`rounded-lg`), which are labels.
- **`Button`** (`ui/Button.jsx`), used by Download Resume, Get in Touch, Send message and Back to top: a 40px pill, the
  label left and the icon in its own 32px circle with a 4px rim (sized after the photo's Hold pill). `primary` is a
  green outline (border, label, circle and icon in matcha, no fill); on hover it fills `matcha-fill` and everything
  inside turns `on-matcha` (black in dark, white in light). `outline` is neutral; on hover its border, label and circle
  turn green. `nudge="x"|"y"` sets the icon's hover motion.
- Section headings (`SectionHeading`): the title, an optional one-line subtitle (`intros` in `data/site.js`, in the
  owner's voice), a 4px green bar on the left running from just above the title to just below the subtitle, the
  Projects view toggle on the right, a hairline under it (except Projects, Certifications and Tech stack:
  `rule={false}`, the owner asked for the line gone there). **No section numbers or eyebrow labels on headings** (the
  owner finds them an AI-template tell).
- One global `:focus-visible` outline (2px matcha). `Button` presses to 0.97, `IconButton` to 0.94.
- Icons: decorative ones get `aria-hidden`; icon-only controls an `aria-label`. The theme icons, the menu button and the
  section dots are our own SVGs.

## Navigation

- **Desktop (`xl`, 1280px up): `layout/PageIndex.jsx`,** a 224px column down the left that the page sits beside
  (`main`, the footer and the fixed photos use `--index-w`).
  - Top: the logo (links to the top), `profile.headline` ("Full-Stack Developer") and the local time.
  - Rows: a mono number and the name. The current section sits in a green-tinted box shaped like a tab (square on the
    left with a 3px green line its full height, rounded on the right) that glides between rows; a fainter box glides to
    the row under the pointer or keyboard focus, whose number turns green while a small arrow slides in.
  - Bottom: LinkedIn and GitHub circles beside a Résumé pill, the theme switch stretched into three equal segments,
    then a Contact block: a label with a copy button, `profile.reachOut`, and the email as **plain text** (not a mailto
    link; one click selects it; it turns green on hover).
  - **Collapsible:** the button by the logo shrinks it to a 72px rail (`html[data-index='min']`, remembered in
    `localStorage`, applied before paint). The rail shows the mark, the sections as dots, and round 36px controls with
    tooltips (`Tip`). The dots work like a dock: each grows, tints green and shows its name (green text) with the
    pointer's distance from it, about three names at a time; the current section's dot is always the biggest. Values
    glide every frame from a rAF loop that writes straight to the elements (no React renders).
- **Below `xl`: the top bar** (logo and our drawn menu button: a long line over a shorter one led by a green dot,
  swinging into an X) and a dropdown panel that is a pocket copy of the open side index: headline and time, numbered
  rows, profiles and Résumé, the theme switch, and the email with a copy button. Not full-screen (rejected); no dock
  dots (touch has no hover).
- Links use `{...sectionLink('id')}` from `hooks/useCleanAnchorLinks.js`: sections are `#id` anchors, except Introduction,
  which goes to the plain site URL and clears the hash.

## Sections

- **Hero** (doubles as About): "Hello there, I'm", the name, the typed role line (one line tall even while empty), fact
  chips (degree `DegreeTag`, location `profile.location` "Manila, PH", local time, availability in green), the About
  paragraph, Download Resume and Get in Touch (full labels on every screen), socials (LinkedIn, GitHub, Email) and "See
  my work" (to Projects). Behind it a photo in `FluidImage` (WebGL coffee ripples where the cursor moves, faded into the
  page colour in the shader) with rising particles on desktops.
  - **Portrait** (`ui/Portrait.jsx`): the grad photo in a thin frame. **Press and hold** (mouse, touch or Space/Enter)
    and it breaks into particles that gather into the FEU Tech tamaraw (`three/tamaraw.js`, from
    `assets/images/feu-tamaraw.png`): an even grid of square tiles so the circuit lines stay crisp, swaying gently, with
    near-black sides like a thick badge (dark layers behind its edges, each appearing as the tile in front lands). The
    hint is a dial in the corner whose green ring fills over the 1.9 s the logo takes. Plain photo without WebGL or with
    reduced motion.
  - The location appears **only here** (city and country), nowhere else on the site.
- **Experience** (`ui/Timeline.jsx`): one row per job between hairlines. Left: the company logo (`OrgBadge`, from
  `assets/logos/`, initials as fallback), the dates, the organisation, the length and type ("7 mos · Internship"); right:
  the role, dash points, the tools as outlined tags. Three show; the rest fold behind "Show N earlier". Education isn't
  a section: the hero's degree chip opens a small card with it.
- **Projects** (on the desk photo): a grid/list toggle, six per page.
  - Grid: the screenshot (tilts slightly toward the pointer), the year over the name with its arrow link, stack tags.
  - List: on desktops with a mouse an index (number, name and stack, role · year and description, View details and the
    live link); on touch screens and phones rows with the screenshot. **Every** project has the same "View details"
    pill (faint at rest; on hover its border and text turn green) opening the details in place (`ProjectDetails.jsx`,
    `details` in `data/projects.js`): Overview, How it works (only with a `flow`), and Stack on touch rows. One open at
    a time. The details sit under each row's grid, not in it (a grid gap made a bump at the end of closing).
  - Real screenshots only (1600×900 WebP, the site's navbar flush with the frame's top). Every project needs `image`,
    `link`, `role` and `year`.
- **Certifications:** one grid of outlined cards with no fill (the band shows through), newest first (two columns, three from `2xl`), each a link to its Credly page:
  the badge (192px WebP) beside the title and issuer, a hairline, Issued and Expires (`expires` in
  `data/certifications.js`, from Credly's records; "No expiry" when absent), and a full-width "Verify credential" pill
  that fills green only while it is hovered itself (hovering the card lifts it 4px and outlines it green, no shadow). Six show, the rest fold behind "View all" / "Show fewer" (styled like Projects' View details pill). The issuer
  groups were dropped: their side column and one-card rows left holes. No carousel.
  Above the grid, two dropdown filters (`Filter`): Issuer (building icon) and Year (calendar icon). Each is a pill
  reading "Issuer All" that opens a small menu (check on the chosen option, a count per option, options that would
  leave nothing disabled, so the grid is never empty); a set filter outlines its pill green and greens its value.
  Arrows move through the menu, Escape closes it. Options come from the data (`SHORT` gives PMI its short pill label).
  A row of segmented pills was tried first and replaced.
- **Tech stack** (`Skills.jsx`): two columns of group cards (name, "N tools", brand-logo chips). In the light theme the cards are a see-through crema (`light:bg-ink/55`, chips `light:bg-surface/40`) so the
  blurred desk photo tints them, not bright white. On hover a card lifts
  4px and only its outline turns green (no shadow, like the certification cards). "Currently Learning" has a dashed green outline. Chips flick on in their brand
  colours once, the first time a card appears; tooltips list the projects that used each tool. The background
  (`SkillsBackdrop`) is the desk film's first frame, coming into focus as the section ends.
- **Contact:** the desk film (`ContactFilm.jsx`): a scroll-scrubbed clip of the owner's desk at night (120 WebP frames per
  orientation), the only scroll transition; Contact is pulled up over its end and fades in. Then "Reach me directly"
  (email with copy, phone, LinkedIn, GitHub, local time) beside the form (`user_name`, `user_email`, `subject`,
  `message`; the message box resizes vertically, never below four lines).
- **Footer:** the tagline (first sentence muted), the copyright, "Built with React, Vite and Tailwind CSS." and Back to
  top.
- **No loader** (the owner removed the coffee intro and its 3D cup: a 2 s wait on every first visit, the heaviest file,
  and the coffee theme had faded). The page opens straight onto the hero, whose photo comes into focus and whose text
  rises in. Don't add a loader back.

## Content rules

- All content lives in `src/data/`, never in JSX: `site.js` (profile, `intros`, `navLinks`, `socials`, EmailJS IDs),
  `experience.js`, `projects.js`, `certifications.js`, `skills.js`.
- Socials are professional profiles only (LinkedIn, GitHub, email). No Facebook, Instagram or JobStreet.
- Left out on purpose (don't re-add from the résumé): senior high school, seminars and trainings, the FEU TECH
  Borrowing System project.
- New skills need `name`, `description`, `logo` and `color`. Logos are full-colour files in `assets/brand-logos/`
  (Iconify `logos` set where possible).

## Don't bring back

- Per-section scroll transitions (the hero dive, WORK flood, coffee drop, Skills flight, smoke, chapter numerals' sweep,
  footer curtain), crema/dark alternating bands, the 3D certificate ring, a loading screen.
- Section numbers or eyebrow labels on headings; generic subtitles.
- A custom cursor, magnetic hovers, cursor spotlights, grid patterns, word marquees.
- Green backgrounds or cards (green is only for interaction and status).
- A full-screen phone menu, a bottom dock, a right-edge rail.
- Opening the email in a mail app from the navigation.

## Performance (phones)

No Lenis on touch; no live `blur()` on large photos (ship pre-blurred copies); no `backdrop-blur` on cards; never write a
CSS variable on the document every frame (write to the element instead); film frames are fetched as blobs and decoded
ahead with `createImageBitmap`, every second frame on phones; the film's grade is a CSS filter on the canvas (Safari
ignores `ctx.filter`). Size the film, Skills backdrop and Contact overlap in `lvh`.

## Gotchas

- **Base path is `/Portfolio/`.** Link files in `public/` through `import.meta.env.BASE_URL` (see `profile.resume`).
- **EmailJS** fills only template variables whose names match, so `templateParams()` in `Contact.jsx` sends each field
  under every common name. Keep that mapping.
- **WebGL:** `FluidImage` and the Three.js scenes must not destroy their contexts on cleanup (StrictMode remounts in dev
  and the canvas goes black).
- **rAF loops in effects** must reset their frame id on cleanup (`frame = 0`), or StrictMode's double mount leaves a
  stale id and the loop never restarts on the dev server (the side index's dots looked "static").
- A negative margin can't cancel a grid gap; put spacing inside an element that animates its height.
- Use the CSS `translate`/`rotate`/`scale` properties (Tailwind's `translate-*`) for hover moves on elements that
  `motion` also animates, so they don't fight over `transform`.
- For scroll-linked opacity in motion, use a function transform; a plain `[in] → [out]` map can stick.
- `main` keeps `overflow-x-clip` (not `overflow-hidden`, which breaks sticky; not on `body`). Layouts must work at 360px
  with no sideways scroll.
- Tokens: don't name one `base` or `xs` (they collide with Tailwind's `text-base` and similar).
- ESLint ignores unused names starting with a capital letter (`icon: Icon`) and `motion`. Component files may only export
  components (put shared variants in `.js` files).
- Windows is case-insensitive but the build server isn't: keep folders lowercase and imports exact.
- After changing `vite.config.js` or installing packages, restart the dev server. New `three` entry points go in
  `optimizeDeps.include`.
- Images are WebP with `width`/`height` set; `loading="lazy"` below the fold.
- The link preview is `public/og.jpg` (1200×630: name, role, portrait); re-make it if those change. `%SITE_URL%` in
  `index.html` is filled in by `vite.config.js`.
