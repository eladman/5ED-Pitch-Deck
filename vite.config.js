import { defineConfig } from 'vite'
import { resolve } from 'path'

// Multi-page build: without this, Vite only emits the root index.html and
// /amir 404s on Vercel. Each entry below becomes its own page in dist/.
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        amir: resolve(__dirname, 'amir/index.html'),
      },
    },
  },
})
