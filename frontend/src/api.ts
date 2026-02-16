import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    headers: {
        'Authorization': `Basic ${btoa('admin:password')}`
    }
});

// For testing purposes during dev
export const setAuth = (user: string, pass: string) => {
    const token = btoa(`${user}:${pass}`);
    api.defaults.headers.common['Authorization'] = `Basic ${token}`;
};

export const fetchFiles = async () => {
    const response = await api.get('/files');
    return response.data;
};

export const fetchCanonical = async () => {
    const response = await api.get('/config/canonical');
    return response.data;
};

export const publishFiles = async (files: { filename: string, content: string }[]) => {
    const response = await api.post('/publish', { files });
    return response.data;
};

export const publishCanonical = async (canonical: any) => {
    const response = await api.post('/publish', { canonical });
    return response.data;
};

export const fetchWidgetRegistry = async () => {
    const response = await api.get('/widgets/registry');
    return response.data;
};

export const refreshWidgets = async () => {
    const response = await api.post('/widgets/refresh');
    return response.data;
};

export default api;
