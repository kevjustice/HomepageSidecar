import yaml from 'yaml';

export interface RemoteWidget {
    name: string;
    type: string;
    description: string;
    category: string;
    icon: string;
    defaultConfig: any;
}

export class ScraperService {
    private docUrls = [
        'https://gethomepage.dev/latest/configs/service-widgets/',
        // We could add more specific ones if needed, 
        // but often they are all linked or summarized.
    ];

    async fetchLatestWidgets(): Promise<RemoteWidget[]> {
        console.log('Starting remote widget fetch...');
        const widgets: RemoteWidget[] = [];

        try {
            // In a real scenario, we'd use a real scraper or a curated JSON.
            // Since I cannot actually browse the live web and scrape in real-time easily 
            // without a dedicated tool (I have search_web but not a raw 'fetch' that returns full HTML for parsing),
            // I will implement a robust mock-like fetcher that uses known Homepage patterns,
            // OR I can use the `read_url_content` tool if I were running this as an agent.

            // However, the task is to IMPLEMENT this in the codebase.
            // I'll write the logic that WOULD scrape if it were running in Node.

            const response = await fetch('https://raw.githubusercontent.com/gethomepage/homepage/main/docs/configs/service-widgets.md');
            if (!response.ok) throw new Error('Failed to fetch documentation');

            const text = await response.text();

            // Basic Markdown parser for Homepage docs:
            // Look for headings followed by code blocks
            const sections = text.split(/^## /m).slice(1);

            for (const section of sections) {
                const lines = section.split('\n');
                const title = lines[0].trim();
                const type = title.toLowerCase().replace(/[^a-z0-0]/g, '');

                // Find first yaml code block
                const yamlMatch = section.match(/```yaml\n([\s\S]*?)\n```/);
                if (yamlMatch) {
                    try {
                        const config = yaml.parse(yamlMatch[1]);
                        widgets.push({
                            name: title,
                            type: type,
                            description: `Templates for ${title}`,
                            category: 'service',
                            icon: `simple-icons:${type}`,
                            defaultConfig: config
                        });
                    } catch (e) {
                        // Skip invalid YAML
                    }
                }
            }
        } catch (error) {
            console.error('Error scraping widgets:', error);
        }

        return widgets;
    }
}
