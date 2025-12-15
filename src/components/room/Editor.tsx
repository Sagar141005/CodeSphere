"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Editor, { loader } from "@monaco-editor/react";
import { io, Socket } from "socket.io-client";
import { AlertTriangle, Loader2 } from "lucide-react";
import { defineMonacoThemes } from "@/lib/monaco-themes";
import toast from "react-hot-toast";

// Helper for debouncing socket emits
function debounce<T extends (...args: any[]) => void>(fn: T, delay: number) {
  let timer: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

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
  onCodeChange?: (code: string) => void;
}

export default function CodeEditor({
  roomId,
  fileId,
  user,
  setIsSaving,
  setIsTyping,
  theme,
  editorRef,
  onCodeChange,
}: CodeEditorProps) {
  const [language, setLanguage] = useState("javascript");
  const [loadingError, setLoadingError] = useState(false);
  const [fileLoading, setFileLoading] = useState(true);

  const socketRef = useRef<Socket | null>(null);
  const currentFileIdRef = useRef(fileId);

  // Refs to manage timers
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Ref to prevent echo loops (socket -> editor -> socket)
  const isApplyingRemoteRef = useRef(false);

  const getLanguageFromExtension = (fileName: string): string => {
    if (fileName.endsWith(".py")) return "python";
    if (fileName.endsWith(".cpp")) return "cpp";
    if (fileName.endsWith(".c")) return "c";
    if (fileName.endsWith(".java")) return "java";
    if (fileName.endsWith(".html")) return "html";
    if (fileName.endsWith(".css")) return "css";
    if (fileName.endsWith(".ts")) return "typescript";
    if (fileName.endsWith(".json")) return "json";
    return "javascript";
  };

  // 1. Init Monaco
  useEffect(() => {
    loader.init().then(() => {
      import("@/lib/monaco-snippets").then(({ initMonaco }) => {
        initMonaco();
      });
    });
  }, []);

  // 2. Load File Content
  useEffect(() => {
    currentFileIdRef.current = fileId;
    let isCurrent = true;
    setFileLoading(true);
    setLoadingError(false);

    const loadFile = async () => {
      try {
        const res = await fetch(`/api/file/${fileId}`);
        if (!res.ok) throw new Error("Failed to fetch");

        const data = await res.json();

        if (!isCurrent) return;

        // Set Editor Content
        if (editorRef.current) {
          const model = editorRef.current.getModel();
          if (model) {
            isApplyingRemoteRef.current = true; // Block socket emit
            model.setValue(data.content || "");
            isApplyingRemoteRef.current = false;
          }
        }

        // Set Language
        if (data.name) {
          setLanguage(getLanguageFromExtension(data.name));
        }
      } catch (err) {
        if (isCurrent) {
          console.error(err);
          setLoadingError(true);
          toast.error("Failed to load file.");
        }
      } finally {
        if (isCurrent) setFileLoading(false);
      }
    };

    loadFile();

    return () => {
      isCurrent = false;
      // Clear timers on unmount/file switch
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [fileId, editorRef]);

  // 3. Socket Connection
  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io(process.env.NEXT_PUBLIC_BACKEND_URL || "", {
        path: "/api/socket",
      });
    }

    const sock = socketRef.current;

    const joinRoom = () => {
      sock.emit("join-room", { roomId, user });
    };

    if (sock.connected) joinRoom();
    sock.on("connect", joinRoom);

    const handleCodeUpdate = ({
      fileId: incomingFileId,
      code: incomingCode,
      senderId,
    }: any) => {
      // Ignore my own updates or updates for other files
      if (senderId === socketRef.current?.id) return;
      if (currentFileIdRef.current !== incomingFileId) return;
      if (!editorRef.current) return;

      const model = editorRef.current.getModel();
      if (!model) return;

      const currentContent = model.getValue();
      if (currentContent === incomingCode) return;

      // Apply update
      isApplyingRemoteRef.current = true;

      const selection = editorRef.current.getSelection();

      // Preserve cursor position if possible
      model.pushEditOperations(
        [],
        [{ range: model.getFullModelRange(), text: incomingCode }],
        () => null
      );

      if (selection) editorRef.current.setSelection(selection);

      // Small timeout to ensure we don't trigger onChange immediately
      setTimeout(() => {
        isApplyingRemoteRef.current = false;
      }, 50);
    };

    sock.on("code-update", handleCodeUpdate);

    return () => {
      sock.off("code-update", handleCodeUpdate);
      sock.off("connect", joinRoom);
    };
  }, [roomId, user]);

  // 4. Debounced Socket Emit
  const emitCodeChange = useRef(
    debounce((updatedCode: string) => {
      socketRef.current?.emit("code-change", {
        roomId,
        fileId,
        code: updatedCode,
        senderId: socketRef.current?.id,
      });
    }, 250)
  ).current;

  // 5. Save Function
  const saveContent = useCallback(
    async (content: string) => {
      setIsSaving(true);
      try {
        const res = await fetch(`/api/file/${fileId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content, language }),
        });

        if (!res.ok) {
          throw new Error("Save failed");
        }
      } catch (err) {
        console.error("Auto-save error:", err);
        toast.error("Failed to save changes");
      } finally {
        setIsSaving(false);
      }
    },
    [fileId, language, setIsSaving]
  );

  // 6. Handle Change (Typing)
  const handleChange = (value: string | undefined) => {
    if (loadingError || fileLoading || isApplyingRemoteRef.current) return;

    const newCode = value || "";

    if (onCodeChange) {
      onCodeChange(newCode);
    }

    // A. Emit to Socket
    emitCodeChange(newCode);

    // B. Handle "Is Typing" UI
    setIsTyping(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 1000);

    // C. Handle Auto-Save
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      saveContent(newCode);
    }, 2000);
  };

  return (
    <div className="h-full w-full flex flex-col bg-neutral-950 text-white">
      <div className="flex-1 relative">
        {fileLoading && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-neutral-950/80 backdrop-blur-sm transition-all duration-200">
            <div className="flex flex-col items-center gap-3 animate-in fade-in zoom-in-95 duration-200">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              <p className="text-sm font-medium text-neutral-400">
                Loading file...
              </p>
            </div>
          </div>
        )}

        {loadingError ? (
          <div className="flex items-center justify-center h-full text-red-400 text-sm gap-2">
            <AlertTriangle className="w-4 h-4" />
            <span>Failed to load file.</span>
          </div>
        ) : (
          <Editor
            key={fileId} // Forces remount on file change (ensures clean state)
            height="100%"
            theme={theme}
            language={language}
            onChange={handleChange}
            beforeMount={defineMonacoThemes}
            onMount={(editor) => {
              editorRef.current = editor;

              // Emit cursor moves
              editor.onDidChangeCursorPosition((e) => {
                socketRef.current?.emit("cursor-update", {
                  roomId: roomId,
                  fileId,
                  userId: user.id,
                  cursorPosition: e.position,
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
