import React, { useState } from 'react';
import { Smartphone, Zap, Globe, ShieldCheck, Copy, Check, Palette } from 'lucide-react';

interface PosterData {
    title: string;
    subtitle: string;
    key_points: string[];
    call_to_action: string;
    theme_colors: {
        primary: string;
        secondary: string;
    };
    style_vibe: string;
}

interface PosterPreviewProps {
    data: PosterData | null;
    companyName: string;
}

const PosterPreview: React.FC<PosterPreviewProps> = ({ data, companyName }) => {
    const [copied, setCopied] = useState(false);
    const [overridePrimary, setOverridePrimary] = useState<string | null>(null);

    if (!data || !data.title) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-white/5 rounded-3xl border border-dashed border-white/10 text-gray-500">
                <p>No poster proposal available for this lead yet.</p>
                <p className="text-sm">Run AI Analysis on the lead to generate marketing posters.</p>
            </div>
        );
    }

    const primaryColor = overridePrimary || data.theme_colors?.primary || '#6366f1';
    const secondaryColor = data.theme_colors?.secondary || '#a855f7';
    const icons = [Smartphone, Zap, Globe, ShieldCheck];

    const handleCopySpecs = () => {
        const specs = `MARKETING POSTER PITCH FOR ${companyName.toUpperCase()}\nHeadline: ${data.title}\nSubtitle: ${data.subtitle}\nKey Points:\n- ${data.key_points.join('\n- ')}\nCTA: ${data.call_to_action}`;
        navigator.clipboard.writeText(specs);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="space-y-6 w-full max-w-lg mx-auto">
            {/* Color & Export Bar */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10 text-xs">
                <div className="flex items-center gap-2">
                    <Palette className="w-4 h-4 text-indigo-400" />
                    <span className="text-gray-400 font-bold uppercase text-[10px]">Theme Accent</span>
                    {['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#3b82f6'].map((color) => (
                        <button
                            key={color}
                            onClick={() => setOverridePrimary(color)}
                            className="w-5 h-5 rounded-full border border-white/20 transition-transform hover:scale-125"
                            style={{ backgroundColor: color }}
                        />
                    ))}
                </div>

                <button
                    onClick={handleCopySpecs}
                    className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold flex items-center gap-1.5 transition-all"
                >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied Pitch!' : 'Copy Poster Specs'}</span>
                </button>
            </div>

            {/* Poster Canvas */}
            <div className="relative w-full aspect-[3/4] bg-[#050505] rounded-[2rem] overflow-hidden shadow-2xl border border-white/10 group">
                {/* Background Gradients */}
                <div
                    className="absolute top-0 left-0 w-full h-full opacity-25 transition-all duration-700"
                    style={{
                        background: `radial-gradient(circle at top left, ${primaryColor}, transparent), radial-gradient(circle at bottom right, ${secondaryColor}, transparent)`
                    }}
                />

                {/* Content */}
                <div className="relative h-full p-10 flex flex-col justify-between z-10">
                    <div className="space-y-6">
                        <div className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-[0.2em] text-gray-400">
                            Design Proposal • {data.style_vibe || 'Modern'}
                        </div>

                        <h2 className="text-3xl font-extrabold leading-tight tracking-tight text-white">
                            {data.title.includes(companyName) ? (
                                data.title.split(companyName).map((part, i) => (
                                    <React.Fragment key={i}>
                                        {part}
                                        {i === 0 && (
                                            <span style={{ color: primaryColor }}>{companyName}</span>
                                        )}
                                    </React.Fragment>
                                ))
                            ) : (
                                <span>{data.title}</span>
                            )}
                        </h2>

                        <p className="text-lg text-gray-300 font-medium leading-relaxed">
                            {data.subtitle}
                        </p>

                        <div className="h-px w-20 bg-gradient-to-r from-white/30 to-transparent" />

                        <div className="space-y-4 pt-2">
                            {data.key_points.map((point, index) => {
                                const Icon = icons[index % icons.length];
                                return (
                                    <div key={index} className="flex items-center gap-4 group/item">
                                        <div
                                            className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/5 border border-white/10 transition-transform group-hover/item:scale-110"
                                            style={{ color: index === 0 ? primaryColor : 'inherit' }}
                                        >
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <span className="text-gray-200 font-medium text-sm">{point}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="mt-auto space-y-5 text-center">
                        <div
                            className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md"
                            style={{ borderColor: `${primaryColor}44` }}
                        >
                            <p className="text-base font-bold mb-1 italic text-white">"{data.call_to_action}"</p>
                            <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: primaryColor }} />
                                Executive Strategy Proposal for {companyName}
                            </div>
                        </div>

                        <div className="text-[0.65rem] text-gray-500 uppercase tracking-[0.3em] font-bold">
                            Powered by MapKDev AI
                        </div>
                    </div>
                </div>

                {/* Decorative circle */}
                <div className="absolute top-0 right-0 p-8 pointer-events-none">
                    <div className="w-24 h-24 rounded-full border border-white/5 opacity-50" />
                </div>
            </div>
        </div>
    );
};

export default PosterPreview;
