'use client';

import { useEffect, useRef, useState } from "react";
import Editor from '@monaco-editor/react';
import { io, Socket } from "socket.io-client";
import { loader } from "@monaco-editor/react";
import { initMonaco } from "@/lib/monaco-snippets";

const themes = ["vs-dark", "light", "vs", "hc-black", "vs-light"];

interface CodeEditorProps {
    slug: string;
    fileId: string;
}

export default function CodeEditor({ slug, fileId }: CodeEditorProps) {
    const [code, setCode] = useState("// Loading...");
    const [language, setLanguage] = useState("javascript");
    const [theme, setTheme] = useState("vs-dark");

    const socketRef = useRef<Socket | null>(null);

    // Determine language based on file extension
    const getLanguageFromExtension = (fileName: string): string => {
        if (fileName.endsWith(".py")) return "python";
        if (fileName.endsWith(".cpp")) return "cpp";
        if (fileName.endsWith(".c")) return "c";
        if (fileName.endsWith(".java")) return "java";
        if (fileName.endsWith(".html")) return "html";
        if (fileName.endsWith(".css")) return "css";
        if (fileName.endsWith(".ts")) return "typescript";
        return "javascript";
      };      

    
      useEffect(() => {
        loader.init().then((monaco) => {
          initMonaco(); // Register languages & snippets
        });
      }, []);
      
    useEffect(() => {
        if (!socketRef.current) {
            socketRef.current = io({ path: "/api/socket" });
        }

        const sock = socketRef.current;
        sock.emit('join-room', slug);

        sock.on('code-update', (newCode) => {
            setCode(newCode);
        });

        return () => {
            sock.off('code-update');
        };
    }, [slug]);

    useEffect(() => {
        fetch(`/api/file/${fileId}`)
            .then((res) => res.json())
            .then((data) => {
                setCode(data.content || "// Start coding here");
                if (data.name) {
                    setLanguage(getLanguageFromExtension(data.name));
                }
            })
            .catch(() => setCode("// Error loading file"));
    }, [fileId]);

    const handleChange = (value: string | undefined) => {
        const updatedCode = value || "";
        setCode(updatedCode);
        socketRef.current?.emit('code-change', { roomId: slug, code: updatedCode });
    };

    // Auto-save after 2 seconds of inactivity
    useEffect(() => {
        const timer = setTimeout(() => {
            fetch(`/api/file/${fileId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: code, language }),
            });
        }, 2000);

        return () => clearTimeout(timer);
    }, [code, fileId, language]);

    return (
        <div className="h-screen w-full flex flex-col">
            <div className="flex items-center justify-between p-4 bg-gray-800 text-white">
                <span className="text-sm">Language: {language}</span>
                <select
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                    className="bg-gray-800 px-3 py-1 rounded"
                >
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
                onChange={handleChange}
                options={{
                    fontSize: 14,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    quickSuggestions: true,  
                    automaticLayout: true,
                }}
            />
        </div>
    );
}
