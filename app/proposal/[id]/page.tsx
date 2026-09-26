'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { 
  Globe, Smartphone, Zap, Shield, Star, CheckCircle2, 
  ArrowRight, Phone, Calendar, Clock, Sparkles, AlertTriangle, 
  ChevronRight, ExternalLink, Award, Check, Mail
} from 'lucide-react';
import type { Lead } from '@/lib/types';

export default function ClientProposalPage() {
  const params = useParams();
  const leadId = params?.id as string;
  const [lead, setLead] = useState<Lead | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'comparison' | 'specs' | 'roi'>('comparison');

  useEffect(() => {
    if (!leadId) return;
    fetch(`/api/leads/${leadId}`)
      .then((res) => res.json())
      .then((data) => {
        setLead(data);
      })
      .catch((err) => console.error('Failed to load proposal:', err))
      .finally(() => setIsLoading(false));
  }, [leadId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#060913] text-white flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-gray-400">Loading custom web redesign proposal...</p>
        </div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="min-h-screen bg-[#060913] text-white flex items-center justify-center font-sans p-6 text-center">
        <div className="max-w-md space-y-3">
          <h2 className="text-xl font-bold">Proposal Expired or Not Found</h2>
          <p className="text-sm text-gray-400">The requested custom concept preview is currently unavailable or has been archived.</p>
        </div>
      </div>
    );
  }

  const rating = lead.rating || 4.9;
  const location = lead.search_location || lead.address || 'Local Market';
  const score = lead.ai_score || 85;
  const mobileScore = lead.analysis?.mobile_score || 42;
  const lostVisitors = lead.analysis?.estimated_lost_visitors_monthly || 280;

  return (
    <div className="min-h-screen bg-[#060913] text-slate-100 font-sans selection:bg-indigo-500 selection:text-white pb-24">
      {/* Top Floating Brand Header */}
      <header className="sticky top-0 z-50 bg-[#060913]/80 backdrop-blur-xl border-b border-white/10 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-widest text-indigo-400 font-bold block">Exclusive Web Concept</span>
              <span className="text-sm font-bold text-white block leading-tight">Prepared for {lead.name}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
              <Check className="w-3.5 h-3.5" /> Confidential 2026 Blueprint
            </span>
            <a
              href="mailto:jyu@wisdomitc.com?subject=Proposal%20Inquiry"
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 hover:text-white text-xs font-mono font-bold transition-all"
            >
              <Mail className="w-3.5 h-3.5 text-indigo-400" />
              <span>jyu@wisdomitc.com</span>
            </a>
            <a
              href={`tel:${lead.phone || ''}`}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <Phone className="w-3.5 h-3.5 text-indigo-400" />
              <span>Call Us</span>
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-12 pb-16 px-6 max-w-6xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-bold uppercase tracking-wider">
          <Award className="w-3.5 h-3.5 text-amber-400" />
          <span>Local Market Leader Digital Audit</span>
        </div>

        <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white tracking-tight max-w-4xl mx-auto leading-tight">
          Modernizing <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400">{lead.name}</span> to Match Your 5-Star Offline Reputation
        </h1>

        <p className="text-sm md:text-base text-gray-300 max-w-2xl mx-auto leading-relaxed">
          Your clients love your work ({rating}★ across verified Google reviews). We engineered this custom web modernization blueprint to turn mobile searchers in {location} into paying customers.
        </p>

        {/* Quick Diagnostic Scorecards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto pt-6">
          <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 text-left">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Current Mobile Score</span>
            <div className="text-3xl font-extrabold text-amber-400 font-mono">{mobileScore}<span className="text-sm text-gray-500">/100</span></div>
            <p className="text-[11px] text-gray-400 mt-1">Lacks 1-tap instant booking & emergency calling</p>
          </div>

          <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 text-left">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Est. Lost Inquiries</span>
            <div className="text-3xl font-extrabold text-rose-400 font-mono">~{lostVisitors}<span className="text-sm text-gray-500">/mo</span></div>
            <p className="text-[11px] text-gray-400 mt-1">High-intent smartphone searchers bouncing to competitors</p>
          </div>

          <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/40 to-purple-950/40 border border-indigo-500/30 text-left">
            <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-widest block mb-1">Projected Lift</span>
            <div className="text-3xl font-extrabold text-emerald-400 font-mono">+140%</div>
            <p className="text-[11px] text-gray-300 mt-1">Inbound consultations with new sub-second mobile funnel</p>
          </div>
        </div>
      </section>

      {/* Before vs After Interactive Showcase */}
      <section className="px-6 max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Visual Transformation Matrix</h2>
            <p className="text-xs text-gray-400 mt-0.5">Direct comparison between your legacy digital setup and our 2026 High-Conversion Prototype</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Legacy Site Card */}
          <div className="rounded-3xl bg-black/60 border border-red-500/20 p-6 md:p-8 space-y-6 relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <span className="px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-bold uppercase tracking-wider">
                Current Setup (Friction Points)
              </span>
              <span className="text-xs text-gray-400 font-mono">Status Quo</span>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                <div className="flex items-center gap-2 text-rose-400 text-xs font-bold">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Slow Loading on Cellular Networks</span>
                </div>
                <p className="text-xs text-gray-400">Takes 3-5+ seconds to render on 4G/5G, causing over 40% of potential local customers to abandon.</p>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                <div className="flex items-center gap-2 text-rose-400 text-xs font-bold">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Hidden / Hard-to-Click Contact Info</span>
                </div>
                <p className="text-xs text-gray-400">No persistent tap-to-call button. Mobile users must pinch-zoom or hunt through submenus.</p>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                <div className="flex items-center gap-2 text-rose-400 text-xs font-bold">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Unleveraged Google Reviews</span>
                </div>
                <p className="text-xs text-gray-400">Your stellar {rating}★ rating is stuck on Google Maps, not actively converting visitors on your site.</p>
              </div>
            </div>
          </div>

          {/* New Prototype Concept Card */}
          <div className="rounded-3xl bg-gradient-to-br from-indigo-950/60 via-purple-950/40 to-black border border-indigo-500/40 p-6 md:p-8 space-y-6 relative overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                2026 Next-Gen Flagship Solution
              </span>
              <span className="text-xs text-emerald-400 font-mono font-bold">Recommended</span>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 space-y-1">
                <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Sub-Second Edge Rendering (&lt;0.8s)</span>
                </div>
                <p className="text-xs text-gray-300">Built on Next.js 16 + Cloudflare edge CDN. Instantaneous page load on any smartphone.</p>
              </div>

              <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 space-y-1">
                <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Sticky 1-Tap Mobile Conversion Bar</span>
                </div>
                <p className="text-xs text-gray-300">Thumb-friendly instant call and quote buttons anchored to the bottom of mobile screens.</p>
              </div>

              <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 space-y-1">
                <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Live Verified Google Reviews Wall</span>
                </div>
                <p className="text-xs text-gray-300">Live dynamic sync highlighting your {rating}★ praises immediately above the fold.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3-Step Execution Roadmap */}
      <section className="px-6 max-w-6xl mx-auto pt-16 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl md:text-3xl font-bold text-white">Friction-Free Implementation</h2>
          <p className="text-xs md:text-sm text-gray-400">How we launch your modernized digital flagship in under 14 days without disrupting your business</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
            <span className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-300 font-mono font-bold flex items-center justify-center text-sm">01</span>
            <h4 className="text-base font-bold text-white">Interactive Figma Preview</h4>
            <p className="text-xs text-gray-400 leading-relaxed">Review the custom visual concept for {lead.name}. Unlimited revisions until you are 100% delighted.</p>
          </div>

          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
            <span className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 font-mono font-bold flex items-center justify-center text-sm">02</span>
            <h4 className="text-base font-bold text-white">Rapid Edge Engineering</h4>
            <p className="text-xs text-gray-400 leading-relaxed">Complete mobile responsiveness, Google Maps SEO architecture, and automatic SSL security setup.</p>
          </div>

          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
            <span className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 font-mono font-bold flex items-center justify-center text-sm">03</span>
            <h4 className="text-base font-bold text-white">Go-Live & Client Growth</h4>
            <p className="text-xs text-gray-400 leading-relaxed">Seamless domain switchover with zero downtime. Watch direct phone inquiries and booked calls scale.</p>
          </div>
        </div>
      </section>

      {/* Interactive Consultation / Demo Request Form */}
      <section className="px-6 max-w-3xl mx-auto pt-16">
        <ProposalInquiryForm lead={lead} />
      </section>
    </div>
  );
}

