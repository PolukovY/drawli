import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// Deployed to GitHub Pages under /drawli/, so every asset path must be
// relative to BASE_URL. Override with VITE_BASE for a custom domain.
const base = process.env.VITE_BASE ?? '/drawli/'

export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
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
        // Only the shell ships with the install: the library is hundreds of
        // small SVGs and precaching them would make the first launch crawl.
        globPatterns: ['**/*.{js,css,html,ico,png}'],
        globIgnores: ['**/exercises/**'],
        navigateFallback: `${base}index.html`,
        runtimeCaching: [
          {
            // The catalogue must be allowed to grow: served from the network
            // when it can be, from cache when the tablet is offline.
            urlPattern: /\/exercises\/index\.json$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'drawli-catalogue',
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
              cacheName: 'drawli-exercises',
              expiration: { maxEntries: 2000, maxAgeSeconds: 60 * 60 * 24 * 180 },
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
