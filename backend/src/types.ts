export interface ServiceWidget {
    type: string;
    configText: string;
    advancedExtra?: Record<string, any>;
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
    advancedExtra: Record<string, any>;
}

export interface Group {
    id: string;
    name: string;
    parentGroupId: string | null;
    tabId: string | 'AllTabs';
    order: number;
    options: {
        style?: 'row' | 'columns';
        columns?: number;
        iconsOnly?: boolean;
        header?: boolean;
        icon?: string;
        initiallyCollapsed?: boolean;
        useEqualHeights?: boolean;
    };
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
