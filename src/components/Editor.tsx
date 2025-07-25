'use client';

import { useEffect, useRef, useState } from "react";
import Editor from '@monaco-editor/react';
import { io, Socket } from "socket.io-client";
import { loader } from "@monaco-editor/react";
import { initMonaco } from "@/lib/monaco-snippets";
import { Settings } from "lucide-react";

const themes = ["vs-dark", "light", "vs", "hc-black", "vs-light"];

interface CodeEditorProps {
  slug: string;
  fileId: string;
  user: {
      id: string;
      name: string;
      image?: string | null;
  };
}


export default function CodeEditor({ slug, fileId, user }: CodeEditorProps) {
    const [ code, setCode ] = useState("// Loading...");
    const [ language, setLanguage ] = useState("javascript");
    const [ theme, setTheme ] = useState("vs-dark");
    const [ isTyping, setIsTyping ] = useState(false);
    const [ isSaving, setIsSaving ] = useState(false);
    const [ loadingError, setLoadingError ] = useState(false);

    const socketRef = useRef<Socket | null>(null);
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
        sock.emit('join-room', { roomId: slug, user });


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
            .catch(() => {
              setLoadingError(true);
              setCode("// Error loading file.");
            });
    }, [fileId]);

    const handleChange = (value: string | undefined) => {
        const updatedCode = value || "";
        setCode(updatedCode);
        setIsTyping(true); // User is typing
        socketRef.current?.emit('code-change', { roomId: slug, code: updatedCode });
    };

    // Auto-save after 2 seconds of inactivity
    useEffect(() => {
      if (!fileId || !code) return;
    
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    
      saveTimeoutRef.current = setTimeout(() => {
        setIsSaving(true);
        fetch(`/api/file/${fileId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: code, language }),
        })
          .finally(() => {
            setIsSaving(false);
            setIsTyping(false); // Only stop typing after save is complete
          });
      }, 2000);
    
      return () => clearTimeout(saveTimeoutRef.current!);
    }, [code, fileId, language]);
    

    return (
        <div className="h-screen w-full flex flex-col bg-[#1e1e1e] text-white">
          {/* Topbar */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700 bg-[#2a2a2a]">
            <div className="flex items-center gap-3">
              <Settings className="w-5 h-5 text-gray-400" />
              <span className="text-sm font-semibold text-gray-300">Editor Settings</span>
            </div>
            <div className="flex items-center gap-3">
              {isTyping || isSaving ? (
                <span className="text-xs text-green-400 animate-pulse">Saving...</span>
              ) : (
                <span className="text-xs text-gray-500">Saved</span>
              )}
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="bg-[#333] text-sm px-3 py-1 rounded-md text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {themes.map((theme) => (
                  <option key={theme} value={theme}>
                    {theme}
                  </option>
                ))}
              </select>
            </div>
          </div>
      
          {/* Editor */}
          <div className="flex-1">
            {loadingError ? (
              <div className="flex items-center justify-center h-full text-red-400 text-sm">
                ⚠️ Failed to load file. Please try again.
              </div>
            ) : (
              <Editor
                height="100%"
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
                  fontFamily: "Fira Code, monospace",
                  fontLigatures: true,
                  padding: { top: 10 },
                }}
              />
            )}
          </div>
        </div>
      );
}
