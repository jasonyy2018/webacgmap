import React, { useState, useEffect } from 'react';
import { Send, Save, Loader2, Sparkles, Wand2, Zap, Mail, MessageSquare, Check, Copy } from 'lucide-react';
import type { Lead } from "@/lib/types";
import { leadsApi } from "@/lib/api-client";

interface EmailEditorProps {
    lead: Lead;
    onUpdate: () => void;
}

const EmailEditor: React.FC<EmailEditorProps> = ({ lead, onUpdate }) => {
    const subjects = lead.analysis?.email_subjects || [
        `Web Presence Optimization Proposal for ${lead.name}`,
        `Quick inquiry regarding ${lead.name}'s digital platform`,
        `Modernizing ${lead.name}'s customer portal`
    ];

    const [selectedSubject, setSelectedSubject] = useState(subjects[0] || '');
    const [emailContent, setEmailContent] = useState(lead.analysis?.generated_email || '');
    const [isSaving, setIsSaving] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [isRefining, setIsRefining] = useState(false);
    const [copiedSubject, setCopiedSubject] = useState(false);

    useEffect(() => {
        setEmailContent(lead.analysis?.generated_email || '');
        if (lead.analysis?.email_subjects?.length) {
            setSelectedSubject(lead.analysis.email_subjects[0]);
        } else {
            setSelectedSubject(`Digital Upgrade Proposal for ${lead.name}`);
        }
    }, [lead.id, lead.analysis?.generated_email, lead.analysis?.email_subjects]);

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
            onUpdate();
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

    const handleCopySubject = () => {
        navigator.clipboard.writeText(selectedSubject);
        setCopiedSubject(true);
        setTimeout(() => setCopiedSubject(false), 2000);
    };

    const refinementOptions = [
        { label: 'Professional Tone', icon: Wand2, instruction: 'Make the tone more formal, consultative, and executive.' },
        { label: 'Concise & Short', icon: Sparkles, instruction: 'Make the email under 120 words and direct to the point.' },
        { label: 'Add Tech Urgency', icon: Zap, instruction: 'Add a professional sense of urgency regarding security and mobile debt.' },
    ];

    return (
        <div className="flex flex-col h-full bg-[#0a0a0a] rounded-[2rem] border border-white/10 overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="px-6 py-4 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                        <Mail className="w-4 h-4" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-white">{lead.name}</h3>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest">{lead.contact_email || 'No Contact Email'}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-full uppercase tracking-widest">
                        AI Outreach Studio
                    </span>
                </div>
            </div>

            {/* Editor Content Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* AI Subject Lines Picker */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-[0.65rem] font-bold text-gray-500 uppercase tracking-widest px-2">
                        <span className="flex items-center gap-1.5"><MessageSquare className="w-3 h-3 text-indigo-400" /> AI Suggested Subject Lines</span>
                        <button onClick={handleCopySubject} className="text-gray-400 hover:text-white flex items-center gap-1">
                            {copiedSubject ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            {copiedSubject ? 'Copied!' : 'Copy Subject'}
                        </button>
                    </div>

                    <div className="space-y-1.5">
                        {subjects.map((subj, idx) => (
                            <button
                                key={idx}
                                onClick={() => setSelectedSubject(subj)}
                                className={`w-full text-left p-2.5 px-4 rounded-xl border text-xs font-mono transition-all flex items-center justify-between ${
                                    selectedSubject === subj
                                        ? 'bg-indigo-500/15 border-indigo-500/40 text-indigo-300 shadow-sm'
                                        : 'bg-white/[0.02] border-white/5 text-gray-400 hover:bg-white/5 hover:text-gray-200'
                                }`}
                            >
                                <span className="truncate">{subj}</span>
                                {selectedSubject === subj && <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0 ml-2" />}
                            </button>
                        ))}
                    </div>

                    <input
                        type="text"
                        value={selectedSubject}
                        onChange={(e) => setSelectedSubject(e.target.value)}
                        className="w-full px-4 py-2 rounded-xl bg-black/60 border border-white/10 text-xs font-mono text-white outline-none focus:ring-1 focus:ring-indigo-500/40"
                        placeholder="Custom email subject line..."
                    />
                </div>

                {/* Email Content Textarea */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-[0.65rem] font-bold text-gray-500 uppercase tracking-widest px-2">
                        <span>Personalized Email Body</span>
                        {isRefining && <span className="text-indigo-400 animate-pulse flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Refining with Gemini AI...</span>}
                    </div>
                    <textarea
                        value={emailContent}
                        onChange={(e) => setEmailContent(e.target.value)}
                        disabled={isRefining}
                        className="w-full min-h-[260px] p-5 bg-white/[0.03] border border-white/5 rounded-2xl text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 resize-none font-mono text-sm leading-relaxed"
                        placeholder="Drafting consultative outreach email..."
                    />
                </div>

                {/* Refinement Tools Grid */}
                <div className="grid grid-cols-3 gap-3">
                    {refinementOptions.map((opt) => (
                        <button
                            key={opt.label}
                            onClick={() => handleRefine(opt.instruction)}
                            disabled={isRefining}
                            className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all text-center group disabled:opacity-50"
                        >
                            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                                <opt.icon className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-[10px] font-bold text-gray-300 uppercase tracking-wider">{opt.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Actions */}
            <div className="p-4 bg-white/[0.02] border-t border-white/5 flex gap-3">
                <button
                    onClick={handleSave}
                    disabled={isSaving || isSending || isRefining}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-white/10 hover:bg-white/5 text-xs font-bold transition-all disabled:opacity-50"
                >
                    {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    Save Draft
                </button>
                <button
                    onClick={handleSend}
                    disabled={isSending || isSaving || isRefining || !lead.contact_email}
                    className="flex-[2] flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl text-xs font-black hover:shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:scale-100 shadow-lg shadow-indigo-500/20"
                >
                    {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    Send Outreach Email
                </button>
            </div>
        </div>
    );
};

export default EmailEditor;
