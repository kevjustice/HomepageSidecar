import Fastify from 'fastify';
import cors from '@fastify/cors';
import basicAuth from '@fastify/basic-auth';
import { validatorCompiler, serializerCompiler } from 'fastify-type-provider-zod';
import { FileService } from './FileService.js';
import { ConfigService } from './ConfigService.js';
import { ScraperService } from './ScraperService.js';
import fastifyStatic from '@fastify/static';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fastify = Fastify({
    logger: true,
});

fastify.setValidatorCompiler(validatorCompiler);
fastify.setSerializerCompiler(serializerCompiler);

fastify.register(cors);

// Serve static frontend files
fastify.register(fastifyStatic, {
    root: path.join(__dirname, '../public'),
    prefix: '/', // optional: default '/'
});

const CONFIG_DIR = process.env.CONFIG_DIR || '../config';
const DATA_DIR = process.env.DATA_DIR || '../data';
const fileService = new FileService(path.resolve(CONFIG_DIR));
const configService = new ConfigService(path.resolve(CONFIG_DIR));
const scraperService = new ScraperService();

// Authentication
const user = process.env.BASIC_AUTH_USER || 'admin';
const password = process.env.BASIC_AUTH_PASS || 'password';

fastify.register(basicAuth, {
    validate: async (username, pwd) => {
        if (username !== user || pwd !== password) {
            throw new Error('Unauthorized');
        }
    },
    authenticate: true,
});

fastify.after(() => {
    fastify.addHook('onRequest', fastify.basicAuth);

    fastify.get('/api/health', async () => {
        return { status: 'ok' };
    });

    // Raw file access
    fastify.get('/api/files', async () => {
        const files = [
            'bookmarks.yaml', 'services.yaml', 'settings.yaml', 'widgets.yaml',
            'docker.yaml', 'kubernetes.yaml', 'proxmox.yaml', 'custom.css', 'custom.js'
        ];

        const results = await Promise.all(files.map(async (filename) => {
            const content = await fileService.readFile(filename);
            return { filename, content };
        }));
        return results;
    });

    // Canonical model access
    fastify.get('/api/config/canonical', async () => {
        return configService.getCanonical();
    });

    // Widget Registry access
    fastify.get('/api/widgets/registry', async () => {
        try {
            const registryPath = path.resolve(DATA_DIR, 'widget-registry.json');
            const data = await fs.readFile(registryPath, 'utf-8');
            return JSON.parse(data);
        } catch (e) {
            return []; // Return empty if not yet scraped
        }
    });

    fastify.post('/api/widgets/refresh', async (request, reply) => {
        try {
            const widgets = await scraperService.fetchLatestWidgets();
            const registryPath = path.resolve(DATA_DIR, 'widget-registry.json');

            // Ensure data dir exists
            await fs.mkdir(path.resolve(DATA_DIR), { recursive: true });
            await fs.writeFile(registryPath, JSON.stringify(widgets, null, 2));

            return { message: 'Registry refreshed', count: widgets.length };
        } catch (error: any) {
            fastify.log.error(error);
            return reply.code(500).send({ error: 'Failed to refresh registry' });
        }
    });

    fastify.post('/api/publish', async (request, reply) => {
        const { files, canonical } = request.body as {
            files?: { filename: string, content: string }[],
            canonical?: any
        };

        try {
            if (files) {
                for (const file of files) {
                    await fileService.writeFileAtomic(file.filename, file.content);
                }
            }

            if (canonical) {
                const servicesYaml = configService.generateServicesYaml(canonical);
                const originalSettings = await fileService.readFile('settings.yaml');
                const settingsYaml = configService.generateSettingsYaml(canonical, originalSettings);

                await fileService.writeFileAtomic('services.yaml', servicesYaml);
                await fileService.writeFileAtomic('settings.yaml', settingsYaml);

                // Stub out bookmarks.yaml as they are now merged into services.yaml
                await fileService.writeFileAtomic('bookmarks.yaml', '# Bookmarks migrated to services.yaml by Homepage Config Helper\n[]');
            }

            return { message: 'Published successfully' };
        } catch (error: any) {
            fastify.log.error(error);
            return reply.code(500).send({ error: 'Failed to publish' });
        }
    });

    fastify.setNotFoundHandler((request, reply) => {
        if (request.raw.url && request.raw.url.startsWith('/api')) {
            reply.code(404).send({
                message: `Route ${request.method}:${request.url} not found`,
                error: 'Not Found',
                statusCode: 404
            });
        } else {
            reply.sendFile('index.html');
        }
    });
});

const start = async () => {
    try {
        await fastify.listen({ port: 8080, host: '0.0.0.0' });
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();
