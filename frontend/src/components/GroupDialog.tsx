import React, { useState } from 'react';
import { X, Save, Folder, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { Group, Tab } from '../types';
import IconPicker from './IconPicker';

interface GroupDialogProps {
    group: Group | null;
    parentGroup?: Group;
    tabs?: Tab[];
    allGroups?: Group[];
    onClose: () => void;
    onSave: (group: Group) => void;
}

const GroupDialog: React.FC<GroupDialogProps> = ({ group, parentGroup, tabs, allGroups, onClose, onSave }) => {
    const [formData, setFormData] = useState<Partial<Group>>(group || {
        name: '',
        icon: '',
        parentGroupId: parentGroup?.id || null, // If adding a subgroup
        tabId: parentGroup ? parentGroup.tabId : 'AllTabs',
        order: 0,
        options: {
            columns: 3,
            header: true,
            initiallyCollapsed: false
        },
        childrenType: 'services',
        advancedExtra: {}
    });

    const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);
    const [showAdvanced, setShowAdvanced] = useState(false);

    // Filter available parents based on selected Tab
    const availableParents = allGroups
        ?.filter(g =>
            g.tabId === (formData.tabId || 'AllTabs') &&
            g.id !== group?.id &&
            g.parentGroupId !== group?.id // Simple 1-level cycle prevention
        ) || [];

    const handleSave = () => {
        if (!formData.name) {
            alert('Group Name is required.');
            return;
        }

        onSave({
            id: group?.id || crypto.randomUUID(),
            name: formData.name!,
            parentGroupId: formData.parentGroupId || null,
            tabId: formData.tabId || 'AllTabs',
            order: formData.order || 0,
            options: formData.options || {},
            childrenType: formData.childrenType || 'services',
            advancedExtra: formData.advancedExtra || {}
        } as Group);
    };

    const updateOption = (key: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            options: { ...prev.options, [key]: value }
        }));
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
                <header className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
                    <div>
                        <h3 className="text-xl font-bold flex items-center gap-2">
                            <Folder className="w-5 h-5 text-indigo-500" />
                            {group ? 'Edit Group' : 'New Group'}
                        </h3>
                        {parentGroup && <p className="text-xs text-zinc-500 mt-0.5">Adding subgroup to: {parentGroup.name}</p>}
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-xl transition-all">
                        <X className="w-5 h-5 text-zinc-500" />
                    </button>
                </header>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Group Name *</label>
                        <input
                            type="text"
                            className="w-full bg-zinc-950 border border-zinc-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all font-medium"
                            placeholder="e.g. Media Servers"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            autoFocus
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Icon</label>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <input
                                    type="text"
                                    className="w-full bg-zinc-950 border border-zinc-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all font-mono"
                                    placeholder="mdi-folder-outline"
                                    value={formData.icon || ''}
                                    onChange={e => setFormData({ ...formData, icon: e.target.value })}
                                />
                                {formData.icon && (
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center">
                                        <img src={`https://api.iconify.design/${formData.icon.replace('-', ':')}.svg?color=%236366f1`} className="w-5 h-5" alt="" />
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={() => setIsIconPickerOpen(true)}
                                className="p-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-xl text-zinc-400 hover:text-white transition-all shadow-md"
                            >
                                <Search className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Tab</label>
                            <select
                                className="w-full bg-zinc-950 border border-zinc-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all appearance-none"
                                value={formData.tabId || 'AllTabs'}
                                onChange={e => setFormData({
                                    ...formData,
                                    tabId: e.target.value,
                                    parentGroupId: null // Reset parent if tab changes
                                })}
                                disabled={!!parentGroup && !group}
                            >
                                {tabs?.map(tab => (
                                    <option key={tab.id} value={tab.id}>{tab.name}</option>
                                )) || <option value="AllTabs">Dashboard</option>}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Parent Group</label>
                            <select
                                className="w-full bg-zinc-950 border border-zinc-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all appearance-none"
                                value={formData.parentGroupId || ''}
                                onChange={e => setFormData({ ...formData, parentGroupId: e.target.value || null })}
                            >
                                <option value="">(None - Root Level)</option>
                                {availableParents.map(g => (
                                    <option key={g.id} value={g.id}>{g.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2 col-span-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Columns</label>
                            <input
                                type="number"
                                min={1}
                                max={6}
                                className="w-full bg-zinc-950 border border-zinc-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all"
                                value={formData.options?.columns || 3}
                                onChange={e => updateOption('columns', parseInt(e.target.value))}
                            />
                        </div>
                    </div>

                    <div className="space-y-2 mt-4">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Initial State</label>
                        <select
                            className="w-full bg-zinc-950 border border-zinc-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all appearance-none"
                            value={formData.options?.initiallyCollapsed ? 'collapsed' : 'expanded'}
                            onChange={e => updateOption('initiallyCollapsed', e.target.value === 'collapsed')}
                        >
                            <option value="expanded">Expanded</option>
                            <option value="collapsed">Collapsed</option>
                        </select>
                    </div>

                    <div className="pt-2">
                        <button
                            onClick={() => setShowAdvanced(!showAdvanced)}
                            className="flex items-center gap-2 text-zinc-500 hover:text-zinc-300 text-xs font-bold transition-all"
                        >
                            {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            {showAdvanced ? 'Hide Advanced Options' : 'Show Advanced Options'}
                        </button>

                        {showAdvanced && (
                            <div className="mt-4 p-4 bg-zinc-950/50 border border-zinc-900 rounded-xl space-y-4 animate-in fade-in slide-in-from-top-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-zinc-400">Show Header</span>
                                    <div
                                        className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${formData.options?.header !== false ? 'bg-indigo-600' : 'bg-zinc-700'}`}
                                        onClick={() => updateOption('header', formData.options?.header === false)}
                                    >
                                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${formData.options?.header !== false ? 'left-6' : 'left-1'}`} />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                </div>

                <footer className="p-6 border-t border-zinc-800 flex justify-end gap-3 bg-zinc-900/50">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-xl font-bold text-sm bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-6 py-2.5 rounded-xl font-bold text-sm bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 flex items-center gap-2 active:scale-95 transition-all"
                    >
                        <Save className="w-4 h-4" />
                        Save Group
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
        </div>
    );
};

export default GroupDialog;
