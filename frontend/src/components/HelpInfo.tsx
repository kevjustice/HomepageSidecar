import React, { useState } from 'react';
import { Info, X } from 'lucide-react';

interface HelpInfoProps {
    title: string;
    description: string;
    steps?: string[];
    tips?: string[];
}

const HelpInfo: React.FC<HelpInfoProps> = ({ title, description, steps, tips }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative inline-block">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`p-2 rounded-xl transition-all ${isOpen ? 'bg-indigo-600 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-100 bg-zinc-900 border border-zinc-800'}`}
                title="Page Instructions"
            >
                <Info className="w-4 h-4" />
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px]"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute right-0 mt-3 w-80 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-6 z-50 animate-in fade-in zoom-in duration-200 origin-top-right">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-zinc-100 flex items-center gap-2">
                                <Info className="w-4 h-4 text-indigo-500" />
                                {title}
                            </h3>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1 hover:bg-zinc-800 rounded-lg text-zinc-500 hover:text-white transition-all"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <p className="text-sm text-zinc-400 leading-relaxed mb-6 italic">
                            {description}
                        </p>

                        {steps && steps.length > 0 && (
                            <div className="space-y-3 mb-6">
                                <div className="text-[10px] font-black uppercase tracking-widest text-zinc-600">How to use</div>
                                <ul className="space-y-2">
                                    {steps.map((step, i) => (
                                        <li key={i} className="flex gap-3 text-xs text-zinc-300 leading-snug">
                                            <span className="text-indigo-500 font-bold">{i + 1}.</span>
                                            {step}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {tips && tips.length > 0 && (
                            <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-xl p-3 space-y-2">
                                <div className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Pro Tips</div>
                                <ul className="space-y-1.5">
                                    {tips.map((tip, i) => (
                                        <li key={i} className="text-[11px] text-indigo-200/70 flex items-start gap-2">
                                            <span className="mt-1 w-1 h-1 rounded-full bg-indigo-500 flex-shrink-0" />
                                            {tip}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default HelpInfo;
