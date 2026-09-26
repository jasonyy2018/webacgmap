'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MobileStickyBar from '@/components/MobileStickyBar';
import Hero3DShowcase from '@/components/Hero3DShowcase';
import CyberGridBackground from '@/components/CyberGridBackground';
import LiveMarqueeTicker from '@/components/LiveMarqueeTicker';
import TiltCard3D from '@/components/TiltCard3D';
import VisualDeviceComparison from '@/components/VisualDeviceComparison';
import { 
  Zap, ArrowRight, ShieldCheck, CheckCircle2, Clock, 
  ExternalLink, Mail, Phone, Flame, Copy, Check, Sparkles, 
  TrendingUp, Users, ArrowUpRight, Award, Smartphone, Globe, Search 
} from 'lucide-react';

export default function HomePage() {
  // Audit Tool States
  const [businessName, setBusinessName] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [noWebsite, setNoWebsite] = useState(false);
  const [location, setLocation] = useState('Dallas, TX');
  const [industry, setIndustry] = useState('Plumbing & HVAC');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditStep, setAuditStep] = useState(0);
  const [auditResult, setAuditResult] = useState<any | null>(null);
  const [proposalLink, setProposalLink] = useState<string | null>(null);

  // Contact Form States
  const [inquiryName, setInquiryName] = useState('');
  const [inquiryEmail, setInquiryEmail] = useState('');
  const [inquiryPhone, setInquiryPhone] = useState('');
  const [inquiryCategory, setInquiryCategory] = useState<'CONSULTATION' | 'QUOTATION' | 'FEEDBACK' | 'PARTNERSHIP'>('CONSULTATION');
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [isInquirySubmitting, setIsInquirySubmitting] = useState(false);
  const [inquirySubmitted, setInquirySubmitted] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const industries = [
    'Plumbing & HVAC',
    'Roofing & Construction',
    'Dental & Medical',
    'Legal & Financial',
    'Auto Detailing & Repair',
    'Restaurants & Hospitality',
    'Other Local Services'
  ];

  const handleRunAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName) {
      alert('Please enter your business name.');
      return;
    }
    if (!contactEmail && !contactPhone) {
      alert('Please provide an email or phone so we can send your diagnostic results.');
      return;
    }

    setIsAuditing(true);
    setAuditStep(1);

    const stepTimer1 = setTimeout(() => setAuditStep(2), 700);
    const stepTimer2 = setTimeout(() => setAuditStep(3), 1400);

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: businessName,
          website: noWebsite ? '' : websiteUrl,
          contact_email: contactEmail,
          phone: contactPhone,
          industry,
          location,
          type: 'audit_request',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Audit generation failed');

      setTimeout(() => {
        setAuditResult(data.lead);
        setProposalLink(data.proposalUrl);
        setIsAuditing(false);
        setAuditStep(0);
      }, 2000);
    } catch (err: any) {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      setIsAuditing(false);
      setAuditStep(0);
      alert(`Audit request failed: ${err.message || 'Please try again'}`);
    }
  };

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryName || (!inquiryEmail && !inquiryPhone)) {
      alert('Please enter your name and at least an email or phone number.');
      return;
    }
    if (!inquiryMessage.trim()) {
      alert('Please enter your message or project requirements.');
      return;
    }

    setIsInquirySubmitting(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: inquiryName,
          email: inquiryEmail,
          phone: inquiryPhone,
          category: inquiryCategory,
          message: inquiryMessage,
        }),
      });

      if (res.ok) {
        setInquirySubmitted(true);
      } else {
        const data = await res.json();
        alert(`Failed to submit: ${data.error || 'Server error'}`);
      }
    } catch (err: any) {
      alert(`Error submitting inquiry: ${err.message}`);
    } finally {
      setIsInquirySubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#04060c] text-slate-100 font-sans selection:bg-indigo-500 selection:text-white relative overflow-x-hidden">
      <CyberGridBackground />
      <Navbar />

      {/* Hero Showcase Section */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-32 px-6">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          {/* Trust Badge Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/10 backdrop-blur-md shadow-2xl">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-mono font-medium text-slate-300 tracking-wide uppercase">
              Sub-Second Next.js Web Systems • North American SMB Growth
            </span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.08]">
            We Build Websites That Turn{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400">
              Smartphone Searches
            </span>{' '}
            Into High-Ticket Clients.
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            Eliminate mobile bounce, outrank local competitors, and capture high-intent inquiries with sub-second Next.js edge architecture. Delivered in 14 days guaranteed.
          </p>

          {/* CTA Buttons */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#audit-tool"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-600 to-emerald-500 hover:opacity-95 text-white font-extrabold text-sm shadow-[0_0_40px_rgba(99,102,241,0.4)] transition-all flex items-center justify-center gap-2 group cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-amber-300 text-amber-300" />
              <span>Get Free 60s Website Audit</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>

            <Link
              href="/case-studies"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white font-semibold text-sm backdrop-blur-md transition-all flex items-center justify-center gap-2"
            >
              <span>Explore Client Transformations</span>
              <ArrowUpRight className="w-4 h-4 text-slate-400" />
            </Link>
          </div>

          {/* Quick Metrics Bar */}
          <div className="pt-10 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-sm">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">Average Speed</span>
              <div className="text-2xl font-black text-white font-mono mt-0.5">0.6s FCP</div>
              <span className="text-[10px] text-emerald-400 font-mono">10x faster than WordPress</span>
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-sm">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">Conversion Lift</span>
              <div className="text-2xl font-black text-emerald-400 font-mono mt-0.5">+340%</div>
              <span className="text-[10px] text-slate-400 font-mono">Inbound phone calls</span>
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-sm">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">Delivery SLA</span>
              <div className="text-2xl font-black text-indigo-300 font-mono mt-0.5">14 Days</div>
              <span className="text-[10px] text-amber-300 font-mono">$500 on-time guarantee</span>
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-sm">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">Source Code</span>
              <div className="text-2xl font-black text-white font-mono mt-0.5">100% Owned</div>
              <span className="text-[10px] text-purple-300 font-mono">Zero lock-in contracts</span>
            </div>
          </div>
        </div>

        {/* 3D Futuristic Isometric Showcase Engine */}
        <div className="mt-16 max-w-6xl mx-auto relative">
          <Hero3DShowcase />
        </div>
      </section>

      {/* Verified Launches Live Ticker */}
      <section className="py-6 border-y border-white/[0.06] bg-black/40">
        <LiveMarqueeTicker />
      </section>

      {/* 60-Second Instant Audit Tool */}
      <section id="audit-tool" className="py-24 px-6 max-w-5xl mx-auto relative z-10">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-indigo-950/30 via-black/80 to-purple-950/20 border border-indigo-500/20 shadow-2xl relative">
          <div className="text-center space-y-3 mb-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
              <span>Complimentary Digital Health Diagnostic</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Test Your Business’s Mobile Conversion Readiness
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
              See what potential clients experience when they search for your services on smartphones.
            </p>
          </div>

          {auditResult ? (
            <div className="space-y-6 animate-fadeIn">
              <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white">Diagnostic Ready for {auditResult.name}</h4>
                    <p className="text-xs text-slate-300">
                      Mobile Score: <span className="text-amber-400 font-mono font-bold">{auditResult.analysis?.detailed_analysis?.mobile_score || 46}/100</span> • Est. Lost Monthly Searchers: <span className="text-rose-400 font-mono font-bold">~320</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {proposalLink && (
                    <Link
                      href={proposalLink}
                      target="_blank"
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-indigo-600 hover:opacity-95 text-white font-bold text-xs shadow-lg shadow-emerald-500/25 transition-all flex items-center gap-2"
                    >
                      <span>View Custom Interactive Proposal</span>
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      setAuditResult(null);
                      setProposalLink(null);
                    }}
                    className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold"
                  >
                    Run Another
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleRunAudit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Company / Business Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apex Plumbing & HVAC"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl bg-black/60 border border-white/10 text-white placeholder-slate-500 text-xs focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-300">Website Address (URL)</label>
                    <label className="flex items-center gap-1.5 text-[11px] text-slate-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={noWebsite}
                        onChange={(e) => setNoWebsite(e.target.checked)}
                        className="rounded accent-indigo-500"
                      />
                      <span>No current website</span>
                    </label>
                  </div>
                  <input
                    type="text"
                    disabled={noWebsite}
                    placeholder={noWebsite ? "No website currently active" : "e.g. www.apexplumbingdallas.com"}
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl bg-black/60 border border-white/10 text-white placeholder-slate-500 text-xs focus:border-indigo-500 focus:outline-none disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Business Email (to receive report) *</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. owner@apexplumbing.com"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl bg-black/60 border border-white/10 text-white placeholder-slate-500 text-xs focus:border-indigo-500 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Direct Phone (Optional)</label>
                  <input
                    type="tel"
                    placeholder="e.g. +1 (380) 218-4573"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl bg-black/60 border border-white/10 text-white placeholder-slate-500 text-xs focus:border-indigo-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Industry Focus</label>
                  <select
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl bg-black/60 border border-white/10 text-white text-xs focus:border-indigo-500 focus:outline-none"
                  >
                    {industries.map((ind) => (
                      <option key={ind} value={ind} className="bg-slate-900 text-white">{ind}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Primary Market Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Dallas, TX or Austin Metro"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl bg-black/60 border border-white/10 text-white placeholder-slate-500 text-xs focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isAuditing}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-600 to-emerald-500 hover:opacity-95 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
              >
                {isAuditing ? (
                  <span>
                    {auditStep === 1 ? 'Inspecting Mobile Performance...' : auditStep === 2 ? 'Analyzing Local Search Schema...' : 'Generating Interactive Staging Proposal...'}
                  </span>
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-amber-300 text-amber-300" />
                    <span>Run Complimentary 60s Diagnostic</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Services Overview Teaser */}
      <section className="py-20 px-6 max-w-6xl mx-auto space-y-12 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-indigo-400 font-bold block mb-1">Core Architecture</span>
            <h2 className="text-3xl font-extrabold text-white">Engineered for Tangible Revenue Growth</h2>
          </div>
          <Link
            href="/services"
            className="text-indigo-400 hover:text-indigo-300 text-xs font-mono font-bold flex items-center gap-1.5 transition-colors"
          >
            <span>View All Engineering Services</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <TiltCard3D maxTilt={6} className="h-full">
            <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/10 space-y-4 h-full flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                  <Smartphone className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white">Sub-Second Mobile Funnels</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Fast Next.js architecture with thumb-friendly 1-tap calling and instant appointment booking.
                </p>
              </div>
              <Link href="/services#speed" className="text-xs text-indigo-400 font-bold flex items-center gap-1">
                <span>Learn more</span> &rarr;
              </Link>
            </div>
          </TiltCard3D>

          <TiltCard3D maxTilt={6} className="h-full">
            <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/10 space-y-4 h-full flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                  <Search className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white">Local Google Domination</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  JSON-LD local schema, verified Google reviews integration, and geo-targeted suburb pages.
                </p>
              </div>
              <Link href="/services#seo" className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                <span>Learn more</span> &rarr;
              </Link>
            </div>
          </TiltCard3D>

          <TiltCard3D maxTilt={6} className="h-full">
            <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/10 space-y-4 h-full flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                  <Clock className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white">Guaranteed 14-Day Delivery</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Agile milestone sprint protocol with a $500 cash-back guarantee if launch is delayed.
                </p>
              </div>
              <Link href="/process" className="text-xs text-purple-400 font-bold flex items-center gap-1">
                <span>Explore roadmap</span> &rarr;
              </Link>
            </div>
          </TiltCard3D>
        </div>
      </section>

      {/* Featured Visual Comparison Teaser */}
      <section className="py-20 px-6 max-w-6xl mx-auto space-y-8 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold block mb-1">Visual Transformations</span>
            <h2 className="text-3xl font-extrabold text-white">Before vs. After Overhauls</h2>
          </div>
          <Link
            href="/case-studies"
            className="text-emerald-400 hover:text-emerald-300 text-xs font-mono font-bold flex items-center gap-1.5 transition-colors"
          >
            <span>View All Client Case Studies</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <VisualDeviceComparison />
      </section>

      {/* Pricing Preview Teaser */}
      <section className="py-20 px-6 max-w-6xl mx-auto space-y-10 relative z-10">
        <div className="text-center space-y-2">
          <span className="text-xs font-mono uppercase tracking-widest text-indigo-400 font-bold">Clear Pricing</span>
          <h2 className="text-3xl font-extrabold text-white">Transparent Investments. Zero Hidden Fees.</h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
            100% source code ownership. 14-day turnaround. $500 on-time guarantee.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
            <span className="text-xs font-mono text-slate-400 uppercase">Starter Overhaul</span>
            <div className="text-3xl font-extrabold text-white font-mono">$1,899</div>
            <p className="text-xs text-slate-400">Next.js edge rebuild, mobile 1-tap call funnel, 14-day delivery.</p>
            <Link href="/pricing" className="text-xs text-indigo-400 font-bold block pt-2">View details &rarr;</Link>
          </div>

          <div className="p-6 rounded-2xl bg-indigo-950/30 border border-indigo-500/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-indigo-400 uppercase">Professional Growth</span>
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold">Most Popular</span>
            </div>
            <div className="text-3xl font-extrabold text-white font-mono">$3,499</div>
            <p className="text-xs text-slate-300">Local SEO schema, custom intake calendar, verified reviews feed.</p>
            <Link href="/pricing" className="text-xs text-indigo-300 font-bold block pt-2">View details &rarr;</Link>
          </div>

          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
            <span className="text-xs font-mono text-slate-400 uppercase">Market Domination</span>
            <div className="text-3xl font-extrabold text-white font-mono">$5,999+</div>
            <p className="text-xs text-slate-400">Multi-location franchises, CRM integrations, 24/7 priority SLA.</p>
            <Link href="/pricing" className="text-xs text-indigo-400 font-bold block pt-2">View details &rarr;</Link>
          </div>
        </div>

        <div className="text-center pt-2">
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs transition-all"
          >
            <span>Open Interactive ROI Calculator & Pricing Guide</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Dual Channel Contact Desk */}
      <section id="contact" className="py-24 px-6 max-w-6xl mx-auto relative z-10">
        <div className="text-center space-y-3 mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-mono font-bold uppercase tracking-wider">
            <Mail className="w-3.5 h-3.5 text-indigo-400" />
            <span>Dual-Channel Contact Desk</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Ready to Upgrade Your Digital Presence?
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
            Submit your inquiry online directly to our management console, or email our lead engineer at <span className="text-indigo-400 font-mono font-bold">jyu@wisdomitc.com</span>.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Official Mailbox Card */}
          <div className="lg:col-span-4 space-y-6">
            <TiltCard3D maxTilt={6} className="w-full">
              <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-white/[0.04] to-black/80 border border-white/10 space-y-6 shadow-2xl">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-indigo-400 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      Direct Mailbox
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      Active
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">Official Engineering Mailbox</h3>
                  <p className="text-xs text-slate-400">
                    Monitored 24/7. Inbound inquiries and client feedback are triaged with under 2-hour SLA.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-black/60 border border-indigo-500/30 space-y-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] text-slate-400 font-mono block">Direct Mailbox</span>
                      <a 
                        href="mailto:jyu@wisdomitc.com?subject=Website%20Inquiry%20-%20Nexora%20Studio"
                        className="text-sm font-bold text-indigo-300 hover:text-indigo-200 font-mono truncate block"
                      >
                        jyu@wisdomitc.com
                      </a>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <a
                      href="mailto:jyu@wisdomitc.com?subject=Website%20Inquiry%20-%20Nexora%20Studio"
                      className="py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] text-center transition-all flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/30"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Send Email</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText('jyu@wisdomitc.com');
                        setCopiedEmail(true);
                        setTimeout(() => setCopiedEmail(false), 2000);
                      }}
                      className="py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white font-semibold text-[11px] text-center transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {copiedEmail ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-400" />}
                      <span>{copiedEmail ? 'Copied' : 'Copy Email'}</span>
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400 shrink-0">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-mono block">Direct Hotline</span>
                      <a href="tel:+13802184573" className="text-xs font-bold text-white hover:text-cyan-300 font-mono">
                        +1 (380) 218-4573
                      </a>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">Mon-Fri 9am-6pm CST</span>
                </div>
              </div>
            </TiltCard3D>
          </div>

          {/* Online Submission Form */}
          <div className="lg:col-span-8">
            <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-indigo-950/30 via-black/80 to-purple-950/20 border border-white/10 shadow-2xl">
              <div className="mb-6">
                <span className="text-xs font-mono uppercase tracking-widest text-indigo-400 font-bold block mb-1">
                  Online Triage Portal
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-white">
                  Submit Consultation Request or Feedback
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Entries are logged directly to our admin console and reviewed by our lead architect within 2 hours.
                </p>
              </div>

              {inquirySubmitted ? (
                <div className="p-8 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-lg font-bold text-white">Thank You! Your Request Has Been Logged.</h4>
                    <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                      Our lead engineer will review your market presence and reach out from <span className="text-indigo-400 font-mono font-bold">jyu@wisdomitc.com</span> with your tailored concept mockup within 1 business day.
                    </p>
                  </div>
                  <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                    <a
                      href="mailto:jyu@wisdomitc.com?subject=Supplementary%20Files%20for%20Inquiry"
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all flex items-center gap-1.5"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Send Supplemental Files via Email</span>
                    </a>
                    <button
                      onClick={() => setInquirySubmitted(false)}
                      className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold cursor-pointer"
                    >
                      Submit Another Message
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleInquirySubmit} className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 block">Select Category</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { id: 'CONSULTATION', label: '💼 Web Redesign' },
                        { id: 'QUOTATION', label: '💰 Custom Quote' },
                        { id: 'FEEDBACK', label: '💬 Site Feedback' },
                        { id: 'PARTNERSHIP', label: '🤝 Partnership' },
                      ].map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setInquiryCategory(cat.id as any)}
                          className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all text-center ${
                            inquiryCategory === cat.id
                              ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30'
                              : 'bg-black/50 text-slate-400 border-white/10 hover:text-white hover:border-white/20'
                          }`}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">Name / Business Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="John Doe (Austin Roofing)"
                        value={inquiryName}
                        onChange={(e) => setInquiryName(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/10 text-white placeholder-slate-500 text-xs focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">
                        Email Address <span className="text-indigo-400 font-mono text-[10px]">(for reply)</span> *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="john@austinroofing.com"
                        value={inquiryEmail}
                        onChange={(e) => setInquiryEmail(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/10 text-white placeholder-slate-500 text-xs focus:border-indigo-500 focus:outline-none font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">Phone Number (Optional)</label>
                      <input
                        type="tel"
                        placeholder="+1 (380) 218-4573"
                        value={inquiryPhone}
                        onChange={(e) => setInquiryPhone(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/10 text-white placeholder-slate-500 text-xs focus:border-indigo-500 focus:outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Project Details, Inquiries, or Feedback *</label>
                    <textarea
                      rows={4}
                      required
                      placeholder={
                        inquiryCategory === 'FEEDBACK'
                          ? 'Please describe any suggestions, thoughts, or feedback you have regarding our platform...'
                          : inquiryCategory === 'QUOTATION'
                          ? 'Please describe your target launch timeline, scope requirements, and key business goals...'
                          : 'Describe your current web bottlenecks (e.g. slow speed, mobile bounce rate, outdated layout)...'
                      }
                      value={inquiryMessage}
                      onChange={(e) => setInquiryMessage(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/10 text-white placeholder-slate-500 text-xs focus:border-indigo-500 focus:outline-none leading-relaxed"
                    />
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-[11px] text-slate-400">
                      🔒 Protected by NDA. Our team replies directly from <span className="text-indigo-400 font-mono">jyu@wisdomitc.com</span>.
                    </p>
                    <button
                      type="submit"
                      disabled={isInquirySubmitting}
                      className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-600 to-indigo-600 hover:opacity-95 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 shrink-0"
                    >
                      {isInquirySubmitting ? (
                        <span>Logging Inquiry...</span>
                      ) : (
                        <>
                          <span>Submit Request</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <MobileStickyBar />
    </div>
  );
}
