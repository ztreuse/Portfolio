# CLAUDE.md

Personal portfolio for Troy Bay (front-end developer & UI/UX designer). Single-page React site deployed to GitHub Pages at https://ztreuse.github.io/Portfolio/.

## Stack

- React 19 + Vite 7, plain JavaScript (JSX), no TypeScript
- Tailwind CSS v4 via `@tailwindcss/vite`; there is no `tailwind.config.js`, and theme tokens live in `src/index.css` under `@theme`
- `motion` (formerly Framer Motion) for animation, imported from `motion/react`
- `lenis` for smooth, weighted page scrolling (`hooks/useSmoothScroll.js`; off for reduced motion)
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
├── components/layout/     # Navbar, Footer, Preloader, Cursor
├── components/ui/         # shared primitives: Section, SectionHeading, Container, Button, SocialIcon, Reveal, FluidImage, IconButton, IconBadge
├── hooks/                 # useActiveSection, useCleanAnchorLinks, useSmoothScroll
├── data/                  # ALL content: site.js, experience.js, projects.js, certifications.js, skills.js
└── assets/                # images/, certifications/, projects/ (kebab-case filenames)
```

## Conventions

- **Content goes in `src/data/`, not in JSX.** Name, contact info, socials, nav links and EmailJS IDs are in `data/site.js`. Hero, Footer, Navbar and Contact read from it; never hardcode those values in a component.
- **Socials are professional profiles only:** LinkedIn, GitHub and JobStreet (`socials` in `data/site.js`, each with a `handle`). The owner removed Facebook and Instagram as unprofessional; don't add personal social media. The same list feeds the hero and phone-menu icons and the footer's "Find me on" rows. Contact no longer lists them: the owner removed them there as redundant with the footer right below. JobStreet has no brand icon, so it uses `FaBriefcase`.
- **Every page section uses `<Section id eyebrow title description>`.** It provides the spacing (`py-20 sm:py-28`), the `max-w-6xl` container and the heading style. New sections follow the same pattern. Headings are left-aligned by default; `align="center"` centres the heading and its ghost number (Skills uses it, at the owner's request).
- **Section numbering:** eyebrows are written `01 — About`, `02 — Experience` … `06 — Contact` (navbar links are unnumbered), but `SectionHeading` shows only the label ("About"); the number only drives the faint ghost number behind the title (the owner removed it from the small label as redundant). A new section needs a `navLinks` entry in `data/site.js` and renumbered eyebrows. The eyebrow names the section; the title must not repeat it (the owner found "01 — About / About me" redundant). Titles are short statements: About "Get to know me" (the owner wanted a plain synonym for "About", not a slogan; "Designer who codes" was rejected as silly), Experience "Where I've grown", Certifications "Credentials I've earned", Skills "Tools I build with", Projects "Selected work", Contact "Let's work together". Check that long words fit at 360px.
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
- **About:** its content (photo, heading, paragraph) waits until About fills the page: a full-size marker in `Section`'s `background` is watched with `useInView` (top 12% of the viewport), and `play` is passed to `RevealImage`, `SectionHeading` and `Reveal` (all accept an optional `play`). The owner didn't want it revealing while About is still sliding up over the hero. Grad photo plus `profile.about` text, which fades in whole with `Reveal` (the owner removed a word-by-word "typing" brighten effect; don't bring it back). The photo sits straight and twists slightly on hover (`group-hover:-rotate-2`); the owner preferred this to a resting tilt. Behind it is a thin `border-accent/40` offset frame (`translate-3`, `sm:translate-4`) that reveals just after the photo and on hover swings further out with the opposite twist (`rotate-2`), like two stacked prints fanning apart. The image is `scale-115` inside its card and drifts ±6% with scroll (window parallax; off for reduced motion). Offsets, twists and scale use the CSS `translate`/`rotate`/`scale` properties so they don't clash with motion's `transform`. No location line: the owner removed their city and province from About, the footer and the Contact section so it doesn't put off recruiters. Don't show a location anywhere on the site. The owner removed the four fact cards (degree, experience, certifications, location) as redundant; don't bring back a facts grid.
- **Preloader:** `components/layout/Preloader.jsx` shows a shaded, 3D-style SVG glass mug on a saucer, drawn only in the site palette (taupe/bronze coffee, `accent-strong` crema and edge light, dark saucer with a taupe rim) over the hero's warm glow so it blends in. Don't use realistic browns or a cream saucer. The coffee rises with a widening crema surface and steam, and the only text is the percentage counter; the owner removed the label, so keep it text-free. Animate SVG geometry through attributes, not `style`, for Safari.
  - **Timing:** it waits for window load and fonts, shows for at least 2.2 s and never more than 6 s, then fades out (the owner prefers a fade over a slide-up). `App` locks body scroll while it's showing and passes `ready` to the hero.
- **Hero:** animated background (one faint drifting center glow, rising particles) over the photo. The owner removed the big gradient glows in the top-left and bottom-right corners; don't bring them back. No cursor spotlight or glow circle: the owner removed the "flashlight" look. The photo is a `FluidImage` (WebGL) under a sheet of coffee (the owner asked for coffee instead of plain water, to match the coffee palette and preloader mug): moving the cursor (or a finger) drops ripples along its path that spread out, bend the photo and calm down (a small CPU ripple simulation feeding a height-map texture; its cells are a fixed 8 CSS px and the bend is set in CSS px (`uPixel`), so ripples are the same size on phones as on desktop; a fixed cell count made them tiny on small screens); a resting cursor does nothing, and it sways gently when idle.
  - **Coffee look:**
    - **Ripples:** disturbed areas take a slight brown tint, crests glint crema and troughs sink toward espresso.
    - **Smooth fade:** everything the ripples do is scaled by `uEnergy`. It rises fast when you move (`ENERGY_RISE`) and eases down as the waves shrink below `FULL_WAVE` (`ENERGY_FALL`). The simulation settles once it's invisible.
      - **Why:** without it, tiny leftover waves (8-bit height texture) made a faint blotchy after-effect for several seconds, then snapped flat. The owner disliked that.
      - **Duration:** it's essentially gone about 2.5 s after the cursor stops.
    - **Main ripple only:** the owner wants the effect only where the cursor is. They disliked faint rings spreading across the whole photo after every gentle move.
      - **Damping:** `DAMPING = 0.95`, so waves die out near the cursor.
      - **Filter:** the shader drops faint slopes with `smoothstep(0.004, 0.016, length(slope))`.
      - **Strength:** a stroke disturbs a little harder (`× 0.008`, capped at 0.4) to compensate, while slow moves (under ~4px per event) do nothing.
    - **Rejected:** a lingering marbled "crema" trail stirred in by the cursor was tried and removed by the owner as a long, unsmooth after-effect. Keep only the ripple.
    - **Dimming:** the photo is darkened inside the shader (`dim={0.85}`, toward `ink`) instead of by a `bg-ink/85` overlay, so the ripple shading isn't hidden under it. The non-WebGL fallback renders its own `bg-ink` overlay at that opacity.
  - **Hero, continued:** The photo must stay intact and readable. Rejected earlier: a cursor ember trail, a smeary rainbow-edged fluid trail, and a lens bulge that followed the cursor like a circle. It pauses off screen, falls back to a plain image without WebGL or with reduced motion, and must not destroy its WebGL context on cleanup (StrictMode remounts in dev and the photo goes black). No grid pattern: the owner removed it as looking AI-generated. It shows a plain "Hello there, I'm" label and a static two-tone name, with the typed text cycling `profile.roles`. Keep the name static; don't retype it. No per-letter effects on the name: a letter-by-letter hover wave was tried and removed by the owner. Instead, each text line floats on its own: a slow, pure vertical bob (5–9px, easeInOutSine) from the `animate-float` keyframes in `index.css` `@theme`. Each line sets its own `--float` height, `animation-duration` and a negative `animation-delay` so the lines stay out of step (the `float` map in `Hero.jsx`). It animates the CSS `translate` property, so it runs on the GPU and doesn't fight the reveal's `transform`, and it uses `motion-reduce:animate-none`. Don't drive it from JS (`useTime` or motion values): that version stuttered next to the WebGL water. It must not follow the cursor: the owner disliked the cursor-driven parallax drift. No light sheen sweep on the name either (the owner declined it). The owner removed the waving-hand emoji, the "Open to full-time roles" badge, and the intro paragraph (it duplicated the About description).
- **Experience logos:** organization logos live in `src/assets/logos/` and are picked up by filename through `logoFor()` in `data/experience.js` (currently `feu-tech.*` and `simplevia.*`). A missing file falls back to the `initials` monogram badge on the timeline. Keep Experience as the drawn-line timeline; the owner rejected a dropdown/accordion here (that request was meant for Skills).
- **Projects:** grid view is always two equal columns; there is no full-width featured card, which the owner rejected.
  - **Grid cards:** just the screenshot (the owner found text cards too large for their content).
    - **md and up, on hover-capable devices** (`md:[@media(hover:hover)]`): hovering or focusing a card fades in a dark gradient and slides up the details: role, name, a 3-line description and an icon link. The list view is there for full details.
    - **Below md (any device) and on touch screens:** the details are a caption under the image instead. Its description (`ExpandableText`) is clamped to 3 lines with a "Read more" / "Show less" toggle that only appears when the text is actually cut off. The owner asked for this because the grid/list toggle is hidden on small screens.
  - **Tags:** there are no tool tags on cards or rows; the owner removed them as clutter (`tools` stays in the data).
  - **Project link:** an icon-only round arrow (`IconButton` with `href`, labelled "View <name>"), with no "View Project" text. List view alternates: a large screenshot (7/12) beside the details (5/12), with sides swapping every row; when the image is on the left, the text is right-aligned. Projects are paginated at `PAGE_SIZE = 6` in both views, and the page controls only render once there is more than one page.
- **Certifications show Credly badge artwork.** Each entry in `data/certifications.js` has:
  - `badgeId`: the `data-share-badge-id` from Credly's embed code. It builds the public link `https://www.credly.com/badges/<id>/public_url`.
  - `image`: the badge PNG, downloaded into `src/assets/certifications/` and resized to 340px.
  - **No Credly widget:** the owner wants the badge image only, not Credly's embed (iframe or `embed.js`) with its title, issuer and "Provided by Credly" frame.
  - **Adding a badge:** get the image URL from `https://www.credly.com/embedded_badge/<id>` (the `images.credly.com` src), then download and resize it.
  - **Inactive slides:** the link is `pointer-events-none` so drag and slide-to-click still work.
