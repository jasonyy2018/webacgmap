import React, { useState } from 'react';
import { Mail, ChevronRight, MessageSquare, AlertCircle, Layout, Sparkles } from 'lucide-react';
import type { Lead } from "@/lib/types";
import EmailEditor from './EmailEditor';

interface OutreachDashboardProps {
    leads: Lead[];
    onUpdate: () => void;
}

const OutreachDashboard: React.FC<OutreachDashboardProps> = ({ leads, onUpdate }) => {
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const outreachLeads = leads.filter(l => l.ai_status === 'completed');
    const contactedCount = leads.filter(l => l.status === 'contacted').length;

    // Use current lead object from leads list to ensure up-to-date data
    const activeLead = selectedLead ? leads.find(l => l.id === selectedLead.id) : null;

    return (
        <div className="h-[calc(100vh-180px)] flex gap-8">
            {/* Left Panel: List */}
            <div className="w-1/3 flex flex-col gap-6 overflow-hidden">
                {/* Stats Mini-Grid */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Analyzed</p>
                        <h3 className="text-xl font-bold">{outreachLeads.length}</h3>
                    </div>
                    <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10">
                        <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest mb-1">Contacted</p>
                        <h3 className="text-xl font-bold text-indigo-400">{contactedCount}</h3>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                    {outreachLeads.length === 0 ? (
                        <div className="p-10 text-center bg-white/5 rounded-3xl border border-dashed border-white/10">
                            <Mail className="w-10 h-10 text-gray-700 mx-auto mb-4" />
                            <p className="text-gray-500 text-sm italic">Analyze leads to start outreach</p>
                        </div>
                    ) : (
                        outreachLeads.map((lead) => (
                            <button
                                key={lead.id}
                                onClick={() => setSelectedLead(lead)}
                                className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 group ${activeLead?.id === lead.id
                                    ? 'bg-indigo-500/10 border-indigo-500/30'
                                    : 'bg-white/5 border-white/5 hover:bg-white/[0.08] hover:border-white/20'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${lead.status === 'contacted' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-indigo-500/10 text-indigo-400'
                                        }`}>
                                        <MessageSquare className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-sm truncate">{lead.name}</h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            {lead.contact_email ? (
                                                <span className="text-[10px] text-gray-500 truncate">{lead.contact_email}</span>
                                            ) : (
                                                <span className="text-[10px] text-amber-500 flex items-center gap-1">
                                                    <AlertCircle className="w-2.5 h-2.5" /> No Email
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <ChevronRight className={`w-4 h-4 transition-transform ${activeLead?.id === lead.id ? 'translate-x-0 opacity-100 text-indigo-400' : '-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 text-gray-600'}`} />
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Right Panel: Editor Area */}
            <div className="flex-1">
                {activeLead ? (
                    <EmailEditor
                        lead={activeLead}
                        onUpdate={onUpdate}
                    />
                ) : (
                    <div className="h-full flex flex-col items-center justify-center p-12 bg-white/[0.02] border border-white/5 rounded-[2.5rem] border-dashed">
                        <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-6">
                            <Layout className="w-8 h-8 text-gray-700" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Workspace Ready</h3>
                        <p className="text-gray-500 text-sm text-center max-w-xs">
                            Select a lead from the discovery list on the left to start crafting your personalized marketing strategy.
                        </p>
                        <div className="mt-8 flex gap-3">
                            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] text-gray-400 uppercase tracking-widest font-bold">
                                <Sparkles className="w-3 h-3 text-indigo-500" />
                                AI Optimized
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OutreachDashboard;
