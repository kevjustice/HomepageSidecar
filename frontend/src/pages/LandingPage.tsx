import React from 'react';
import { Link } from 'react-router-dom';
import {
    Zap,
    ShieldAlert,
    Cpu,
    Layout,
    Box,
    ArrowRight,
    Github,
    Library,
    Code2,
    CheckCircle2
} from 'lucide-react';

const LandingPage: React.FC = () => {
    const screenshots = [
        {
            src: "/screenshots/HomepageHelper_MainScreen.png",
            title: "Visual Board",
            desc: "Drag-and-drop service orchestration with deep group nesting."
        },
        {
            src: "/screenshots/HomepageHelper_InfoWidgets.png",
            title: "Widget Catalog",
            desc: "Browse and configure information widgets with live templates."
        },
        {
            src: "/screenshots/HomepageHelper_ReorderGroups.png",
            title: "Hierarchy Editor",
            desc: "Complete structural management of your dashboard landscape."
        },
        {
            src: "/screenshots/HomepageHelper_Settings.png",
            title: "Global Settings",
            desc: "Configure appearance, themes, and system behavior visually."
        }
    ];

    const techStack = [
        { name: "React 18", icon: Library },
        { name: "Fastify", icon: Cpu },
        { name: "TypeScript", icon: Code2 },
        { name: "Tailwind CSS", icon: Layout },
        { name: "Lucide Icons", icon: Zap },
        { name: "Monaco Editor", icon: Box }
    ];

    return (
        <div className="h-full overflow-y-auto bg-zinc-950 text-zinc-100 selection:bg-indigo-500/30">
            {/* Hero Section */}
            <header className="relative py-24 px-8 border-b border-zinc-900 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-600/10 blur-[120px] rounded-full -z-10" />

                <div className="max-w-5xl mx-auto text-center space-y-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-widest animate-in fade-in slide-in-from-bottom-2 duration-700">
                        <Zap className="w-3 h-3 fill-current" />
                        100% AI Generated Project
                    </div>

                    <h1 className="text-6xl md:text-7xl font-black tracking-tighter leading-none animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                        The Ultimate Sidecar for <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400">Homepage</span>
                    </h1>

                    <p className="text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                        Stop manual YAML hunting. Homepage Helper provides a powerful visual UI to orchestrate your services, widgets, and configurations without breaking your dashboard.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-300">
                        <Link
                            to="/services"
                            className="bg-zinc-100 text-zinc-950 px-10 py-4 rounded-2xl font-black text-lg flex items-center gap-3 hover:bg-white transition-all hover:scale-[1.02] active:scale-95 shadow-2xl shadow-zinc-100/10"
                        >
                            Enter Dashboard <ArrowRight className="w-5 h-5" />
                        </Link>
                        <a
                            href="https://github.com/kevjustice"
                            target="_blank"
                            rel="noreferrer"
                            className="bg-zinc-900 text-zinc-400 px-8 py-4 rounded-2xl font-bold text-lg flex items-center gap-3 hover:text-white border border-zinc-800 transition-all active:scale-95 shadow-xl shadow-zinc-950/20"
                        >
                            <Github className="w-5 h-5" /> GitHub Profile
                        </a>
                    </div>
                </div>
            </header>

            {/* Feature Showcase */}
            <section className="py-24 px-8 max-w-7xl mx-auto space-y-16">
                <div className="text-center space-y-4">
                    <h2 className="text-4xl font-black tracking-tight">Visual Mastery</h2>
                    <p className="text-zinc-500 max-w-xl mx-auto">High-performance interface designed for complex dashboard management.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {screenshots.map((img, i) => (
                        <div key={i} className="group bg-zinc-900/30 border border-zinc-900 rounded-3xl overflow-hidden hover:border-indigo-500/30 transition-all shadow-2xl">
                            <div className="aspect-video relative overflow-hidden bg-zinc-950">
                                <img
                                    src={img.src}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    alt={img.title}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-8">
                                    <div className="space-y-1">
                                        <h3 className="text-xl font-bold">{img.title}</h3>
                                        <p className="text-sm text-zinc-400">{img.desc}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 border-t border-zinc-900 bg-zinc-900/20">
                                <h3 className="font-bold flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                    {img.title}
                                </h3>
                                <p className="text-xs text-zinc-500 mt-1">{img.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Why & Tech Stack */}
            <section className="py-24 px-8 bg-zinc-900/20 border-y border-zinc-900">
                <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24">
                    <div className="space-y-6">
                        <h2 className="text-4xl font-black tracking-tight leading-tight">Built to solve the <span className="text-indigo-400">YAML struggle</span>.</h2>
                        <div className="space-y-4 text-zinc-400 leading-relaxed">
                            <p>
                                Configuration for Homepage is powerful but fragile. A misplaced indentation or a missing colon in your services files can bring down your entire dashboard interface.
                            </p>
                            <p>
                                Homepage Helper was built to provide a **safe haven** for your configurations. It parses your files into a visual model where you can drag, drop, and edit without touching the raw syntax unless you want to.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {techStack.map((tech, i) => (
                                <div key={i} className="flex items-center gap-3 p-3 bg-zinc-950 border border-zinc-900 rounded-2xl">
                                    <tech.icon className="w-5 h-5 text-indigo-500" />
                                    <span className="text-sm font-bold">{tech.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="relative group">
                        <div className="absolute -inset-4 bg-gradient-to-tr from-indigo-500/20 to-emerald-500/10 blur-2xl rounded-3xl -z-10 group-hover:opacity-100 opacity-50 transition-opacity" />
                        <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-8 space-y-8 shadow-2xl">
                            <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center border border-amber-500/20">
                                <ShieldAlert className="w-8 h-8 text-amber-500" />
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-2xl font-black tracking-tight text-amber-500 uppercase italic">Important Notice</h3>
                                <div className="space-y-4 text-sm text-zinc-400 leading-relaxed font-medium">
                                    <p>
                                        This entire application—from the Fastify backend to this very sentence—was <span className="text-white font-bold">100% authored by Artificial Intelligence</span> via the Google Deepmind team's Antigravity assistant.
                                    </p>
                                    <p className="p-4 bg-amber-950/20 border border-amber-900/50 rounded-xl text-amber-200/80">
                                        Because it is AI-generated, there may be edge cases or behaviors not expected in traditional software. Please use this tool at your own risk.
                                    </p>
                                    <ul className="space-y-2">
                                        <li className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                            Backup your config directory before use.
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                            Review Expert YAML output before publishing.
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 px-8 text-center text-zinc-600 text-[10px] font-black uppercase tracking-widest bg-zinc-950">
                © 2026 Kevin Justice • AI Generated Software • MIT License
            </footer>
        </div>
    );
};

export default LandingPage;
