'use client';

import React, { useState, useMemo } from 'react';
import LeadCard from './LeadCard';
import LeadDetailModal from './LeadDetailModal';
import { 
  Loader2, 
  Users, 
  Search, 
  Filter, 
  Download, 
  Sparkles, 
  CheckSquare, 
  Square,
  FileSpreadsheet,
  FileCode
} from 'lucide-react';
import type { Lead } from "@/lib/types";
import { leadsApi } from '@/lib/api-client';

interface LeadDashboardProps {
    leads: Lead[];
    isLoading: boolean;
    onSelectLead: (lead: Lead) => void;
    onUpdate: () => void;
}

const LeadDashboard: React.FC<LeadDashboardProps> = ({ leads, isLoading, onSelectLead, onUpdate }) => {
    const [searchFilter, setSearchFilter] = useState('');
    const [gradeFilter, setGradeFilter] = useState<'ALL' | 'A' | 'B' | 'C'>('ALL');
    const [statusFilter, setStatusFilter] = useState<string>('ALL');
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [activeDetailLead, setActiveDetailLead] = useState<Lead | null>(null);
    const [isBatchAnalyzing, setIsBatchAnalyzing] = useState(false);

    // Filter leads based on controls
    const filteredLeads = useMemo(() => {
        return leads.filter((lead) => {
            // Search text filter
            const matchesSearch = !searchFilter || 
                lead.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
                (lead.address && lead.address.toLowerCase().includes(searchFilter.toLowerCase())) ||
                (lead.website && lead.website.toLowerCase().includes(searchFilter.toLowerCase()));

            // Grade filter
            const matchesGrade = gradeFilter === 'ALL' || lead.ai_grade === gradeFilter;

            // Status filter
            const matchesStatus = statusFilter === 'ALL' || lead.ai_status === statusFilter;

            return matchesSearch && matchesGrade && matchesStatus;
        });
    }, [leads, searchFilter, gradeFilter, statusFilter]);

    const toggleSelectId = (id: number) => {
        setSelectedIds((prev) => 
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === filteredLeads.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredLeads.map((l) => l.id));
        }
    };

    const handleBatchAnalyze = async () => {
        const targetIds = selectedIds.length > 0 
            ? selectedIds 
            : filteredLeads.filter((l) => l.ai_status !== 'completed').map((l) => l.id);

        if (targetIds.length === 0) {
            alert('No un-audited leads selected.');
            return;
        }

        setIsBatchAnalyzing(true);
        try {
            for (const id of targetIds) {
                await leadsApi.analyze(id);
            }
            onUpdate();
            setSelectedIds([]);
        } catch (e: any) {
            console.error('Batch analysis error:', e);
            alert(`Batch audit error: ${e.message}`);
        } finally {
            setIsBatchAnalyzing(false);
        }
    };

    const handleExportCSV = () => {
        const exportTarget = selectedIds.length > 0 
            ? leads.filter((l) => selectedIds.includes(l.id)) 
            : filteredLeads;

        if (exportTarget.length === 0) return;

        const headers = ['ID', 'Name', 'Address', 'Phone', 'Email', 'Website', 'Rating', 'AI Grade', 'AI Score', 'Status'];
        const rows = exportTarget.map((l) => [
            l.id,
            `"${(l.name || '').replace(/"/g, '""')}"`,
            `"${(l.address || '').replace(/"/g, '""')}"`,
            `"${l.phone || ''}"`,
            `"${l.contact_email || ''}"`,
            `"${l.website || ''}"`,
            l.rating || '',
            l.ai_grade || '',
            l.ai_score || '',
            l.status || ''
        ]);

        const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `mapkdev_leads_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
    };

    const handleExportJSON = () => {
        const exportTarget = selectedIds.length > 0 
            ? leads.filter((l) => selectedIds.includes(l.id)) 
            : filteredLeads;

        const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportTarget, null, 2));
        const link = document.createElement('a');
        link.setAttribute('href', dataStr);
        link.setAttribute('download', `mapkdev_leads_${new Date().toISOString().slice(0, 10)}.json`);
        document.body.appendChild(link);
        link.click();
        link.remove();
    };

    if (isLoading) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-4" />
                <p className="text-gray-500 font-medium">Discovering and analyzing lead records...</p>
            </div>
        );
    }

    if (leads.length === 0) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] border border-white/5 bg-white/[0.02] rounded-3xl p-8 text-center">
                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-6">
                    <Users className="w-8 h-8 text-gray-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No Leads Discovered Yet</h3>
                <p className="text-gray-500 max-w-xs mx-auto text-sm">
                    Enter a target industry or keyword above (e.g., "Web design agencies in London") to pull business leads directly from Google Maps.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Filter & Batch Action Toolbar */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-wrap items-center justify-between gap-4">
                {/* Left: Filter Controls */}
                <div className="flex flex-wrap items-center gap-3 flex-1">
                    {/* Search Input */}
                    <div className="relative min-w-[200px] flex-1 max-w-xs">
                        <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Filter leads..."
                            value={searchFilter}
                            onChange={(e) => setSearchFilter(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/60 border border-white/10 text-xs text-white placeholder-gray-500 outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                    </div>

                    {/* Grade Filter Tabs */}
                    <div className="flex bg-black/60 p-1 rounded-xl border border-white/10 text-xs">
                        {(['ALL', 'A', 'B', 'C'] as const).map((grade) => (
                            <button
                                key={grade}
                                onClick={() => setGradeFilter(grade)}
                                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                                    gradeFilter === grade 
                                        ? 'bg-indigo-500 text-white shadow-md' 
                                        : 'text-gray-400 hover:text-white'
                                }`}
                            >
                                {grade === 'ALL' ? 'All Grades' : `Grade ${grade}`}
                            </button>
                        ))}
                    </div>

                    {/* AI Status Filter */}
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-xs text-gray-300 outline-none"
                    >
                        <option value="ALL">All AI Statuses</option>
                        <option value="completed">Completed Audit</option>
                        <option value="pending">Pending Audit</option>
                        <option value="analyzing">Analyzing</option>
                        <option value="failed">Audit Failed</option>
                    </select>
                </div>

                {/* Right: Batch Actions */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={toggleSelectAll}
                        className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-bold text-gray-300 flex items-center gap-1.5 transition-all"
                    >
                        {selectedIds.length > 0 && selectedIds.length === filteredLeads.length ? (
                            <CheckSquare className="w-3.5 h-3.5 text-indigo-400" />
                        ) : (
                            <Square className="w-3.5 h-3.5 text-gray-500" />
                        )}
                        <span>{selectedIds.length > 0 ? `Selected (${selectedIds.length})` : 'Select All'}</span>
                    </button>

                    <button
                        onClick={handleBatchAnalyze}
                        disabled={isBatchAnalyzing}
                        className="px-4 py-2 rounded-xl bg-indigo-500/20 border border-indigo-500/30 hover:bg-indigo-500/30 text-indigo-300 font-bold text-xs flex items-center gap-1.5 transition-all disabled:opacity-50"
                    >
                        <Sparkles className={`w-3.5 h-3.5 ${isBatchAnalyzing ? 'animate-spin' : ''}`} />
                        <span>{isBatchAnalyzing ? 'Auditing Batch...' : 'Batch AI Audit'}</span>
                    </button>

                    <button
                        onClick={handleExportCSV}
                        className="px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center gap-1.5 transition-all"
                        title="Export as CSV spreadsheet"
                    >
                        <FileSpreadsheet className="w-3.5 h-3.5" /> Export CSV
                    </button>

                    <button
                        onClick={handleExportJSON}
                        className="px-3 py-2 rounded-xl bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 text-purple-300 font-bold text-xs flex items-center gap-1.5 transition-all"
                        title="Export as JSON"
                    >
                        <FileCode className="w-3.5 h-3.5" /> Export JSON
                    </button>
                </div>
            </div>

            {/* Lead Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredLeads.map((lead) => (
                    <LeadCard 
                        key={lead.id} 
                        lead={lead} 
                        isSelected={selectedIds.includes(lead.id)}
                        onToggleSelect={toggleSelectId}
                        onSelectLead={onSelectLead} 
                        onOpenDetail={(l) => setActiveDetailLead(l)}
                        onUpdate={onUpdate} 
                    />
                ))}
            </div>

            {/* Lead Detail Modal */}
            {activeDetailLead && (
                <LeadDetailModal
                    lead={activeDetailLead}
                    onClose={() => setActiveDetailLead(null)}
                    onSelectLeadForOutreach={onSelectLead}
                    onUpdate={() => {
                        onUpdate();
                    }}
                />
            )}
        </div>
    );
};

export default LeadDashboard;