- **Certifications carousel:** a full-bleed Swiper with `slidesPerView="auto"`, centered slides, loop, and autoplay (5 s, pauses on hover, off for reduced motion).
  - **Look:** an edge mask fades the peeking neighbors. Inactive cards are `scale-90`, dimmed and grayscale; the active card glows.
  - **Controls:** the counter, dots and prev/next buttons sit below the track. The dots render into `.certs-pagination`, and their overrides live in `index.css`.
  - **Keep it responsive:** the owner loves how it fits every screen size, so don't change slide widths, breakpoints or the card layout.
  - **Curved track:** each slide's inner wrapper gets `perspective(1600px) rotateY(-progress × 24°) translateZ(-|progress| × 40px)` from Swiper's `watchSlidesProgress` (`onProgress` and `onSetTransition`), so neighbours angle in like a wall wrapping around you. The sign matters: positive angles turn them away and they vanish. Off for reduced motion.
  - **Badge coin flip:** the badge spins 360° on `rotateY` each time its card becomes active.
  - **Glow room:** the track is `-my-14! py-20!` so the active card's glow fades out instead of being cut off by Swiper's `overflow: hidden` (the owner noticed the hard edge). That padding overlaps the controls row, which therefore has `relative z-10`; without it the prev/next buttons can't be clicked.
  - **Autoplay countdown:** the active dot is a pill that fills left to right over the 5 s autoplay (`onAutoplayTimeLeft` writes `--autoplay-progress` straight onto the dots element; never put it in React state, since it fires every frame). It pauses on hover along with autoplay.
