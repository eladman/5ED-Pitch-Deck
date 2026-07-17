# 5ED — Pitch Deck

A scroll/keyboard-navigable investor deck (Hebrew, RTL). Split into normal editable files instead of one giant HTML blob.

## Structure

```
index.html      # all 14 slides — the content you'll edit most often
css/styles.css  # all styling (colors, layout, animations, deck-mode/slide overrides)
js/main.js      # all behavior (hero particle logo, the "10%" canvas, GSAP scroll reveals, slide nav, etc.)
assets/logo.png # the 5ED logo (previously an inline base64 blob — now a real file)
```

## Running it locally

Requires [Node.js](https://nodejs.org/) (18+).

```bash
npm install   # first time only
npm run dev   # starts a local dev server with live reload
```

Open the URL it prints (usually http://localhost:5173).

## Editing content

Almost everything you'd want to change for a pitch update lives directly in `index.html`:

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
