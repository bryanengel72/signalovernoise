import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, type Plugin } from 'vite';
import { renderHtml } from './content/html-tokens';

/**
 * Identity and Copy, rendered into the HTML entries at build time.
 *
 * Both pages get the Identity tokens, so the contact address and the Cal.com
 * namespace are spelled out in exactly one place. The scroll-film additionally
 * gets its Copy: it is a hand-written page with its own runtime — deliberately
 * not React — but its words come from content/ like everything else, and the
 * markup is still static in the output, which is what a marketing page wants.
 */
const htmlTokens = (): Plugin => ({
  name: 'html-tokens',
  transformIndexHtml: {
    order: 'pre',
    handler: (html, { filename }) => renderHtml(html, filename),
  },
});

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), htmlTokens()],
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
      // Set DISABLE_HMR=true to serve without hot reload. Useful when an agent is
      // editing files underneath the dev server and the reloads fight the edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
