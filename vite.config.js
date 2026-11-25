import process from 'node:process';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// The site's full address, for the link-preview tags in index.html: on Vercel the real domain for the live site and the
// branch's own address for a preview; otherwise GitHub Pages.
const siteUrl = () => {
  const { VERCEL, VERCEL_ENV, VERCEL_PROJECT_PRODUCTION_URL, VERCEL_BRANCH_URL, VERCEL_URL } = process.env;
  if (!VERCEL) return 'https://ztreuse.github.io/Portfolio/';
  const host = VERCEL_ENV === 'production' ? VERCEL_PROJECT_PRODUCTION_URL : VERCEL_BRANCH_URL;
  return `https://${host || VERCEL_URL}/`;
};
const linkPreview = {
  name: 'link-preview-url',
  transformIndexHtml: { order: 'pre', handler: (html) => html.replaceAll('%SITE_URL%', siteUrl()) },
};

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), linkPreview],
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
