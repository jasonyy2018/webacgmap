'use client';

import React from 'react';
import { ShieldCheck, Award, Star, Lock, CheckCircle2, Zap } from 'lucide-react';

export default function TrustBadges() {
  const badges = [
    {
      icon: Star,
      title: 'Google Premier Partner',
      subtitle: 'Certified Search & Local Engine',
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10 border-amber-500/20'
    },
    {
      icon: Award,
      title: 'Clutch Top B2B Agency',
      subtitle: '4.9/5.0 Client Rating (2026)',
      color: 'text-indigo-400',
      bgColor: 'bg-indigo-500/10 border-indigo-500/20'
    },
    {
      icon: Lock,
      title: 'Stripe Verified Partner',
      subtitle: '256-Bit Bank-Grade Security',
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10 border-purple-500/20'
    },
    {
      icon: ShieldCheck,
      title: 'HIPAA & Privacy Ready',
      subtitle: 'Compliant Intake & Medical Forms',
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10 border-emerald-500/20'
    },
    {
      icon: CheckCircle2,
      title: '100% Code Ownership',
      subtitle: 'Zero Platform Lock-in Guarantee',
      color: 'text-teal-400',
      bgColor: 'bg-teal-500/10 border-teal-500/20'
    }
  ];

  return (
    <div className="py-10 border-y border-white/[0.06] bg-black/40 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-6">
          <span className="text-[11px] font-mono uppercase tracking-widest text-slate-400 font-semibold">
            Enterprise Security Standards & Industry Credibility
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4">
          {badges.map((b, idx) => (
            <div 
              key={idx}
              className={`p-3 sm:p-3.5 rounded-2xl border flex items-center gap-3 backdrop-blur-sm transition-all hover:scale-[1.02] ${b.bgColor} ${idx === 4 ? 'col-span-2 md:col-span-1' : ''}`}
            >
              <div className={`p-2 rounded-xl bg-black/40 ${b.color} shrink-0`}>
                <b.icon className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] sm:text-xs font-bold text-white truncate">{b.title}</div>
                <div className="text-[9px] sm:text-[10px] text-slate-400 truncate">{b.subtitle}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
