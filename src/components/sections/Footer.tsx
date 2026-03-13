interface FooterProps {
  onPrivacy: () => void;
}

export const Footer = ({ onPrivacy }: FooterProps) => {
  return (
    <footer className="border-t border-white/5 p-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted uppercase tracking-widest">
      <div>© 2026 SIGNAL OVER NOISE AI.</div>
      <div className="flex gap-8">
        <a href="#" className="hover:text-signal transition-colors">SYS.LOG</a>
        <button onClick={onPrivacy} className="hover:text-signal transition-colors cursor-pointer">DATA.PRIVACY</button>
      </div>
    </footer>
  );
};
