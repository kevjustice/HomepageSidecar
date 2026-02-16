import React, { useState, useEffect } from 'react';
import { X, Save, Box, Plus, Activity } from 'lucide-react';
import { WIDGET_REGISTRY } from '../widgetRegistry';
import WidgetCatalog from './WidgetCatalog';
import HelpInfo from './HelpInfo';
import MonacoEditor from './MonacoEditor';
import { fetchFiles, publishFiles } from '../api';
import yaml from 'js-yaml';

interface InfoWidgetsPanelProps {
    onClose?: () => void;
    inline?: boolean;
}

const InfoWidgetsPanel: React.FC<InfoWidgetsPanelProps> = ({ onClose, inline = false }) => {
    const [widgetsYaml, setWidgetsYaml] = useState<any[]>([]);
    const [rawYaml, setRawYaml] = useState('');
    const [isCatalogOpen, setIsCatalogOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadWidgets();
    }, []);

    const loadWidgets = async () => {
        try {
            const files = await fetchFiles();
            const content = files.find((f: any) => f.filename === 'widgets.yaml')?.content || '';
            setRawYaml(content);
            try {
                const parsed = yaml.load(content);
                if (Array.isArray(parsed)) {
                    setWidgetsYaml(parsed);
                } else if (parsed) {
                    setWidgetsYaml([parsed]);
                } else {
                    setWidgetsYaml([]);
                }
            } catch (e) {
                console.error("Failed to parse widgets.yaml", e);
            }
        } catch (e) {
            console.error("Failed to fetch widgets.yaml", e);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            await publishFiles([{ filename: 'widgets.yaml', content: rawYaml }]);
            if (onClose) onClose();
        } catch (e) {
            alert('Failed to save widgets.yaml');
        }
    };

    const handleAddWidget = ({ config }: { config: any }) => {
        const updated = [...widgetsYaml, config];
        const newYaml = yaml.dump(updated);
        setRawYaml(newYaml);
        setWidgetsYaml(updated);
        setIsCatalogOpen(false);
    };

    const panelContent = (
        <div className={`bg-zinc-900 border border-zinc-800 rounded-3xl w-full ${inline ? 'h-full flex-1' : 'max-w-4xl max-h-[90vh] shadow-2xl'} flex flex-col overflow-hidden`}>
            <header className="p-8 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
                <div>
                    <h3 className="text-2xl font-bold flex items-center gap-3">
                        <Activity className="w-6 h-6 text-indigo-500" />
                        Widgets Editor
                    </h3>
                    <p className="text-zinc-500 text-xs mt-1">Manage global widgets like Search, Weather, and System Resources.</p>
                </div>
                <div className="flex items-center gap-4">
                    <HelpInfo
                        title="Widgets Editor Guide"
                        description="Manage global widgets like Search, Weather, and System Resources."
                        steps={[
                            "Click 'Add Widget' to browse the catalog and insert a new template.",
                            "Modify the raw YAML directly in the editor to fine-tune settings.",
                            "Refer to the 'Active Widgets' list on the right for an overview.",
                            "Click 'Save Configuration' to persist changes to widgets.yaml."
                        ]}
                        tips={[
                            "Each widget type has specific configuration options (API keys, themes).",
                            "The catalog provides sensible defaults for each widget type."
                        ]}
                    />
                    {onClose && (
                        <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-xl transition-all">
                            <X className="w-6 h-6 text-zinc-500" />
                        </button>
                    )}
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-8 flex flex-col lg:flex-row gap-8">
                <div className="flex-1 flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">widgets.yaml</label>
                        <button
                            onClick={() => setIsCatalogOpen(true)}
                            className="px-3 py-1.5 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 rounded-xl text-[10px] font-bold flex items-center gap-2 border border-indigo-500/20 transition-all uppercase tracking-widest"
                        >
                            <Plus className="w-3.5 h-3.5" /> Add Widget
                        </button>
                    </div>
                    <div className="flex-1 min-h-[400px] border border-zinc-800 rounded-2xl overflow-hidden bg-zinc-950">
                        <MonacoEditor
                            filename="widgets.yaml"
                            content={rawYaml}
                            onChange={(val) => {
                                setRawYaml(val || '');
                                try {
                                    const parsed = yaml.load(val || '');
                                    if (Array.isArray(parsed)) setWidgetsYaml(parsed);
                                } catch (e) { }
                            }}
                        />
                    </div>
                </div>

                <div className="lg:w-1/3 xl:w-1/4 space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-500">Active Widgets</h4>
                    <div className="space-y-3">
                        {widgetsYaml.map((w, idx) => {
                            const type = Object.keys(w)[0];
                            const template = WIDGET_REGISTRY.find(t => t.type === type);
                            return (
                                <div key={idx} className="bg-zinc-800/30 border border-zinc-800 p-3 rounded-xl flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center">
                                        {template ? (
                                            <img src={`https://api.iconify.design/${template.icon.replace(':', '-')}.svg?color=white`} className="w-4 h-4" alt="" />
                                        ) : (
                                            <Box className="w-4 h-4 text-zinc-500" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-bold text-zinc-300 text-sm capitalize">{template?.name || type}</p>
                                        <p className="text-[10px] text-zinc-600 font-mono">Index {idx}</p>
                                    </div>
                                </div>
                            );
                        })}
                        {!loading && widgetsYaml.length === 0 && (
                            <p className="text-zinc-600 text-xs italic">No widgets configured.</p>
                        )}
                    </div>
                </div>
            </div>

            <footer className="p-8 border-t border-zinc-800 flex justify-end gap-3 bg-zinc-900/50">
                {onClose && (
                    <button
                        onClick={onClose}
                        className="px-8 py-3 rounded-2xl font-bold text-sm bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-all active:scale-95"
                    >
                        Cancel
                    </button>
                )}
                <button
                    onClick={handleSave}
                    className="px-8 py-3 rounded-2xl font-bold text-sm bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl shadow-indigo-600/30 flex items-center gap-2 active:scale-95 transition-all"
                >
                    <Save className="w-4 h-4" />
                    Save Configuration
                </button>
            </footer>

            {isCatalogOpen && (
                <WidgetCatalog
                    filter="info"
                    onSelect={handleAddWidget}
                    onClose={() => setIsCatalogOpen(false)}
                />
            )}
        </div>
    );

    if (inline) {
        return panelContent;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
            {panelContent}
        </div>
    );
};

export default InfoWidgetsPanel;
