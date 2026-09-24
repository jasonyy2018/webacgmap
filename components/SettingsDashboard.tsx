'use client';

import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Key, 
  Sparkles, 
  Database, 
  Webhook, 
  Check, 
  AlertCircle, 
  RefreshCw, 
  Trash2, 
  PlusCircle, 
  Save, 
  Sliders, 
  ShieldCheck,
  Zap,
  Globe
} from 'lucide-react';

interface SettingsDashboardProps {
  onClearLeads: () => void;
  onRefreshLeads: () => void;
}

export default function SettingsDashboard({ onClearLeads, onRefreshLeads }: SettingsDashboardProps) {
  const [apiKeyStatus, setApiKeyStatus] = useState<'checking' | 'active' | 'missing'>('checking');
  const [testLog, setTestLog] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  // Settings form states
  const [defaultLocation, setDefaultLocation] = useState('San Francisco');
  const [minRating, setMinRating] = useState('0');
  const [autoAudit, setAutoAudit] = useState(true);
  const [webhookUrl, setWebhookUrl] = useState('https://api.queeny-ai.com/v1/webhook/leads');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Prompt customization states
  const [auditPromptTip, setAuditPromptTip] = useState(
    'Determine if target business needs modern web design, mobile responsiveness, and SEO overhaul.'
  );

  useEffect(() => {
    checkApiStatus();
  }, []);

  const checkApiStatus = async () => {
    setApiKeyStatus('checking');
    try {
      const res = await fetch('/api/leads?limit=1');
      if (res.ok) {
        setApiKeyStatus('active');
      } else {
        setApiKeyStatus('missing');
      }
    } catch {
      setApiKeyStatus('missing');
    }
  };

  const handleTestKey = async () => {
    setIsTesting(true);
    setTestLog(null);
    try {
      const res = await fetch('/api/leads/search?query=Web+Developer+Test&location=New+York');
      const data = await res.json();
      if (res.ok && data.success) {
        setTestLog(`✓ API Test Successful! Returned ${data.leads?.length || 0} test lead records.`);
        setApiKeyStatus('active');
      } else {
        setTestLog(`⚠ API Key Check: ${data.error || 'Failed to fetch search results.'}`);
      }
    } catch (e: any) {
      setTestLog(`✖ Error testing API connection: ${e.message}`);
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('mapkdev_default_location', defaultLocation);
    localStorage.setItem('mapkdev_webhook_url', webhookUrl);
    localStorage.setItem('mapkdev_auto_audit', String(autoAudit));
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleSeedDemoData = async () => {
    try {
      const res = await fetch('/api/leads/search?query=Coffee+Roasters&location=Seattle', { method: 'POST' });
      if (res.ok) {
        alert('Demo leads created successfully!');
        onRefreshLeads();
      } else {
        alert('Failed to create demo leads.');
      }
    } catch (err: any) {
      alert(`Error seeding demo data: ${err.message}`);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl">
      {/* Top Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-purple-950/50 via-indigo-950/40 to-black border border-white/10 shadow-2xl flex items-center justify-between">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-mono">
            <Settings className="w-3.5 h-3.5" />
            <span>Control Center & Configuration</span>
          </div>
          <h2 className="text-3xl font-bold text-white tracking-tight">System Settings & Integrations</h2>
          <p className="text-gray-400 text-sm">
            Manage Google Maps & Gemini API connections, AI prompt tuning, and webhook automation rules.
          </p>
        </div>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-8">
        {/* Section 1: API Status & Key Validation */}
        <div className="p-8 rounded-3xl bg-white/5 border border-white/10 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Key className="w-5 h-5 text-indigo-400" /> API Keys & Model Connectivity
            </h3>
            <div className="flex items-center gap-2">
              {apiKeyStatus === 'active' && (
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-mono">
                  <Check className="w-3.5 h-3.5" /> Active & Operational
                </span>
              )}
              {apiKeyStatus === 'missing' && (
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-mono">
                  <AlertCircle className="w-3.5 h-3.5" /> API Key Issues
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="p-4 rounded-2xl bg-black/50 border border-white/10 space-y-2">
              <div className="flex justify-between items-center text-gray-400">
                <span className="font-semibold">Google Maps Places API</span>
                <span className="text-emerald-400 font-mono">Configured in .env</span>
              </div>
              <p className="text-gray-500 text-[11px]">Used for text search, place details, rating & geocoding.</p>
            </div>

            <div className="p-4 rounded-2xl bg-black/50 border border-white/10 space-y-2">
              <div className="flex justify-between items-center text-gray-400">
                <span className="font-semibold">Google Gemini AI Engine</span>
                <span className="text-indigo-400 font-mono">Gemini 1.5 Flash/Pro</span>
              </div>
              <p className="text-gray-500 text-[11px]">Used for website technical audit, score calculation & outreach email generation.</p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handleTestKey}
              disabled={isTesting}
              className="px-5 py-2.5 rounded-xl bg-indigo-500/20 border border-indigo-500/30 hover:bg-indigo-500/30 text-indigo-300 font-bold text-xs flex items-center gap-2 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isTesting ? 'animate-spin' : ''}`} />
              <span>{isTesting ? 'Testing API Calls...' : 'Run Live API Test'}</span>
            </button>
            {testLog && (
              <span className="text-xs font-mono text-gray-300 bg-black/60 px-4 py-2 rounded-xl border border-white/10">
                {testLog}
              </span>
            )}
          </div>
        </div>

        {/* Section 2: Search & Auto-Audit Preferences */}
        <div className="p-8 rounded-3xl bg-white/5 border border-white/10 space-y-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Sliders className="w-5 h-5 text-purple-400" /> Discovery & Audit Preferences
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div className="space-y-2">
              <label className="block text-gray-400 text-xs font-bold uppercase tracking-wider">Default Target Region / City</label>
              <input
                type="text"
                value={defaultLocation}
                onChange={(e) => setDefaultLocation(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white font-mono text-xs focus:ring-2 focus:ring-indigo-500/50 outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-gray-400 text-xs font-bold uppercase tracking-wider">Minimum Rating Threshold</label>
              <select
                value={minRating}
                onChange={(e) => setMinRating(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white font-mono text-xs outline-none"
              >
                <option value="0">All Ratings (0+ Stars)</option>
                <option value="3.5">3.5+ Stars</option>
                <option value="4.0">4.0+ Stars</option>
                <option value="4.5">4.5+ Stars Only</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5">
            <div>
              <p className="text-sm font-bold text-white">Auto-Trigger AI Technical Audit</p>
              <p className="text-xs text-gray-500">Automatically start Gemini AI website audit immediately upon discovery</p>
            </div>
            <button
              type="button"
              onClick={() => setAutoAudit(!autoAudit)}
              className={`w-12 h-6 rounded-full p-1 transition-colors ${autoAudit ? 'bg-indigo-600' : 'bg-gray-700'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-transform ${autoAudit ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>
        </div>

        {/* Section 3: Webhook & Third-party Integrations */}
        <div className="p-8 rounded-3xl bg-white/5 border border-white/10 space-y-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Webhook className="w-5 h-5 text-emerald-400" /> Webhook & External Workflow Sync
          </h3>

          <div className="space-y-2">
            <label className="block text-gray-400 text-xs font-bold uppercase tracking-wider">
              Outbound Lead Webhook Endpoint (e.g. Queeny AI Workflow / Zapier)
            </label>
            <input
              type="url"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/10 text-emerald-400 font-mono text-xs outline-none"
            />
            <p className="text-[11px] text-gray-500">
              When a lead reaches Priority A status, JSON payload will be posted to this endpoint automatically.
            </p>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="submit"
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 font-bold text-xs text-white hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> Save System Preferences
          </button>
          {savedSuccess && (
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
              <Check className="w-4 h-4" /> Settings saved successfully!
            </span>
          )}
        </div>
      </form>

      {/* Section 4: Data & Maintenance Controls */}
      <div className="p-8 rounded-3xl bg-rose-950/20 border border-rose-500/20 space-y-6">
        <h3 className="text-lg font-bold text-rose-400 flex items-center gap-2">
          <Database className="w-5 h-5 text-rose-400" /> Data Maintenance & Reset Controls
        </h3>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-white">Database Status & Utilities</p>
            <p className="text-xs text-gray-400">Purge discovered leads or populate sample records for demo testing.</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSeedDemoData}
              className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold text-xs flex items-center gap-2 transition-all"
            >
              <PlusCircle className="w-4 h-4 text-indigo-400" /> Seed Sample Demo Leads
            </button>
            <button
              type="button"
              onClick={onClearLeads}
              className="px-5 py-2.5 rounded-xl bg-rose-500/20 border border-rose-500/30 hover:bg-rose-500/30 text-rose-300 font-bold text-xs flex items-center gap-2 transition-all"
            >
              <Trash2 className="w-4 h-4 text-rose-400" /> Clear All Lead Results
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
