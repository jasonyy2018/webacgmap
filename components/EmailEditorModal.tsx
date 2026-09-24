import React, { useState, useEffect } from 'react';
import { X, Send, Save, Loader2, Sparkles, Image as ImageIcon, Mail, Wand2, Zap } from 'lucide-react';
import type { Lead } from "@/lib/types";
import { leadsApi } from "@/lib/api-client";
import PosterPreview from './PosterPreview';

interface EmailEditorModalProps {
    lead: Lead;
    onClose: () => void;
    onUpdate: () => void;
}

type TabType = 'email' | 'poster';

const EmailEditorModal: React.FC<EmailEditorModalProps> = ({ lead, onClose, onUpdate }) => {
    const [activeTab, setActiveTab] = useState<TabType>('email');
    const [emailContent, setEmailContent] = useState(lead.analysis?.generated_email || '');
    const [isSaving, setIsSaving] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [isRefining, setIsRefining] = useState(false);
    const [posterData, setPosterData] = useState<any>(null);
    const [isLoadingPoster, setIsLoadingPoster] = useState(false);

    useEffect(() => {
        if (activeTab === 'poster' && !posterData) {
            fetchPosterData();
        }
    }, [activeTab]);

    const fetchPosterData = async () => {
        setIsLoadingPoster(true);
        try {
            const data = await leadsApi.getPosterData(lead.id);
            setPosterData(data);
        } catch (error) {
            console.error('Failed to fetch poster data:', error);
        } finally {
            setIsLoadingPoster(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await leadsApi.updateAnalysis(lead.id, { generated_email: emailContent });
            onUpdate();
        } catch (error) {
            console.error('Failed to save email:', error);
            alert('Failed to save email content');
        } finally {
            setIsSaving(false);
        }
    };

    const handleSend = async () => {
        if (!confirm(`Are you sure you want to send this email to ${lead.contact_email}?`)) return;

        setIsSending(true);
        try {
            await handleSave();
            await leadsApi.sendEmail(lead.id);
            alert('Email sent successfully!');
            onClose();
        } catch (error) {
            console.error('Failed to send email:', error);
            alert('Failed to send email');
        } finally {
            setIsSending(false);
        }
    };

    const handleRefine = async (instruction: string) => {
        setIsRefining(true);
        try {
            const result = await leadsApi.refineEmail(lead.id, instruction);
            setEmailContent(result.refined_email);
            onUpdate();
        } catch (error) {
            console.error('Failed to refine email:', error);
            alert('Failed to refine email content');
        } finally {
            setIsRefining(false);
        }
    };

    const refinementOptions = [
        { label: 'Professional', icon: Wand2, instruction: 'Make the tone more formal and professional.' },
        { label: 'Shorten', icon: Sparkles, instruction: 'Make the email much shorter and more direct.' },
        { label: 'Add urgency', icon: Zap, instruction: 'Add a professional sense of urgency regarding technical debt.' },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] w-full max-w-4xl h-[85vh] overflow-hidden flex flex-col shadow-2xl">
                {/* Header with Tabs */}
                <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <div>
                            <h3 className="text-xl font-bold">{lead.name}</h3>
                            <p className="text-gray-500 text-xs tracking-wider uppercase">{lead.website}</p>
                        </div>

                        <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5">
                            <button
                                onClick={() => setActiveTab('email')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === 'email' ? 'bg-white/10 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                <Mail className="w-4 h-4" /> Email Content
                            </button>
                            <button
                                onClick={() => setActiveTab('poster')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === 'poster' ? 'bg-white/10 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                <ImageIcon className="w-4 h-4" /> Marketing Poster
                            </button>
                        </div>
                    </div>

                    <button onClick={onClose} className="p-3 hover:bg-white/5 rounded-full transition-colors text-gray-500 hover:text-white">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-hidden flex">
                    {activeTab === 'email' ? (
                        <div className="flex-1 flex gap-8 p-8 overflow-y-auto">
                            {/* Main Editor */}
                            <div className="flex-[2] flex flex-col gap-4">
                                <div className="flex-1 flex flex-col gap-2">
                                    <div className="flex items-center justify-between text-[0.65rem] font-bold text-gray-500 uppercase tracking-widest px-2">
                                        <span>Generated Content</span>
                                        <span className="text-indigo-500">AI Powered</span>
                                    </div>
                                    <textarea
                                        value={emailContent}
                                        onChange={(e) => setEmailContent(e.target.value)}
                                        disabled={isRefining}
                                        className="flex-1 w-full min-h-[400px] p-6 bg-white/[0.03] border border-white/5 rounded-3xl text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 resize-none font-mono text-sm leading-relaxed"
                                        placeholder="Writing your personalized email..."
                                    />
                                </div>
                            </div>

                            {/* Sidebar Tools */}
                            <div className="flex-1 space-y-8 min-w-[240px]">
                                <div className="space-y-4">
                                    <h4 className="text-[0.65rem] font-bold text-gray-500 uppercase tracking-widest px-2">AI Refinement</h4>
                                    <div className="space-y-2">
                                        {refinementOptions.map((opt) => (
                                            <button
                                                key={opt.label}
                                                onClick={() => handleRefine(opt.instruction)}
                                                disabled={isRefining}
                                                className="w-full flex items-center gap-3 p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all text-left group"
                                            >
                                                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                                                    <opt.icon className="w-4 h-4" />
                                                </div>
                                                <span className="text-sm font-medium text-gray-300">{opt.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="p-6 rounded-3xl bg-indigo-500/5 border border-indigo-500/10 space-y-3">
                                    <div className="flex items-center gap-2 text-indigo-400">
                                        <Sparkles className="w-4 h-4" />
                                        <span className="text-xs font-bold uppercase tracking-wider">Analysis Tip</span>
                                    </div>
                                    <p className="text-xs text-gray-400 leading-relaxed">
                                        Mentions of {lead.analysis?.tech_stack[0]} and UX issues detected on {lead.website} are already included.
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 overflow-y-auto p-8 flex flex-col items-center">
                            {isLoadingPoster ? (
                                <div className="flex flex-col items-center justify-center py-20 gap-4">
                                    <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
                                    <p className="text-gray-500 font-medium">Generating marketing poster...</p>
                                </div>
                            ) : (
                                <PosterPreview data={posterData} companyName={lead.name} />
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-8 py-6 bg-white/[0.02] border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <div className="flex flex-col">
                            <span className="text-[0.65rem] font-bold text-gray-600 uppercase tracking-widest">Recipient</span>
                            <span className="text-sm text-gray-400 font-medium">{lead.contact_email || 'No email found'}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleSave}
                            disabled={isSaving || isSending || isRefining}
                            className="flex items-center gap-2 px-8 py-3 rounded-full border border-white/10 hover:bg-white/5 transition-all font-medium disabled:opacity-50"
                        >
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Save Draft
                        </button>

                        <button
                            onClick={handleSend}
                            disabled={isSending || isSaving || isRefining || !lead.contact_email}
                            className="flex items-center gap-2 px-10 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full font-bold hover:shadow-[0_0_30px_rgba(99,102,241,0.4)] transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:scale-100 shadow-xl shadow-indigo-500/20"
                        >
                            {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                            Send Outreach
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmailEditorModal;
