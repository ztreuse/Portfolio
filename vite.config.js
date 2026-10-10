import process from 'node:process';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // GitHub Pages serves the site under /Portfolio/; Vercel serves it from the domain root (it sets VERCEL=1 when building).
  base: process.env.VERCEL ? '/' : '/Portfolio/',
});
