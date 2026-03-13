import { motion, useMotionValue, useTransform, useSpring } from 'motion/react';
import React, { useEffect } from 'react';

// Pre-calculate random positions for nodes to ensure stable rendering
const NODES = Array.from({ length: 40 }).map((_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 3 + 1,
  opacity: Math.random() * 0.5 + 0.1,
  duration: Math.random() * 20 + 10,
  delay: Math.random() * -20
}));

// Pre-calculate connections between nearby nodes
const CONNECTIONS: { id: string; source: any; target: any; opacity: number }[] = [];
for (let i = 0; i < NODES.length; i++) {
  for (let j = i + 1; j < NODES.length; j++) {
    const dx = NODES[i].x - NODES[j].x;
    const dy = NODES[i].y - NODES[j].y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < 25) {
      CONNECTIONS.push({ id: `${i}-${j}`, source: NODES[i], target: NODES[j], opacity: 1 - distance / 25 });
    }
  }
}

export const SignalVisual = () => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set((e.clientX / window.innerWidth) * 2 - 1);
      mouseY.set((e.clientY / window.innerHeight) * 2 - 1);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const springX = useSpring(mouseX, { stiffness: 40, damping: 40 });
  const springY = useSpring(mouseY, { stiffness: 40, damping: 40 });

  const moveOuterX = useTransform(springX, [-1, 1], [15, -15]);
  const moveOuterY = useTransform(springY, [-1, 1], [15, -15]);
  
  const moveInnerX = useTransform(springX, [-1, 1], [-25, 25]);
  const moveInnerY = useTransform(springY, [-1, 1], [-25, 25]);

  return (
    <div className="relative w-full aspect-square max-w-[600px] mx-auto perspective-1000">
      
      {/* Soft glowing ambient background */}
      <motion.div 
        className="absolute inset-0 rounded-full opacity-30 mix-blend-screen"
        style={{
          background: 'radial-gradient(circle at center, var(--color-signal) 0%, transparent 70%)',
          filter: 'blur(30px)',
          x: moveOuterX,
          y: moveOuterY,
          scale: 1.2
        }}
      />

      {/* Container for the network */}
      <motion.div 
        className="absolute inset-0 overflow-hidden rounded-full border border-white/5 glass"
        style={{ x: moveInnerX, y: moveInnerY }}
        animate={{ rotate: 360 }}
        transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
      >
        {/* Connection Lines */}
        <svg className="absolute inset-0 w-full h-full" strokeWidth="0.5">
          {CONNECTIONS.map(conn => (
            <motion.line
              key={conn.id}
              x1={`${conn.source.x}%`}
              y1={`${conn.source.y}%`}
              x2={`${conn.target.x}%`}
              y2={`${conn.target.y}%`}
              stroke="var(--color-signal)"
              strokeOpacity={conn.opacity * 0.4}
              animate={{ opacity: [conn.opacity * 0.1, conn.opacity * 0.4, conn.opacity * 0.1] }}
              transition={{ duration: Math.random() * 4 + 2, repeat: Infinity, ease: "easeInOut" }}
            />
          ))}
        </svg>

        {/* Nodes */}
        {NODES.map((node) => (
          <motion.div
            key={node.id}
            className="absolute rounded-full bg-signal"
            style={{
              left: `${node.x}%`,
              top: `${node.y}%`,
              width: node.size,
              height: node.size,
              opacity: node.opacity,
              boxShadow: `0 0 ${node.size * 3}px var(--color-signal)`
            }}
            animate={{ 
              scale: [1, 1.5, 1],
              opacity: [node.opacity, node.opacity * 2, node.opacity]
            }}
            transition={{
              duration: node.duration,
              repeat: Infinity,
              delay: node.delay,
              ease: "easeInOut"
            }}
          />
        ))}
      </motion.div>
      
      {/* Central Core */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
        <div className="w-24 h-24 rounded-full border border-signal/20 absolute animate-[ping_4s_cubic-bezier(0,0,0.2,1)_infinite]" />
        <div className="w-16 h-16 rounded-full border border-signal/40 absolute animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite_1s]" />
        <motion.div 
          className="w-4 h-4 rounded-full bg-white glow-signal"
          animate={{ scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
      
    </div>
  );
};
