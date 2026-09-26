'use client';

import React from 'react';
import { Star, CheckCircle2, Quote, Flame, Building2, MapPin } from 'lucide-react';
import TiltCard3D from './TiltCard3D';

export default function TestimonialsSection() {
  const reviews = [
    {
      name: 'Marcus Vance',
      role: 'Founder & Managing Partner',
      company: 'Apex Plumbing & HVAC',
      location: 'Dallas, TX',
      metricLift: '+314% Mobile Call Volume',
      quote: "Before working with Nexora, our website took 14 seconds to load and looked terrible on smartphones. Within 3 weeks of launching our new Next.js engine, our 24/7 emergency dispatch calls more than tripled. The ROI paid for the entire project in less than 20 days.",
      rating: 5,
      revenueLift: '+$48,000 / mo'
    },
    {
      name: 'Dr. Elena Rostova',
      role: 'Lead Orthodontist & Director',
      company: 'Pacific Smiles Dentistry',
      location: 'Seattle, WA',
      metricLift: '+236% New Patient Intakes',
      quote: "Our patients constantly compliment our modern website. The automated online appointment booking and HIPAA forms eliminated hours of paperwork for our front desk. Nexora delivered on time in exactly 14 days as promised.",
      rating: 5,
      revenueLift: '+$62,000 / mo'
    },
    {
      name: 'David O’Connor',
      role: 'President',
      company: 'Summit Ridge Roofing & Exteriors',
      location: 'Denver, CO',
      metricLift: '4.2x Inspection Requests',
      quote: "In the roofing business, speed and credibility are everything when hail storms hit Colorado. The instant satellite roof estimate tool and drone video hero make us look like a Fortune 500 company compared to local competitors.",
      rating: 5,
      revenueLift: '+$115,000 / mo'
    }
  ];

  return (
    <div className="py-24 px-6 max-w-7xl mx-auto">
      <div className="text-center space-y-3 mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-bold uppercase tracking-wider">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          Verified North American SMB Results
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white">
          Loved by Business Owners Across{' '}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-300 via-emerald-300 to-indigo-300">
            the US & Canada.
          </span>
        </h2>
        <p className="text-slate-400 text-sm max-w-xl mx-auto">
          Real results from local contractors, medical clinics, and service businesses who replaced their outdated templates with our conversion engine.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {reviews.map((rev, idx) => (
          <TiltCard3D key={idx} maxTilt={9} glareOpacity={0.12} className="h-full">
            <div className="h-full p-8 rounded-3xl bg-white/[0.025] border border-white/10 hover:border-amber-500/30 backdrop-blur-xl space-y-6 flex flex-col justify-between group transition-all">
              <div className="space-y-4">
                {/* Top Rating & Metric */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1">
                    <Flame className="w-3 h-3 fill-emerald-400" />
                    <span>{rev.metricLift}</span>
                  </span>
                </div>

                {/* Quote */}
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed italic">
                  "{rev.quote}"
                </p>
              </div>

              {/* Author & Revenue Impact */}
              <div className="pt-4 border-t border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white tracking-tight">{rev.name}</h4>
                    <p className="text-xs text-slate-400">{rev.role}, <span className="text-slate-300">{rev.company}</span></p>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-slate-400 font-mono uppercase">Est. Revenue Lift</div>
                    <div className="text-sm font-mono font-black text-emerald-400">{rev.revenueLift}</div>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-[11px] font-mono text-indigo-400">
                  <MapPin className="w-3 h-3 text-indigo-400" />
                  <span>{rev.location}</span>
                  <span className="text-slate-500">•</span>
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span className="text-slate-400">Google Verified Client</span>
                </div>
              </div>
            </div>
          </TiltCard3D>
        ))}
      </div>
    </div>
  );
}
