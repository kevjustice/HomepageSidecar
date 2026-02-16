import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import HierarchyEditor from '../HierarchyEditor';
import { CanonicalModel } from '../../types';

describe('HierarchyEditor', () => {
    const mockCanonical: CanonicalModel = {
        tabs: [
            { id: 't1', name: 'Home', order: 0, isAllTabs: false },
            { id: 't2', name: 'Media', order: 1, isAllTabs: false }
        ],
        groups: [
            {
                id: 'g1',
                name: 'Services',
                tabId: 't1',
                parentGroupId: null,
                order: 0,
                options: {},
                advancedExtra: {},
                childrenType: 'services'
            },
            {
                id: 'g2',
                name: 'Plex',
                tabId: 't2',
                parentGroupId: null,
                order: 0,
                options: {},
                advancedExtra: {},
                childrenType: 'services'
            }
        ],
        services: []
    };

    const mockOnUpdate = vi.fn();

    it('renders tabs and groups correctly', () => {
        render(
            <HierarchyEditor
                canonical={mockCanonical}
                onUpdate={mockOnUpdate}
            />
        );

        expect(screen.getByText('Home')).toBeInTheDocument();
        expect(screen.getByText('Media')).toBeInTheDocument();
        expect(screen.getByText('Services')).toBeInTheDocument();
        expect(screen.getByText('Plex')).toBeInTheDocument();
    });

    it('renders "Add Tab" and "Add Group" buttons', () => {
        render(
            <HierarchyEditor
                canonical={mockCanonical}
                onUpdate={mockOnUpdate}
            />
        );

        expect(screen.getByText('Add Tab')).toBeInTheDocument();
        expect(screen.getByText('Add Group')).toBeInTheDocument();
    });
});
