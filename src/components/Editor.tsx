'use client';

import { useEffect, useRef, useState } from "react";
import Editor, { loader } from "@monaco-editor/react";
import { io, Socket } from "socket.io-client";
import { AlertTriangle } from "lucide-react";

const themes = ["vs-dark", "light", "vs", "hc-black", "vs-light"];

interface CodeEditorProps {
  slug: string;
  fileId: string;
  user: {
      id: string;
      name: string;
      image?: string | null;
  };
  theme: string,
  setIsSaving: (val: boolean) => void;
  setIsTyping: (val: boolean) => void;
}


export default function CodeEditor({ slug, fileId, user, setIsSaving, setIsTyping, theme }: CodeEditorProps) {
    const [ code, setCode ] = useState("// Loading...");
    const [ language, setLanguage ] = useState("javascript");
    const [ loadingError, setLoadingError ] = useState(false);
    
    const socketRef = useRef<Socket | null>(null);
    const editorRef = useRef<any>(null);
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
        loader.init().then(() => {
          import("@/lib/monaco-snippets").then(({ initMonaco }) => {
            initMonaco(); 
          });
        });
      }, []);      
      
      useEffect(() => {
        if (!socketRef.current) {
          socketRef.current = io({ path: "/api/socket" });
        }
    
        const sock = socketRef.current;
        sock.emit('join-room', { roomId: slug, user });
    
        const handleCodeUpdate = ({ fileId: incomingFileId, code: incomingCode }: any) => {
          if (incomingFileId === fileId && incomingCode !== code) {
            setCode(incomingCode);
            // Update the Monaco editor manually
            if (editorRef.current) {
              editorRef.current.setValue(incomingCode);
            }
          }
        };
    
        sock.on('code-update', handleCodeUpdate);
    
        return () => {
          sock.off('code-update', handleCodeUpdate);
        };
      }, [slug, fileId, code]);

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
          setIsTyping(true) // User is typing
          socketRef.current?.emit('code-change', {
            roomId: slug,
            fileId,
            code: updatedCode
          });          
      };

      // Auto-save after 2 seconds of inactivity
      useEffect(() => {
        if (!fileId || code === null) return;
      
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
        <div className="h-full w-full flex flex-col bg-[#1e1e1e] text-white">
      
          {/* Editor */}
          <div className="flex-1">
            {loadingError ? (
              <div className="flex items-center justify-center h-full text-red-400 text-sm">
                <AlertTriangle className="w-4 h-4" /> Failed to load file. Please try again.
              </div>
            ) : (
              <Editor
                key={fileId}
                height="100%"
                theme={theme}
                language={language}
                value={code}
                onChange={handleChange}
                onMount={(editor) => {
                  editorRef.current = editor;

                  editor.onDidChangeCursorPosition((e) => {
                    const position = editor.getPosition();
                    socketRef.current?.emit('cursor-update', {
                      roomId: slug,
                      fileId,
                      userId: user.id,
                      cursorPosition: position
                    });
                  });
                }}    
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
