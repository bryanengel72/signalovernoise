import '@fontsource-variable/inter';
import '@fontsource-variable/space-grotesk';
import { installLazyCal } from '../booking/cal';
import { EVENTS, installAnalytics, trackEvent } from '../analytics';
import { start } from './film';

/**
 * The scroll-film's entry point.
 *
 * It exists so film.ts can be imported without touching the document: the
 * engine grabs the canvas and rewrites the wordmark, so doing that at import
 * time made every module on the page untestable.
 */
installAnalytics();
installLazyCal({
  onOpen: (source) => trackEvent(EVENTS.bookingOpened, { source }),
  onBooked: () => trackEvent(EVENTS.bookingCompleted),
});
start();
