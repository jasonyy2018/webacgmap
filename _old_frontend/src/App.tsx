import React, { useState, useEffect } from 'react';
import { Layout, Search, Users, Settings, Mail, BarChart3 } from 'lucide-react';
import LeadSearch from './components/LeadSearch';
import LeadDashboard from './components/LeadDashboard';
import OutreachDashboard from './components/OutreachDashboard';
import EmailEditorModal from './components/EmailEditorModal';
import { leadsApi, searchApi } from './api';
import type { Lead } from './api/types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('search');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const fetchLeads = async () => {
    try {
      const data = await leadsApi.getAll();
      setLeads(data);
    } catch (error) {
      console.error('Failed to fetch leads:', error);
    }
  };

  useEffect(() => {
    fetchLeads();
    // Poll for updates if there are pending analyses
    const hasPending = leads.some(l => l.ai_status === 'pending' || l.ai_status === 'analyzing');
    if (hasPending) {
      const interval = setInterval(fetchLeads, 5000);
      return () => clearInterval(interval);
    }
  }, [leads.length, leads.some(l => l.ai_status === 'pending' || l.ai_status === 'analyzing')]);

  const handleSearch = async (query: string, location: string) => {
    setIsLoading(true);
    try {
      const data = await searchApi.search(query, location);
      setLeads(data);
      if (data.length === 0) {
        alert('No leads found for this search. Check your API key and quota.');
      } else {
        setActiveTab('leads');
      }
    } catch (error: any) {
      console.error('Search failed:', error);
      alert(`Search failed: ${error.response?.data?.detail || error.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const navItems = [
    { id: 'search', icon: Search, label: 'Search' },
    { id: 'leads', icon: Users, label: 'Leads' },
    { id: 'marketing', icon: Mail, label: 'Marketing' },
    { id: 'analytics', icon: BarChart3, label: 'Analytics' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  const analyzedCount = leads.filter(l => l.ai_status === 'completed').length;
  const totalPotentialValue = analyzedCount * 1500; // Mock calculation

  const handleClearLeads = async () => {
    if (!confirm('Are you sure you want to clear all lead results? This cannot be undone.')) return;
    try {
      const res = await leadsApi.deleteAll();
      console.log('Clear results:', res);
      setLeads([]);
      alert('All results cleared.');
    } catch (error: any) {
      console.error('Failed to clear leads:', error);
      const msg = error.response?.data?.detail || error.message || 'Unknown error';
      alert(`Failed to clear leads: ${msg}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex font-['Outfit',_sans-serif]">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/10 flex flex-col p-6 bg-black/40 backdrop-blur-xl">
        <div className="flex items-center gap-2 mb-10 px-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <Layout className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            MapKDev AI
          </span>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${activeTab === item.id
                ? 'bg-white/10 text-white shadow-[0_0_20px_rgba(255,255,255,0.05)]'
                : 'text-gray-500 hover:bg-white/5 hover:text-gray-300'
                }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-auto p-4 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-white/10">
          <p className="text-xs text-gray-400 mb-2">MVP Version 1.0</p>
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
            <div className="h-full w-2/3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Header */}
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-black/20 backdrop-blur-md sticky top-0 z-10">
          <h1 className="text-2xl font-semibold capitalize">{activeTab} Dashboard</h1>
          <div className="flex items-center gap-4">
            {(activeTab === 'leads' || activeTab === 'marketing') && leads.length > 0 && (
              <button
                onClick={handleClearLeads}
                className="px-4 py-2 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-full font-medium text-sm hover:bg-rose-500/20 transition-all flex items-center gap-2"
              >
                Clear Results
              </button>
            )}
            <div className="flex -space-x-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-black bg-gray-800" />
              ))}
            </div>
            <button className="px-4 py-2 bg-white text-black rounded-full font-medium text-sm hover:bg-gray-200 transition-colors">
              New Project
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 p-8 overflow-y-auto">
          {activeTab === 'search' && (
            <div className="space-y-12 py-10">
              <div className="text-center space-y-4">
                <h2 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40">
                  Find Your Next Big Client
                </h2>
                <p className="text-gray-500 max-w-2xl mx-auto">
                  Use AI to discover businesses with outdated websites, poor SEO, or technical debt directly from Google Maps.
                </p>
              </div>

              <LeadSearch onSearch={handleSearch} isLoading={isLoading} />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm">
                  <p className="text-gray-400 text-sm mb-1">Total Leads</p>
                  <h3 className="text-2xl font-bold">{leads.length}</h3>
                </div>
                <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm">
                  <p className="text-gray-400 text-sm mb-1">AI Analyzed</p>
                  <h3 className="text-2xl font-bold">{analyzedCount}</h3>
                </div>
                <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm">
                  <p className="text-gray-400 text-sm mb-1">Potential Value</p>
                  <h3 className="text-2xl font-bold text-emerald-400">${totalPotentialValue.toLocaleString()}</h3>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'leads' && (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Discovery Results</h2>
                  <p className="text-gray-500 text-sm">Leads discovered from your latest searches</p>
                </div>
              </div>
              <LeadDashboard
                leads={leads}
                isLoading={isLoading}
                onSelectLead={(l) => setSelectedLead(l)}
                onUpdate={fetchLeads}
              />
            </div>
          )}

          {activeTab === 'marketing' && (
            <OutreachDashboard
              leads={leads}
              onUpdate={fetchLeads}
            />
          )}

          {activeTab === 'analytics' && (
            <div className="flex-1 flex flex-col items-center justify-center min-h-[400px]">
              <BarChart3 className="w-12 h-12 text-gray-700 mb-4" />
              <p className="text-gray-500">Advanced analytics coming soon...</p>
            </div>
          )}
        </div>

        {selectedLead && (
          <EmailEditorModal
            lead={selectedLead}
            onClose={() => setSelectedLead(null)}
            onUpdate={fetchLeads}
          />
        )}
      </main>
    </div>
  );
};

export default App;
