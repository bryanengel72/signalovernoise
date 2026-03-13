import { useState, useEffect } from 'react';
import { motion } from 'motion/react';

export const CustomCursor = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      
      const target = e.target as HTMLElement;
      const isClickable = 
        target.tagName.toLowerCase() === 'button' ||
        target.tagName.toLowerCase() === 'a' ||
        target.tagName.toLowerCase() === 'input' ||
        target.tagName.toLowerCase() === 'textarea' ||
        target.closest('button') ||
        target.closest('a');
        
      setIsHovering(!!isClickable);
    };
    
    window.addEventListener('mousemove', updateMousePosition);
    return () => window.removeEventListener('mousemove', updateMousePosition);
  }, []);

  return (
    <motion.div
      className="fixed top-0 left-0 pointer-events-none z-50 flex items-center justify-center mix-blend-difference"
      animate={{ 
        x: mousePosition.x - (isHovering ? 24 : 12), 
        y: mousePosition.y - (isHovering ? 24 : 12),
        width: isHovering ? 48 : 24,
        height: isHovering ? 48 : 24
      }}
      transition={{ type: "spring", stiffness: 500, damping: 28, mass: 0.5 }}
    >
      <div className={`border border-signal rounded-full absolute inset-0 transition-opacity duration-300 ${isHovering ? 'opacity-20' : 'opacity-100'}`} />
      <div className={`bg-signal rounded-full transition-all duration-300 ${isHovering ? 'w-2 h-2' : 'w-1 h-1'}`} />
      {isHovering && (
        <motion.div 
          className="absolute inset-0 border border-signal rounded-full"
          animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      )}
    </motion.div>
  );
};
