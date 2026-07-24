export const Marquee = () => {
  return (
    <div className="relative flex overflow-hidden whitespace-nowrap bg-signal text-black py-3 border-b border-grid group">
      {/* Edge fades */}
      <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-black/25 to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-black/25 to-transparent z-10 pointer-events-none" />
      <div
        className="flex gap-8 items-center text-xs font-bold tracking-widest uppercase min-w-max group-hover:[animation-play-state:paused]"
        style={{ animation: 'marquee-scroll 25s linear infinite' }}
      >
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex gap-8 items-center">
            <span>AUTOMATE OR STAGNATE</span>
            <span className="w-1.5 h-1.5 bg-black rounded-full" />
            <span>MEASURABLE ROI</span>
            <span className="w-1.5 h-1.5 bg-black rounded-full" />
            <span>CUT THROUGH THE NOISE</span>
            <span className="w-1.5 h-1.5 bg-black rounded-full" />
            <span>ZERO HYPE. RESULTS ONLY.</span>
            <span className="w-1.5 h-1.5 bg-black rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
};
