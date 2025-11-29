import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Use root path for local development
  // For GitHub Pages deployment, set base to '/Cholera-Watch/' in package.json deploy script
  base: '/',
})
