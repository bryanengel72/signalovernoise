import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, type Plugin } from 'vite';
import { renderExperienceHtml } from './content/experience-html';

/**
 * The scroll-film's Copy, rendered into its HTML at build time.
 *
 * /experience is a hand-written page with its own runtime — it is deliberately
 * not React — but it used to be a full fork: its own nav, its own copy, its own
 * hardcoded contact address. It is a build entry now, so its words come from
 * content/ like everything else and Identity is not duplicated. The markup is
 * still static in the output, which is what a marketing page wants.
 */
const experienceContent = (): Plugin => ({
  name: 'experience-content',
  transformIndexHtml: {
    order: 'pre',
    handler(html, { filename }) {
      return filename.endsWith('experience.html') ? renderExperienceHtml(html) : html;
    },
  },
});

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), experienceContent()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html'),
          experience: path.resolve(__dirname, 'experience.html'),
        },
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify — file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
