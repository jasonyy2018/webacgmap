'use client';

import React from 'react';
import { MapPin, Briefcase, Zap, Shield, Sparkles, TrendingUp } from 'lucide-react';

interface PresetProps {
  onSelect: (query: string, location: string) => void;
  disabled?: boolean;
}

interface IndustryPreset {
  name: string;
  query: string;
  tag: string;
  ticketSize: string;
  urgencyReason: string;
}

interface LocationPreset {
  city: string;
  country: string;
  flag: string;
}

export const NORTH_AMERICA_INDUSTRIES: IndustryPreset[] = [
  {
    name: 'Roofing & Solar Contractors',
    query: 'Roofing contractor',
    tag: 'High Ticket ($8K-$25K)',
    ticketSize: '$10k+',
    urgencyReason: 'Homeowners verify websites & Google reviews before committing. Outdated sites lose massive bids.'
  },
  {
    name: 'Emergency Plumbing & Rooter',
    query: 'Emergency plumber',
    tag: 'Mobile Tap-to-Call Critical',
    ticketSize: '$500-$3K',
    urgencyReason: '90% mobile searches in crisis. Without instant 1-tap call button, visitors bounce immediately.'
  },
  {
    name: 'HVAC & Air Conditioning',
    query: 'HVAC repair installation',
    tag: 'Seasonal Surge Peak',
    ticketSize: '$2K-$12K',
    urgencyReason: 'Requires instant online quote requests and seasonal maintenance booking funnels.'
  },
  {
    name: 'Cosmetic Dentistry & Ortho',
    query: 'Cosmetic dentist clinic',
    tag: 'High Visual Trust',
    ticketSize: '$3K-$15K',
    urgencyReason: 'Patients judge surgical and aesthetic quality directly by website design & smile galleries.'
  },
  {
    name: 'Boutique Kitchen & Bath Remodeling',
    query: 'Kitchen remodeling contractor',
    tag: 'Portfolio Driven',
    ticketSize: '$15K-$60K',
    urgencyReason: 'Needs modern high-resolution project portfolio showcases and interactive estimate calculators.'
  },
  {
    name: 'Personal Injury & Civil Law',
    query: 'Personal injury lawyer',
    tag: 'Ultra-High Value Client',
    ticketSize: '$20k+',
    urgencyReason: 'Clients need 24/7 confidential case evaluation forms and prominent authority badges.'
  },
  {
    name: 'Luxury Auto Detailing & Wrap',
    query: 'Ceramic coating auto detailing',
    tag: 'Gen-Z / Millennial Audience',
    ticketSize: '$1K-$4K',
    urgencyReason: 'Visual aesthetics on mobile are everything. Seamless package selection and deposit booking.'
  },
  {
    name: 'Commercial Electricians',
    query: 'Commercial electrical contractor',
    tag: 'B2B Trust',
    ticketSize: '$5K-$30K',
    urgencyReason: 'Commercial property managers require proof of compliance, licensing, and case studies.'
  }
];

export const NORTH_AMERICA_LOCATIONS: LocationPreset[] = [
  { city: 'Dallas, TX', country: 'USA', flag: '🇺🇸' },
  { city: 'Los Angeles, CA', country: 'USA', flag: '🇺🇸' },
  { city: 'Miami, FL', country: 'USA', flag: '🇺🇸' },
  { city: 'Chicago, IL', country: 'USA', flag: '🇺🇸' },
  { city: 'Toronto, ON', country: 'Canada', flag: '🇨🇦' },
  { city: 'Vancouver, BC', country: 'Canada', flag: '🇨🇦' },
  { city: 'Austin, TX', country: 'USA', flag: '🇺🇸' },
  { city: 'Phoenix, AZ', country: 'USA', flag: '🇺🇸' },
  { city: 'London', country: 'UK', flag: '🇬🇧' },
  { city: 'Sydney, NSW', country: 'Australia', flag: '🇦🇺' },
];

export default function NorthAmericaPresets({ onSelect, disabled }: PresetProps) {
  const [selectedIndustry, setSelectedIndustry] = React.useState<IndustryPreset>(NORTH_AMERICA_INDUSTRIES[0]);
  const [selectedLocation, setSelectedLocation] = React.useState<LocationPreset>(NORTH_AMERICA_LOCATIONS[0]);

  const handleLaunch = (ind: IndustryPreset, loc: LocationPreset) => {
    setSelectedIndustry(ind);
    setSelectedLocation(loc);
    onSelect(ind.query, loc.city);
  };

  return (
    <div className="bg-gradient-to-b from-white/[0.04] to-white/[0.01] border border-white/10 rounded-3xl p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-widest mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            North America High-Intent Lead Presets
          </div>
          <h3 className="text-lg font-bold text-white">
            北美英语高潜行业与刚需建站市场快速发现
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            精选客单价高、极其依赖线上第一印象与手机端即时转化的本地实体企业
          </p>
        </div>

        <button
          onClick={() => handleLaunch(selectedIndustry, selectedLocation)}
          disabled={disabled}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold text-xs shadow-lg shadow-indigo-500/20 transition-all transform active:scale-95 disabled:opacity-50"
        >
          <Zap className="w-3.5 h-3.5" />
          <span>一键挖掘高需求客户</span>
        </button>
      </div>

      {/* Grid: Industries */}
      <div className="space-y-2">
        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
          <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
          选择北美建站高意向行业 (Industry Niches)
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {NORTH_AMERICA_INDUSTRIES.map((ind) => {
            const isSelected = selectedIndustry.query === ind.query;
            return (
              <button
                key={ind.query}
                type="button"
                onClick={() => setSelectedIndustry(ind)}
                disabled={disabled}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  isSelected
                    ? 'bg-indigo-500/15 border-indigo-500/50 text-white shadow-md'
                    : 'bg-white/[0.02] border-white/5 text-gray-300 hover:bg-white/5 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold truncate pr-1">{ind.name}</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 shrink-0">
                    {ind.ticketSize}
                  </span>
                </div>
                <p className="text-[10px] text-gray-400 line-clamp-2 leading-relaxed">
                  {ind.urgencyReason}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid: Locations */}
      <div className="space-y-2">
        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-purple-400" />
          选择目标重点都会区 (Metro Locations)
        </label>
        <div className="flex flex-wrap gap-2">
          {NORTH_AMERICA_LOCATIONS.map((loc) => {
            const isSelected = selectedLocation.city === loc.city;
            return (
              <button
                key={loc.city}
                type="button"
                onClick={() => setSelectedLocation(loc)}
                disabled={disabled}
                className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-purple-500/20 border-purple-500/50 text-white shadow-sm'
                    : 'bg-white/[0.02] border-white/5 text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <span>{loc.flag}</span>
                <span>{loc.city}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
