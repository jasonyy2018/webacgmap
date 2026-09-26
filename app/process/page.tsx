'use client';

import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MobileStickyBar from '@/components/MobileStickyBar';
import CyberGridBackground from '@/components/CyberGridBackground';
import ProcessRoadmap from '@/components/ProcessRoadmap';
import GuaranteesSection from '@/components/GuaranteesSection';
import { Clock, ShieldCheck, CheckCircle2, ArrowRight, Zap, Award } from 'lucide-react';

export default function ProcessPage() {
  return (
    <div className="min-h-screen bg-[#04060c] text-slate-100 font-sans selection:bg-indigo-500 selection:text-white relative overflow-x-hidden">
      <CyberGridBackground />
      <Navbar />

      {/* Hero Header */}
      <section className="pt-20 pb-12 px-6 max-w-6xl mx-auto text-center space-y-6 relative z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-mono font-bold uppercase tracking-wider">
          <Clock className="w-3.5 h-3.5 text-indigo-400" />
          <span>Guaranteed 14-Day Turnaround</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight max-w-4xl mx-auto leading-tight">
          From Concept to Live in <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400">14 Days Flat</span> — Backed by a $500 Guarantee
        </h1>

        <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Traditional agencies take 3 to 6 months of endless meetings and delays. We operate on an agile, milestone-driven engineering protocol that delivers a world-class digital storefront in exactly two weeks.
        </p>

        <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/contact"
            className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 transition-all flex items-center gap-2"
          >
            <span>Lock in Next Available Sprint</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/pricing"
            className="px-6 py-3.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold text-xs transition-all"
          >
            View Pricing Tiers
          </Link>
        </div>
      </section>

      {/* Step-by-Step 14-Day Protocol */}
      <section className="py-16 px-6 max-w-6xl mx-auto relative z-10">
        <ProcessRoadmap />
      </section>

      {/* Ironclad Risk-Free Guarantees Section */}
      <section className="py-16 px-6 max-w-6xl mx-auto relative z-10">
        <GuaranteesSection />
      </section>

      {/* Delivery FAQ Highlights */}
      <section className="py-16 px-6 max-w-4xl mx-auto space-y-6 relative z-10">
        <div className="text-center space-y-2 mb-8">
          <span className="text-xs font-mono uppercase tracking-widest text-indigo-400 font-bold">Frequently Asked Questions</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">How Our 14-Day Sprint Works</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
            <h4 className="font-bold text-white">What is required from our team to hit Day 14?</h4>
            <p className="text-slate-400 leading-relaxed">
              We require only a 30-minute discovery call and your branding assets (logo, high-res photos if available). Our copywriters and systems engineers handle the rest.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
            <h4 className="font-bold text-white">What happens if launch is delayed past Day 14?</h4>
            <p className="text-slate-400 leading-relaxed">
              If we miss our agreed launch milestone for any technical reason on our end, we automatically credit $500 cash back to your invoice upon launch. No questions asked.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
            <h4 className="font-bold text-white">Do we own 100% of the website code?</h4>
            <p className="text-slate-400 leading-relaxed">
              Yes. Upon final delivery, all source code, Next.js repositories, Figma design files, and domain assets are transferred to your ownership. You are never held hostage.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
            <h4 className="font-bold text-white">Will our current Google rankings be impacted during migration?</h4>
            <p className="text-slate-400 leading-relaxed">
              No. We map 301 redirects for every existing URL on your legacy website to ensure you retain 100% of your historical Google search equity, with an immediate boost from faster load times.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 max-w-4xl mx-auto text-center relative z-10">
        <div className="p-10 rounded-3xl bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-black border border-indigo-500/30 space-y-6 shadow-2xl">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Ready to Launch in 14 Days?
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
            We limit our active client sprint capacity to 4 companies per month to guarantee dedicated senior engineer attention.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/contact"
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 transition-all"
            >
              Check Sprint Availability & Reserve Spot
            </Link>
          </div>
        </div>
      </section>

      <Footer />
      <MobileStickyBar />
    </div>
  );
}
