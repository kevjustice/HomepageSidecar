import React, { useState, useEffect } from 'react';
import { Save, Palette, Globe, Layout as LayoutIcon, Image as ImageIcon, Monitor, Smartphone } from 'lucide-react';
import { fetchFiles, publishFiles } from '../api';
import MonacoEditor from '../components/MonacoEditor';
import HelpInfo from '../components/HelpInfo';
import yaml from 'js-yaml';

const SettingsPage: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [settings, setSettings] = useState<any>({});
    const [currentYaml, setCurrentYaml] = useState('');
    const [viewMode, setViewMode] = useState<'visual' | 'expert'>('visual');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        async function loadSettings() {
            try {
                const files = await fetchFiles();
                const settingsFile = files.find((f: any) => f.filename === 'settings.yaml');
                if (settingsFile) {
                    setCurrentYaml(settingsFile.content);
                    setSettings(yaml.load(settingsFile.content) || {});
                }
            } catch (err) {
                console.error('Failed to load settings', err);
            } finally {
                setLoading(false);
            }
        }
        loadSettings();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            const content = viewMode === 'visual' ? yaml.dump(settings) : currentYaml;
            await publishFiles([{ filename: 'settings.yaml', content }]);
            setCurrentYaml(content);
            alert('Settings saved successfully!');
        } catch (err) {
            alert('Failed to save settings.');
        } finally {
            setSaving(false);
        }
    };

    const updateSetting = (key: string, value: any) => {
        setSettings((prev: any) => ({ ...prev, [key]: value }));
    };

    const updateNestedSetting = (parent: string, key: string, value: any) => {
        setSettings((prev: any) => ({
            ...prev,
            [parent]: { ...prev[parent], [key]: value }
        }));
    };

    if (loading) return <div className="p-8 text-zinc-500">Loading settings...</div>;

    return (
        <div className="flex flex-col h-full bg-zinc-950">
            <header className="p-8 border-b border-zinc-900 bg-zinc-950/50 flex justify-between items-end backdrop-blur-sm z-10 sticky top-0">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Dashboard Settings</h2>
                    <p className="text-zinc-500 mt-1">Configure global appearance, layout, and system behavior.</p>
                </div>
                <div className="flex items-center gap-4">
                    <HelpInfo
                        title="Dashboard Settings Guide"
                        description="Configure global appearance, layout, and system behavior for your dashboard."
                        steps={[
                            "Use the Visual tab for a structured configuration experience.",
                            "Toggle layout options like 'Five Columns' or 'Full Width'.",
                            "Configure PWA and General info like Dashboard Title.",
                            "Use Expert mode for direct YAML editing of settings.yaml."
                        ]}
                        tips={[
                            "Don't forget to click 'Save Settings' to apply your changes.",
                            "Some settings require a dashboard reload to take effect."
                        ]}
                    />
                    <div className="flex bg-zinc-900 border border-zinc-800 rounded-xl p-1">
                        <button
                            onClick={() => setViewMode('visual')}
                            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${viewMode === 'visual' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                        >
                            Visual
                        </button>
                        <button
                            onClick={() => setViewMode('expert')}
                            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${viewMode === 'expert' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                        >
                            Expert (YAML)
                        </button>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center shadow-lg shadow-indigo-600/20 active:scale-95 disabled:opacity-50"
                    >
                        <Save className="w-4 h-4 mr-2" />
                        {saving ? 'Saving...' : 'Save Settings'}
                    </button>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-8">
                <div className="max-w-5xl mx-auto">
                    {viewMode === 'visual' ? (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-20">
                            {/* Left Column: Navigation/Toggles */}
                            <div className="lg:col-span-4 space-y-6">
                                <section className="bg-zinc-900/30 border border-zinc-900 rounded-2xl p-6 space-y-4">
                                    <div className="flex items-center gap-3 mb-2">
                                        <LayoutIcon className="w-5 h-5 text-indigo-400" />
                                        <h3 className="font-bold">Layout Controls</h3>
                                    </div>
                                    <Toggle label="Five Columns" value={settings.fiveColumns} onChange={v => updateSetting('fiveColumns', v)} />
                                    <Toggle label="Full Width" value={settings.fullWidth} onChange={v => updateSetting('fullWidth', v)} />
                                    <Toggle label="Equal Height Cards" value={settings.useEqualHeights} onChange={v => updateSetting('useEqualHeights', v)} />
                                    <Toggle label="Show Stats" value={settings.showStats} onChange={v => updateSetting('showStats', v)} />
                                    <Toggle label="Disable Indexing" value={settings.disableSearchEngineIndexing} onChange={v => updateSetting('disableSearchEngineIndexing', v)} />
                                </section>

                                <section className="bg-zinc-900/30 border border-zinc-900 rounded-2xl p-6 space-y-4">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Monitor className="w-5 h-5 text-emerald-400" />
                                        <h3 className="font-bold">Display Style</h3>
                                    </div>
                                    <Select
                                        label="Header Style"
                                        options={['default', 'boxed', 'clean']}
                                        value={settings.headerStyle || 'default'}
                                        onChange={v => updateSetting('headerStyle', v)}
                                    />
                                    <Select
                                        label="Status Style"
                                        options={['dot', 'pulse', 'none']}
                                        value={settings.statusStyle || 'dot'}
                                        onChange={v => updateSetting('statusStyle', v)}
                                    />
                                </section>

                                <section className="bg-zinc-900/30 border border-zinc-900 rounded-2xl p-6 space-y-4">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Smartphone className="w-5 h-5 text-amber-400" />
                                        <h3 className="font-bold">PWA Settings</h3>
                                    </div>
                                    <Input label="Start URL" value={settings.startUrl || '/'} onChange={v => updateSetting('startUrl', v)} />
                                    <Input label="Favicon URL" value={settings.favicon} onChange={v => updateSetting('favicon', v)} />
                                </section>
                            </div>

                            {/* Right Column: Detailed Config */}
                            <div className="lg:col-span-8 space-y-8">
                                <section className="bg-zinc-900/30 border border-zinc-900 rounded-2xl overflow-hidden">
                                    <div className="p-6 border-b border-zinc-900 flex items-center gap-3 bg-zinc-900/50">
                                        <Globe className="w-5 h-5 text-zinc-400" />
                                        <h3 className="font-bold">General Information</h3>
                                    </div>
                                    <div className="p-6 grid grid-cols-2 gap-6">
                                        <Input label="Dashboard Title" value={settings.title} onChange={v => updateSetting('title', v)} />
                                        <Input label="Instance Name" value={settings.instanceName} onChange={v => updateSetting('instanceName', v)} />
                                        <div className="col-span-2">
                                            <Input label="Base URL" value={settings.baseUrl} onChange={v => updateSetting('baseUrl', v)} />
                                        </div>
                                    </div>
                                </section>

                                <section className="bg-zinc-900/30 border border-zinc-900 rounded-2xl overflow-hidden">
                                    <div className="p-6 border-b border-zinc-900 flex items-center gap-3 bg-zinc-900/50">
                                        <ImageIcon className="w-5 h-5 text-indigo-400" />
                                        <h3 className="font-bold">Background Effects</h3>
                                    </div>
                                    <div className="p-6 space-y-6">
                                        <Input label="Background Image URL" value={settings.background?.image} onChange={v => updateNestedSetting('background', 'image', v)} placeholder="https://..." />
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-4">
                                                <Slider label="Blur Level" value={settings.background?.blur || 0} min={0} max={20} step={1} onChange={v => updateNestedSetting('background', 'blur', v)} />
                                                <Slider label="Brightness" value={settings.background?.brightness || 100} min={0} max={200} step={1} onChange={v => updateNestedSetting('background', 'brightness', v)} />
                                            </div>
                                            <div className="space-y-4">
                                                <Slider label="Saturation" value={settings.background?.saturate || 100} min={0} max={200} step={1} onChange={v => updateNestedSetting('background', 'saturate', v)} />
                                                <Slider label="Opacity" value={settings.background?.opacity || 100} min={0} max={100} step={1} onChange={v => updateNestedSetting('background', 'opacity', v)} />
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                <section className="bg-zinc-900/30 border border-zinc-900 rounded-2xl overflow-hidden">
                                    <div className="p-6 border-b border-zinc-900 flex items-center gap-3 bg-zinc-900/50">
                                        <Palette className="w-5 h-5 text-zinc-400" />
                                        <h3 className="font-bold">Theme & Localization</h3>
                                    </div>
                                    <div className="p-6 grid grid-cols-2 gap-6">
                                        <Select label="Theme" options={['dark', 'light', 'corporate', 'retro']} value={settings.theme || 'dark'} onChange={v => updateSetting('theme', v)} />
                                        <Input label="Language" value={settings.language || 'en'} onChange={v => updateSetting('language', v)} />
                                    </div>
                                </section>
                            </div>
                        </div>
                    ) : (
                        <div className="h-[700px] border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
                            <MonacoEditor
                                filename="settings.yaml"
                                content={currentYaml}
                                onChange={(val) => setCurrentYaml(val || '')}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

/* Component Helpers */

const Input = ({ label, value, onChange, placeholder = "" }: { label: string, value: any, onChange: (v: string) => void, placeholder?: string }) => (
    <div className="space-y-2">
        <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{label}</label>
        <input
            type="text"
            className="w-full bg-zinc-950 border border-zinc-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all font-medium placeholder:text-zinc-800"
            value={value || ''}
            placeholder={placeholder}
            onChange={e => onChange(e.target.value)}
        />
    </div>
);

const Select = ({ label, options, value, onChange }: { label: string, options: string[], value: string, onChange: (v: string) => void }) => (
    <div className="space-y-2">
        <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{label}</label>
        <select
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all appearance-none cursor-pointer"
            value={value}
            onChange={e => onChange(e.target.value)}
        >
            {options.map(opt => <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>)}
        </select>
    </div>
);

const Toggle = ({ label, value, onChange }: { label: string, value: boolean, onChange: (v: boolean) => void }) => (
    <div className="flex items-center justify-between group cursor-pointer" onClick={() => onChange(!value)}>
        <span className="text-sm text-zinc-400 group-hover:text-zinc-200 transition-colors font-medium">{label}</span>
        <div className={`w-10 h-5 rounded-full transition-all relative ${value ? 'bg-indigo-600' : 'bg-zinc-800'}`}>
            <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${value ? 'left-6' : 'left-1'}`} />
        </div>
    </div>
);

const Slider = ({ label, value, min, max, step, onChange }: { label: string, value: number, min: number, max: number, step: number, onChange: (v: number) => void }) => (
    <div className="space-y-3">
        <div className="flex justify-between items-center">
            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{label}</label>
            <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">{value}</span>
        </div>
        <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={e => onChange(Number(e.target.value))}
            className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
        />
    </div>
);

export default SettingsPage;
