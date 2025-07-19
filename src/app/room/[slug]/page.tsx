'use client';

import { use } from 'react';
import CodeEditor from "@/components/Editor";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import Tabs from "@/components/Tabs";
import Terminal, { TerminalRef } from "@/components/Terminal";
import { getSocket } from "@/lib/socket";
import { useEffect, useState, useRef } from "react";
import type { FileData } from "@/types/FileData";

export default function RoomPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);

  const [files, setFiles] = useState<FileData[]>([]);
  const [openTabs, setOpenTabs] = useState<FileData[]>([]);
  const [activeFile, setActiveFile] = useState<FileData | null>(null);
  const terminalRef = useRef<TerminalRef>(null);

  useEffect(() => {
    fetch(`/api/room/${slug}/files`)
      .then((res) => res.json())
      .then((data) => {
        const normalized = data.map((f: any) => ({
          ...f,
          type: f.type === "folder" ? "folder" : "file"
        }));
        setFiles(normalized);
      });
  }, [slug]);

  useEffect(() => {
    const socket = getSocket();
    socket.emit("join-room", { roomId: slug, user: { name: "User" } });
  }, [slug]);

  const openFile = (file: FileData) => {
    if (!openTabs.find((f) => f.id === file.id)) {
      setOpenTabs((prev) => [...prev, file]);
    }
    setActiveFile(file);
  };

  const closeFile = (fileId: string) => {
    setOpenTabs((prev) => prev.filter((f) => f.id !== fileId));
    if (activeFile?.id === fileId) {
      const remaining = openTabs.filter(f => f.id !== fileId);
      setActiveFile(remaining.length > 0 ? remaining[remaining.length - 1] : null);
    }
  };

  const getLanguage = (filename: string) => {
    if (filename.endsWith('.js')) return 'javascript';
    if (filename.endsWith('.py')) return 'python';
    if (filename.endsWith('.cpp')) return 'cpp';
    if (filename.endsWith('.c')) return 'c';
    if (filename.endsWith('.java')) return 'java';
    return 'javascript'; // default fallback
  };
  

  const runCode = async () => {
    if (!activeFile) return;
    const res = await fetch(`/api/file/${activeFile.id}`);
    const file = await res.json();
    terminalRef.current?.runCode(getLanguage(activeFile.name), file.content);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      <Navbar roomSlug={slug} />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          files={files}
          onFileClick={openFile}
          slug={slug}
          onFileAdded={(file) => setFiles((prev) => [...prev, file])}
          onFileDeleted={(id) => setFiles((prev) => prev.filter((f) => f.id !== id))}
          onFileRenamed={(id, newName) =>
            setFiles((prev) =>
              prev.map((f) => (f.id === id ? { ...f, name: newName } : f))
            )
          }
        />

<div className="flex flex-col flex-1 overflow-hidden">
  {/* Tabs */}
  <Tabs
    tabs={openTabs}
    activeFileId={activeFile?.id || ""}
    onTabClick={(file) => setActiveFile(file)}
    onClose={closeFile}
  />

  {/* Run Button */}
  <div className="flex justify-end bg-gray-800 p-2">
    <button
      onClick={runCode}
      className="bg-green-500 px-3 py-1 rounded hover:bg-green-600"
    >
      Run
    </button>
  </div>

  {/* Editor + Terminal */}
  <div className="flex flex-col flex-1 overflow-hidden">
    {/* Editor Section */}
    <div className="flex-1 overflow-auto">
      {activeFile ? (
        <CodeEditor fileId={activeFile.id} slug={slug} />
      ) : (
        <div className="flex flex-1 items-center justify-center text-gray-400">
          Open a file to start editing
        </div>
      )}
    </div>

    {/* Terminal Section */}
    <div className="h-52 border-t border-gray-700 bg-black">
    <Terminal ref={terminalRef} roomId={slug} />

    </div>
  </div>
</div>

      </div>
    </div>
  );
}
