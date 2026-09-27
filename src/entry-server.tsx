import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import App from './App';

/**
 * The page rendered to HTML at build time (see scripts/prerender.mjs).
 *
 * The site used to ship an empty <div id="root"> and build everything in the
 * browser, so anything that reads HTML without running JavaScript — most AI
 * crawlers, link previews, some search bots — saw no content at all. Now the
 * HTML carries every Section, and main.tsx hydrates it rather than replacing it.
 */
export const render = () =>
  renderToString(
    <StrictMode>
      <App />
    </StrictMode>,
  );
