import React from 'react';
import Editor from '@monaco-editor/react';

interface MonacoEditorProps {
    content: string;
    filename: string;
    onChange: (value: string | undefined) => void;
}

const MonacoEditor: React.FC<MonacoEditorProps> = ({ content, filename, onChange }) => {
    const getLanguage = (file: string) => {
        if (file.endsWith('.yaml')) return 'yaml';
        if (file.endsWith('.css')) return 'css';
        if (file.endsWith('.js')) return 'javascript';
        return 'text';
    };

    return (
        <div className="h-full w-full border border-zinc-800 rounded-lg overflow-hidden">
            <Editor
                height="100%"
                defaultLanguage={getLanguage(filename)}
                theme="vs-dark"
                value={content}
                onChange={onChange}
                options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    padding: { top: 16, bottom: 16 }
                }}
            />
        </div>
    );
};

export default MonacoEditor;