- **Skills:** each skill in `data/skills.js` has `name`, `description` (2–3 words), a brand `logo` (or a Lucide `icon` for generic skills), and its official brand `color`. The color tints the icon box and drives the hover glow. Groups, in order: Front-End (HTML5, CSS3, JavaScript, React, Vue.js, Tailwind, Mantine, Bootstrap), Design & Animation (includes Canva), Back-End & Databases (PHP first, Swagger UI last), Tools & AI, Mobile (React Native, Expo, Android Studio), Certified Foundations (Networking, Cybersecurity, PM; deliberately not called "expertise"), Other Languages (Python, C++, Java; no "Basic Knowledge" label) and, last, Data & Analytics (Upskilling). There is no "Core Languages" group anymore: the owner split it into Front-End, Back-End and Other Languages. Skills render as chips inside category cards. New skills need all four fields.
  - **Category cards (current design, a "software expertise" board):** one card per category in a grid: 1 column on phones, 2 on tablets (a lone last card spans both), and 3 per row on desktop using a 6-track grid with cards spanning 2, so an incomplete last row (one or two cards) sits centred.
    - **Card:** the title, then the tools as pill chips (the owner removed the number and "N skills" header row) (logo in a brand-tinted circle and the name). It lifts on hover, its border warms, and a soft taupe spotlight follows the pointer (`--mx`/`--my` set on pointer move).
    - **Chip:** a rounded rectangle (`rounded-lg`, the owner wanted a border radius, not a full pill) with no fill, just a `border-white/10` outline, and the logo in a `rounded-md` brand-tinted box. Hovering tints it in the brand colour (border, background, glow), and its `description` shows as the native tooltip. These chips are the one exception to "controls are round", since they are labels, not controls.
    - **Growth:** add skills or categories in `data/skills.js`; they become chips or cards.
    - **History:** before this came a dropdown list (rows with just the name and a chevron) and, before that, filterable tabs. The owner asked for cards like a reference, with better design.
    - **History:** the owner rejected scroll-driven designs here. A sticky list beside scrolling blocks and a pinned scroll-stepped stage both shifted the page or mismatched the emphasis, and clicking a category moved the page. A Matter.js physics jar was tried before those.
