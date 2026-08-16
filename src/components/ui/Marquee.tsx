import { marqueeCopy, type MarqueeCopy } from '@/content/sections/marquee';

/**
 * The CSS keyframe translates the track by -50%, so the phrase block must be
 * repeated an even number of times for the loop to be seamless.
 */
const REPEATS = 6;

export const Marquee = ({ copy = marqueeCopy }: { copy?: MarqueeCopy }) => {
  return (
    <div className="relative flex overflow-hidden whitespace-nowrap bg-signal text-black py-3 border-b border-grid group">
      {/* Edge fades */}
      <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-black/25 to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-black/25 to-transparent z-10 pointer-events-none" />
      <div
        className="marquee-track flex gap-8 items-center text-xs font-bold tracking-widest uppercase min-w-max group-hover:[animation-play-state:paused]"
      >
        {[...Array(REPEATS)].map((_, i) => (
          <div key={i} className="flex gap-8 items-center">
            {copy.phrases.map((phrase) => (
              <span key={phrase} className="flex gap-8 items-center">
                <span>{phrase}</span>
                <span className="w-1.5 h-1.5 bg-black rounded-full" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
