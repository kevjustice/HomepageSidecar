import { useState, useEffect, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import MonacoEditor from './components/MonacoEditor';
import HelpInfo from './components/HelpInfo';
import { fetchFiles, fetchCanonical, publishFiles, publishCanonical } from './api';
import { CanonicalModel } from './types';
import ServicesPage from './pages/ServicesPage';
import SettingsPage from './pages/SettingsPage';
import LandingPage from './pages/LandingPage';
import InfoWidgetsPanel from './components/InfoWidgetsPanel';
import yaml from 'js-yaml';

interface FileData {
    filename: string;
    content: string;
    originalContent: string;
}

function App() {
    const [files, setFiles] = useState<Record<string, FileData>>({});
    const [canonical, setCanonical] = useState<CanonicalModel | null>(null);
    const [loading, setLoading] = useState(true);
    const [isDirty, setIsDirty] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Dynamic dashboard URL extraction
    const homepageUrl = useMemo(() => {
        try {
            const settingsFile = files['settings.yaml'];
            if (settingsFile) {
                const parsed: any = yaml.load(settingsFile.content);
                return parsed?.baseUrl || parsed?.pwa?.startUrl || parsed?.startUrl || 'http://localhost:3000';
            }
        } catch (e) {
            console.warn("Failed to parse settings for URL", e);
        }
        return 'http://localhost:3000';
    }, [files]);

    useEffect(() => {
        async function loadData() {
            try {
                const [filesData, canonicalData] = await Promise.all([
                    fetchFiles(),
                    fetchCanonical()
                ]);

                const fileMap: Record<string, FileData> = {};
                filesData.forEach((f: any) => {
                    fileMap[f.filename] = {
                        filename: f.filename,
                        content: f.content,
                        originalContent: f.content
                    };
                });
                setFiles(fileMap);
                setCanonical(canonicalData);
                setError(null);
            } catch (err: any) {
                console.error('Failed to load data', err);

                // If we are on a subpage and fail to load, redirect to root
                // This handles the case where sidecar is restarting and only root loads correctly first
                if (window.location.pathname !== '/') {
                    window.location.href = '/';
                    return;
                }

                setError(err.response?.status === 401
                    ? 'Unauthorized: Authentication failed. Please check the backend credentials.'
                    : 'Failed to connect to the backend API. Please ensure the sidecar is running.');
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    const handleUpdate = (filename: string, newContent: string) => {
        setFiles(prev => {
            const updated = {
                ...prev,
                [filename]: { ...prev[filename], content: newContent }
            };
            return updated;
        });
    };

    const handleCanonicalUpdate = (updated: CanonicalModel) => {
        setCanonical(updated);
        setIsDirty(true);
    };

    const ConfigPage = ({ filename }: { filename: string }) => {
        const file = files[filename];
        if (!file) return <div className="p-8 text-zinc-500">File not found: {filename}</div>;

        const getHelpContent = () => {
            if (filename.includes('kubernetes')) return {
                title: "Kubernetes Config Guide",
                description: "Connect to your K8s clusters and monitor pod status.",
                steps: ["Define your cluster address and token.", "Map namespaces to dashboard groups.", "Configure resource limits and monitoring agents."],
                tips: ["Homepage uses the official K8s API for real-time status updates."]
            };
            if (filename.includes('docker')) return {
                title: "Docker Config Guide",
                description: "Monitor local and remote Docker containers.",
                steps: ["Define your Docker socket or TCP endpoint.", "Add container labels to filter what shows up.", "Enable GPU or resource monitoring stats."],
                tips: ["Label containers with 'homepage.group' for auto-sorting."]
            };
            if (filename.includes('proxmox')) return {
                title: "Proxmox Config Guide",
                description: "Monitor VMs and Containers on your PVE nodes.",
                steps: ["Add your Proxmox API node and token ID/secret.", "Select specific VM IDs to monitor.", "Configure CPU/Memory threshold alerts."],
                tips: ["Ensure your API token has 'PVEAuditor' permissions."]
            };
            if (filename.endsWith('.css')) return {
                title: "Custom CSS Guide",
                description: "Override dashboard styles with your own CSS.",
                steps: ["Write standard CSS rules here.", "Styles are injected after the default theme.", "Use !important if you need to override core components."],
                tips: ["Inspect elements in Homepage to find specific class names."]
            };
            if (filename.endsWith('.js')) return {
                title: "Custom JS Guide",
                description: "Add dynamic behaviors with JavaScript.",
                steps: ["Standard ES6+ JavaScript is supported.", "Script is executed on dashboard page load.", "Useful for custom integrations or DOM manipulation."],
                tips: ["Use 'window.homepage' to access dashboard-global events."]
            };
            return null;
        };

        const help = getHelpContent();

        return (
            <div className="h-full flex flex-col p-8 bg-zinc-950">
                <header className="mb-6 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            {filename}
                            {file.content !== file.originalContent && <span className="text-xs font-normal text-amber-500 px-2 py-0.5 rounded border border-amber-900/50 bg-amber-950/20">modified</span>}
                        </h2>
                        <p className="text-zinc-500">Edit raw {filename.split('.').pop()?.toUpperCase()} configuration</p>
                    </div>
                    {help && <HelpInfo {...help} />}
                </header>
                <div className="flex-1 min-h-0">
                    <MonacoEditor
                        filename={filename}
                        content={file.content}
                        onChange={(val) => handleUpdate(filename, val || '')}
                    />
                </div>
            </div>
        );
    };

    const PublishPage = () => {
        const changedFiles = Object.values(files).filter(f => f.content !== f.originalContent);
        const [publishing, setPublishing] = useState(false);
        const [result, setResult] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

        const handlePublish = async () => {
            setPublishing(true);
            try {
                if (isDirty && canonical) {
                    await publishCanonical(canonical);
                }

                const rawToPublish = changedFiles.map(f => ({ filename: f.filename, content: f.content }));
                if (rawToPublish.length > 0) {
                    await publishFiles(rawToPublish);
                }

                setResult({ message: 'Success! Changes published and Homepage should reload shortly.', type: 'success' });

                const [filesUpdated, canonicalUpdated] = await Promise.all([
                    fetchFiles(),
                    fetchCanonical()
                ]);

                const fileMap: Record<string, FileData> = {};
                filesUpdated.forEach((f: any) => {
                    fileMap[f.filename] = {
                        filename: f.filename,
                        content: f.content,
                        originalContent: f.content
                    };
                });
                setFiles(fileMap);
                setCanonical(canonicalUpdated);
                setIsDirty(false);
            } catch (err) {
                setResult({ message: 'Error: Failed to publish changes', type: 'error' });
            } finally {
                setPublishing(false);
            }
        };

        return (
            <div className="p-8 max-w-2xl mx-auto h-full overflow-y-auto">
                <h2 className="text-3xl font-bold mb-6">Publish Changes</h2>

                {!isDirty && changedFiles.length === 0 ? (
                    <p className="text-zinc-400">No changes detected.</p>
                ) : (
                    <div className="space-y-6">
                        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                            <div className="px-6 py-4 border-b border-zinc-800 bg-zinc-900/50">
                                <h3 className="font-medium">Summary of changes:</h3>
                            </div>
                            <ul className="divide-y divide-zinc-800">
                                {isDirty && (
                                    <li className="px-6 py-3 flex items-center justify-between">
                                        <span className="text-sm">Structured Configuration (Services/Groups)</span>
                                        <span className="text-xs text-amber-500 px-2 py-0.5 rounded bg-amber-950/20 border border-amber-900/50">modified</span>
                                    </li>
                                )}
                                {changedFiles.map(f => (
                                    <li key={f.filename} className="px-6 py-3 flex items-center justify-between">
                                        <span className="text-sm font-mono">{f.filename}</span>
                                        <span className="text-xs text-amber-500 px-2 py-0.5 rounded bg-amber-950/20 border border-amber-900/50">modified</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <button
                            onClick={handlePublish}
                            disabled={publishing}
                            className={`
                w-full py-4 px-6 rounded-xl font-bold transition-all
                ${publishing
                                    ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20'}
              `}
                        >
                            {publishing ? 'Publishing...' : 'Publish to Homepage'}
                        </button>
                    </div>
                )}

                {result && (
                    <div className={`mt-6 p-4 rounded-xl border ${result.type === 'success' ? 'bg-emerald-950/20 border-emerald-900 text-emerald-200' : 'bg-red-950/20 border-red-900 text-red-200'}`}>
                        {result.message}
                    </div>
                )}
            </div>
        );
    };

    if (error) {
        return (
            <div className="h-screen bg-zinc-950 flex items-center justify-center text-red-100">
                <div className="text-center space-y-6 max-w-md p-8 bg-zinc-900 border border-red-900/50 rounded-2xl shadow-2xl">
                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto border border-red-500/20">
                        <span className="text-3xl text-red-500">!</span>
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold">Connection Failed</h2>
                        <p className="text-zinc-500 text-sm leading-relaxed">{error}</p>
                    </div>
                    <button
                        onClick={() => window.location.reload()}
                        className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl font-bold transition-all border border-zinc-700"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="h-screen bg-zinc-950 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    <div className="text-zinc-500 font-medium tracking-tight">Syncing configuration...</div>
                </div>
            </div>
        );
    }

    if (!canonical) {
        return (
            <div className="h-screen bg-zinc-950 flex items-center justify-center text-zinc-500">
                Finalizing initialization...
            </div>
        );
    }

    return (
        <Router>
            <div className="flex bg-zinc-950 text-zinc-100 min-h-screen overflow-hidden">
                <Navigation
                    isDirty={isDirty || Object.values(files).some(f => f.content !== f.originalContent)}
                    homepageUrl={homepageUrl}
                    hasErrors={false}
                />
                <main className="flex-1 relative overflow-hidden h-screen bg-zinc-950">
                    <Routes>
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/services" element={<ServicesPage canonical={canonical!} onUpdate={handleCanonicalUpdate} />} />
                        <Route path="/widgets" element={<InfoWidgetsPanel inline={true} />} />
                        <Route path="/kubernetes" element={<ConfigPage filename="kubernetes.yaml" />} />
                        <Route path="/docker" element={<ConfigPage filename="docker.yaml" />} />
                        <Route path="/proxmox" element={<ConfigPage filename="proxmox.yaml" />} />
                        <Route path="/settings" element={<SettingsPage />} />
                        <Route path="/css" element={<ConfigPage filename="custom.css" />} />
                        <Route path="/js" element={<ConfigPage filename="custom.js" />} />
                        <Route path="/publish" element={<PublishPage />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App;
