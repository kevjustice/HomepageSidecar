import React, { useState } from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragStartEvent,
    DragEndEvent,
    DragOverlay
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
    GripVertical,
    Folder,
    Plus,
    Settings2,
    Layout as LayoutIcon,
    Trash2,
    Layers
} from 'lucide-react';
import { CanonicalModel, Group, Tab } from '../types';
import GroupDialog from './GroupDialog';
import TabManagerDialog from './TabManagerDialog';

// --- Components ---

interface SortableItemProps {
    id: string;
    name: string;
    type: 'tab' | 'group' | 'subgroup';
    depth?: number;
    children?: React.ReactNode;
    onEdit?: () => void;
    onDelete?: () => void;
    onAddChild?: () => void;
    isSystem?: boolean;
    itemCount?: number;
}

const SortableItem: React.FC<SortableItemProps> = (props) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: props.id });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 'auto',
        opacity: isDragging ? 0.3 : 1,
    };

    // Visual styles based on type
    const isTab = props.type === 'tab';
    const isSub = props.type === 'subgroup';

    // Base classes
    const containerClass = isTab
        ? "bg-zinc-900 border border-zinc-800 rounded-xl mb-4 overflow-hidden shadow-lg"
        : isSub
            ? "ml-8 mt-2 bg-zinc-950/30 border-l-2 border-l-indigo-500/30 border-y border-r border-zinc-800/50 rounded-r-lg"
            : "bg-zinc-950/80 border border-zinc-800 rounded-lg mb-2 shadow-sm hover:border-zinc-700";

    const headerClass = isTab
        ? "p-4 flex items-center gap-3 bg-zinc-950/50 border-b border-zinc-800"
        : "p-3 flex items-center gap-3";

    return (
        <div ref={setNodeRef} style={style} className={containerClass}>
            <div className={`group ${headerClass}`}>
                <button
                    {...attributes}
                    {...listeners}
                    className="cursor-grab active:cursor-grabbing text-zinc-600 hover:text-zinc-400 p-1 hover:bg-zinc-800 rounded"
                >
                    <GripVertical className="w-4 h-4" />
                </button>

                {isTab ? (
                    <LayoutIcon className="w-5 h-5 text-indigo-400" />
                ) : isSub ? (
                    <Layers className="w-4 h-4 text-zinc-600" />
                ) : (
                    <Folder className="w-4 h-4 text-zinc-500" />
                )}

                <div className="flex-1 min-w-0">
                    <span className={`truncate block ${isTab ? 'font-bold text-zinc-100 text-sm' : 'text-sm text-zinc-300'}`}>
                        {props.name}
                    </span>
                    {props.itemCount !== undefined && props.itemCount > 0 && (
                        <span className="text-[9px] text-zinc-600 font-mono uppercase tracking-wider">
                            {props.itemCount} items
                        </span>
                    )}
                </div>

                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {props.onAddChild && (
                        <button onClick={props.onAddChild} className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-500 hover:text-emerald-400 transition-colors" title="Add Subgroup">
                            <Plus className="w-3.5 h-3.5" />
                        </button>
                    )}
                    <button onClick={props.onEdit} className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-500 hover:text-white transition-colors" title="Edit">
                        <Settings2 className="w-3.5 h-3.5" />
                    </button>
                    {!props.isSystem && (
                        <button onClick={props.onDelete} className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-500 hover:text-red-400 transition-colors" title="Delete">
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>
            </div>

            {/* Content area for Tab children */}
            {isTab && props.children && (
                <div className="p-3 bg-zinc-950 min-h-[50px]">
                    {props.children}
                    {React.Children.count(props.children) === 0 && (
                        <div className="text-center py-4 text-zinc-700 text-xs italic border-2 border-dashed border-zinc-900 rounded-lg">
                            Empty Tab
                        </div>
                    )}
                </div>
            )}

            {/* Content area for Group children (subgroups) */}
            {!isTab && props.children}
        </div>
    );
};

// --- Main Editor ---

interface HierarchyEditorProps {
    canonical: CanonicalModel;
    onUpdate: (updated: CanonicalModel) => void;
}

const HierarchyEditor: React.FC<HierarchyEditorProps> = ({ canonical, onUpdate }) => {
    const [editingGroup, setEditingGroup] = useState<Group | null>(null);
    const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [isTabManagerOpen, setIsTabManagerOpen] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5, // Prevent accidental drags
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);

        if (!over) return;
        if (active.id === over.id) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        // Group Reordering - STRICTLY LOCAL
        const activeGroup = canonical.groups.find(g => g.id === activeId);
        const overGroup = canonical.groups.find(g => g.id === overId);

        if (activeGroup && overGroup) {
            const sameTab = activeGroup.tabId === overGroup.tabId;
            const sameParent = activeGroup.parentGroupId === overGroup.parentGroupId;

            if (sameTab && sameParent) {
                const siblings = canonical.groups
                    .filter(g => g.tabId === activeGroup.tabId && g.parentGroupId === activeGroup.parentGroupId)
                    .sort((a, b) => a.order - b.order);

                const oldIndex = siblings.findIndex(g => g.id === activeId);
                const newIndex = siblings.findIndex(g => g.id === overId);

                if (oldIndex !== -1 && newIndex !== -1) {
                    // Reorder locally
                    const newSiblings = arrayMove(siblings, oldIndex, newIndex);

                    // Construct new global list
                    const otherGroups = canonical.groups.filter(g =>
                        !(g.tabId === activeGroup.tabId && g.parentGroupId === activeGroup.parentGroupId)
                    );

                    const updatedSiblings = newSiblings.map((g, idx) => ({ ...g, order: idx }));

                    onUpdate({
                        ...canonical,
                        groups: [...otherGroups, ...updatedSiblings]
                    });
                }
            }
        }
    };

    // Dialog Handlers
    const handleAddGroup = (parentGroupId: string | null = null, tabId: string | null = null) => {
        // Default to first tab if not specified
        const effectiveTabId = tabId || canonical.tabs[0]?.id || 'Dashboard';

        setEditingGroup({
            id: crypto.randomUUID(),
            name: '',
            tabId: effectiveTabId,
            parentGroupId,
            order: 999, // end
            options: { columns: 3, header: true, initiallyCollapsed: false },
            advancedExtra: {},
            childrenType: 'services'
        });
        setIsGroupDialogOpen(true);
    };

    const handleEditGroup = (group: Group) => {
        setEditingGroup(group);
        setIsGroupDialogOpen(true);
    };

    const handleDeleteGroup = (groupId: string) => {
        if (confirm('Delete group? Services inside will be orphaned.')) {
            onUpdate({ ...canonical, groups: canonical.groups.filter(g => g.id !== groupId) });
        }
    };

    const handleSaveGroup = (group: Group) => {
        const exists = canonical.groups.some(g => g.id === group.id);
        const updatedGroups = exists
            ? canonical.groups.map(g => g.id === group.id ? group : g)
            : [...canonical.groups, group];

        onUpdate({ ...canonical, groups: updatedGroups });
        setIsGroupDialogOpen(false);
    };

    const handleSaveTabOrder = (newTabs: Tab[]) => {
        onUpdate({ ...canonical, tabs: newTabs });
    };

    // Recursive render helper
    const renderGroupList = (tabId: string, parentId: string | null = null) => {
        const siblings = canonical.groups
            .filter(g => g.tabId === tabId && g.parentGroupId === parentId)
            .sort((a, b) => a.order - b.order);

        return (
            <SortableContext
                items={siblings.map(g => g.id)}
                strategy={verticalListSortingStrategy}
            >
                <div className="space-y-1">
                    {siblings.map(group => {
                        // Count direct services/subgroups
                        const subCount = canonical.groups.filter(g => g.parentGroupId === group.id).length;
                        const svcCount = canonical.services.filter(s => s.groupId === group.id).length;

                        return (
                            <SortableItem
                                key={group.id}
                                id={group.id}
                                name={group.name}
                                type={parentId ? 'subgroup' : 'group'}
                                onEdit={() => handleEditGroup(group)}
                                onDelete={() => handleDeleteGroup(group.id)}
                                onAddChild={!parentId ? () => handleAddGroup(group.id, tabId) : undefined}
                                itemCount={svcCount + subCount}
                            >
                                {/* Recursive Children */}
                                {!parentId && renderGroupList(tabId, group.id)}
                            </SortableItem>
                        );
                    })}
                </div>
            </SortableContext>
        );
    };

    return (
        <div className="bg-zinc-950 p-8 pt-6 rounded-2xl border border-zinc-900 shadow-2xl h-full flex flex-col">
            <header className="mb-6 flex justify-between items-end flex-shrink-0">
                <div>
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <Layers className="w-5 h-5 text-indigo-500" />
                        Hierarchy Editor
                    </h3>
                    <p className="text-sm text-zinc-500 mt-1 max-w-md">
                        Structure your dashboard. Drag tabs to reorder sections. Drag groups within tabs to reorder layout.
                    </p>
                </div>
                <div className="space-y-4">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-500/10 rounded-lg">
                                <LayoutIcon className="w-5 h-5 text-indigo-400" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-white">Dashboard Hierarchy</h2>
                                <p className="text-xs text-zinc-500">Organize your services into tabs and groups</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setIsTabManagerOpen(true)}
                                className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-all border border-zinc-700/50"
                            >
                                <Settings2 className="w-3.5 h-3.5" />
                                Manage Tabs
                            </button>
                            <button
                                onClick={() => handleAddGroup(null)}
                                className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow-lg shadow-indigo-600/20 active:scale-95 transition-all"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                New Group
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                >
                    <div className="space-y-8">
                        {canonical.tabs.map(tab => (
                            <div key={tab.id} className="space-y-3">
                                {/* Tab Header - STATIC, not draggable anymore */}
                                <div className="flex items-center gap-3 px-1 group">
                                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />
                                    <span className="text-xs font-bold uppercase tracking-widest text-zinc-500 group-hover:text-zinc-300 transition-colors">
                                        {tab.name}
                                    </span>
                                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />
                                </div>

                                <SortableContext
                                    id={tab.id}
                                    items={canonical.groups.filter(g => g.tabId === tab.id && !g.parentGroupId).map(g => g.id)}
                                    strategy={verticalListSortingStrategy}
                                >
                                    <div className="grid grid-cols-1 gap-3 min-h-[50px] bg-zinc-900/20 rounded-xl p-2 border border-dashed border-zinc-800/50">
                                        {canonical.groups
                                            .filter(g => g.tabId === tab.id && !g.parentGroupId)
                                            .sort((a, b) => a.order - b.order)
                                            .map(group => (
                                                <SortableItem
                                                    key={group.id}
                                                    id={group.id}
                                                    name={group.name}
                                                    type="group"
                                                    onEdit={() => handleEditGroup(group)}
                                                    onDelete={() => handleDeleteGroup(group.id)}
                                                    onAddChild={() => handleAddGroup(group.id, tab.id)}
                                                    itemCount={canonical.services.filter(s => s.groupId === group.id).length + canonical.groups.filter(g => g.parentGroupId === group.id).length}
                                                >
                                                    {/* Render Subgroups if any */}
                                                    <div className="space-y-2 mt-2">
                                                        <SortableContext
                                                            id={group.id}
                                                            items={canonical.groups.filter(sub => sub.parentGroupId === group.id).map(g => g.id)}
                                                            strategy={verticalListSortingStrategy}
                                                        >
                                                            {canonical.groups
                                                                .filter(sub => sub.parentGroupId === group.id)
                                                                .sort((a, b) => a.order - b.order)
                                                                .map(subgroup => (
                                                                    <SortableItem
                                                                        key={subgroup.id}
                                                                        id={subgroup.id}
                                                                        name={subgroup.name}
                                                                        type="subgroup"
                                                                        onEdit={() => handleEditGroup(subgroup)}
                                                                        onDelete={() => handleDeleteGroup(subgroup.id)}
                                                                        isSystem={false}
                                                                    />
                                                                ))}
                                                        </SortableContext>
                                                    </div>
                                                </SortableItem>
                                            ))}

                                        {canonical.groups.filter(g => g.tabId === tab.id && !g.parentGroupId).length === 0 && (
                                            <div className="flex flex-col items-center justify-center py-6 text-zinc-600 text-xs italic gap-2">
                                                <span>Empty Tab</span>
                                                <button
                                                    onClick={() => handleAddGroup(null, tab.id)}
                                                    className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 rounded text-zinc-400 hover:text-white transition-colors"
                                                >
                                                    + Add Group Here
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </SortableContext>
                            </div>
                        ))}
                    </div>

                    <DragOverlay dropAnimation={null}>
                        {activeId ? (
                            <div className="opacity-80 rotate-2 scale-105 cursor-grabbing">
                                {(() => {
                                    const group = canonical.groups.find(g => g.id === activeId);
                                    if (group) return (
                                        <div className="bg-zinc-800 p-4 rounded-xl border border-zinc-700 shadow-2xl flex items-center gap-3">
                                            <Folder className="w-5 h-5 text-indigo-400" />
                                            <span className="font-bold text-zinc-200">{group.name}</span>
                                        </div>
                                    );
                                    return null;
                                })()}
                            </div>
                        ) : null}
                    </DragOverlay>
                </DndContext>

                {isGroupDialogOpen && (
                    <GroupDialog
                        group={editingGroup}
                        tabs={canonical.tabs}
                        allGroups={canonical.groups} // Pass for reparenting
                        onClose={() => setIsGroupDialogOpen(false)}
                        onSave={handleSaveGroup}
                    />
                )}

                {isTabManagerOpen && (
                    <TabManagerDialog
                        tabs={canonical.tabs}
                        onClose={() => setIsTabManagerOpen(false)}
                        onSave={handleSaveTabOrder}
                    />
                )}
            </div>
        </div>
    );
};

export default HierarchyEditor;
