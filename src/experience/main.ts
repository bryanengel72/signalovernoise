import { start } from './film';

/**
 * The scroll-film's entry point.
 *
 * It exists so film.ts can be imported without touching the document: the
 * engine grabs the canvas and rewrites the wordmark, so doing that at import
 * time made every module on the page untestable.
 */
start();
