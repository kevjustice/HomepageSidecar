import fs from 'fs/promises';
import path from 'path';
import yaml from 'yaml';
import { v4 as uuidv4 } from 'uuid';

interface ServiceWidget {
    type: string;
    configText: string;
}

interface Service {
    id: string;
    title: string;
    href?: string;
    icon?: string;
    description?: string;
    groupId: string;
    order: number;
    container?: string;
    server?: string;
    widgets?: ServiceWidget[];
    ping?: string;
    siteMonitor?: string;
    target?: string;
    namespace?: string;
    pod?: string;
    port?: string;
    advancedExtra?: Record<string, any>;
}

interface Group {
    id: string;
    name: string;
    order: number;
    parentGroupId: string | null;
    tabId: string;
    icon?: string;
    options?: Record<string, any>; // For columns, etc.
}

interface CanonicalModel {
    settings: any;
    tabs: any[]; // We still track tabs implicitly or via settings
    groups: Group[];
    services: Service[];
}

export class ConfigService {
    private configDir: string;

    constructor(configDir: string) {
        this.configDir = configDir;
    }

    async getFiles() {
        const files = ['settings.yaml', 'services.yaml', 'widgets.yaml', 'bookmarks.yaml', 'docker.yaml', 'custom.css', 'custom.js'];
        const result: Record<string, string> = {};

        for (const file of files) {
            try {
                const content = await fs.readFile(path.join(this.configDir, file), 'utf-8');
                result[file] = content;
            } catch (e) {
                result[file] = '';
            }
        }
        return result;
    }

    async saveFiles(files: { filename: string, content: string }[]) {
        for (const file of files) {
            await fs.writeFile(path.join(this.configDir, file.filename), file.content, 'utf-8');
        }
    }

    async getCanonical(): Promise<CanonicalModel> {
        const files = await this.getFiles();

        let settings: any = {};
        try { settings = yaml.parse(files['settings.yaml']) || {}; } catch (e) { }

        let rawServices: any = [];
        try { rawServices = yaml.parse(files['services.yaml']) || []; } catch (e) { }

        // Parse Services & Groups
        // We pass settings to help identify which tab a group belongs to
        const { groups, services } = this.parseServices(rawServices, settings);

        // Build Tabs from Settings Layout
        const tabs: any[] = [];
        const layout = settings.layout || {};
        const seenTabs = new Set<string>();

        // 1. Infer tabs from layout mapping: GroupName -> { tab: TabName }
        if (typeof layout === 'object' && layout !== null) {
            Object.values(layout).forEach((config: any) => {
                if (config && config.tab) {
                    seenTabs.add(config.tab);
                }
            });
        }

        // 2. Also check if there are explicit tab definitions (unlikely in standard homepage, but possible)
        // or just add "AllTabs" if nothing found
        if (seenTabs.size === 0) {
            seenTabs.add('Dashboard');
        }

        // Convert set to array - PRESERVE ORDER from layout (seenTabs iteration)
        Array.from(seenTabs).forEach((name, idx) => {
            tabs.push({ id: name, name: name, order: idx });
        });

        // Ensure we catch groups that might have a tabId that wasn't in layout (orphaned?)
        // If a group has a tabId not in tabs, add it.
        groups.forEach(g => {
            if (g.tabId !== 'AllTabs' && !tabs.find(t => t.id === g.tabId)) {
                tabs.push({ id: g.tabId, name: g.tabId, order: tabs.length });
            }
        });

        // If 'AllTabs' is used by any group but not in tabs list, add it (renamed to Dashboard usually)
        if (groups.some(g => g.tabId === 'AllTabs') && !tabs.find(t => t.id === 'AllTabs')) {
            tabs.push({ id: 'AllTabs', name: 'Dashboard', order: 0 });
        }

        return {
            settings,
            tabs,
            groups,
            services
        };
    }

    // --- YAML GENERATION ---

    generateSettingsYaml(canonical: CanonicalModel, originalContent: string = ''): string {
        let settings: any = {};
        try {
            settings = yaml.parse(originalContent) || {};
        } catch (e) { }

        // Merge generic updates
        settings = { ...settings, ...canonical.settings };

        // Reconstruct LAYOUT based on Tabs -> Groups to preserve order
        if (!settings.layout) settings.layout = {};

        const newLayout: Record<string, any> = {};

        // Iterate TABS first by order
        const sortedTabs = canonical.tabs.sort((a, b) => a.order - b.order);

        sortedTabs.forEach(tab => {
            // Find groups in this tab, sorted by their order
            const groupsInTab = canonical.groups
                .filter(g => g.tabId === tab.id && !g.parentGroupId) // Only root groups
                .sort((a, b) => a.order - b.order);

            groupsInTab.forEach(g => {
                const existing = settings.layout ? settings.layout[g.name] : {};

                newLayout[g.name] = {
                    ...existing,
                    tab: g.tabId === 'AllTabs' ? (canonical.tabs[0]?.name || 'Dashboard') : g.tabId,
                    ...g.options
                };
            });
        });

        // Catch any orphaned root groups not in known tabs? (Shouldn't happen if model is consistent)
        // But if they exist, append them
        canonical.groups.forEach(g => {
            if (!g.parentGroupId && !newLayout[g.name]) {
                const existing = settings.layout ? settings.layout[g.name] : {};
                newLayout[g.name] = {
                    ...existing,
                    tab: g.tabId,
                    ...g.options
                };
            }
        });

        settings.layout = newLayout;

        return yaml.stringify(settings);
    }

