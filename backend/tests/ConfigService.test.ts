import { describe, it, expect } from 'vitest';
import { ConfigService } from '../src/ConfigService';
import yaml from 'yaml';

describe('ConfigService', () => {
    const configService = new ConfigService();

    it('should parse simple services.yaml correctly', () => {
        const servicesYaml = `
- My Group:
    - Service A:
        href: http://example.com
`;
        // Minimal settings with empty layout
        const settingsYaml = 'layout: []';

        // Minimal bookmarks
        const bookmarksYaml = '[]';

        const model = configService.parseServices(servicesYaml, settingsYaml, bookmarksYaml);

        expect(model.groups).toHaveLength(1);
        expect(model.groups[0].name).toBe('My Group');
        expect(model.services).toHaveLength(1);
        expect(model.services[0].title).toBe('Service A');
        expect(model.services[0].href).toBe('http://example.com');
    });

    it('should migrate bookmarks into services', () => {
        const servicesYaml = '[]';
        const settingsYaml = 'layout: []';
        const bookmarksYaml = `
- Bookmarks Group:
    - My Bookmark:
        href: http://bookmark.com
`;

        const model = configService.parseServices(servicesYaml, settingsYaml, bookmarksYaml);

        expect(model.groups).toHaveLength(1);
        expect(model.groups[0].name).toBe('Bookmarks Group');

        // Check if the service was correctly created from bookmark
        const service = model.services.find(s => s.title === 'My Bookmark');
        expect(service).toBeDefined();
        expect(service?.href).toBe('http://bookmark.com');
    });

    it('should preserve unknown fields in services', () => {
        const servicesYaml = `
- Custom Group:
    - Custom Service:
        href: http://test.com
        customField: "some value"
`;
        const settingsYaml = 'layout: []';
        const bookmarksYaml = '[]';

        const model = configService.parseServices(servicesYaml, settingsYaml, bookmarksYaml);
        const service = model.services[0];

        expect(service.advancedExtra).toHaveProperty('customField', 'some value');

        // Test round-trip generation
        const generatedYaml = configService.generateServicesYaml(model);
        const parsed = yaml.parse(generatedYaml);

        // Group -> 0 -> Custom Group -> 0 -> Custom Service
        const serviceObj = parsed[0]['Custom Group'][0]['Custom Service'];
        expect(serviceObj.customField).toBe('some value');
    });
});
