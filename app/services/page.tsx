'use client';

import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MobileStickyBar from '@/components/MobileStickyBar';
import CyberGridBackground from '@/components/CyberGridBackground';
import TiltCard3D from '@/components/TiltCard3D';
import { 
  Smartphone, Zap, Globe, Shield, Check, ArrowRight, 
  BarChart3, Clock, Sparkles, Database, Search, Cpu 
} from 'lucide-react';

export default function ServicesPage() {
  const services = [
    {
      id: 'speed',
      badge: 'Performance Engineering',
      title: 'Sub-Second Next.js Web Architecture',
      desc: 'Over 53% of mobile visitors abandon a website if it takes more than 3 seconds to load. We engineer lightweight, edge-cached Next.js platforms that achieve 95+ Google Lighthouse scores and 0.6s First Contentful Paint.',
      metrics: '0.6s Average Load Speed • 99+ Core Web Vitals',
      features: [
        'Next.js 16 App Router on Cloudflare & Vercel Edge',
        'Automatic WebP / AVIF Next-gen Image Optimization',
        'Elimination of bloated WordPress plugins and legacy scripts',
        'Universal responsive scaling for iPhone, Android, and 4K displays'
      ],
      icon: Zap,
      gradient: 'from-amber-500/20 via-orange-500/10 to-transparent'
    },
    {
      id: 'funnels',
      badge: 'Conversion Rate Optimization',
      title: '1-Tap Mobile Lead Funnels & Intake Portals',
      desc: 'A pretty website that doesn’t ring your phone is a cost, not an asset. We architect high-converting booking funnels, click-to-call bars, and interactive estimate calculators tailored for local service businesses.',
      metrics: '+180% to +340% Inbound Phone Calls',
      features: [
        'Sticky thumb-friendly mobile call & appointment actions',
        'Interactive quote calculators with instant pricing ranges',
        'Direct CRM integration (HubSpot, Jobber, ServiceTitan, Housecall Pro)',
        'Instant SMS & email dispatch notifications upon form submission'
      ],
      icon: Smartphone,
      gradient: 'from-indigo-500/20 via-purple-500/10 to-transparent'
    },
    {
      id: 'seo',
      badge: 'Search Engine Optimization',
      title: 'Local SEO & Google Maps Domination',
      desc: 'We structure your site architecture to capture high-intent "near me" local queries, embedding verified Google reviews, localized schema markup, and neighborhood sub-landing pages to outrank regional competitors.',
      metrics: '#1-#3 Local Pack Rankings within 90 Days',
      features: [
        'LocalBusiness JSON-LD schema markup with geo-coordinates',
        'Automated live sync with Google Business Profile reviews',
        'Dynamic multi-city landing pages for surrounding suburbs',
        'High-speed XML sitemaps and semantic heading hierarchies'
      ],
      icon: Search,
      gradient: 'from-emerald-500/20 via-teal-500/10 to-transparent'
    },
    {
      id: 'security',
      badge: 'Zero Maintenance Stress',
      title: 'Enterprise Hosting, Security & 24/7 SLA',
      desc: 'Say goodbye to vulnerable WordPress plugins getting hacked or breaking overnight. Our static-first serverless architecture provides bank-grade SSL encryption, automated DDoS mitigation, and daily snapshots.',
      metrics: '99.99% Uptime Guarantee • 0 Hack Vulnerabilities',
      features: [
        'Zero database vulnerabilities (static edge compiled frontends)',
        'Automated daily GitHub backups and version snapshots',
        'Direct SLA priority support with our lead engineering team',
        'Full domain & DNS management with Cloudflare security'
      ],
      icon: Shield,
      gradient: 'from-cyan-500/20 via-blue-500/10 to-transparent'
    }
  ];

  const comparisonTable = [
    { feature: 'Page Load Speed (Mobile)', legacy: '4.8s - 12.5s (Slow)', nexora: '0.4s - 0.8s (Instantaneous)' },
    { feature: 'Core Web Vitals Score', legacy: '24 - 45 / 100 (Failing)', nexora: '95 - 100 / 100 (Flawless)' },
    { feature: 'Mobile Navigation Friction', legacy: 'Pinch-to-zoom, broken forms', nexora: 'Thumb-friendly 1-tap call & booking' },
    { feature: 'Security & Maintenance', legacy: 'Vulnerable to plugin malware', nexora: 'Serverless Edge, 0 malware vector' },
    { feature: 'Client Ownership', legacy: 'Locked in proprietary builders', nexora: '100% full ownership of source code' }
  ];

  return (
    <div className="min-h-screen bg-[#04060c] text-slate-100 font-sans selection:bg-indigo-500 selection:text-white relative overflow-x-hidden">
      <CyberGridBackground />
      <Navbar />

      {/* Hero Header */}
      <section className="pt-20 pb-16 px-6 max-w-6xl mx-auto text-center space-y-6 relative z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-mono font-bold uppercase tracking-wider">
          <Cpu className="w-3.5 h-3.5 text-indigo-400" />
          <span>Full-Stack Web Engineering for SMBs</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight max-w-4xl mx-auto leading-tight">
          Web Systems Built to <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400">Capture & Convert</span> High-Ticket Local Clients
        </h1>

        <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
          We replace outdated, slow WordPress templates with modern Next.js edge architectures engineered specifically to boost local Google visibility and turn smartphone clicks into booked appointments.
        </p>

        <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/contact"
            className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 transition-all flex items-center gap-2"
          >
            <span>Book Strategy Session</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/#audit-tool"
            className="px-6 py-3.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold text-xs transition-all flex items-center gap-2"
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Run Free 60s Audit</span>
          </Link>
        </div>
      </section>

      {/* 4 Pillars Section */}
      <section className="py-16 px-6 max-w-6xl mx-auto space-y-10 relative z-10">
        <div className="text-center space-y-2">
          <span className="text-xs font-mono uppercase tracking-widest text-indigo-400 font-bold">Comprehensive Capabilities</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">The Four Core Pillars of Nexora Engineering</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((svc) => {
            const Icon = svc.icon;
            return (
              <TiltCard3D key={svc.id} maxTilt={6} glareOpacity={0.06} className="h-full">
                <div className={`h-full p-8 rounded-3xl bg-gradient-to-br ${svc.gradient} bg-black/60 border border-white/10 space-y-6 flex flex-col justify-between shadow-xl`}>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center text-white">
                        <Icon className="w-6 h-6 text-indigo-400" />
                      </div>
                      <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-mono text-slate-300 font-semibold">
                        {svc.badge}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">{svc.title}</h3>
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{svc.desc}</p>
                    </div>

                    <div className="p-3 rounded-xl bg-black/50 border border-white/5 text-xs font-mono text-emerald-400 font-semibold">
                      ⚡ Proven Impact: {svc.metrics}
                    </div>

                    <ul className="space-y-2.5 pt-2 border-t border-white/5">
                      {svc.features.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                          <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Link
                    href="/contact"
                    className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-xs text-center transition-all block mt-4"
                  >
                    Consult on This Architecture &rarr;
                  </Link>
                </div>
              </TiltCard3D>
            );
          })}
        </div>
      </section>

      {/* Comparison Table Section */}
      <section className="py-16 px-6 max-w-5xl mx-auto relative z-10">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-white/[0.03] to-black/80 border border-white/10 space-y-8 shadow-2xl">
          <div className="text-center space-y-2">
            <span className="text-xs font-mono uppercase tracking-widest text-indigo-400 font-bold">Architectural Benchmark</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Traditional WordPress vs. Nexora Next.js Engine
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
              Why leading American local firms are migrating away from legacy web builders.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 font-mono uppercase tracking-wider">
                  <th className="py-3 px-4">Evaluation Criteria</th>
                  <th className="py-3 px-4 text-rose-400">Legacy CMS / WordPress</th>
                  <th className="py-3 px-4 text-emerald-400 font-bold">Nexora Engine (Next.js 16)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {comparisonTable.map((row, i) => (
                  <tr key={i} className="hover:bg-white/[0.02]">
                    <td className="py-4 px-4 font-semibold text-white">{row.feature}</td>
                    <td className="py-4 px-4 text-slate-400">{row.legacy}</td>
                    <td className="py-4 px-4 text-emerald-300 font-semibold">{row.nexora}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CTA Box */}
      <section className="py-20 px-6 max-w-4xl mx-auto text-center relative z-10">
        <div className="p-10 rounded-3xl bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-black border border-indigo-500/30 space-y-6 shadow-2xl">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Ready to Upgrade Your Digital Storefront?
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto">
            Every project includes our 14-day guaranteed delivery window, 100% source code ownership, and zero lock-in contracts.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/contact"
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 transition-all"
            >
              Get Custom Quote & Timeline
            </Link>
            <Link
              href="/process"
              className="px-8 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-xs transition-all"
            >
              Explore 14-Day Method
            </Link>
          </div>
        </div>
      </section>

      <Footer />
      <MobileStickyBar />
    </div>
  );
}
