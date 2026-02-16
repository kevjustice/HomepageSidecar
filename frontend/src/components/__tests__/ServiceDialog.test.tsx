import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ServiceDialog from '../ServiceDialog';
import { Group, Service } from '../../types';

describe('ServiceDialog', () => {
    const mockGroups: Group[] = [
        {
            id: 'g1',
            name: 'Media',
            tabId: 't1',
            order: 0,
            parentGroupId: null,
            options: {},
            advancedExtra: {},
            childrenType: 'services'
        }
    ];

    const mockOnClose = vi.fn();
    const mockOnSave = vi.fn();

    // Mock window.alert
    const originalAlert = window.alert;
    beforeEach(() => {
        window.alert = vi.fn();
    });
    afterEach(() => {
        window.alert = originalAlert;
        vi.clearAllMocks();
    });

    it('renders with empty form for new service', () => {
        render(
            <ServiceDialog
                service={null}
                groups={mockGroups}
                onClose={mockOnClose}
                onSave={mockOnSave}
            />
        );

        expect(screen.getByText('Add New Service')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('e.g. Plex')).toHaveValue('');
        expect(screen.getByPlaceholderText('https://plex.example.com')).toHaveValue('');
    });

    it('validates required fields', () => {
        render(
            <ServiceDialog
                service={null}
                groups={mockGroups}
                onClose={mockOnClose}
                onSave={mockOnSave}
            />
        );

        fireEvent.click(screen.getByText('Save Service'));

        expect(window.alert).toHaveBeenCalledWith('Title, URL, and Group are required.');
        expect(mockOnSave).not.toHaveBeenCalled();
    });

    it('calls onSave with correct data when valid', () => {
        render(
            <ServiceDialog
                service={null}
                groups={mockGroups}
                onClose={mockOnClose}
                onSave={mockOnSave}
            />
        );

        fireEvent.change(screen.getByPlaceholderText('e.g. Plex'), { target: { value: 'My Plex' } });
        fireEvent.change(screen.getByPlaceholderText('https://plex.example.com'), { target: { value: 'http://test.com' } });

        // Select 'Media' group (it's the first one, so likely selected by default, but let's be sure if we change logic)
        // Group select usually defaults to first if groupId initial state is set

        fireEvent.click(screen.getByText('Save Service'));

        expect(mockOnSave).toHaveBeenCalledWith(expect.objectContaining({
            title: 'My Plex',
            href: 'http://test.com',
            groupId: 'g1'
        }));
    });

    it('populates form when editing existing service', () => {
        const existingService: Service = {
            id: 's1',
            title: 'Existing Service',
            href: 'http://existing.com',
            groupId: 'g1',
            order: 0,
            widgets: [],
            advancedExtra: {}
        };

        render(
            <ServiceDialog
                service={existingService}
                groups={mockGroups}
                onClose={mockOnClose}
                onSave={mockOnSave}
            />
        );

        expect(screen.getByText('Edit Service')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Existing Service')).toBeInTheDocument();
        expect(screen.getByDisplayValue('http://existing.com')).toBeInTheDocument();
    });
});