- **Footer:** minimal on purpose.
  - **Layout:** the same `bg-ink` as Contact (the owner wanted no darker band), separated only by a hairline divider that fades out at both ends. Then the tagline as a large sign-off line on the left and a "Find me on" list on the right (stacked on phones).
    - **Sign-off:** the part before ` — ` is muted (`text-stone-500`) and the rest is white. It's `profile.tagline` in `data/site.js`: "From the first sketch to the final commit — I care about every step in between." It covers both design and code, and is sincere rather than a slogan. Also rejected: "… — fuelled by a little too much coffee." (the owner didn't want to spell out liking coffee) and "Designed with intent, built line by line — so it works as well as it looks." (sounded sarcastic) The owner rejected "Thanks for scrolling this far — let's build something worth scrolling for." as cliché.
    - **Find me on:** `socials` as text rows with a `↗` arrow. Each row's divider line fills taupe from the left on hover. These are labelled rows, not `SocialIcon` circles, which the hero and phone menu already show.
  - **Bottom:** a bar with "© year Troy Bay. All rights reserved." (the owner wants that line) and an icon-only up-arrow `IconButton` (`aria-label` "Back to top"; the owner removed the visible words), then an oversized faded "Troy Bay" wordmark cropped by the bottom edge.
  - **Curtain reveal** (scroll-scrubbed, reverses going back up, static for reduced motion; `useScroll` on the footer, `['start end', 'end end']`):
    - **Content:** it slides up from -35% and brightens from 0.2 opacity as the footer comes in, like it's revealed from under Contact.
    - **Wordmark:** its letters rise one by one out of the bottom edge.
    - **Always completes:** the footer's end meets the screen's end at the page bottom, so progress always reaches 1. This is why it's scroll-linked rather than a `whileInView` reveal, which never fires on short screens.
    - **Opacity gotcha:** compute the opacity with a function transform. A plain `[in] → [out]` opacity map gets offloaded to the browser's native scroll timeline, which left the footer stuck at 0.2.
    - **Clipping:** the wordmark letters clip on the y-axis only, because tight tracking pushes glyphs past their box sideways.
  - **Removed as redundant:** the small logo (the wordmark and navbar already show the name), a navigation list (the navbar is always visible) and a "Get in Touch" column (the Contact section sits right above). Don't re-add them.
