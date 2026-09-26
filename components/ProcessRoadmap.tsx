'use client';

import React from 'react';
import { 
  Sparkles, CheckCircle2, ShieldCheck, Rocket, 
  Clock, ArrowRight, Layers, Smartphone, Code2, Globe 
} from 'lucide-react';
import TiltCard3D from './TiltCard3D';

export default function ProcessRoadmap() {
  const steps = [
    {
      phase: 'Phase 01',
      days: 'Days 1 – 3',
      title: 'AI Diagnostic & Bespoke Concept Preview',
      subtitle: 'Zero Guesswork',
      desc: 'We analyze your local market competitors, extract your highest-value customer keywords, and present an interactive Before vs. After Figma prototype.',
      icon: Sparkles,
      color: 'from-cyan-500 to-blue-600',
      tagColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
      badge: 'Figma Interactive Mockup'
    },
    {
      phase: 'Phase 02',
      days: 'Days 4 – 8',
      title: 'Next.js 16 Architecture & Mobile Optimization',
      subtitle: 'Engineered For Speed',
      desc: 'Our senior engineers build your bespoke platform on Next.js 16, ensuring sub-second loading (under 0.8s) and flawless thumb-friendly mobile responsive UX.',
      icon: Smartphone,
      color: 'from-indigo-500 to-purple-600',
      tagColor: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
      badge: '95+ Lighthouse Score'
    },
    {
      phase: 'Phase 03',
      days: 'Days 9 – 11',
      title: 'Automated Lead Funnel & Local SEO Sync',
      subtitle: 'Maximum Inbound Inquiries',
      desc: 'We configure 1-tap call buttons, direct Calendly/instant quote forms, SMS dispatch alerts, and Schema.org local Google Maps search markup.',
      icon: Layers,
      color: 'from-purple-500 to-pink-600',
      tagColor: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
      badge: 'Instant SMS & CRM Integration'
    },
    {
      phase: 'Phase 04',
      days: 'Days 12 – 14',
      title: 'Zero-Downtime Launch & 30-Day Support',
      subtitle: 'Guaranteed On-Time Delivery',
      desc: 'We perform a seamless DNS cutover with zero email or domain disruption. We monitor real-time conversions for 30 days post-launch to ensure peak ROI.',
      icon: Rocket,
      color: 'from-emerald-500 to-teal-600',
      tagColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      badge: '100% Code & Asset Ownership'
    }
  ];

  return (
    <div className="py-24 px-6 max-w-7xl mx-auto relative">
      {/* Background Accent Mesh */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none -z-10" />

      <div className="text-center space-y-3 mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-wider">
          <Clock className="w-3.5 h-3.5 text-indigo-400" />
          The Effortless 14-Day Delivery Method
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white">
          From Outdated to Market Leader in{' '}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-300 to-emerald-300">
            14 Business Days.
          </span>
        </h2>
        <p className="text-slate-400 text-sm max-w-2xl mx-auto">
          No months of endless meetings or technical headache. We handle the design, copywriting, coding, and SEO so you can focus on running your business.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
        {steps.map((step, idx) => (
          <TiltCard3D key={idx} maxTilt={10} glareOpacity={0.12} className="h-full">
            <div className="h-full p-6 sm:p-7 rounded-3xl bg-white/[0.025] border border-white/10 hover:border-indigo-500/40 backdrop-blur-xl space-y-5 flex flex-col justify-between group transition-all">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className={`text-[11px] font-mono font-bold uppercase px-2.5 py-1 rounded-full border ${step.tagColor}`}>
                    {step.phase}
                  </span>
                  <span className="text-xs font-mono text-slate-400 flex items-center gap-1 font-semibold">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span>{step.days}</span>
                  </span>
                </div>

                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${step.color} p-0.5 shadow-lg group-hover:scale-110 transition-transform`}>
                  <div className="w-full h-full bg-[#070a14] rounded-[14px] flex items-center justify-center text-white">
                    <step.icon className="w-6 h-6" />
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-white tracking-tight leading-snug">
                    {step.title}
                  </h3>
                  <div className="text-[11px] font-mono text-indigo-400 font-semibold">
                    {step.subtitle}
                  </div>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  {step.desc}
                </p>
              </div>

              <div className="pt-4 border-t border-white/5">
                <div className="inline-flex items-center gap-1.5 text-[11px] font-mono text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{step.badge}</span>
                </div>
              </div>
            </div>
          </TiltCard3D>
        ))}
      </div>

      {/* 14-Day Delivery Guarantee Banner */}
      <div className="mt-12 p-6 rounded-3xl bg-gradient-to-r from-indigo-950/60 via-purple-950/40 to-slate-950 border border-indigo-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300 shrink-0">
            <ShieldCheck className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h4 className="text-sm sm:text-base font-bold text-white">Strict 14-Day On-Time Delivery Guarantee</h4>
            <p className="text-xs text-slate-300">If your website is not ready for review by Day 14, we credit you $500 cash back. Zero risk.</p>
          </div>
        </div>
        <a
          href="/#audit-tool"
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-indigo-500/25 transition-all shrink-0 flex items-center gap-1.5"
        >
          <span>Kickoff Free Audit</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}
