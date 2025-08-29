"use client";

import { useEffect, useRef, useState } from "react";
import Editor, { loader } from "@monaco-editor/react";
import { io, Socket } from "socket.io-client";
import { AlertTriangle } from "lucide-react";
import { defineMonacoThemes } from "@/lib/monaco-themes";
import toast from "react-hot-toast";

const themes = ["vs-dark", "light", "vs", "hc-black", "vs-light"];

interface CodeEditorProps {
  roomId: string;
  fileId: string;
  user: {
    id: string;
    name: string;
    image?: string | null;
  };
  theme: string;
  setIsSaving: (val: boolean) => void;
  setIsTyping: (val: boolean) => void;
  editorRef: React.MutableRefObject<any>;
}

export default function CodeEditor({
  roomId,
  fileId,
  user,
  setIsSaving,
  setIsTyping,
  theme,
  editorRef,
}: CodeEditorProps) {
  const [code, setCode] = useState("// Loading...");
  const [language, setLanguage] = useState("javascript");
  const [loadingError, setLoadingError] = useState(false);
  const [fileLoading, setFileLoading] = useState(true);

  const socketRef = useRef<Socket | null>(null);
  const currentFileIdRef = useRef(fileId);
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
    currentFileIdRef.current = fileId;
  }, [fileId]);

  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io(process.env.NEXT_PUBLIC_BACKEND_URL, {
        path: "/api/socket",
      });
    }

    const sock = socketRef.current;
    sock.emit("join-room", { roomId: roomId, user });

    const handleCodeUpdate = ({
      fileId: incomingFileId,
      code: incomingCode,
    }: any) => {
      if (
        currentFileIdRef.current === incomingFileId &&
        incomingCode !== editorRef.current?.getValue()
      ) {
        setCode(incomingCode);
        editorRef.current?.setValue(incomingCode);
      }
    };

    sock.on("code-update", handleCodeUpdate);

    return () => {
      sock.off("code-update", handleCodeUpdate);
    };
  }, [roomId, fileId, code]);

  useEffect(() => {
    let isCurrent = true;
    setFileLoading(true);

    const loadFile = async () => {
      try {
        const res = await fetch(`/api/file/${fileId}`);
        const data = await res.json();

        if (!isCurrent) return;

        setCode(data.content || "// Start coding here");
        if (data.name) {
          setLanguage(getLanguageFromExtension(data.name));
        }
      } catch {
        if (isCurrent) {
          setLoadingError(true);
          setCode("// Error loading file.");
          toast.error("Failed to load file.");
        }
      } finally {
        if (isCurrent) setFileLoading(false); // loading finished
      }
    };

    loadFile();
    return () => {
      isCurrent = false; // Cancel this load if fileId changes
    };
  }, [fileId]);

  const handleChange = (value: string | undefined) => {
    if (loadingError || fileLoading) return;

    const updatedCode = value || "";
    setCode(updatedCode);
    setIsTyping(true); // User is typing
    socketRef.current?.emit("code-change", {
      roomId: roomId,
      fileId,
      code: updatedCode,
    });
  };

  // Auto-save after 2 seconds of inactivity
  useEffect(() => {
    if (!fileId || code === null || loadingError || fileLoading) return;

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    saveTimeoutRef.current = setTimeout(async () => {
      setIsSaving(true);
      try {
        const res = await fetch(`/api/file/${fileId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: code, language }),
        });

        if (!res.ok) {
          const err = await res.json();
          toast.error(err.error || "Auto-save failed.");
        }
      } catch (err) {
        console.error("Failed to save:", err);
        toast.error("Failed to auto-save.");
      } finally {
        setIsSaving(false);
        setIsTyping(false);
      }
    }, 2000);

    return () => clearTimeout(saveTimeoutRef.current!);
  }, [code, fileId, language, loadingError, fileLoading]);

  return (
    <div className="h-full w-full flex flex-col bg-[#1e1e1e] text-white">
      {/* Editor */}
      <div className="flex-1">
        {loadingError ? (
          <div className="flex items-center justify-center h-full text-red-400 text-sm">
            <AlertTriangle className="w-4 h-4" /> Failed to load file. Please
            try again.
          </div>
        ) : (
          <Editor
            key={fileId}
            height="100%"
            theme={theme}
            language={language}
            value={code}
            onChange={handleChange}
            beforeMount={defineMonacoThemes}
            onMount={(editor) => {
              editorRef.current = editor;

              editor.onDidChangeCursorPosition((e) => {
                const position = editor.getPosition();
                socketRef.current?.emit("cursor-update", {
                  roomId: roomId,
                  fileId,
                  userId: user.id,
                  cursorPosition: position,
                });
              });
            }}
            options={{
              fontSize: 14,
              readOnly: fileLoading || loadingError,
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