- **Full-height sections:** `<Section>` is `min-h-svh` with content centered vertically; every section is at least one screen tall.
- **Scroll animation:** use `components/ui/Reveal.jsx` so motion stays consistent.
  - `<Reveal>` fades or slides a single element in on scroll; `x`/`y`/`delay` props tune it.
  - `<RevealGroup>` with `<RevealItem>` children staggers lists and grids. Pass `play={boolean}` to control it manually instead of on scroll; the hero uses `play={ready}` so it animates as the preloader lifts.
  - Section headings already reveal through `SectionHeading`.
  - The Hero has parallax and fades out on scroll.
  - Don't hand-roll new `whileInView` animations elsewhere.
- **Scroll-linked motion** (added so scrolling feels alive, not just one-shot fades):
  - **Smooth scrolling:** Lenis (`useSmoothScroll`, started first in `App`). There's no CSS `scroll-behavior: smooth`, because the two fight each other.
    - **Locking:** use `setScrollLocked()` (preloader, phone menu), never `body.style.overflow`.
    - **Links:** in-page link clicks go through `useCleanAnchorLinks`, which glides with a distance-based duration (about 1 s per 1100 px, 1–2.8 s, easeInOutCubic) so the hero's Scroll cue plays the dive instead of flashing past, and calls `lenis.start()` before `scrollTo` (resuming later cancels a scroll in progress). Lenis reads `scroll-padding-top`, so don't pass an extra offset.
  - **Experience timelines:** a `DrawnLine` fills down the track with a glowing tip as you scroll.
  - **Section titles:** `SectionHeading` titles rise word by word from behind a mask. The words are variant children of its `RevealGroup`.
