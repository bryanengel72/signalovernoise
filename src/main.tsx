import {StrictMode} from 'react';
import {createRoot, hydrateRoot} from 'react-dom/client';
import App from './App';
// Self-hosted, so text renders without a round-trip to Google (and without
// sending visitors' IPs there). Each covers every weight the design uses.
import '@fontsource-variable/inter';
import '@fontsource-variable/space-grotesk';
import './index.css';
import { installLazyCal } from './booking/cal';

// Cal.com's embed loads when someone reaches for a booking button, not before.
installLazyCal();

const root = document.getElementById('root')!;
const app = (
  <StrictMode>
    <App />
  </StrictMode>
);

// The production build ships the page pre-rendered (scripts/prerender.mjs), so
// attach to that markup. The dev server serves an empty root, so render there.
if (root.hasChildNodes()) hydrateRoot(root, app);
else createRoot(root).render(app);
