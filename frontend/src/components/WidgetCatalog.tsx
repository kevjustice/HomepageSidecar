import React, { useState, useEffect } from 'react';
import { Search, X, Check, Info, Box, Wrench, RefreshCw, Loader2 } from 'lucide-react';
import { WIDGET_REGISTRY } from '../widgetRegistry';
import { fetchWidgetRegistry, refreshWidgets } from '../api';

interface WidgetCatalogProps {
    onSelect: (widget: any) => void;
    onClose: () => void;
    filter?: 'info' | 'service'; // Optional filter to show only specific types
}

const WidgetCatalog: React.FC<WidgetCatalogProps> = ({ onSelect, onClose, filter }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState<'all' | 'info' | 'service'>('all');
    const [remoteRegistry, setRemoteRegistry] = useState<any[]>([]);
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        loadRemoteRegistry();
    }, []);

    const loadRemoteRegistry = async () => {
        try {
            const data = await fetchWidgetRegistry();
            setRemoteRegistry(data);
        } catch (e) {
            console.error('Failed to load remote registry', e);
        }
    };

    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            await refreshWidgets();
            await loadRemoteRegistry();
        } catch (e) {
            alert('Failed to refresh widget templates.');
        } finally {
            setIsRefreshing(false);
        }
    };

    const combinedRegistry = [...WIDGET_REGISTRY];
    // Merge remote ones if they don't exist
    remoteRegistry.forEach(remote => {
        if (!combinedRegistry.some(local => local.type === remote.type)) {
            combinedRegistry.push(remote);
        }
    });

    // Sort alphabetically by name
    combinedRegistry.sort((a, b) => a.name.localeCompare(b.name));

    const filtered = combinedRegistry.filter(t => {
        const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = activeCategory === 'all' || t.category === activeCategory;
        const matchesFilter = !filter
            ? true
            : filter === 'service'
                ? t.category !== 'info'
                : t.category === filter;
        return matchesSearch && matchesCategory && matchesFilter;
    });

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-3xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
                <header className="p-8 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
                    <div>
                        <h3 className="text-2xl font-bold flex items-center gap-3">
                            <Box className="w-6 h-6 text-indigo-500" />
                            Widget Catalog
                        </h3>
                        <p className="text-zinc-500 text-xs mt-1">Select a pre-configured widget to add to your service.</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-xl transition-all">
                        <X className="w-6 h-6 text-zinc-500" />
                    </button>
                </header>

                <div className="px-8 py-6 border-b border-zinc-800 bg-zinc-950/30 space-y-4">
                    <div className="flex gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600" />
                            <input
                                type="text"
                                autoFocus
                                placeholder="Search widgets (e.g. plex, weather, cpu)..."
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all font-medium"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button
                            onClick={handleRefresh}
                            disabled={isRefreshing}
                            className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl text-zinc-400 hover:text-white hover:border-indigo-500/50 transition-all disabled:opacity-50"
                            title="Refresh Catalog from Docs"
                        >
                            {isRefreshing ? (
                                <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
                            ) : (
                                <RefreshCw className="w-5 h-5" />
                            )}
                        </button>
                    </div>

                    {!filter && (
                        <div className="flex gap-2 p-1 bg-zinc-900 border border-zinc-800 rounded-xl w-fit">
                            <CategoryTab label="All" active={activeCategory === 'all'} onClick={() => setActiveCategory('all')} />
                            <CategoryTab label="Info Widgets" active={activeCategory === 'info'} onClick={() => setActiveCategory('info')} icon={<Info className="w-3.5 h-3.5" />} />
                            <CategoryTab label="Service Widgets" active={activeCategory === 'service'} onClick={() => setActiveCategory('service')} icon={<Wrench className="w-3.5 h-3.5" />} />
                        </div>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filtered.map(template => (
                        <button
                            key={template.id}
                            onClick={() => onSelect({ type: template.type, config: template.defaultConfig })}
                            className="flex items-start gap-4 p-5 bg-zinc-950 border border-zinc-800 rounded-2xl hover:border-indigo-500/50 hover:bg-zinc-900/50 transition-all group text-left relative overflow-hidden min-h-[120px]"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform shadow-lg">
                                <img
                                    src={`https://api.iconify.design/${template.icon.replace('-', ':')}.svg?color=%236366f1`}
                                    className="w-8 h-8"
                                    alt=""
                                    onError={(e) => {
                                        (e.target as any).src = `https://api.iconify.design/mdi:cube-outline.svg?color=%236366f1`;
                                    }}
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-bold text-zinc-100 group-hover:text-white transition-colors">{template.name}</h4>
                                    <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded ${template.category === 'info' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-indigo-500/10 text-indigo-500'}`}>
                                        {template.category}
                                    </span>
                                </div>
                                <p className="text-[11px] text-zinc-500 line-clamp-2 leading-relaxed">{template.description}</p>
                            </div>
                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Check className="w-4 h-4 text-emerald-500" />
                            </div>
                        </button>
                    ))}

                    {filtered.length === 0 && (
                        <div className="col-span-full py-20 text-center space-y-4">
                            <div className="w-16 h-16 bg-zinc-900/50 rounded-full flex items-center justify-center mx-auto border border-zinc-800">
                                <Search className="w-6 h-6 text-zinc-700" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-zinc-400 font-bold">No widgets found</p>
                                <p className="text-zinc-600 text-xs">Try searching for something else or changing categories.</p>
                            </div>
                        </div>
                    )}
                </div>

                <footer className="p-6 border-t border-zinc-800 bg-zinc-900/50 flex items-center gap-3 text-[10px] text-zinc-500 font-medium">
                    <Info className="w-4 h-4 text-indigo-500" />
                    <span>Selected widgets will be added to the service with default configuration. You can edit the YAML manually after adding.</span>
                </footer>
            </div>
        </div>
    );
};

const CategoryTab = ({ label, active, onClick, icon }: { label: string, active: boolean, onClick: () => void, icon?: React.ReactNode }) => (
    <button
        onClick={onClick}
        className={`
            px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2
            ${active ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}
        `}
    >
        {icon}
        {label}
    </button>
);

export default WidgetCatalog;
