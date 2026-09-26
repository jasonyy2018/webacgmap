'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Layout, Search, Users, Settings, Mail, BarChart3, 
  Code, Globe, Copy, Check, Terminal, Play, Layers, Sparkles, Inbox, ExternalLink, ArrowLeft 
} from 'lucide-react';
import LeadSearch from '@/components/LeadSearch';
import LeadDashboard from '@/components/LeadDashboard';
import EDMOutreachHub from '@/components/EDMOutreachHub';
import PipelineKanban from '@/components/PipelineKanban';
import NorthAmericaPresets from '@/components/NorthAmericaPresets';
import InboundInbox from '@/components/InboundInbox';
import EmailEditorModal from '@/components/EmailEditorModal';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';
import SettingsDashboard from '@/components/SettingsDashboard';
import type { Lead } from '@/lib/types';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('search');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  
  // API Developer Portal States
  const [originDomain, setOriginDomain] = useState('https://your-domain.com');
  const [apiQuery, setApiQuery] = useState('Emergency plumbing');
  const [apiLocation, setApiLocation] = useState('Dallas, TX');
  const [apiResponse, setApiResponse] = useState<string | null>(null);
  const [isTestingApi, setIsTestingApi] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [codeLanguage, setCodeLanguage] = useState<'curl' | 'python' | 'javascript'>('curl');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOriginDomain(window.location.origin);
    }
  }, []);

  const fetchLeads = async () => {
    try {
      const response = await fetch('/api/leads');
      if (!response.ok) throw new Error('Failed to fetch leads');
      const data = await response.json();
      setLeads(data);
    } catch (error) {
      console.error('Failed to fetch leads:', error);
    }
  };

  useEffect(() => {
    fetchLeads();
    const hasPending = leads.some(l => l.ai_status === 'pending' || l.ai_status === 'analyzing');
    if (hasPending) {
      const interval = setInterval(fetchLeads, 4000);
      return () => clearInterval(interval);
    }
  }, [leads.length, leads.some(l => l.ai_status === 'pending' || l.ai_status === 'analyzing')]);

  const handleSearch = async (query: string, location: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/leads/search?query=${encodeURIComponent(query)}&location=${encodeURIComponent(location)}`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Search failed');
      const data = await response.json();
      setLeads(data.leads || data);
      if ((data.leads || data).length === 0) {
        alert('No leads found for this search. Check your Google API key and query params.');
      } else {
        setActiveTab('leads');
      }
    } catch (error: any) {
      console.error('Search failed:', error);
      alert(`Search failed: ${error.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectFromPipeline = (lead: Lead) => {
    setSelectedLead(lead);
    setActiveTab('marketing');
  };

  const handleTestApi = async () => {
    setIsTestingApi(true);
    setApiResponse(null);
    try {
      const endpoint = `${originDomain}/api/leads/search?query=${encodeURIComponent(apiQuery)}&location=${encodeURIComponent(apiLocation)}`;
      const res = await fetch(endpoint);
      const data = await res.json();
      setApiResponse(JSON.stringify(data, null, 2));
    } catch (err: any) {
      setApiResponse(JSON.stringify({ error: err.message || 'API request failed' }, null, 2));
    } finally {
      setIsTestingApi(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const navItems = [
    { id: 'search', icon: Search, label: 'Search & Presets' },
    { id: 'leads', icon: Users, label: 'Leads & Audits' },
    { id: 'pipeline', icon: Layers, label: 'Trust Pipeline' },
    { id: 'inbox', icon: Inbox, label: 'Inbound Inbox' },
    { id: 'marketing', icon: Mail, label: 'EDM Studio' },
    { id: 'analytics', icon: BarChart3, label: 'Analytics' },
    { id: 'api', icon: Code, label: 'API Developer Portal' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  const analyzedCount = leads.filter(l => l.ai_status === 'completed').length;
  const totalPotentialValue = analyzedCount * 3200; // Realistic North American SMB website project avg ticket

  const handleClearLeads = async () => {
    if (!confirm('Are you sure you want to clear all lead results? This cannot be undone.')) return;
    try {
      const response = await fetch('/api/leads', { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to clear leads');
      setLeads([]);
      alert('All results cleared.');
    } catch (error: any) {
      console.error('Failed to clear leads:', error);
      alert(`Failed to clear leads: ${error.message || 'Unknown error'}`);
    }
  };

  const currentApiEndpoint = `${originDomain}/api/leads/search`;
  const curlExample = `curl -X GET "${currentApiEndpoint}?query=${encodeURIComponent(apiQuery)}&location=${encodeURIComponent(apiLocation)}"`;

  const pythonExample = `import requests

url = "${currentApiEndpoint}"
params = {
    "query": "${apiQuery}",
    "location": "${apiLocation}"
}

response = requests.get(url, params=params)
data = response.json()
print("Discovered Leads:", len(data.get("leads", [])))`;

  const jsExample = `const endpoint = "${currentApiEndpoint}?query=" + encodeURIComponent("${apiQuery}") + "&location=" + encodeURIComponent("${apiLocation}");

fetch(endpoint)
  .then(res => res.json())
  .then(data => console.log("Leads:", data.leads))
  .catch(err => console.error(err));`;

  const getCodeSnippet = () => {
    if (codeLanguage === 'python') return pythonExample;
    if (codeLanguage === 'javascript') return jsExample;
    return curlExample;
  };

  return (
    <div className="h-screen bg-[#050505] text-white flex font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/10 flex flex-col p-6 bg-black/40 backdrop-blur-xl shrink-0 h-full">
        <div className="flex items-center gap-3 mb-6 px-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Layout className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300 tracking-tight block">
              MapKDev Admin
            </span>
            <span className="text-[10px] text-indigo-400 font-mono tracking-wider uppercase block">
              Operation Console
            </span>
          </div>
        </div>

        {/* Back to Live Official Website Button */}
        <Link 
          href="/" 
          className="mb-6 flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-all text-xs font-semibold group"
        >
          <span className="flex items-center gap-2">
            <Globe className="w-3.5 h-3.5" />
            <span>访问业务展示官网</span>
          </span>
          <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
        </Link>

        <nav className="flex-1 space-y-1.5 overflow-y-auto pr-1 custom-scrollbar">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                activeTab === item.id
                  ? 'bg-indigo-600/20 text-indigo-300 shadow-[0_0_20px_rgba(99,102,241,0.15)] border border-indigo-500/30 font-bold'
                  : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
              }`}
            >
              <item.icon className="w-4 h-4" />
              <span className="font-medium text-xs">{item.label}</span>
              {item.id === 'pipeline' && leads.length > 0 && (
                <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white font-mono">
                  {leads.length}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="mt-auto p-4 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-white/10 shrink-0">
          <p className="text-xs text-gray-400 mb-1 font-bold">API Domain Active</p>
          <p className="text-[10px] font-mono text-indigo-400 truncate">{originDomain}</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        {/* Header */}
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-black/20 backdrop-blur-md shrink-0 z-10">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded-md bg-indigo-500/20 text-indigo-400 text-[10px] font-mono font-bold uppercase tracking-wider border border-indigo-500/30">
              Admin Ops
            </span>
            <h1 className="text-xl font-bold capitalize tracking-tight flex items-center gap-2">
              {activeTab === 'api' ? 'API 开发者中心 & 接口部署' : 
               activeTab === 'pipeline' ? 'North America Cold-to-Trust Pipeline' :
               activeTab === 'inbox' ? 'Inbound Reply Inbox & AI Intelligence' :
               activeTab === 'marketing' ? 'EDM Outreach Studio & Template Matrix' :
               activeTab === 'analytics' ? 'Analytics Business Intelligence' :
               activeTab === 'settings' ? 'System Settings & Control Center' :
               `${activeTab} Dashboard`}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300 text-xs font-medium transition-all"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              <span>查看前台官网</span>
            </Link>
            <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>在线服务中</span>
            </div>
          </div>
        </header>

        {/* Content Area with Permanent Visible Vertical Scrollbar */}
        <div className="flex-1 min-h-0 p-4 md:p-6 overflow-y-scroll custom-scrollbar">
          {activeTab === 'search' && (
            <div className="space-y-8 max-w-6xl mx-auto py-4">
              <div className="text-center space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  AI-Powered North America SMB Discovery
                </div>
                <h2 className="text-3xl md:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50 tracking-tight">
                  发掘最有建站需求的北美中小企业客户
                </h2>
                <p className="text-gray-400 max-w-2xl mx-auto text-xs md:text-sm leading-relaxed">
                  通过 Google Maps 实时捕捉具有极高客户口碑、但网站缺失、手机端无法适配、或技术老旧的中小企业，并自动生成冷启动信任触达邮件。
                </p>
              </div>

              {/* North America Smart Presets */}
              <NorthAmericaPresets 
                onSelect={(query, loc) => handleSearch(query, loc)}
                disabled={isLoading}
              />

              {/* Custom Search Form */}
              <LeadSearch onSearch={handleSearch} isLoading={isLoading} />

              {/* Stats Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl mx-auto">
                <div className="p-5 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm">
                  <p className="text-gray-400 text-xs uppercase font-bold tracking-widest mb-1">Total Discovered Leads</p>
                  <h3 className="text-3xl font-extrabold text-white">{leads.length}</h3>
                </div>
                <div className="p-5 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm">
                  <p className="text-gray-400 text-xs uppercase font-bold tracking-widest mb-1">AI Audited Leads</p>
                  <h3 className="text-3xl font-extrabold text-indigo-400">{analyzedCount}</h3>
                </div>
                <div className="p-5 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm">
                  <p className="text-gray-400 text-xs uppercase font-bold tracking-widest mb-1">Est. Revenue Pipeline</p>
                  <h3 className="text-3xl font-extrabold text-emerald-400">${totalPotentialValue.toLocaleString()}</h3>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'leads' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold tracking-tight">Discovered Business Leads</h2>
                  <p className="text-gray-400 text-xs">Leads discovered from Google Maps with AI technical audits</p>
                </div>
              </div>
              <LeadDashboard
                leads={leads}
                isLoading={isLoading}
                onSelectLead={(l) => {
                  setSelectedLead(l);
                  setActiveTab('marketing');
                }}
                onUpdate={fetchLeads}
              />
            </div>
          )}

          {activeTab === 'pipeline' && (
            <PipelineKanban
              leads={leads}
              onSelectLead={handleSelectFromPipeline}
              onUpdate={fetchLeads}
            />
          )}

          {activeTab === 'inbox' && (
            <InboundInbox
              onRefreshLeads={fetchLeads}
              onSelectLeadForOutreach={(leadId) => {
                const found = leads.find(l => l.id === leadId);
                if (found) {
                  setSelectedLead(found);
                  setActiveTab('marketing');
                }
              }}
            />
          )}

          {activeTab === 'marketing' && (
            <EDMOutreachHub
              leads={leads}
              onUpdate={fetchLeads}
              initialSelectedLead={selectedLead}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsDashboard leads={leads} />
          )}

          {activeTab === 'settings' && (
            <SettingsDashboard 
              onClearLeads={handleClearLeads} 
              onRefreshLeads={fetchLeads} 
            />
          )}

          {/* API Developer Portal Tab */}
          {activeTab === 'api' && (
            <div className="space-y-6 max-w-5xl animate-fadeIn">
              <div className="p-8 rounded-3xl bg-gradient-to-r from-indigo-950/60 to-purple-950/40 border border-indigo-500/20 space-y-3 shadow-2xl">
                <div className="flex items-center space-x-3">
                  <Code className="w-7 h-7 text-indigo-400" />
                  <h2 className="text-2xl font-bold text-white">Google Maps & Gemini AI REST API SDK</h2>
                </div>
                <p className="text-sm text-gray-300 leading-relaxed">
                  系统会自动动态识别您部署的域名（例如 <code className="text-indigo-300 font-mono">{originDomain}</code>）。任何外部系统（如外贸获客工作流或其他程序）均可通过该 API 直接调用全网抓取与 AI 提取服务。
                </p>
              </div>

              {/* Endpoint Details Card */}
              <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-200 flex items-center space-x-2">
                    <Globe className="w-4 h-4 text-emerald-400" />
                    <span>动态 API Base Endpoint</span>
                  </span>
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-mono border border-emerald-500/30">
                    HTTP GET / POST Enabled
                  </span>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-black/60 border border-white/10 font-mono text-xs text-indigo-300">
                  <span className="truncate">{currentApiEndpoint}</span>
                  <button
                    onClick={() => handleCopy(currentApiEndpoint)}
                    className="ml-3 text-gray-400 hover:text-white flex items-center space-x-1 shrink-0"
                  >
                    {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Interactive API Tester */}
              <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-6">
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <Terminal className="w-4 h-4 text-indigo-400" />
                  <span>在线 API 模拟测试与 SDK 代码生成</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <label className="block text-gray-400 font-bold uppercase text-[10px]">Query (搜索关键词)</label>
                    <input
                      type="text"
                      value={apiQuery}
                      onChange={(e) => setApiQuery(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white font-mono text-xs outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-gray-400 font-bold uppercase text-[10px]">Location (目标地区/国家)</label>
                    <input
                      type="text"
                      value={apiLocation}
                      onChange={(e) => setApiLocation(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white font-mono text-xs outline-none"
                    />
                  </div>
                </div>

                {/* Multi-language Code Generator */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400 uppercase font-bold">API 调用代码示例 (自动匹配部署域名)</span>
                    <div className="flex bg-black/60 p-1 rounded-xl border border-white/10 text-xs font-mono">
                      {(['curl', 'python', 'javascript'] as const).map((lang) => (
                        <button
                          key={lang}
                          onClick={() => setCodeLanguage(lang)}
                          className={`px-3 py-1 rounded-lg uppercase font-bold transition-all ${
                            codeLanguage === lang ? 'bg-indigo-500 text-white' : 'text-gray-400 hover:text-white'
                          }`}
                        >
                          {lang}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-black/80 border border-white/10 text-xs font-mono text-indigo-300 relative group">
                    <pre className="overflow-x-auto whitespace-pre-wrap">{getCodeSnippet()}</pre>
                    <button
                      onClick={() => handleCopy(getCodeSnippet())}
                      className="absolute top-3 right-3 text-gray-400 hover:text-white p-2 rounded-lg bg-white/5 border border-white/10"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleTestApi}
                  disabled={isTestingApi}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-xs hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] flex items-center space-x-2 transition-all shadow-lg"
                >
                  <Play className={`w-4 h-4 ${isTestingApi ? 'animate-spin' : ''}`} />
                  <span>{isTestingApi ? '发送请求中...' : '测试发送 API 请求'}</span>
                </button>

                {/* Response Preview JSON */}
                {apiResponse && (
                  <div className="space-y-1 pt-2">
                    <label className="text-[11px] text-gray-400 uppercase font-semibold">API Response JSON Output</label>
                    <pre className="p-4 rounded-xl bg-black/90 border border-white/10 text-xs font-mono text-emerald-400 overflow-x-auto max-h-64">
                      {apiResponse}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {selectedLead && activeTab !== 'marketing' && (
          <EmailEditorModal
            lead={selectedLead}
            onClose={() => setSelectedLead(null)}
            onUpdate={fetchLeads}
          />
        )}
      </main>
    </div>
  );
}
