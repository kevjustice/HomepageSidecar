import React, { useState } from 'react';
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    Settings2,
    Code,
    Eye,
    Layout,
    Network,
    AlertTriangle,
    Save,
    Folder,
    Box,
    ExternalLink,
    GripVertical
} from 'lucide-react';
import { CanonicalModel, Service, Group } from '../types';
import ServiceDialog from '../components/ServiceDialog';
import GroupDialog from '../components/GroupDialog';
import InfoWidgetsPanel from '../components/InfoWidgetsPanel';
import HelpInfo from '../components/HelpInfo';
import MonacoEditor from '../components/MonacoEditor';
import { publishFiles, fetchCanonical } from '../api';
import yaml from 'js-yaml';
import HierarchyEditor from '../components/HierarchyEditor';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, rectSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface ServicesPageProps {
    canonical: CanonicalModel;
    onUpdate: (updated: CanonicalModel) => void;
}

// Sortable Item Wrapper
const SortableServiceCard = ({ service, children }: { service: Service, children: React.ReactNode }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: service.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 1000 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} className="relative group/sortable">
            {children}
            {/* Drag Handle - Only visible on hover in edit/visual mode */}
            <div
                {...attributes}
                {...listeners}
                className="absolute top-2 left-2 p-1.5 bg-zinc-800/80 rounded-lg text-zinc-400 opacity-0 group-hover/sortable:opacity-100 hover:text-white hover:bg-indigo-600 cursor-grab active:cursor-grabbing transition-all z-20 backdrop-blur-sm"
            >
                <GripVertical className="w-3 h-3" />
            </div>
        </div>
    );
};

