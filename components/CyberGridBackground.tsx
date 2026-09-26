'use client';

import React, { useEffect, useState } from 'react';

export default function CyberGridBackground() {
  const [mousePos, setMousePos] = useState({ x: 50, y: 30 });

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-20">
      {/* Dynamic Cursor Light Spotlight */}
      <div
        style={{
          background: `radial-gradient(circle 600px at ${mousePos.x}% ${mousePos.y}%, rgba(99, 102, 241, 0.08), transparent 80%)`,
        }}
        className="absolute inset-0 transition-opacity duration-300"
      />

      {/* Radiant Glowing Ambient Nebulas */}
      <div className="absolute -top-40 left-1/4 w-[700px] h-[700px] bg-gradient-to-br from-indigo-600/20 via-purple-600/15 to-transparent rounded-full blur-[160px] animate-pulse" />
      <div className="absolute top-1/3 -right-20 w-[600px] h-[600px] bg-gradient-to-bl from-cyan-500/15 via-indigo-600/10 to-transparent rounded-full blur-[150px]" />
      <div className="absolute bottom-1/4 left-10 w-[650px] h-[650px] bg-gradient-to-tr from-purple-600/15 via-emerald-500/10 to-transparent rounded-full blur-[160px]" />

      {/* 3D Perspective Ground Grid (Visible in Hero top half) */}
      <div 
        style={{
          perspective: '600px',
        }}
        className="absolute top-0 left-0 right-0 h-[650px] overflow-hidden opacity-30"
      >
        <div 
          style={{
            transform: 'rotateX(72deg) translateY(-80px)',
            transformOrigin: 'top center',
          }}
          className="w-[200%] -left-1/2 h-[900px] cyber-grid-floor relative"
        >
          {/* Horizon Gradient Fade to black */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#04060c]/60 to-[#04060c]" />
        </div>
      </div>
    </div>
  );
}
