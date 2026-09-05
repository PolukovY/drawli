import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// Deployed to GitHub Pages under /drawli/, so every asset path must be
// relative to BASE_URL. Override with VITE_BASE for a custom domain.
const base = process.env.VITE_BASE ?? '/drawli/'

/**
 * Every build gets an id, and the runtime caches are named after it. Without
 * that, a redeploy left the old artwork and the old catalogue sitting in the
 * exercise cache: the shell updated, the content did not, and the only way out
 * was to uninstall the app. A new id means a new, empty cache; the stale ones
 * are swept up on the next launch.
 */
const buildId = (
  process.env.VITE_BUILD_ID
  ?? process.env.GITHUB_SHA
  ?? new Date().toISOString().replace(/[^0-9]/g, '')
).slice(0, 12)

export default defineConfig({
  base,
  define: { __BUILD_ID__: JSON.stringify(buildId) },
  plugins: [
    react(),
    VitePWA({
      // 'prompt', not 'autoUpdate': a new build must never take the screen
      // away from a child mid-stroke. The app is told a version is ready and
      // shows a banner; see src/app/serviceWorker.ts for what happens next.
      registerType: 'prompt',
      // The service worker scope must match the Pages sub-path, or the app
      // installs but never serves anything offline.
      base,
      scope: base,
      includeAssets: ['icons/*.svg'],
      manifest: {
        name: 'Drawli',
        short_name: 'Drawli',
        description: 'Drawli — learn to draw step by step',
        lang: 'uk',
        start_url: base,
        scope: base,
        display: 'standalone',
        orientation: 'landscape',
        background_color: '#F4F1FA',
        theme_color: '#7C5CFF',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        cleanupOutdatedCaches: true,
        // The new worker waits its turn rather than seizing the page. It takes
        // over when the child asks it to, or on the next launch — which is
        // what the browser does by itself once no window is using the old one.
        skipWaiting: false,
        // Claiming is not seizing: it only means the page that registered a
        // worker is controlled by it straight away instead of from the next
        // load. Without it the first launch after an install runs uncontrolled,
        // and a new build has no page to hand itself to.
        clientsClaim: true,
        // Only the shell ships with the install: the library is hundreds of
        // small SVGs and precaching them would make the first launch crawl.
        globPatterns: ['**/*.{js,css,html,ico,png}'],
        globIgnores: ['**/exercises/**', '**/vocabulary/**'],
        navigateFallback: `${base}index.html`,
        runtimeCaching: [
          {
            // The catalogue must be allowed to grow: served from the network
            // when it can be, from cache when the tablet is offline.
            urlPattern: /\/exercises\/index\.json$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: `drawli-catalogue-${buildId}`,
              networkTimeoutSeconds: 4,
              expiration: { maxEntries: 4, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
          {
            // Exercise definitions and artwork: instant from cache, refreshed
            // in the background so a redraw of an exercise reaches the child.
            urlPattern: /\/exercises\/.*\.(?:svg|json)$/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: `drawli-exercises-${buildId}`,
              expiration: { maxEntries: 2000, maxAgeSeconds: 60 * 60 * 24 * 180 },
            },
          },
          {
            // The vocabulary game's word lists and pictures: same deal as the
            // exercise library, and named separately so pruning one on a
            // redeploy never touches the other's cache.
            urlPattern: /\/vocabulary\/.*\.(?:svg|json)$/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: `drawli-vocabulary-${buildId}`,
              expiration: { maxEntries: 500, maxAgeSeconds: 60 * 60 * 24 * 180 },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'drawli-fonts',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      },
    }),
  ],
})
