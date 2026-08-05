# 5ED — Site & Pitch Decks

Three static pages (Hebrew, RTL) built with Vite:

| URL | File | Audience |
|-----|------|----------|
| `/` | `index.html` | **Public landing page** — for outside mentors and stakeholders. No pricing, no named prospects, no internal structure. |
| `/inhouse` | `inhouse/index.html` | The **internal** investor/partner deck. `noindex` — unlisted, not linked from anywhere. |
| `/amir` | `amir/index.html` | The short Amir deck. `noindex`. |

Both decks are scroll/keyboard-navigable. Anything added to `/inhouse` is private by
default — before putting something on `/` ask whether an outside mentor should see it.

## Structure

```
index.html         # public landing page (standalone — does NOT use styles.css)
css/landing.css    # landing-page styling only
js/landing.js      # landing-page behavior (scroll reveals, sticky nav, count-up)

inhouse/index.html # the internal deck — the slides you'll edit most often
amir/index.html    # the Amir deck
css/styles.css     # deck styling (colors, layout, animations, deck-mode/slide overrides)
css/light.css      # deck light theme (all rules scoped under html.light)
js/main.js         # deck behavior (hero particle logo, GSAP scroll reveals, slide nav)
assets/            # logo, app screenshots, partner logos, team placeholders
```

The landing page deliberately does **not** load `css/styles.css` — that file hardwires
deck behaviour (scroll-snap slides, fixed nav) that would fight a normal scrolling page.
It re-declares the same brand tokens instead, so the two stay visually consistent.

## Running it locally

Requires [Node.js](https://nodejs.org/) (18+).

```bash
npm install   # first time only
npm run dev   # starts a local dev server with live reload
```

Open the URL it prints (usually http://localhost:5173).

## Editing content

Almost everything you'd want to change for a pitch update lives directly in `inhouse/index.html`:

- Each slide is a `<section id="sNN" class="slide">...</section>` block, in order, with an HTML comment header like `<!-- ===== 03 · STRATEGY / 10% ===== -->`.
- Numbers that animate on scroll (like the hero stats) use `<span class="num count" data-to="2500">0</span>` — edit the `data-to` value.
- To reorder or remove a slide, move/delete its whole `<section>` block. The slide counter, nav dots, and keyboard navigation all pick this up automatically (they read `section.slide` at runtime — no other file needs updating).

Colors, fonts, and spacing are all CSS variables at the top of `css/styles.css` (the `:root { ... }` block) — change `--orange`, `--ink`, etc. once and it updates everywhere.

## Building for deployment

```bash
npm run build     # outputs a production build to dist/
npm run preview   # serve that build locally to double check it
```

The `dist/` folder is a static site — drag it into Netlify/Vercel, or point any static host at it.

## Notes

- Fonts (Assistant, Secular One) and the animation libraries (three.js, GSAP) load from public CDNs — an internet connection is needed both in dev and when the deck is viewed.
- The deck degrades gracefully without JS animation libs (there's a no-GSAP fallback in `main.js`), but keyboard/scroll slide navigation needs JS.
