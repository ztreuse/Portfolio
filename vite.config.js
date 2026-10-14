import process from 'node:process';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Three.js is only imported dynamically (the preloader's 3D cup). Pre-bundle it up front, or the dev server finds
  // it late, optimizes it on the fly and reloads the page mid-load.
  optimizeDeps: {
    include: [
      'three',
      'three/examples/jsm/postprocessing/EffectComposer.js',
      'three/examples/jsm/postprocessing/RenderPass.js',
      'three/examples/jsm/postprocessing/BokehPass.js',
      'three/examples/jsm/postprocessing/OutputPass.js',
    ],
  },
  // GitHub Pages serves the site under /Portfolio/; Vercel serves it from the domain root (it sets VERCEL=1 when building).
  base: process.env.VERCEL ? '/' : '/Portfolio/',
});
