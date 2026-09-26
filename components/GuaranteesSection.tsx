'use client';

import React from 'react';
import { ShieldCheck, Zap, Lock, RefreshCw, CheckCircle2, ArrowRight } from 'lucide-react';
import TiltCard3D from './TiltCard3D';

export default function GuaranteesSection() {
  const guarantees = [
    {
      icon: ShieldCheck,
      title: '14-Day Delivery or $500 Cash Back',
      desc: 'We respect your time. If your completed platform is not ready for final review on Day 14, we credit you $500 on the spot.',
      color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30'
    },
    {
      icon: Zap,
      title: 'Guaranteed 95+ Core Web Vitals',
      desc: 'We engineer on Next.js 16 and edge CDN. If your new website does not achieve a 95+ Google PageSpeed score, we optimize for free until it does.',
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
    },
    {
      icon: Lock,
      title: '100% Full Code & Asset Ownership',
      desc: 'Zero platform lock-in or hostage fees. You own all design files, source code, domains, and content with full legal rights.',
      color: 'text-purple-400 bg-purple-500/10 border-purple-500/30'
    },
    {
      icon: RefreshCw,
      title: 'Unlimited Concept Revisions',
      desc: 'We collaborate closely until you fall in love with your new digital storefront. We do not stop until you are 100% thrilled.',
      color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30'
    }
  ];

  return (
    <div className="py-20 px-6 max-w-7xl mx-auto">
      <div className="p-8 sm:p-12 rounded-[36px] bg-gradient-to-br from-indigo-950/40 via-purple-950/20 to-black/80 border border-indigo-500/30 shadow-[0_20px_60px_-15px_rgba(99,102,241,0.2)] backdrop-blur-2xl relative overflow-hidden">
        
        {/* Ambient Top Glow Light */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[500px] h-[200px] bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center space-y-3 mb-12 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" />
            Zero-Risk Business Commitment
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            The Nexora 4-Point Ironclad Guarantee
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm max-w-xl mx-auto">
            We eliminate every ounce of risk from your web transformation. Here is our binding pledge to your business:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
          {guarantees.map((g, idx) => (
            <TiltCard3D key={idx} maxTilt={10} glareOpacity={0.12} className="h-full">
              <div className="h-full p-6 rounded-2xl bg-black/50 border border-white/10 hover:border-indigo-500/40 backdrop-blur-md space-y-4 flex flex-col justify-between group transition-all">
                <div className="space-y-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center border group-hover:scale-110 transition-transform ${g.color}`}>
                    <g.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-white tracking-tight leading-snug">
                    {g.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {g.desc}
                  </p>
                </div>

                <div className="pt-3 border-t border-white/5 flex items-center gap-1.5 text-[11px] font-mono text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Guaranteed in writing</span>
                </div>
              </div>
            </TiltCard3D>
          ))}
        </div>
      </div>
    </div>
  );
}
