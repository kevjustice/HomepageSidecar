import React, { useState } from 'react';
import { X, Save, Box, Search, Plus, Trash2, Settings, Activity, ChevronDown, ChevronUp } from 'lucide-react';
import { Service, Group, ServiceWidget } from '../types';
import IconPicker from './IconPicker';
import WidgetCatalog from './WidgetCatalog';
import MonacoEditor from './MonacoEditor';
import yaml from 'js-yaml';

interface ServiceDialogProps {
    service: Service | null;
    groups: Group[];
    onClose: () => void;
    onSave: (service: Service) => void;
}

const ServiceDialog: React.FC<ServiceDialogProps> = ({ service, groups, onClose, onSave }) => {
    const [formData, setFormData] = useState<Partial<Service>>(service || {
        title: '',
        href: '',
        icon: '',
        description: '',
        groupId: groups[0]?.id || '',
        order: 0,
        widgets: [],
        advancedExtra: {}
    });

    const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);
    const [isWidgetCatalogOpen, setIsWidgetCatalogOpen] = useState(false);
    const [showAdvanced, setShowAdvanced] = useState(false);

    const handleSave = () => {
        if (!formData.title || !formData.href || !formData.groupId) {
            alert('Title, URL, and Group are required.');
            return;
        }

        onSave({
            id: service?.id || crypto.randomUUID(),
            title: formData.title!,
            href: formData.href!,
            icon: formData.icon,
            description: formData.description,
            groupId: formData.groupId!,
            order: formData.order || 0,
            widgets: formData.widgets || [],
            docker: formData.docker,
            container: formData.container,
            server: formData.server,
            ping: formData.ping,
            siteMonitor: formData.siteMonitor,
            target: formData.target,
            namespace: formData.namespace,
            pod: formData.pod,
            port: formData.port,
            advancedExtra: formData.advancedExtra || {}
        } as Service);
    };

    const handleAddWidget = ({ type, config }: { type: string, config: any }) => {
        const newWidget: ServiceWidget = {
            type: type,
            configText: yaml.dump(config)
        };
        setFormData({
            ...formData,
            widgets: [...(formData.widgets || []), newWidget]
        });
        setIsWidgetCatalogOpen(false);
    };

    const handleRemoveWidget = (idx: number) => {
        const updated = [...(formData.widgets || [])];
        updated.splice(idx, 1);
        setFormData({ ...formData, widgets: updated });
    };

    const updateWidgetConfig = (idx: number, newConfig: string) => {
        const updated = [...(formData.widgets || [])];
        updated[idx] = { ...updated[idx], configText: newConfig };
        setFormData({ ...formData, widgets: updated });
    };

    const fillFromUrl = (field: 'ping' | 'siteMonitor') => {
        if (!formData.href) return;
        try {
            const url = new URL(formData.href);
            if (field === 'ping') {
                setFormData({ ...formData, ping: url.hostname });
            } else if (field === 'siteMonitor') {
                setFormData({ ...formData, siteMonitor: formData.href });
            }
        } catch (e) {
            // Invalid URL
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[95vh] overflow-hidden">
                <header className="p-8 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
                    <div>
                        <h3 className="text-2xl font-bold flex items-center gap-3">
                            <Box className="w-6 h-6 text-indigo-500" />
                            {service ? 'Modify Service' : 'Add Service'}
                        </h3>
                        <p className="text-zinc-500 text-xs mt-1">Configure your dashboard item properties and integrations.</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-xl transition-all">
                        <X className="w-6 h-6 text-zinc-500" />
                    </button>
                </header>

                <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
                    {/* Basic Configuration */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 text-zinc-400 font-bold text-xs uppercase tracking-widest mb-2">
                            <Settings className="w-4 h-4" /> Basic Details
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Field label="Service Name *" value={formData.title} onChange={v => setFormData({ ...formData, title: v })} placeholder="e.g. Plex" />
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Group *</label>
                                <select
                                    className="w-full bg-zinc-950 border border-zinc-900 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all appearance-none cursor-pointer"
                                    value={formData.groupId}
                                    onChange={e => setFormData({ ...formData, groupId: e.target.value })}
                                >
                                    {groups.map(g => (
                                        <option key={g.id} value={g.id}>{g.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <Field label="Target URL / Href *" value={formData.href} onChange={v => setFormData({ ...formData, href: v })} placeholder="https://..." />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Icon</label>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <input
                                            type="text"
                                            className="w-full bg-zinc-950 border border-zinc-900 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all font-mono"
                                            placeholder="e.g. plex, mdi-plex, or full URL"
                                            value={formData.icon || ''}
                                            onChange={e => setFormData({ ...formData, icon: e.target.value })}
                                        />
                                        {formData.icon && (
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center">
                                                <img
                                                    src={formData.icon.startsWith('http') ? formData.icon : `https://api.iconify.design/${formData.icon.replace('mdi-', 'mdi:').replace('si-', 'simple-icons:').replace('-', ':')}.svg?color=%236366f1`}
                                                    className="w-5 h-5 object-contain"
                                                    alt=""
                                                    onError={(e) => (e.target as any).style.display = 'none'}
                                                />
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => setIsIconPickerOpen(true)}
                                        className="p-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-2xl text-zinc-400 hover:text-white transition-all shadow-md"
                                        title="Open Icon Picker"
                                    >
                                        <Search className="w-5 h-5" />
                                    </button>
                                </div>
                                <p className="text-[10px] text-zinc-600">
                                    Supports <strong>MDI</strong>, <strong>Simple Icons</strong>, <strong>SelfH.st</strong> or direct URLs.
                                </p>
                            </div>
                            <Field label="Description" value={formData.description} onChange={v => setFormData({ ...formData, description: v })} placeholder="Media Server" />
                        </div>
                    </div>

                    {/* Infrastructure & Status */}
                    <div className="space-y-6 pt-6 border-t border-zinc-800/50">
                        <div className="flex items-center gap-2 text-zinc-400 font-bold text-xs uppercase tracking-widest mb-2">
                            <Activity className="w-4 h-4 text-emerald-500" /> Infrastructure & Monitoring
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="relative">
                                <Field label="Ping Address" value={formData.ping} onChange={v => setFormData({ ...formData, ping: v })} placeholder="10.0.0.5" />
                                {formData.href && (
                                    <button onClick={() => fillFromUrl('ping')} className="absolute right-0 top-0 text-[10px] text-indigo-500 hover:text-indigo-400 font-bold uppercase p-0.5">Fill from URL</button>
                                )}
                            </div>
                            <div className="relative">
                                <Field label="Site Monitor URL" value={formData.siteMonitor} onChange={v => setFormData({ ...formData, siteMonitor: v })} placeholder="https://plex.example.com/health" />
                                {formData.href && (
                                    <button onClick={() => fillFromUrl('siteMonitor')} className="absolute right-0 top-0 text-[10px] text-indigo-500 hover:text-indigo-400 font-bold uppercase p-0.5">Fill from URL</button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Widgets Section */}
                    <div className="space-y-6 pt-6 border-t border-zinc-800/50">
                        <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center gap-2 text-zinc-400 font-bold text-xs uppercase tracking-widest">
                                <Box className="w-4 h-4 text-indigo-400" /> Service Widgets
                            </div>
                            <button
                                onClick={() => setIsWidgetCatalogOpen(true)}
                                className="px-3 py-1.5 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 rounded-xl text-[10px] font-bold flex items-center gap-2 border border-indigo-500/20 transition-all uppercase tracking-widest"
                            >
                                <Plus className="w-3.5 h-3.5" /> Select Template
                            </button>
                        </div>

                        <div className="space-y-4">
                            {formData.widgets?.map((w, idx) => (
                                <div key={idx} className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden">
                                    <div className="px-5 py-3 border-b border-zinc-900 flex justify-between items-center bg-zinc-900/10">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                                            <span className="text-xs font-bold font-mono uppercase text-zinc-300">{w.type} integration</span>
                                        </div>
                                        <button onClick={() => handleRemoveWidget(idx)} className="p-1.5 hover:bg-red-500/10 text-zinc-600 hover:text-red-400 rounded-lg transition-all">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="h-40 bg-zinc-950">
                                        <MonacoEditor
                                            filename={`widget-${idx}.yaml`}
                                            content={w.configText}
                                            onChange={(v) => updateWidgetConfig(idx, v || '')}
                                        />
                                    </div>
                                </div>
                            ))}
                            {(!formData.widgets || formData.widgets.length === 0) && (
                                <div className="py-12 border-2 border-dashed border-zinc-800/50 rounded-2xl text-center">
                                    <p className="text-zinc-600 text-xs italic">No widgets configured. Use the catalog to add a pre-built integration.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Advanced Fields Toggle */}
                    <div className="pt-4">
                        <button
                            onClick={() => setShowAdvanced(!showAdvanced)}
                            className="flex items-center gap-2 text-zinc-500 hover:text-zinc-300 text-xs font-bold transition-all"
                        >
                            {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            {showAdvanced ? 'Hide Advanced Options (Docker, K8s, Targets)' : 'Show Advanced Options (Docker, K8s, Targets)'}
                        </button>

                        {showAdvanced && (
                            <div className="mt-6 p-6 bg-zinc-950/50 border border-zinc-900 rounded-2xl grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-4 duration-300">
                                <Field label="Container Name (Docker)" value={formData.container} onChange={v => setFormData({ ...formData, container: v })} placeholder="e.g. plex-container" />
                                <Field label="Server ID (Docker/Proxmox)" value={formData.server} onChange={v => setFormData({ ...formData, server: v })} placeholder="e.g. s01" />
                                <Field label="K8s Namespace" value={formData.namespace} onChange={v => setFormData({ ...formData, namespace: v })} />
                                <Field label="K8s Pod Name" value={formData.pod} onChange={v => setFormData({ ...formData, pod: v })} />
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Link Target</label>
                                    <select
                                        className="w-full bg-zinc-950 border border-zinc-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all appearance-none cursor-pointer"
                                        value={formData.target || '_blank'}
                                        onChange={e => setFormData({ ...formData, target: e.target.value as any })}
                                    >
                                        <option value="_blank">New Tab (_blank)</option>
                                        <option value="_self">Same Tab (_self)</option>
                                        <option value="_top">Top Window (_top)</option>
                                    </select>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <footer className="p-8 border-t border-zinc-800 flex justify-end gap-3 bg-zinc-900/50">
                    <button
                        onClick={onClose}
                        className="px-8 py-3 rounded-2xl font-bold text-sm bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-all active:scale-95"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-8 py-3 rounded-2xl font-bold text-sm bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl shadow-indigo-600/30 flex items-center gap-2 active:scale-95 transition-all"
                    >
                        <Save className="w-4 h-4" />
                        Commit Changes
                    </button>
                </footer>
            </div>

            {isIconPickerOpen && (
                <IconPicker
                    currentIcon={formData.icon}
                    onSelect={(icon) => {
                        setFormData({ ...formData, icon });
                        setIsIconPickerOpen(false);
                    }}
                    onClose={() => setIsIconPickerOpen(false)}
                />
            )}

            {isWidgetCatalogOpen && (
                <WidgetCatalog
                    filter="service"
                    onSelect={handleAddWidget}
                    onClose={() => setIsWidgetCatalogOpen(false)}
                />
            )}
        </div>
    );
};

/* Internal Helper */
const Field = ({ label, value, onChange, placeholder = "" }: { label: string, value: any, onChange: (v: string) => void, placeholder?: string }) => (
    <div className="space-y-2">
        <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{label}</label>
        <input
            type="text"
            className="w-full bg-zinc-950 border border-zinc-900 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all font-medium placeholder:text-zinc-800"
            value={value || ''}
            placeholder={placeholder}
            onChange={e => onChange(e.target.value)}
        />
    </div>
);

export default ServiceDialog;