- **Signature transitions and interactions** (inspired by wallofportfolios.in):
  - **Hero → panel:** the hero is pinned (`sticky top-0`) and stays exactly in place, full width, while everything after it in a `bg-ink` panel slides up and covers it; the transition is a two-stage "dive" (the owner found a plain cover too short for the zoom to mean anything). The hero renders a spacer (`h-[140svh]`, matching `DIVE_SCREENS = 1.4`; skipped for reduced motion) after itself, and `journey` runs 0→1 over those 1.4 screens of scroll, then 1→2 over one more (the owner found one screen too fast and 1.8 a bit slow). From 0 to 1 the background (photo, glow, particles) zooms 1→2.4 around a low origin (`origin-[50%_70%]`) and drifts up 12%, so the dive heads downward like sinking underwater (the owner asked for this). The text rises 220px and rushes past (scales to 1.6, blurs and clears by 0.7). Keep the low origin: with it, the scaled background always covers the bottom edge while it rises. From 1 to 2 About slides up while the background keeps expanding to 2.7 and darkens; the darkening overlay sits behind the text. Before the dive existed, the owner asked not to fade the hero text just because it gets covered; it now clears only as part of the dive (they disabled an earlier shrink/rounded "sink" because it exposed the sides). Its progress comes from page `scrollY`, not `useScroll({ target })` (a sticky element's offset moves with it). Once fully covered the hero gets `invisible` and `FluidImage` is `paused`. `useActiveSection` picks the lowest section crossing the middle, because the pinned hero always crosses it, and the panel is in `App` (`z-10`). The panel has no hard top edge (no rounded corners, border or shadow): its first block is an `h-[55svh]` gradient (transparent via `ink/60` to `ink`; the owner asked for it more spread out than the original `h-56`) inside the panel, above a `bg-ink` wrapper for the sections. Because the fade is part of the panel, it starts below the first screen and moves with it. Don't go back to an absolutely positioned fade above the panel with scroll-linked opacity: while it was half faded it left a visible hard line across the hero. The hero is hidden only once `#about`'s top passes the viewport top. The panel must not overlap the hero (no negative margin): the owner wants the hero to fill the first screen with no hint of About.
  - **Experience "dimension" circle (like sahor.work's Digital Archive):** The circle must not be limited to Experience's box: the owner wants it to spill over the neighbouring sections. So there are two layers, both clipped to `circle(r at 50% cy)` and recomputed from the content wrapper's rect on every scroll (`circleFor`). Its radius and center follow a spring (`CIRCLE_SPRING`), so the circle trails the scroll and settles like the cursor ring (the owner asked for that delay); the content mask uses the same sprung values minus the content's live top, so the layers stay aligned. The circle is a `fixed inset-0 z-20 bg-dimension` layer (`#403b37`, a deep warm gray-brown the owner picked; a light taupe version with flipped colors, a latte-crema texture, a deep espresso `#3a2d24` and a lighter gray-taupe `#56514c` were tried first). Because it's lighter than the page, the section re-points the muted palette one step lighter (`DIMENSION_TEXT`: accent → accent-strong, stone-400 → stone-300, stone-300 → stone-200) so labels, dates and body text keep their contrast. The layer sits above About and Certifications inside the `z-10` panel but under the navbar (`z-50`). Experience's content sits above it (`relative z-30`), masked by the same circle in its own coordinates. Nothing above it may get a `transform` or `filter`, or `fixed` would stop being relative to the viewport.
    - **Opening:** a small dot appears at the section's top edge as it enters, then grows (easing in) and settles in the middle of the screen, covering everything once the top is 15% down the screen. Clicking a link to `#experience` must land with the circle already full and no edges showing (the owner asked for this): the full point is reached before the landing spot under the navbar, and during any in-page link glide (3.5 s after a click on `a[href^="#"]` or `a[data-section]`) the spring is bypassed with `jump()` so the circle tracks the scroll exactly.
    - **Closing:** it stays full while you read (also covering the start of Certifications), then shrinks back to a dot that follows the section's bottom edge. It is completely gone (radius 0) once the bottom is within `max(15% of the screen, 80px)` of the top, so clicking Certifications never lands with a leftover dot or edge on any screen size (the owner asked for this; verified at 1920×1080 down to 360×640 and landscape phones).
    - **Reduced motion:** a plain `bg-dimension` section, no circle.
    - **History:** a scroll marquee and an opening rounded window were tried first; the owner chose this.
  - **Heading zoom (Skills label):** `<Section zoom="label" | "title">` makes that text start oversized and shrink into place.
    - **Where it's used:** only by Skills, on its small "Skills" label, which starts as a huge centred word (up to 7×). The owner first tried it on the Projects title (`zoom="title"`, up to 2.6×), then moved it to the Skills label.
    - **Scrubbed and pinned (like the About title on sahor.work):** the zoom follows the scroll and reverses when you scroll back up. The owner rejected a timed, play-once version.
      - **Pinning:** the heading pins (`sticky top-36 sm:top-44`, i.e. the 64px navbar plus the section's top padding) over a `h-[70svh]` spacer. The zoom plays over that stretch, then the heading scrolls on.
      - **Navbar clicks:** clicking Skills lands at the end of the stretch with the zoom already settled (the owner asked for this). It works through an invisible `[data-landing]` marker at `70svh` minus the section's top padding, which `useCleanAnchorLinks` glides to instead of the section top. Any section can add one. Scrolling up from there replays the zoom in reverse.
      - **Overflow:** the section uses `overflow-clip`, not `overflow-hidden`, which would break sticky.
    - **Size and pacing:** it's capped to what fits the heading's width, so it never overflows, and paced with smoothstep.
    - **Fade-in:** the rest of the heading (the title when the label zooms, the description and the action) fades in over the last 45% of the zoom.
    - **Mechanics:** it uses motion `scale` (`origin-top`, or `origin-top-left` when not centred), and it's off for reduced motion.
    - **Rejected:** a stacked-cards version, where Skills stuck in place while Projects slid over it as a rounded card, left Skills visible behind the transparent Contact section further down. Don't make whole sections sticky inside the panel (pinning just the heading within its own section is fine).
  - **Ghost numbers:** `SectionHeading` shows a huge faint section number (taken from the eyebrow) with scroll parallax.
  - **Image reveals:** images fade in from a slight zoom and blur (no clip-path wipe: the owner disliked the bottom-to-top "filling up" look) via `RevealImage`, or `imageReveal` variants from `components/ui/revealVariants.js` inside a `RevealGroup`. Variants live in that `.js` file because component files may only export components (react-refresh lint rule).
  - **Project cards:** grid cards tilt up to 5° toward the pointer, with a light sheen. There's no tilt for reduced motion.
  - **Custom cursor:** `Cursor` replaces the system cursor for fine pointers at `lg` and up (the owner wanted only the custom one). It adds `lg:cursor-none` and `lg:[&_*]:cursor-none!` to `<html>`, so narrower windows and touch keep the normal cursor. A small taupe dot sits exactly on the pointer for precise clicks, and a taupe ring trails it. Both use `mix-blend-difference` so they stay visible over the light taupe buttons, except the ring while it shows a label. It swells over links and shows a label over `data-cursor="View"` (project images) and `data-cursor="Drag"` (certifications carousel).
- **Reuse `Button`** (rounded pill with the label left and an `icon` in its own circle on the right; `primary` is the taupe gradient with a dark icon circle, `outline` a white/20 border with a bordered circle that fills taupe on hover; `nudge="x"|"y"` sets the icon's hover motion; renders `<a>` when given `href`; used by the hero buttons and the Contact send button so they match), **`SocialIcon`** (magnetic round social link with tooltip) and **`IconButton`** (round arrow button for carousel, pagination and project links; renders `<a>` when given `href`), and **`IconBadge`** (round icon badge beside the Experience timeline headings; give its parent `group` so the hover glow and tilt trigger). Don't hand-roll plain `bg-surface` icon boxes, or restyle buttons and social links by hand.
- **Components:** arrow functions with `export default` at the bottom of the file, single quotes, semicolons, 2-space indent. No `import React`.
- **Icons:** UI icons come from `react-icons`. Decorative icons get `aria-hidden`; icon-only links and buttons get an `aria-label`.
  - **Original brand logos:** the Skills tiles and the Contact profile rows use full-color logo files from `src/assets/brand-logos/` (the owner wants original logos, not one-color brand icons).
    - **Sources:** SVGs come from the Iconify `logos` set (`https://api.iconify.design/logos/<name>.svg`; prefer the `-icon` variants over wordmarks). Brands whose mark is black (GitHub, Expo, Framer, CapCut) use the white version so they show on the dark theme. JobStreet and CapCut are PNGs taken from their sites. Canva isn't in the Iconify `logos` set, so it uses `thesvg-color:canva` (the current app icon: a white C on a teal-to-purple circle). Android Studio isn't there either, and the owner wanted its current icon (blue drafting compass, navy hinge, green Android head peeking out), so `android-studio.svg` is a hand-drawn vector traced from their reference, without its white badge. Vue.js and Swagger UI are `logos:vue` and `logos:swagger`.
    - **Generic skills** (Networking, Cybersecurity, PM) keep Lucide icons.
    - **Round social buttons** (`SocialIcon`) stay one-color `fa6` icons.
- **Animation:** use `motion/react`. `MotionConfig reducedMotion="user"` in App.jsx already honours reduced-motion settings; for CSS transitions add `motion-reduce:` variants where the movement is large.

## Design system

| Token (`src/index.css`) | Value     | Use                          |
| ----------------------- | --------- | ---------------------------- |
| `ink`                   | `#161513` | page background              |
| `ink-deep`              | `#0f0e0d` | spare darker shade (the footer now uses `ink`) |
| `surface`               | `#1f1d1a` | cards, inputs                |
| `line`                  | `#2d2925` | borders, dividers            |
| `accent`                | `#9f8f81` | brand accent (taupe)         |
| `accent-strong`         | `#c9bcaf` | accent text, hover states    |
| `dimension`             | `#403b37` | Experience's "dimension" circle |

- **Fonts:** one family, **Inter** (loaded from Google Fonts in `index.html`, weights 300–900), styled after dnyaneshgore.com, which the owner chose. Both tokens point to it: `font-display` is used bold for headings, the name, nav links, buttons, skill names and uppercase labels, and `font-sans` for paragraphs.
  - **Signature look:** heavy weight with very tight tracking on the big headings: the hero name is `tracking-[-0.06em]` and section titles `tracking-[-0.05em]`. Keep that, since without it Inter reads generic. The gradient surname in the hero has `pr-[0.1em] -mr-[0.1em]`: tight tracking pushes the last glyph past its box, and `bg-clip-text` would otherwise cut off the top of the "y".
  - **History:** the owner once rejected Inter (with Space Grotesk and JetBrains Mono) as too generic, then asked for it in this tight, heavy style. It replaced Onest (from khaledbatt.vercel.app, briefly), which had replaced Zalando Sans Expanded and Poppins.
  - **Other fonts:** don't add monospace or cursive/script fonts.
- **Palette experiments:** a subtle matcha green secondary accent (`#9caf88` on the hero glow, eyebrow numbers, nav underline and icon hovers) was tried and reverted because the owner found it too minimal. Don't reintroduce it unasked; if the idea returns, it needs a bolder treatment.
- **Text colors:** headings `text-white`, body `text-stone-300`/`text-stone-400`, muted `text-stone-500`.
- **Controls are round** (the owner asked to bring older square controls in line): buttons are pills, and icon buttons, badges and toggles are circles or pills with `border-white/20 bg-ink/40` (backdrop blur), turning taupe on hover. Active and selected states use the primary gradient (`from-accent-strong to-accent`). No `rounded-lg`/`rounded-xl` square icon tiles or toggles.
- **Repeated patterns:**
  - Eyebrow label: `font-display text-xs font-semibold tracking-[0.14em] text-accent uppercase`
  - Card: `rounded-2xl border border-line bg-surface`
- **Tokens:** don't name one `base` or `xs`; it collides with Tailwind size utilities such as `text-base`.
- **Responsive:** the layout must work at 390px with no horizontal scroll. `<main>` has `overflow-x-clip` so slide-in reveals can't widen the page; don't remove it, and don't move it onto `body` (browsers apply a body overflow setting to the whole window, where it doesn't clip reliably). Build mobile-first and add `sm:`/`md:`/`lg:` breakpoints on top.

## Gotchas

- **Base path is `/Portfolio/`** (`vite.config.js`). Files in `public/` must be linked through `import.meta.env.BASE_URL` (see `profile.resume`), not `/file.pdf`.
- **ESLint** doesn't see JSX usage for destructured or namespaced components, so the `no-unused-vars` rule ignores names starting with a capital letter and `motion`. Keep using `icon: Icon` destructuring and `motion.*`.
- **EmailJS:** the form fields are `user_name`, `user_email`, `subject`, `message`. Only the message used to arrive, because EmailJS fills only template variables whose names match and the template uses other names. So `templateParams()` in `Contact.jsx` sends each value under all the common names (`name`/`from_name`/`user_name`, `email`/`from_email`/`reply_to`/`user_email`, `title`/`subject`, `message`, plus `time`) via `emailjs.send`. Keep that mapping when changing the form.
- **Contact layout** (based on professional portfolio contact pages; the owner rejected an earlier boxed-cards version):
  - **Left, "Reach me directly":** the email large in the display font (`text-lg sm:text-xl`) with an underline that draws in on hover and an icon-only copy button, then the phone on a quiet line. The email only ever wraps right after the `@` (`<wbr>`), never mid-word.
  - **Right, a conversational form:** "What's your name?", "Your email", "What's it about?", "Your message" (the owner removed the 01–04 numbers). The inputs are underline-only and warm to taupe on focus. Placeholders are plain instructions ("Your full name", "Where can I reply?"); no sample names like "Jane Doe" or "jane@company.com", which the owner found AI-generic.
  - **Send:** the shared `Button` (pill with an arrow in a dark circle, spinner while sending), with the icon status line beside it. It stays a compact pill on every screen (on phones it sits at the left, `max-sm:self-start`); the owner rejected a full-width button on mobile.
- **Swiper CSS is unlayered,** so overrides for it must also be unlayered (outside `@layer`) in `index.css`, or use Tailwind's `!` suffix (`h-auto!`).
- **Windows, case-insensitive filesystem:** keep folders lowercase (`components/`, not `Components/`). Imports are case-sensitive on the Linux build server.
- **Dev server:** after changing `vite.config.js` or installing packages, it needs a full restart (Ctrl+C, then `npm run dev`); a browser refresh isn't enough.
- **Large images:** several are 1–2 MB PNGs. Prefer WebP for new images, and use `loading="lazy"` on images below the fold.

## Working preferences

- The owner is iterating section by section on the UI. Keep changes scoped to the section asked about, and match the existing design system rather than introducing new colors, fonts or spacing scales.
- Explain visual changes in plain terms (what it looks like and how it behaves), and check that the layout works at both desktop and phone width.
- Don't commit, push or deploy unless asked.
