import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App';
// Self-hosted, so text renders without a round-trip to Google (and without
// sending visitors' IPs there). Each covers every weight the design uses.
import '@fontsource-variable/inter';
import '@fontsource-variable/space-grotesk';
import './index.css';
import { installLazyCal } from './booking/cal';

// Cal.com's embed loads when someone reaches for a booking button, not before.
installLazyCal();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
