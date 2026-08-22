import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Deployed to GitHub Pages under /drawli/, so every asset path must be
// relative to BASE_URL. Override with VITE_BASE for a custom domain.
const base = process.env.VITE_BASE ?? '/drawli/'

export default defineConfig({
  base,
  plugins: [react()],
})
