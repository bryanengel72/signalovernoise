/**
 * Marquee Copy.
 *
 * The CSS keyframe `marquee-scroll` translates the track by -50%, which is only
 * seamless when the Section renders an even number of copies of these phrases.
 * That invariant lives in src/index.css; the phrase list itself lives here.
 */
export type MarqueeCopy = {
  phrases: ReadonlyArray<string>;
};

export const marqueeCopy: MarqueeCopy = {
  phrases: [
    'AUTOMATE OR STAGNATE',
    'MEASURABLE ROI',
    'CUT THROUGH THE NOISE',
    'ZERO HYPE. RESULTS ONLY.',
  ],
};
