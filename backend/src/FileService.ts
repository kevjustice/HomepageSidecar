import fs from 'fs/promises';
import path from 'path';
import { datetime } from './utils.js';

export class FileService {
    private configDir: string;
    private backupDir: string;

    constructor(configDir: string) {
        this.configDir = configDir;
        this.backupDir = configDir; // Backups go into the same directory per requirements
    }

    async readFile(filename: string): Promise<string> {
        const filePath = path.join(this.configDir, filename);
        try {
            return await fs.readFile(filePath, 'utf-8');
        } catch (error: any) {
            if (error.code === 'ENOENT') {
                return '';
            }
            throw error;
        }
    }

    async writeFileAtomic(filename: string, content: string): Promise<void> {
        const filePath = path.join(this.configDir, filename);
        const tempPath = `${filePath}.tmp`;

        // 1. Create backup if file exists
        try {
            await fs.access(filePath);
            const timestamp = new Date().toISOString().replace(/[:.]/g, '').replace('T', '_').split('Z')[0];
            const backupPath = `${filePath}.${timestamp}.bak`;
            await fs.copyFile(filePath, backupPath);
        } catch (error: any) {
            if (error.code !== 'ENOENT') throw error;
        }

        // 2. Write to temp file
        await fs.writeFile(tempPath, content, 'utf-8');

        // 3. Rename temp to original (atomic)
        await fs.rename(tempPath, filePath);
    }

    async listConfigFiles(): Promise<string[]> {
        const files = await fs.readdir(this.configDir);
        const targetFiles = [
            'bookmarks.yaml',
            'services.yaml',
            'settings.yaml',
            'widgets.yaml',
            'docker.yaml',
            'kubernetes.yaml',
            'proxmox.yaml',
            'custom.css',
            'custom.js'
        ];
        return files.filter(f => targetFiles.includes(f));
    }
}
