'use client';

import { useState } from "react";
import Editor from '@monaco-editor/react';

const languages = ["javascript", "typescript", "python", "markdown"];
const themes = ["vs-dark", "light"];

export default function CodeEditor() {
    const [ code, setCode ] = useState("// Start coding here");
    const [ language, setLanguage ] = useState("javascript");
    const [ theme, setTheme ] = useState("vs-dark");

    return (
        <div className="h-screen w-full flex flex-col">
            <div className="flex items-center justify-between p-4 bg-gray-800 text-white">
                <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-gray-800 px-3 py-1 rounded">
                    {languages.map((lang) => (
                        <option key={lang} value={lang}>
                            {lang}
                        </option>
                    ))}
                </select>
                <select
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="bg-gray-800 px-3 py-1 rounded">
                    {themes.map((theme) => (
                        <option key={theme} value={theme}>
                            {theme}
                        </option>
                    ))}
                </select>
            </div>
            <Editor 
            height="90vh"
            theme={theme}
            language={language}
            value={code}
            onChange={(value) => setCode(value || "")}
            options={{
                fontSize: 14,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                automaticLayout: true
            }}
            />
        </div>
    )
}