import { NavLink, Link } from 'react-router-dom';
import {
    Settings,
    Layout,
    Box,
    Database,
    Cpu,
    Palette,
    Code2,
    Send,
    AlertCircle,
    Zap,
    Github
} from 'lucide-react';

interface NavigationProps {
    isDirty: boolean;
    hasErrors: boolean;
    homepageUrl: string;
}

const Navigation: React.FC<NavigationProps> = ({ isDirty, hasErrors, homepageUrl }) => {
    const version = "1.0.5"; // Manually incremented for now

    const navItems = [
        { name: 'Services & Bookmarks', path: '/services', icon: Layout },
        { name: 'Info Widgets', path: '/widgets', icon: Box },
        { name: 'Kubernetes', path: '/kubernetes', icon: Database },
        { name: 'Docker', path: '/docker', icon: Cpu },
        { name: 'Proxmox', path: '/proxmox', icon: Cpu },
        { name: 'Settings', path: '/settings', icon: Settings },
        { name: 'Custom CSS', path: '/css', icon: Palette },
        { name: 'Custom JS', path: '/js', icon: Code2 },
        { name: 'Publish', path: '/publish', icon: Send, disabled: !isDirty },
    ];

    return (
        <nav className="w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col h-screen">
            <div className="p-6 border-b border-zinc-800 flex items-center justify-between group">
                <Link to="/services" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-600/20">
                        <Zap className="w-5 h-5 text-white fill-white/20" />
                    </div>
                    <h1 className="text-lg font-bold text-zinc-100 tracking-tight">Homepage Helper</h1>
                </Link>
                {isDirty && (
                    <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" title="Unpublished changes"></div>
                )}
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-1">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => `
              flex items-center px-6 py-3 text-sm font-medium transition-colors
              ${isActive
                                ? 'bg-zinc-800 text-white border-r-2 border-indigo-500'
                                : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50'}
              ${item.disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}
            `}
                    >
                        <item.icon className="w-5 h-5 mr-3" />
                        {item.name}
                    </NavLink>
                ))}
            </div>

            <div className="p-6 border-t border-zinc-800 space-y-4">
                {hasErrors && (
                    <div className="bg-red-950/30 border border-red-900/50 rounded-lg p-3 flex items-center text-[10px] text-red-200 uppercase tracking-widest font-black">
                        <AlertCircle className="w-3.5 h-3.5 mr-2 flex-shrink-0 text-red-500" />
                        <span>Validation Errors</span>
                    </div>
                )}

                <div className="space-y-4">
                    <a
                        href={homepageUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-center w-full py-2.5 rounded-xl bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 text-xs font-black uppercase tracking-widest transition-all group/launch"
                    >
                        Launch Dashboard
                        <Zap className="w-3 h-3 ml-2 group-hover/launch:scale-110 transition-transform fill-current" />
                    </a>
                </div>

                <div className="space-y-1.5 pt-2">
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">Version</div>
                    <div className="text-xs font-mono text-zinc-400">v{version}</div>
                </div>

                <div className="pt-2">
                    <a
                        href="https://github.com/kevjustice"
                        target="_blank"
                        rel="noreferrer"
                        className="group/footer flex items-center justify-between text-[10px] text-zinc-500 hover:text-white transition-colors"
                    >
                        <div className="flex flex-col">
                            <span className="font-bold uppercase tracking-wider">© 2026 Kevin Justice</span>
                            <span className="text-[9px] text-zinc-700 group-hover/footer:text-indigo-400 transition-colors">github.com/kevjustice</span>
                        </div>
                        <Github className="w-4 h-4 opacity-20 group-hover/footer:opacity-100 transition-opacity" />
                    </a>
                </div>
            </div>
        </nav>
    );
};

export default Navigation;
