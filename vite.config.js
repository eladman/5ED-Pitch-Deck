import { defineConfig } from 'vite'
import { resolve } from 'path'

// Multi-page build: without this, Vite only emits the root index.html and
// /inhouse and /amir 404 on Vercel. Each entry below becomes its own page in dist/.
//   /         → the public landing page (mentors, stakeholders)
//   /inhouse  → the internal investor/partner deck
//   /amir     → the short Amir deck
export default defineConfig({
  build: {
    // Inline logos/photos (≤40KB) as base64 data URIs instead of emitting them
    // as separate hashed files. Default is 4KB, which left the accelerator logos
    // (Microsoft 27KB, Google 12KB) as extra CDN requests — on first view of the
    // slide they hadn't fetched yet, so they popped in a beat after the reveal
    // animation. Baking them into the HTML (like the tiny UpRise logo already was)
    // makes them paint instantly. The 2.4MB hero triptych stays external.
    assetsInlineLimit: 40 * 1024,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        inhouse: resolve(__dirname, 'inhouse/index.html'),
        amir: resolve(__dirname, 'amir/index.html'),
      },
    },
  },
})
