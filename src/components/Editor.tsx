'use client';

import { useEffect, useRef, useState } from "react";
import Editor from '@monaco-editor/react';
import { io, Socket } from "socket.io-client";

const languages = ["javascript", "typescript", "python", "markdown"];
const themes = ["vs-dark", "light"];


export default function CodeEditor({ slug }: { slug: string }) {
    const [ code, setCode ] = useState("// Loading...");
    const [ language, setLanguage ] = useState("javascript");
    const [ theme, setTheme ] = useState("vs-dark");

    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        if(!socketRef.current) {
            socketRef.current = io({ path: "/api/socket" });
        }
        
        const sock = socketRef.current;
        sock.emit('join-room', slug);
        
        sock.on('code-update', (newCode) => {
            setCode(newCode);
        });

        return () => {
            sock.off('code-update');
        }
    }, [slug]);

    useEffect(() => {
        fetch(`/api/room/${slug}`)
            .then((res) => res.json())
            .then((data) => {
                setCode(data.content || "// Start coding here");
            })
            .catch(() => setCode("// Error loading code"));
    }, [slug]);

    const handleChange = (value: string | undefined) => {
        const updateCode = value || "";
        setCode(updateCode);
        socketRef.current?.emit('code-change', { roomId: slug, code: updateCode });
    }

    useEffect(() => {
        const timer = setTimeout(() => {
            fetch(`/api/room/${slug}`, {
                method: 'PATCH',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: code })
            });
        }, 2000);

        return () => clearTimeout(timer);
    }, [code, slug]);

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