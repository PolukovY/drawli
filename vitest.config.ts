import { defineConfig } from 'vitest/config'

// Separate from vite.config.ts on purpose: the PWA plugin there tries to read
// a real build output when it initialises, which a test run never produces.
export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
  },
})
