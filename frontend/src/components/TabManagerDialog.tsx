import React, { useState } from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, X, Save, Edit3, Check, Trash2 } from 'lucide-react';
import { Tab } from '../types';

interface TabManagerDialogProps {
    tabs: Tab[];
    onClose: () => void;
    onSave: (tabs: Tab[]) => void;
}

interface SortableTabItemProps {
    tab: Tab;
    onRename: (id: string, newName: string) => void;
    onDelete: (id: string) => void;
}

const SortableTabItem: React.FC<SortableTabItemProps> = ({ tab, onRename, onDelete }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: tab.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(tab.name);

    const handleSave = () => {
        onRename(tab.id, name);
        setIsEditing(false);
    };

    return (
        <div ref={setNodeRef} style={style} className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 flex items-center gap-3 mb-2 group">
            <div {...attributes} {...listeners} className="cursor-grab text-zinc-600 hover:text-zinc-400">
                <GripVertical className="w-5 h-5" />
            </div>

            <div className="flex-1">
                {isEditing ? (
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-sm w-full focus:outline-none focus:border-indigo-500"
                            autoFocus
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSave();
                                if (e.key === 'Escape') setIsEditing(false);
                            }}
                        />
                        <button onClick={handleSave} className="p-1 hover:bg-zinc-800 rounded text-green-500">
                            <Check className="w-4 h-4" />
                        </button>
                    </div>
                ) : (
                    <span className="font-medium text-sm text-zinc-300">{tab.name}</span>
                )}
            </div>

            <div className="flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                {!isEditing && (
                    <button onClick={() => setIsEditing(true)} className="p-1.5 hover:bg-zinc-800 rounded text-zinc-500 hover:text-indigo-400">
                        <Edit3 className="w-4 h-4" />
                    </button>
                )}
                {/* Prevent deleting the last/only tab or "AllTabs" if it's special, 
                    but here we just allow standard delete. Backend might block if services exist? 
                    For now, allows UI delete. */}
                <button onClick={() => onDelete(tab.id)} className="p-1.5 hover:bg-zinc-800 rounded text-zinc-500 hover:text-red-400">
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

const TabManagerDialog: React.FC<TabManagerDialogProps> = ({ tabs, onClose, onSave }) => {
    const [localTabs, setLocalTabs] = useState<Tab[]>([...tabs]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (active.id !== over?.id) {
            setLocalTabs((items) => {
                const oldIndex = items.findIndex((i) => i.id === active.id);
                const newIndex = items.findIndex((i) => i.id === over?.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    const handleRename = (id: string, newName: string) => {
        setLocalTabs(prev => prev.map(t => t.id === id ? { ...t, name: newName } : t));
    };

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to remove this tab? Groups inside it may become visible in "Dashboard" or need reassignment.')) {
            setLocalTabs(prev => prev.filter(t => t.id !== id));
        }
    };

    const handleSave = () => {
        // Re-index order before saving
        const ordered = localTabs.map((t, idx) => ({ ...t, order: idx }));
        onSave(ordered);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
            <div className="bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-md shadow-2xl flex flex-col max-h-[80vh]">
                <header className="p-6 border-b border-zinc-800 flex justify-between items-center">
                    <h3 className="text-lg font-bold">Manage Tabs</h3>
                    <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-xl transition-all">
                        <X className="w-5 h-5 text-zinc-500" />
                    </button>
                </header>

                <div className="flex-1 overflow-y-auto p-6">
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={localTabs.map(t => t.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            {localTabs.map((tab) => (
                                <SortableTabItem
                                    key={tab.id}
                                    tab={tab}
                                    onRename={handleRename}
                                    onDelete={handleDelete}
                                />
                            ))}
                        </SortableContext>
                    </DndContext>

                    {localTabs.length === 0 && (
                        <div className="text-center py-8 text-zinc-500 text-sm">
                            No tabs defined.
                        </div>
                    )}
                </div>

                <footer className="p-6 border-t border-zinc-800 flex justify-end gap-3 bg-zinc-900/50 rounded-b-3xl">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-xl font-bold text-sm bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 rounded-xl font-bold text-sm bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 flex items-center gap-2 active:scale-95 transition-all"
                    >
                        <Save className="w-4 h-4" />
                        Save Changes
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default TabManagerDialog;