    generateServicesYaml(canonical: CanonicalModel): string {
        // Transform Canonical Groups/Services back to Homepage Nested YAML

        const rootGroups = canonical.groups.filter(g => !g.parentGroupId).sort((a, b) => a.order - b.order);
        const yamlStructure: any[] = [];

        const buildGroupStructure = (group: Group): any => {
            const groupContent: any[] = [];

            // 1. Subgroups
            const subGroups = canonical.groups
                .filter(g => g.parentGroupId === group.id)
                .sort((a, b) => a.order - b.order);

            subGroups.forEach(sub => {
                groupContent.push({ [sub.name]: buildGroupStructure(sub) });
            });

            // 2. Services
            const services = canonical.services
                .filter(s => s.groupId === group.id)
                .sort((a, b) => a.order - b.order);

            services.forEach(svc => {
                const serviceObj: any = {
                    ...svc.advancedExtra
                };

                if (svc.description) serviceObj.description = svc.description;
                if (svc.icon) serviceObj.icon = svc.icon;
                if (svc.href) serviceObj.href = svc.href;
                if (svc.container) serviceObj.container = svc.container;
                if (svc.server) serviceObj.server = svc.server;
                if (svc.ping) serviceObj.ping = svc.ping;
                if (svc.siteMonitor) serviceObj.site_monitor = svc.siteMonitor;

                // Reconstruct widgets
                if (svc.widgets && svc.widgets.length > 0) {
                    svc.widgets.forEach(w => {
                        try {
                            const parsed = yaml.parse(w.configText);
                            Object.assign(serviceObj, parsed);
                        } catch (e) {
                            if (!serviceObj.widget) serviceObj.widget = {};
                            serviceObj.widget = { type: w.type };
                        }
                    });
                }

                groupContent.push({ [svc.title]: serviceObj });
            });

            return groupContent;
        };

        rootGroups.forEach(g => {
            yamlStructure.push({ [g.name]: buildGroupStructure(g) });
        });

        return yaml.stringify(yamlStructure);
    }

    // --- RECURSIVE PARSER ---
    public parseServices(raw: any, settings: any = {}): { groups: Group[], services: Service[] } {
        let groups: Group[] = [];
        let services: Service[] = [];

        // Build a map of GroupName -> TabName from settings.layout
        const groupTabMap: Record<string, string> = {};
        if (settings && settings.layout) {
            Object.entries(settings.layout).forEach(([groupName, config]: [string, any]) => {
                if (config && config.tab) {
                    groupTabMap[groupName] = config.tab;
                }
            });
        }

        // Helper to recurse
        const traverse = (items: any, parentGroupId: string | null = null, inheritedTabId: string = 'AllTabs') => {
            if (!items) return;

            // Normalize to array of objects
            const list = Array.isArray(items) ? items : [items];

            list.forEach((item: any, idx: number) => {
                if (typeof item === 'object' && item !== null) {
                    Object.entries(item).forEach(([key, val]) => {
                        // VAL can be: 
                        // 1. Array -> It's a Group/Subgroup
                        // 2. Object -> It's a Service 

                        if (Array.isArray(val)) {
                            // GROUP detected
                            // Determine Tab ID:
                            // If root group (no parent), check settings map.
                            // If subgroup, inherit from parent.

                            let myTabId = inheritedTabId;
                            if (!parentGroupId) {
                                // Check map
                                myTabId = groupTabMap[key] || 'AllTabs';
                            }

                            // Also check if we have layout options in settings for this group
                            // e.g. columns, header, etc.
                            const layoutOpts = (settings.layout && settings.layout[key]) ? settings.layout[key] : {};

                            const groupId = uuidv4();
                            groups.push({
                                id: groupId,
                                name: key,
                                order: groups.length,
                                parentGroupId: parentGroupId,
                                tabId: myTabId,
                                options: layoutOpts
                            });

                            // Recurse into children
                            traverse(val, groupId, myTabId);

                        } else if (typeof val === 'object' && val !== null) {
                            // SERVICE detected
                            const serviceId = uuidv4();
                            const sVal = val as any;

                            const myWidgets: ServiceWidget[] = [];
                            if (sVal.widget) {
                                myWidgets.push({ type: sVal.widget.type, configText: yaml.stringify(sVal.widget) });
                            }

                            const { description, icon, href, container, server, ping, site_monitor, widget, ...others } = sVal;

                            services.push({
                                id: serviceId,
                                title: key,
                                description: description,
                                icon: icon,
                                href: href,
                                groupId: parentGroupId || 'orphaned',
                                order: services.length,
                                container: container,
                                server: server,
                                ping: ping,
                                siteMonitor: site_monitor,
                                widgets: myWidgets,
                                advancedExtra: others
                            });
                        }
                    });
                }
            });
        };

        let parsedRaw = raw;
        if (typeof raw === 'string') {
            try { parsedRaw = yaml.parse(raw); } catch (e) { }
        }

        traverse(parsedRaw);
        return { groups, services };
    }
}
