'use client';

import React, { useState } from 'react';
import { MapPin, Briefcase, Zap, Shield, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';

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
  const [selectedIndustry, setSelectedIndustry] = useState<IndustryPreset>(NORTH_AMERICA_INDUSTRIES[0]);
  const [selectedLocation, setSelectedLocation] = useState<LocationPreset>(NORTH_AMERICA_LOCATIONS[0]);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleLaunch = (ind: IndustryPreset, loc: LocationPreset) => {
    setSelectedIndustry(ind);
    setSelectedLocation(loc);
    onSelect(ind.query, loc.city);
  };

  const displayedIndustries = isExpanded ? NORTH_AMERICA_INDUSTRIES : NORTH_AMERICA_INDUSTRIES.slice(0, 4);

  return (
    <div className="bg-gradient-to-b from-white/[0.04] to-white/[0.01] border border-white/10 rounded-2xl p-4 md:p-5 space-y-4 shadow-lg">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-[10px] uppercase tracking-widest mb-0.5">
            <Sparkles className="w-3 h-3" />
            North America High-Intent Lead Presets
          </div>
          <h3 className="text-sm md:text-base font-bold text-white">
            北美英语高潜建站行业与目标城市预设
          </h3>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/5 text-[11px] text-gray-300 font-medium flex items-center gap-1 transition-all"
          >
            <span>{isExpanded ? '收起行业' : `展开全部 (${NORTH_AMERICA_INDUSTRIES.length})`}</span>
            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          <button
            onClick={() => handleLaunch(selectedIndustry, selectedLocation)}
            disabled={disabled}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 transition-all transform active:scale-95 disabled:opacity-50"
          >
            <Zap className="w-3 h-3" />
            <span>一键发掘</span>
          </button>
        </div>
      </div>

      {/* Grid: Industries with Compact Scrollable Heights */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
          <Briefcase className="w-3 h-3 text-indigo-400" />
          行业分类:
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {displayedIndustries.map((ind) => {
            const isSelected = selectedIndustry.query === ind.query;
            return (
              <button
                key={ind.query}
                type="button"
                onClick={() => setSelectedIndustry(ind)}
                disabled={disabled}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'bg-indigo-500/15 border-indigo-500/50 text-white shadow-sm'
                    : 'bg-white/[0.02] border-white/5 text-gray-300 hover:bg-white/5 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold truncate pr-1">{ind.name}</span>
                  <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 shrink-0">
                    {ind.ticketSize}
                  </span>
                </div>
                <p className="text-[9px] text-gray-400 line-clamp-1">
                  {ind.urgencyReason}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid: Locations */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
          <MapPin className="w-3 h-3 text-purple-400" />
          都会区:
        </label>
        <div className="flex flex-wrap gap-1.5">
          {NORTH_AMERICA_LOCATIONS.map((loc) => {
            const isSelected = selectedLocation.city === loc.city;
            return (
              <button
                key={loc.city}
                type="button"
                onClick={() => setSelectedLocation(loc)}
                disabled={disabled}
                className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-all flex items-center gap-1 ${
                  isSelected
                    ? 'bg-purple-500/25 border-purple-500/50 text-white shadow-sm font-bold'
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