const ServicesPage: React.FC<ServicesPageProps> = ({ canonical, onUpdate }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTabId, setSelectedTabId] = useState<string | 'AllTabs'>('AllTabs');
    const [editingService, setEditingService] = useState<Service | null>(null);
    const [editingGroup, setEditingGroup] = useState<Group | null>(null);
    const [parentForNewGroup, setParentForNewGroup] = useState<Group | undefined>(undefined);

    const [isServiceDialogOpen, setIsServiceDialogOpen] = useState(false);
    const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);
    const [isInfoWidgetsOpen, setIsInfoWidgetsOpen] = useState(false);

    const [viewMode, setViewMode] = useState<'visual' | 'hierarchy' | 'preview' | 'expert'>('visual');
    const [expertYaml, setExpertYaml] = useState('');

    // Filter top-level groups
    const topLevelGroups = canonical.groups.filter(g =>
        (selectedTabId === 'AllTabs' || g.tabId === selectedTabId) &&
        !g.parentGroupId
    );

    // --- Service Handlers ---
    const handleAddService = () => {
        setEditingService(null);
        // Pre-selection logic would go here if specific group target needed
        setIsServiceDialogOpen(true);
    };

    const handleEditService = (service: Service) => {
        setEditingService(service);
        setIsServiceDialogOpen(true);
    };

    const handleDeleteService = (serviceId: string) => {
        if (confirm('Are you sure you want to delete this service?')) {
            const updated = {
                ...canonical,
                services: canonical.services.filter(s => s.id !== serviceId)
            };
            onUpdate(updated);
        }
    };

    const handleSaveService = (service: Service) => {
        let updatedServices;
        if (editingService) {
            updatedServices = canonical.services.map(s => s.id === service.id ? service : s);
        } else {
            updatedServices = [...canonical.services, service];
        }
        onUpdate({ ...canonical, services: updatedServices });
        setIsServiceDialogOpen(false);
    };

    // --- Group Handlers ---
    const handleAddGroup = (parent?: Group) => {
        setEditingGroup(null);
        setParentForNewGroup(parent);
        setIsGroupDialogOpen(true);
    };

    const handleEditGroup = (group: Group) => {
        setEditingGroup(group);
        setParentForNewGroup(undefined);
        setIsGroupDialogOpen(true);
    };

    const handleSaveGroup = (group: Group) => {
        let updatedGroups;
        if (editingGroup) {
            updatedGroups = canonical.groups.map(g => g.id === group.id ? group : g);
        } else {
            updatedGroups = [...canonical.groups, group];
        }
        onUpdate({ ...canonical, groups: updatedGroups });
        setIsGroupDialogOpen(false);
    };

    const handleDeleteGroup = (groupId: string) => {
        if (confirm('Delete this group? This will simply remove the group container.')) {
            const updatedGroups = canonical.groups.filter(g => g.id !== groupId);
            onUpdate({ ...canonical, groups: updatedGroups });
        }
    };

    const handleExpertSave = async () => {
        try {
            if (confirm('Saving in Expert Mode will overwrite services.yaml directly. Continue?')) {
                await publishFiles([{ filename: 'services.yaml', content: expertYaml }]);
                const refreshed = await fetchCanonical();
                onUpdate(refreshed);
                setViewMode('visual');
            }
        } catch (err) {
            alert('Failed to save YAML. Please check syntax.');
        }
    };

    // Helper to get Iconify URL 
    const getIconUrl = (icon: string | undefined) => {
        if (!icon) return null;

        // Direct URL check
        if (icon.startsWith('http://') || icon.startsWith('https://')) {
            return icon;
        }

        let formatted = icon;

        if (icon.startsWith('sh-')) {
            const name = icon.replace('sh-', '');
            // Try to use dashboard-icons CDN for sh- prefix as it's common for homepage
            return `https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/${name}.png`;
        } else if (icon.startsWith('si-')) {
            formatted = icon.replace('si-', 'simple-icons:');
        } else if (icon.startsWith('mdi-')) {
            formatted = icon.replace('mdi-', 'mdi:');
        } else if (icon.includes('-') && !icon.includes(':')) {
            formatted = icon.replace('-', ':');
        }

        // Handle color suffix if present (mdi-name-#color)
        if (formatted.includes('-#')) {
            const [base, color] = formatted.split('-#');
            return `https://api.iconify.design/${base}.svg?color=%23${color}`;
        }

        return `https://api.iconify.design/${formatted}.svg?color=%23ffffff`;
    };

    // --- Drag and Drop ---
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (active.id !== over?.id) {
            const activeId = active.id;
            const overId = over?.id;

            // Find source and destination groups (simplified: assume same group for now or handle cross-group)
            // Ideally we only allow reorder within same group for now to match request
            const activeService = canonical.services.find(s => s.id === activeId);
            const overService = canonical.services.find(s => s.id === overId);

            if (activeService && overService && activeService.groupId === overService.groupId) {
                const groupServices = canonical.services
                    .filter(s => s.groupId === activeService.groupId)
                    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

                const oldIndex = groupServices.findIndex(s => s.id === activeId);
                const newIndex = groupServices.findIndex(s => s.id === overId);

                const reorderedGroupServices = arrayMove(groupServices, oldIndex, newIndex);

                // Update orders for all services in this group
                const updatedServices = canonical.services.map(s => {
                    if (s.groupId === activeService.groupId) {
                        const newOrderIndex = reorderedGroupServices.findIndex(rs => rs.id === s.id);
                        return { ...s, order: newOrderIndex };
                    }
                    return s;
                });

                onUpdate({ ...canonical, services: updatedServices });
            }
        }
    };

    // Recursive Group Renderer
    const renderGroup = (group: Group, depth: number = 0) => {
        const groupServices = canonical.services
            .filter(s => s.groupId === group.id)
            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

        const subGroups = canonical.groups
            .filter(g => g.parentGroupId === group.id)
            .sort((a, b) => a.order - b.order);

        const matchesSearch = searchTerm === '' ||
            group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            groupServices.some(s => s.title.toLowerCase().includes(searchTerm.toLowerCase()));

        if (!matchesSearch && subGroups.length === 0 && groupServices.length === 0) return null;

        return (
            <div key={group.id} className={`${depth === 0 ? 'space-y-6 mb-12' : 'ml-6 mt-6 pt-6 border-l border-zinc-900/50 pl-6'}`}>
                {/* Header */}
                <div className="flex items-center justify-between group/header">
                    <h3 className={`font-bold flex items-center gap-3 ${depth === 0 ? 'text-2xl' : 'text-lg text-zinc-300'}`}>
                        {depth === 0 ? (
                            <span className="w-1.5 h-8 bg-indigo-600 rounded-full shadow-[0_0_15px_rgba(79,70,229,0.5)]"></span>
                        ) : (
                            <Folder className="w-4 h-4 text-zinc-500" />
                        )}
                        {group.name}
                        {groupServices.length > 0 && <span className="text-[10px] font-black uppercase tracking-widest text-zinc-700 bg-zinc-900/50 px-2 py-0.5 rounded ml-2">{groupServices.length} items</span>}
                        {subGroups.length > 0 && <span className="text-[10px] font-black uppercase tracking-widest text-zinc-700 bg-zinc-900/50 px-2 py-0.5 rounded ml-2">{subGroups.length} groups</span>}
                    </h3>

                    <div className="flex items-center gap-2 opacity-0 group-hover/header:opacity-100 transition-opacity">
                        <button onClick={() => handleAddGroup(group)} className="p-1.5 hover:bg-zinc-800 text-zinc-500 hover:text-indigo-400 rounded-lg transition-all" title="Add Subgroup">
                            <Folder className="w-3.5 h-3.5" /> <span className="text-[9px] font-bold uppercase ml-1">Sub</span>
                        </button>
                        <button onClick={() => handleEditGroup(group)} className="p-1.5 hover:bg-zinc-800 text-zinc-500 hover:text-white rounded-lg transition-all" title="Edit Group">
                            <Settings2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDeleteGroup(group.id)} className="p-1.5 hover:bg-zinc-800 text-zinc-500 hover:text-red-400 rounded-lg transition-all" title="Delete Group">
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>

                {/* Subgroups (Recursive) */}
                {subGroups.length > 0 && (
                    <div className="space-y-8">
                        {subGroups.map(sg => renderGroup(sg, depth + 1))}
                    </div>
                )}

                {/* Direct Services */}
                {groupServices.length > 0 && (
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={groupServices.map(s => s.id)}
                            strategy={rectSortingStrategy}
                        >
                            <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-5 mt-4">
                                {groupServices.map(service => (
                                    <SortableServiceCard key={service.id} service={service}>
                                        <div
                                            className="bg-zinc-900/30 border border-zinc-900/80 rounded-xl p-4 hover:border-indigo-500/30 hover:bg-zinc-900/50 transition-all group relative overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-indigo-500/5 h-full"
                                        >
                                            <div className="flex items-start gap-4 mb-3">
                                                <div className="w-10 h-10 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform shadow-inner">
                                                    {service.icon ? (
                                                        <img
                                                            src={getIconUrl(service.icon)!}
                                                            className="w-6 h-6 object-contain"
                                                            alt=""
                                                            onError={(e) => {
                                                                (e.target as any).src = `https://api.iconify.design/mdi:cube-outline.svg?color=%2352525b`;
                                                            }}
                                                        />
                                                    ) : (
                                                        <Box className="w-5 h-5 text-zinc-700" />
                                                    )}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <h4 className="font-bold text-sm text-zinc-100 group-hover:text-white transition-colors truncate">{service.title}</h4>
                                                    <p className="text-[10px] font-mono text-zinc-600 truncate mt-0.5">{service.href}</p>
                                                </div>
                                            </div>

                                            {service.description && (
                                                <p className="text-xs text-zinc-500 line-clamp-2 mb-3 leading-relaxed italic">{service.description}</p>
                                            )}

                                            <div className="flex items-center justify-between mt-auto pt-3 border-t border-zinc-900/50">
                                                <div className="flex gap-2">
                                                    {service.widgets && service.widgets.length > 0 && (
                                                        <span className="text-[9px] font-black uppercase tracking-widest text-indigo-500/80 bg-indigo-500/5 px-2 py-0.5 rounded border border-indigo-500/10 flex items-center gap-1.5">
                                                            <Settings2 className="w-3 h-3" /> {service.widgets.length}
                                                        </span>
                                                    )}
                                                    {service.container && (
                                                        <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500/80 bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10 flex items-center gap-1">
                                                            Docker
                                                        </span>
                                                    )}
                                                </div>
                                                <a
                                                    href={service.href}
                                                    target={service.target || "_blank"}
                                                    rel="noreferrer"
                                                    className="text-[10px] font-black tracking-widest text-zinc-500 hover:text-white transition-colors flex items-center gap-1.5 uppercase"
                                                >
                                                    Visit <ExternalLink className="w-3 h-3" />
                                                </a>
                                            </div>

                                            {/* Absolute Actions */}
                                            <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                <button
                                                    onClick={() => handleEditService(service)}
                                                    className="p-2 bg-zinc-950/90 border border-zinc-800 hover:border-indigo-500/50 text-zinc-500 hover:text-white rounded-lg transition-all shadow-xl backdrop-blur-sm"
                                                    title="Edit Service"
                                                >
                                                    <Edit2 className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteService(service.id)}
                                                    className="p-2 bg-zinc-950/90 border border-zinc-800 hover:border-red-500/50 text-zinc-500 hover:text-red-400 rounded-lg transition-all shadow-xl backdrop-blur-sm"
                                                    title="Delete Service"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    </SortableServiceCard>
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                )}

                {subGroups.length === 0 && groupServices.length === 0 && (
                    <div className="p-8 border-2 border-dashed border-zinc-900 rounded-2xl flex flex-col items-center justify-center text-zinc-600 space-y-2">
                        <p className="text-xs font-bold uppercase tracking-widest">Empty Group</p>
                        <button onClick={() => {
                            // Could add quick add logic here
                        }} className="text-indigo-500 text-xs hover:underline">Add items via top menu</button>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full bg-zinc-950">
            <header className="p-8 border-b border-zinc-900 bg-zinc-950/50 flex justify-between items-end backdrop-blur-sm z-10 sticky top-0">
                <div className="space-y-4 flex-1 max-w-2xl">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Services & Bookmarks</h2>
                        <p className="text-zinc-500 mt-1">Orchestrate your dashboard landscape and service integrations.</p>
                    </div>

                    {viewMode === 'visual' && (
                        <div className="flex gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                                <input
                                    type="text"
                                    placeholder="Filter by name, group, or property..."
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all font-medium placeholder:text-zinc-700"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="flex bg-zinc-900 border border-zinc-800 rounded-xl p-1 text-nowrap overflow-x-auto scroller-hidden shadow-inner">
                                {canonical.tabs.sort((a, b) => a.order - b.order).map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setSelectedTabId(tab.id)}
                                        className={`px-5 py-2 text-xs font-bold rounded-lg transition-all ${selectedTabId === tab.id ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-600 hover:text-zinc-300'}`}
                                    >
                                        {tab.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex flex-col items-end gap-3">
                    <div className="flex items-center gap-3">
                        {viewMode === 'visual' && (
                            <HelpInfo
                                title="Visual Board Guide"
                                description="Manage your services visually with drag-and-drop organization."
                                steps={[
                                    "Drag service cards to reorder them within a group.",
                                    "Click group headers to add subgroups or edit group settings.",
                                    "Use the 'Add Service' button to create new bookmarks.",
                                    "Action buttons (Edit/Delete) appear in the top-right of cards on hover."
                                ]}
                                tips={[
                                    "Reordering is currently limited to the same group.",
                                    "The board automatically expands to fill your screen width."
                                ]}
                            />
                        )}
                        {viewMode === 'hierarchy' && (
                            <HelpInfo
                                title="Tree Editor Guide"
                                description="Deep hierarchy management and group reparenting."
                                steps={[
                                    "Use the list to see nested groups and their services.",
                                    "Edit groups to change their parent and nest them deeply.",
                                    "This view is best for large-scale structural changes."
                                ]}
                            />
                        )}
                        {viewMode === 'expert' && (
                            <HelpInfo
                                title="Expert Mode Guide"
                                description="Direct YAML manipulation for power users."
                                steps={[
                                    "Edit the raw YAML configuration directly in the editor.",
                                    "Click 'Overwrite Model' to apply changes (Caution: bypasses UI safety checks).",
                                    "Best for bulk editing or copy-pasting configurations."
                                ]}
                            />
                        )}

                        <div className="flex bg-zinc-900 border border-zinc-800 rounded-2xl p-1 shadow-inner">
                            <NavButton active={viewMode === 'visual'} onClick={() => setViewMode('visual')} icon={<Layout className="w-5 h-5" />} title="Visual Board" />
                            <NavButton active={viewMode === 'hierarchy'} onClick={() => setViewMode('hierarchy')} icon={<Network className="w-5 h-5" />} title="Tree Editor" />
                            <NavButton active={viewMode === 'preview'} onClick={() => setViewMode('preview')} icon={<Eye className="w-5 h-5" />} title="Output Preview" />
                            <NavButton
                                active={viewMode === 'expert'}
                                onClick={() => {
                                    setExpertYaml("# Expert Mode: Direct YAML access\n" + yaml.dump(canonical.services));
                                    setViewMode('expert');
                                }}
                                icon={<Code className="w-5 h-5" />}
                                title="Expert YAML"
                                color="hover:text-amber-500"
                            />
                        </div>
                    </div>

                    {viewMode === 'visual' && (
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleAddGroup()}
                                className="bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-1.5 rounded-xl font-bold text-[10px] uppercase tracking-wider transition-all flex items-center shadow-lg active:scale-95"
                            >
                                <Folder className="w-3 h-3 mr-1.5 text-indigo-400" />
                                Add Group
                            </button>
                            <button
                                onClick={() => handleAddService()}
                                className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-xl font-bold text-[10px] uppercase tracking-wider transition-all flex items-center shadow-xl shadow-indigo-600/30 active:scale-95"
                            >
                                <Plus className="w-3 h-3 mr-1.5" />
                                Add Service
                            </button>
                        </div>
                    )}
                </div>
            </header>

            <div className="flex-1 overflow-hidden relative">
                {viewMode === 'visual' ? (
                    <div className="overflow-y-auto h-full p-10 pt-6 custom-scrollbar">
                        <div className="">
                            {topLevelGroups.map(group => renderGroup(group))}

                            {topLevelGroups.length === 0 && (
                                <div className="py-40 text-center space-y-4">
                                    <div className="w-20 h-20 bg-zinc-900/30 rounded-3xl flex items-center justify-center mx-auto border border-zinc-800/50">
                                        <Box className="w-8 h-8 text-zinc-800" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-zinc-500 font-bold">No groups found in this tab</p>
                                        <p className="text-zinc-700 text-xs">Switch tabs or add a new group to get started.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ) : viewMode === 'hierarchy' ? (
                    <div className="overflow-y-auto h-full p-10 pt-6 custom-scrollbar">
                        <div className="max-w-4xl mx-auto">
                            <HierarchyEditor canonical={canonical} onUpdate={onUpdate} />
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex flex-col">
                        {viewMode === 'expert' && (
                            <div className="bg-amber-950/10 border-b border-amber-900/30 p-5 flex items-center gap-4 text-amber-200/80">
                                <AlertTriangle className="w-5 h-5 text-amber-500 shadow-sm" />
                                <div className="text-xs font-medium">
                                    <span className="font-black uppercase tracking-widest text-amber-500 mr-2">Warning:</span>
                                    Expert Mode direct editing bypasses schema safety. Applying changes here will force-refresh the data model.
                                </div>
                                <button
                                    onClick={handleExpertSave}
                                    className="ml-auto bg-amber-600 hover:bg-amber-500 shadow-lg shadow-amber-600/20 text-black px-5 py-2 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 active:scale-95"
                                >
                                    <Save className="w-4 h-4" />
                                    Overwrite Model
                                </button>
                            </div>
                        )}
                        <div className="flex-1 p-10 pt-0">
                            <MonacoEditor
                                filename="services.yaml"
                                content={viewMode === 'expert' ? expertYaml : yaml.dump(canonical.services)}
                                onChange={(val) => setExpertYaml(val || '')}
                            />
                        </div>
                    </div>
                )}
            </div>

            {isServiceDialogOpen && (
                <ServiceDialog
                    service={editingService}
                    groups={canonical.groups}
                    onClose={() => setIsServiceDialogOpen(false)}
                    onSave={handleSaveService}
                />
            )}

            {isGroupDialogOpen && (
                <GroupDialog
                    group={editingGroup}
                    parentGroup={parentForNewGroup}
                    onClose={() => setIsGroupDialogOpen(false)}
                    onSave={handleSaveGroup}
                />
            )}

            {isInfoWidgetsOpen && (
                <InfoWidgetsPanel
                    onClose={() => setIsInfoWidgetsOpen(false)}
                />
            )}
        </div>
    );
};

const NavButton = ({ active, onClick, icon, title, color = "hover:text-white" }: { active: boolean, onClick: () => void, icon: React.ReactNode, title: string, color?: string }) => (
    <button
        onClick={onClick}
        className={`p-2.5 rounded-xl transition-all ${active ? 'bg-zinc-800 text-white shadow-md' : `text-zinc-600 ${color}`}`}
        title={title}
    >
        {icon}
    </button>
);

export default ServicesPage;
