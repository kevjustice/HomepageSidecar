import React, { useState } from 'react';
import { X, Save, Layout } from 'lucide-react';
import { Tab } from '../types';

interface TabDialogProps {
    tab: Tab | null;
    onClose: () => void;
    onSave: (tab: Tab) => void;
}

const TabDialog: React.FC<TabDialogProps> = ({ tab, onClose, onSave }) => {
    const [name, setName] = useState(tab?.name || '');

    const handleSave = () => {
        if (!name) {
            alert('Name is required.');
            return;
        }

        onSave({
            id: tab?.id || crypto.randomUUID(),
            name,
            order: tab?.order || 0,
            isAllTabs: tab?.isAllTabs || false
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md shadow-2xl flex flex-col">
                <header className="p-6 border-b border-zinc-800 flex justify-between items-center">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <Layout className="w-5 h-5 text-indigo-400" />
                        {tab ? 'Edit Tab' : 'Add New Tab'}
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-lg transition-all">
                        <X className="w-5 h-5 text-zinc-500" />
                    </button>
                </header>

                <div className="p-8 space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Tab Name <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium"
                            placeholder="e.g. Media"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            autoFocus
                        />
                    </div>

                    {tab?.id === 'AllTabs' && (
                        <p className="text-xs text-amber-500 bg-amber-950/20 border border-amber-900/30 p-3 rounded-lg">
                            This is a system tab and cannot be deleted or renamed.
                        </p>
                    )}
                </div>

                <footer className="p-6 border-t border-zinc-800 flex justify-end gap-3 bg-zinc-900/50 rounded-b-2xl">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-xl font-bold text-sm bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={tab?.id === 'AllTabs'}
                        className={`px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 active:scale-95 transition-all
              ${tab?.id === 'AllTabs'
                                ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20'}`}
                    >
                        <Save className="w-4 h-4" />
                        Save Tab
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default TabDialog;
