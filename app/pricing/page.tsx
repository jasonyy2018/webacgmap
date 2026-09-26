'use client';

import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MobileStickyBar from '@/components/MobileStickyBar';
import CyberGridBackground from '@/components/CyberGridBackground';
import TiltCard3D from '@/components/TiltCard3D';
import RoiCalculator from '@/components/RoiCalculator';
import FaqSection from '@/components/FaqSection';
import { Check, Flame, Shield, ArrowRight, Zap, Sparkles } from 'lucide-react';

export default function PricingPage() {
  const tiers = [
    {
      id: 'starter',
      name: 'Starter Modernization',
      badge: 'Local Foundation',
      price: '$1,899',
      sub: 'One-time investment • 14-day turnaround',
      desc: 'Ideal for established local contractors and boutique service providers seeking to eliminate mobile bounce and present a clean, modern digital storefront.',
      popular: false,
      features: [
        'Complete sub-second Next.js edge web architecture',
        'Custom mobile-first layout with 1-tap call bar',
        'Google Business Profile integration & reviews widget',
        'Core Web Vitals 95+ performance certification',
        '100% full source code and domain ownership'
      ],
      cta: 'Start with Starter',
      ctaLink: '/contact?tier=starter'
    },
    {
      id: 'pro',
      name: 'Professional Growth',
      badge: 'Most Popular Choice',
      price: '$3,499',
      sub: 'One-time investment • 14-day turnaround',
      desc: 'Designed for ambitious SMBs aiming to dominate their local market, outrank regional competitors on Google, and automate customer inquiry intake.',
      popular: true,
      features: [
        'Everything in Starter Modernization',
        'Localized SEO schema markup for up to 8 surrounding suburbs',
        'Interactive online booking & customized quote estimator',
        'Instant SMS & email dispatch routing to your dispatch team',
        'Before-and-after interactive project gallery slider',
        '30 days of post-launch conversion rate optimization'
      ],
      cta: 'Claim Growth Package',
      ctaLink: '/contact?tier=pro'
    },
    {
      id: 'domination',
      name: 'Market Domination',
      badge: 'Franchise & Multi-Location',
      price: '$5,999+',
      sub: 'Custom scope • Dedicated senior engineer',
      desc: 'For multi-location medical groups, multi-crew roofing firms, and regional franchises seeking high-ticket digital branding and custom intake integrations.',
      popular: false,
      features: [
        'Everything in Professional Growth',
        'Multi-location dynamic city landing page engine',
        'Custom CRM integration (ServiceTitan, Jobber, HubSpot)',
        'Bespoke intake qualification questionnaires',
        'High-resolution drone / video asset visual polish',
        '24/7 dedicated SLA account director & weekly backups'
      ],
      cta: 'Consult Enterprise Lead',
      ctaLink: '/contact?tier=domination'
    }
  ];

  return (
    <div className="min-h-screen bg-[#04060c] text-slate-100 font-sans selection:bg-indigo-500 selection:text-white relative overflow-x-hidden">
      <CyberGridBackground />
      <Navbar />

      {/* Hero Header */}
      <section className="pt-20 pb-12 px-6 max-w-6xl mx-auto text-center space-y-6 relative z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-mono font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Transparent Pricing • Zero Hidden Fees</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight max-w-4xl mx-auto leading-tight">
          Invest Once in an Asset That <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400">Generates Revenue Daily</span>
        </h1>

        <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
          No perpetual software rentals. No hostage code. Every package includes a guaranteed 14-day delivery schedule, 100% source code ownership, and our $500 on-time credit guarantee.
        </p>
      </section>

      {/* 3 Tier Pricing Cards */}
      <section className="py-12 px-6 max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {tiers.map((tier) => (
            <TiltCard3D
              key={tier.id}
              maxTilt={tier.popular ? 8 : 5}
              glareOpacity={tier.popular ? 0.12 : 0.05}
              className="h-full"
            >
              <div
                className={`h-full p-8 rounded-3xl flex flex-col justify-between space-y-6 relative transition-all shadow-2xl ${
                  tier.popular
                    ? 'bg-gradient-to-b from-indigo-950/40 via-purple-950/20 to-black/90 border-2 border-indigo-500/60 shadow-indigo-500/20'
                    : 'bg-white/[0.02] border border-white/10'
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-mono text-[10px] font-extrabold uppercase tracking-widest flex items-center gap-1 shadow-lg">
                    <Flame className="w-3.5 h-3.5 text-amber-300" />
                    <span>{tier.badge}</span>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    {!tier.popular && (
                      <span className="text-xs font-mono text-slate-400 uppercase tracking-widest block mb-1">
                        {tier.badge}
                      </span>
                    )}
                    <h3 className="text-xl font-bold text-white">{tier.name}</h3>
                    <div className="text-4xl font-extrabold text-white font-mono mt-3">
                      {tier.price}
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{tier.sub}</p>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed border-t border-white/5 pt-4">
                    {tier.desc}
                  </p>

                  <ul className="space-y-3 text-xs text-slate-300 pt-2">
                    {tier.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 border-t border-white/5">
                  <Link
                    href={tier.ctaLink}
                    className={`w-full py-3.5 rounded-xl font-bold text-xs text-center transition-all flex items-center justify-center gap-2 block ${
                      tier.popular
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/30'
                        : 'bg-white/10 hover:bg-white/15 text-white'
                    }`}
                  >
                    <span>{tier.cta}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </TiltCard3D>
          ))}
        </div>
      </section>

      {/* Interactive ROI Loss Calculator */}
      <section id="roi-calc" className="py-16 px-6 max-w-6xl mx-auto relative z-10">
        <RoiCalculator />
      </section>

      {/* Frequently Asked Questions */}
      <section id="faq" className="py-16 px-6 max-w-5xl mx-auto relative z-10">
        <FaqSection />
      </section>

      {/* Bottom CTA */}
      <section className="py-20 px-6 max-w-4xl mx-auto text-center relative z-10">
        <div className="p-10 rounded-3xl bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-black border border-indigo-500/30 space-y-6 shadow-2xl">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Have Questions About Custom Scope?
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
            Email our engineering team directly at <span className="text-indigo-400 font-mono font-bold">jyu@wisdomitc.com</span> or schedule a 15-minute scoping call.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/contact"
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 transition-all"
            >
              Contact Engineering Lead
            </Link>
          </div>
        </div>
      </section>

      <Footer />
      <MobileStickyBar />
    </div>
  );
}