function ProposalInquiryForm({ lead }: { lead: Lead }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState(lead.contact_email || '');
  const [message, setMessage] = useState('Yes, please send me the interactive Figma prototype and pricing breakdown.');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/leads/${lead.id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from_name: name || lead.name,
          from_email: email || lead.contact_email || 'client@business.com',
          content: message,
          source: 'proposal_inquiry'
        })
      });
      if (res.ok) {
        setSubmitted(true);
      } else {
        alert('Failed to submit inquiry, please email us directly.');
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="p-8 rounded-3xl bg-gradient-to-r from-emerald-950/40 to-black border border-emerald-500/30 text-center space-y-3 shadow-2xl">
        <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h3 className="text-xl font-bold text-white">Thank You, {name || lead.name}!</h3>
        <p className="text-xs text-gray-300 max-w-md mx-auto">
          Your request for the custom interactive preview has been prioritized. Our lead digital strategist will send the staging credentials directly to <span className="text-indigo-400 font-mono">{email}</span> within 2 hours.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-8 md:p-10 rounded-3xl bg-gradient-to-b from-white/[0.05] to-black/60 border border-indigo-500/30 space-y-5 shadow-2xl">
      <div className="text-center space-y-1">
        <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-widest">Get The Live Staging Link</span>
        <h3 className="text-2xl font-bold text-white">Request Access to {lead.name}&apos;s Prototype</h3>
        <p className="text-xs text-gray-400">Zero cost, zero obligation. View the interactive 2026 redesign before making any decisions.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="space-y-1">
          <label className="text-gray-400 font-bold uppercase text-[10px]">Your Name / Title</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. David Miller (Owner)"
            className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white outline-none focus:border-indigo-500 font-sans"
          />
        </div>
        <div className="space-y-1">
          <label className="text-gray-400 font-bold uppercase text-[10px]">Your Business Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. dave@company.com"
            className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white outline-none focus:border-indigo-500 font-mono"
          />
        </div>
      </div>

      <div className="space-y-1 text-xs">
        <label className="text-gray-400 font-bold uppercase text-[10px]">Inquiry or Specific Questions</label>
        <textarea
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full p-3 rounded-xl bg-black/60 border border-white/10 text-white outline-none focus:border-indigo-500 text-xs leading-relaxed"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
      >
        <span>{isSubmitting ? 'Sending Request...' : 'Send Request & Claim Prototype Preview'}</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </form>
  );
}

