'use client';

import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MobileStickyBar from '@/components/MobileStickyBar';
import CyberGridBackground from '@/components/CyberGridBackground';
import VisualDeviceComparison from '@/components/VisualDeviceComparison';
import TestimonialsSection from '@/components/TestimonialsSection';
import LiveMarqueeTicker from '@/components/LiveMarqueeTicker';
import { Award, ArrowRight, TrendingUp, Star, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';

export default function CaseStudiesPage() {
  const caseStudies = [
    {
      company: 'Precision Emergency HVAC & Plumbing',
      location: 'Dallas, TX',
      industry: 'Home Services & Emergency Contracting',
      challenge: 'Old 2013 non-responsive site with unclickable phone numbers, slow image assets, and no emergency dispatch request form. Mobile bounce rate exceeded 68%.',
      solution: 'Sub-second Next.js edge rebuild with instant thumb-friendly emergency dispatch modal, automated Google reviews feed, and localized schema for 14 Dallas-Fort Worth suburbs.',
      results: {
        lift: '+314%',
        metric: 'Inbound Emergency Phone Inquiries',
        speedBefore: '14.2s',
        speedAfter: '0.6s',
        mobileScore: '98/100',
        roi: '12.4x ROI in first 90 days'
      },
      quote: 'We went from 14 calls a month to over 58 qualified repair jobs in our first 60 days after Nexora rebuilt our site. The 1-tap emergency dispatch button on mobile phones changed our business entirely.',
      author: 'Marcus Vance',
      role: 'Founder & Master Plumber'
    },
    {
      company: 'Modern Smile Dental Studio',
      location: 'Seattle, WA',
      industry: 'Cosmetic & Family Dentistry',
      challenge: 'Cluttered stock-photo-heavy website with an intimidating 6-page PDF intake form that caused patients to abandon online appointments.',
      solution: 'Clean boutique Scandinavian cosmetic aesthetic, interactive 4-step smile quiz, before-and-after smile gallery slider, and direct calendar integration.',
      results: {
        lift: '+260%',
        metric: 'Cosmetic Patient Consultations',
        speedBefore: '9.8s',
        speedAfter: '0.5s',
        mobileScore: '99/100',
        roi: '22 new invisalign cases in month 1'
      },
      quote: 'Nexora gave our clinic the digital storefront our 5-star Google reputation deserved. Patients consistently remark how effortless it is to book on their phones.',
      author: 'Dr. Elena Rostova, DDS',
      role: 'Clinical Director'
    },
    {
      company: 'Apex Commercial & Residential Roofing',
      location: 'Denver, CO',
      industry: 'Commercial Construction & Storm Restoration',
      challenge: 'Expired SSL warning on Google Chrome, broken responsive layout on iOS Safari, and zero local search visibility for hail storm repair queries.',
      solution: 'Drone footage hero presentation, interactive satellite roof measurement estimator, storm insurance claim guide, and Google Local Services ads sync.',
      results: {
        lift: '+411%',
        metric: 'High-Ticket Inspection Requests',
        speedBefore: '12.1s',
        speedAfter: '0.7s',
        mobileScore: '96/100',
        roi: '$240,000+ added commercial pipeline'
      },
      quote: 'During hail storm season, having our site load in 0.7s while competitors timed out gave us a massive advantage. We dominated the Denver metro search rankings.',
      author: 'Tyler Henderson',
      role: 'Managing Partner'
    }
  ];

  return (
    <div className="min-h-screen bg-[#04060c] text-slate-100 font-sans selection:bg-indigo-500 selection:text-white relative overflow-x-hidden">
      <CyberGridBackground />
      <Navbar />

      {/* Hero Header */}
      <section className="pt-20 pb-12 px-6 max-w-6xl mx-auto text-center space-y-6 relative z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold uppercase tracking-wider">
          <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          <span>Real Growth • Verified Metrics</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight max-w-4xl mx-auto leading-tight">
          How Leading American SMBs <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-300 to-indigo-400">Multiplied Inbound Revenue</span>
        </h1>

        <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Explore interactive before-and-after transformations and verified case studies of local businesses that upgraded from slow, legacy websites to our high-converting Next.js engine.
        </p>
      </section>

      {/* Live Recent Deployments Ticker */}
      <section className="py-6 relative z-10">
        <LiveMarqueeTicker />
      </section>

      {/* Interactive Visual Before/After Showcase */}
      <section className="py-16 px-6 max-w-6xl mx-auto space-y-8 relative z-10">
        <div className="text-center space-y-2">
          <span className="text-xs font-mono uppercase tracking-widest text-indigo-400 font-bold">Interactive Transformation</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Visual Comparison: Before vs. After Overhaul</h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
            Toggle between the legacy website bottlenecks and our modern 3D responsive architecture.
          </p>
        </div>

        <VisualDeviceComparison />
      </section>

      {/* Detailed Case Breakdowns */}
      <section className="py-16 px-6 max-w-6xl mx-auto space-y-12 relative z-10">
        <div className="text-center space-y-2">
          <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold">In-Depth Breakdowns</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Featured Client Stories</h2>
        </div>

        <div className="space-y-8">
          {caseStudies.map((cs, idx) => (
            <div
              key={idx}
              className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-white/[0.04] via-black/80 to-white/[0.02] border border-white/10 shadow-2xl space-y-8"
            >
              {/* Header Info */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
                <div>
                  <span className="text-xs font-mono text-indigo-400 uppercase tracking-wider block mb-1">
                    {cs.location} • {cs.industry}
                  </span>
                  <h3 className="text-2xl font-bold text-white">{cs.company}</h3>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-3xl font-black text-emerald-400 font-mono block leading-none">
                      {cs.results.lift}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono uppercase">{cs.results.metric}</span>
                  </div>
                </div>
              </div>

              {/* Challenge vs Solution Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm leading-relaxed">
                <div className="p-6 rounded-2xl bg-rose-950/15 border border-rose-500/20 space-y-2">
                  <span className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                    Bottlenecks & Friction
                  </span>
                  <p className="text-slate-300">{cs.challenge}</p>
                </div>

                <div className="p-6 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 space-y-2">
                  <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                    Engineered Solution
                  </span>
                  <p className="text-slate-300">{cs.solution}</p>
                </div>
              </div>

              {/* Metrics Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-4 rounded-xl bg-black/50 border border-white/5">
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">Speed (Before)</span>
                  <span className="text-base font-bold text-rose-400 font-mono">{cs.results.speedBefore}</span>
                </div>
                <div className="p-4 rounded-xl bg-black/50 border border-white/5">
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">Speed (After)</span>
                  <span className="text-base font-bold text-emerald-400 font-mono">{cs.results.speedAfter}</span>
                </div>
                <div className="p-4 rounded-xl bg-black/50 border border-white/5">
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">Mobile Score</span>
                  <span className="text-base font-bold text-indigo-300 font-mono">{cs.results.mobileScore}</span>
                </div>
                <div className="p-4 rounded-xl bg-black/50 border border-white/5">
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">Return on Investment</span>
                  <span className="text-base font-bold text-amber-300 font-mono">{cs.results.roi}</span>
                </div>
              </div>

              {/* Client Quote */}
              <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 italic text-slate-300 text-xs sm:text-sm flex items-start gap-4">
                <span className="text-3xl text-indigo-400 font-serif leading-none shrink-0">&ldquo;</span>
                <div className="space-y-2">
                  <p>{cs.quote}</p>
                  <p className="not-italic font-bold text-white text-xs">
                    — {cs.author}, <span className="text-slate-400 font-normal">{cs.role}</span>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Verified Google Reviews & Testimonials Section */}
      <section className="py-16 px-6 max-w-6xl mx-auto relative z-10">
        <TestimonialsSection />
      </section>

      {/* Final Action Banner */}
      <section className="py-20 px-6 max-w-4xl mx-auto text-center relative z-10">
        <div className="p-10 rounded-3xl bg-gradient-to-r from-emerald-950/40 via-indigo-950/40 to-black border border-emerald-500/30 space-y-6 shadow-2xl">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Want Similar Results for Your Local Business?
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
            We will review your current website and prepare a free, zero-obligation interactive Figma & staging concept preview within 1 business day.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/contact"
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-indigo-600 hover:opacity-95 text-white font-bold text-xs shadow-lg shadow-emerald-500/25 transition-all"
            >
              Request Free Bespoke Mockup
            </Link>
            <Link
              href="/pricing"
              className="px-8 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-xs transition-all"
            >
              View Transparent Pricing
            </Link>
          </div>
        </div>
      </section>

      <Footer />
      <MobileStickyBar />
    </div>
  );
}
