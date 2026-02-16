export interface ServiceWidget {
    type: string;
    configText: string;
}

export interface Service {
    id: string;
    title: string;
    groupId: string;
    order: number;
    icon?: string;
    href: string;
    target?: '_blank' | '_self' | '_top';
    siteMonitor?: string;
    ping?: string;
    description?: string;
    widgets?: ServiceWidget[];
    docker?: {
        server?: string;
        container?: string;
    };
    // Additional common fields
    container?: string; // Alternative for direct container mapping
    server?: string;    // Alternative for direct server mapping
    namespace?: string; // K8s
    pod?: string;       // K8s
    port?: number;
    advancedExtra: Record<string, any>;
}

export interface Group {
    id: string;
    name: string;
    parentGroupId: string | null;
    tabId: string | 'AllTabs';
    order: number;
    icon?: string;
    options: {
        style?: 'row' | 'columns';
        columns?: number;
        iconsOnly?: boolean;
        header?: boolean;
        icon?: string;
        initiallyCollapsed?: boolean;
        useEqualHeights?: boolean;
    } & Record<string, any>; // Allow all group options
    advancedExtra: Record<string, any>;
    childrenType: 'services' | 'groups';
}

export interface Tab {
    id: string;
    name: string;
    order: number;
    isAllTabs: boolean;
}

export interface CanonicalModel {
    tabs: Tab[];
    groups: Group[];
    services: Service[];
}
