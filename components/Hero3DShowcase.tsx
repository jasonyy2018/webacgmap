'use client';

import React, { useRef, useState, useEffect } from 'react';
import { 
  Zap, Star, ShieldCheck, Flame, TrendingUp, Smartphone, 
  Globe, CheckCircle2, ArrowUpRight, Activity, Sparkles 
} from 'lucide-react';

export default function Hero3DShowcase() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rotate, setRotate] = useState({ x: 14, y: -16 });
  const [isHovered, setIsHovered] = useState(false);
  const [tick, setTick] = useState(0);

  // Subtle continuous floating rotation animation
  useEffect(() => {
    const timer = setInterval(() => {
      setTick(prev => prev + 1);
    }, 50);
    return () => clearInterval(timer);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    // Interactive mouse rotation combined with base angle
    setRotate({
      x: 14 + y * -20,
      y: -16 + x * 25,
    });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotate({ x: 14, y: -16 });
  };

  const floatY = Math.sin(tick * 0.05) * 8;
  const floatZ = Math.cos(tick * 0.04) * 4;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        perspective: '1400px',
      }}
      className="relative w-full max-w-4xl mx-auto py-10 select-none"
    >
      {/* 3D Isometric Viewport */}
      <div
        style={{
          transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) translateY(${floatY}px) translateZ(${floatZ}px)`,
          transition: isHovered ? 'transform 0.12s ease-out' : 'transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)',
          transformStyle: 'preserve-3d',
        }}
        className="relative mx-auto w-full max-w-3xl"
      >
        {/* Glowing Horizon Glow Plate Underneath */}
        <div 
          style={{ transform: 'translateZ(-60px)' }}
          className="absolute -inset-10 bg-gradient-to-r from-indigo-500/20 via-purple-600/30 to-emerald-500/20 rounded-[40px] blur-3xl opacity-70 pointer-events-none"
        />

        {/* Outer 3D Chassis Base */}
        <div className="relative rounded-3xl p-1 bg-gradient-to-br from-indigo-500/40 via-purple-500/20 to-emerald-500/40 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8),0_0_50px_rgba(99,102,241,0.25)] border border-white/20 backdrop-blur-2xl">
          <div className="rounded-[22px] bg-[#070a14]/90 p-5 sm:p-7 border border-white/10 overflow-hidden relative">
            
            {/* Animated Laser Scan Beam */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-laser-scan shadow-[0_0_15px_#22d3ee]" />

            {/* Futuristic Window Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80 shadow-[0_0_8px_#f43f5e]" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80 shadow-[0_0_8px_#f59e0b]" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 shadow-[0_0_8px_#10b981]" />
                <span className="text-[11px] font-mono text-slate-400 ml-2">NEXORA-OS // HIGH-CONVERSION ENGINE v4.2</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>REAL-TIME STREAMING</span>
              </div>
            </div>

            {/* Platform Mockup Core UI */}
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                {/* Left Hero Preview */}
                <div className="md:col-span-8 p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3 relative overflow-hidden">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-[11px] font-bold">
                    <Sparkles className="w-3 h-3 text-cyan-400" />
                    <span>Dallas Premier 24/7 HVAC & Plumbing</span>
                  </div>
                  <h4 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    Emergency Dispatched in <span className="text-cyan-400">45 Minutes</span>
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed max-w-md">
                    Sub-second Edge CDN delivery with 1-tap thumb dispatch, automated dispatch SMS alerts & instant online price estimates.
                  </p>
                  
                  <div className="flex items-center gap-3 pt-2">
                    <div className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 text-white font-bold text-xs shadow-lg shadow-cyan-500/25 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 fill-white" />
                      <span>Book Instant Tech</span>
                    </div>
                    <div className="text-[11px] font-mono text-slate-400">
                      TTFB: <span className="text-emerald-400 font-bold">24ms</span>
                    </div>
                  </div>
                </div>

                {/* Right Mini Metrics */}
                <div className="md:col-span-4 space-y-3">
                  <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10">
                    <div className="text-[10px] text-slate-400 uppercase font-mono">Mobile Conversion</div>
                    <div className="text-2xl font-black text-emerald-400 font-mono mt-0.5">+314.8%</div>
                    <div className="text-[10px] text-emerald-300 flex items-center gap-1 mt-1">
                      <TrendingUp className="w-3 h-3" />
                      <span>vs Industry Standard</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10">
                    <div className="text-[10px] text-slate-400 uppercase font-mono">Google Lighthouse</div>
                    <div className="text-2xl font-black text-amber-400 font-mono mt-0.5">100 / 100</div>
                    <div className="text-[10px] text-slate-400 mt-1">
                      Passed Core Web Vitals
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Visualizer Bar */}
              <div className="p-3.5 rounded-xl bg-black/50 border border-white/5 flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-3">
                  <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
                  <span className="text-slate-400 text-[11px]">ACTIVE TRAFFIC FUNNEL:</span>
                  <div className="flex items-center gap-1">
                    {[40, 65, 85, 45, 95, 70, 80, 100, 60, 90, 85].map((h, i) => (
                      <span 
                        key={i} 
                        style={{ height: `${h * 0.16}px` }} 
                        className="w-1 bg-gradient-to-t from-indigo-500 to-cyan-400 rounded-full inline-block"
                      />
                    ))}
                  </div>
                </div>
                <div className="text-emerald-400 font-bold text-[11px]">
                  99.98% SLA
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ---------------- 3D Floating Holographic Elements in Z-Space ---------------- */}

        {/* Floating Element 1 (Top-Right): Core Web Vitals Speed Gauge */}
        <div
          style={{
            transform: 'translateZ(75px) translateY(-25px) translateX(25px)',
            transition: 'transform 0.2s ease-out',
          }}
          className="absolute -top-6 -right-6 hidden sm:flex items-center gap-3 p-4 rounded-2xl bg-[#090e1d]/95 border border-cyan-500/50 shadow-[0_15px_35px_rgba(6,182,212,0.3)] backdrop-blur-xl animate-float-slow"
        >
          <div className="w-11 h-11 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-inner">
            <Zap className="w-6 h-6 fill-cyan-400" />
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase text-cyan-300 font-bold tracking-wider">Sub-Second Speed</div>
            <div className="text-lg font-black text-white font-mono leading-tight">0.48s FCP</div>
            <div className="text-[10px] text-slate-400">Google Top 1% Fastest</div>
          </div>
        </div>

        {/* Floating Element 2 (Bottom-Left): Inbound Call Lead Alert */}
        <div
          style={{
            transform: 'translateZ(90px) translateY(25px) translateX(-25px)',
            transition: 'transform 0.2s ease-out',
          }}
          className="absolute -bottom-6 -left-6 hidden sm:flex items-center gap-3 p-4 rounded-2xl bg-[#090e1d]/95 border border-emerald-500/50 shadow-[0_15px_35px_rgba(16,185,129,0.3)] backdrop-blur-xl animate-float-reverse"
        >
          <div className="w-11 h-11 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-inner">
            <Flame className="w-6 h-6 fill-emerald-400" />
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase text-emerald-300 font-bold tracking-wider">Inbound Booking Captured</div>
            <div className="text-base font-black text-white leading-tight">+$3,200 New Quote</div>
            <div className="text-[10px] text-slate-400">Instant SMS dispatched to owner</div>
          </div>
        </div>

        {/* Floating Element 3 (Center-Top Pill): Security & SSL */}
        <div
          style={{
            transform: 'translateZ(55px) translateY(-15px)',
            transition: 'transform 0.2s ease-out',
          }}
          className="absolute -top-4 left-1/2 -translate-x-1/2 hidden md:flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-purple-500/40 text-purple-300 text-xs font-mono shadow-lg shadow-purple-500/20 backdrop-blur-md"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
          <span>EDGE ISOLATION • NEXT.JS 16 ARCHITECTURE</span>
        </div>
      </div>

      {/* Mobile-Only HUD Stat Pills (Compact & Centered for Small Screens) */}
      <div className="flex sm:hidden flex-wrap items-center justify-center gap-2 pt-4 px-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold">
          <Zap className="w-3.5 h-3.5 fill-cyan-400 text-cyan-400" />
          <span>0.48s FCP Speed</span>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold">
          <Flame className="w-3.5 h-3.5 fill-emerald-400 text-emerald-400" />
          <span>+$3,200 New Quote</span>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-mono font-bold">
          <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
          <span>100% HIPAA Ready</span>
        </div>
      </div>
    </div>
  );
}
