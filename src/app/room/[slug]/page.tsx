'use client';

import { use } from 'react';
import CodeEditor from "@/components/Editor";
import Navbar from "@/components/Navbar";
import EditorFIlePanel from "@/components/EditorFilePanel";
import Tabs from "@/components/Tabs";
import Terminal, { TerminalRef } from "@/components/Terminal";
import { getSocket } from "@/lib/socket";
import { useSession } from "next-auth/react";
import { useEffect, useState, useRef } from "react";
import type { FileData } from "@/types/FileData";
import { Play } from 'lucide-react';

export default function RoomPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { data: session, status } = useSession();

  const [ files, setFiles] = useState<FileData[]>([]);
  const [ roomName, setRoomName ] = useState<string>("");
  const [ openTabs, setOpenTabs ] = useState<FileData[]>([]);
  const [ activeFile, setActiveFile ] = useState<FileData | null>(null);
  const terminalRef = useRef<TerminalRef>(null);

  useEffect(() => {
    fetch(`/api/room/${slug}`)
    .then((res) => res.json())
    .then((data) => setRoomName(data.name))
    .catch(() => setRoomName(slug));

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
    if (status !== "authenticated" || !session?.user?.id) return;
  
    const socket = getSocket();
  
    socket.emit("join-room", {
      roomId: slug,
      user: {
        id: session.user.id,
        name: session.user.name || "Anonymous",
        image: session.user.image || null,
        email: session.user.email || null,
      },
    });
  }, [slug, session, status]);
  

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
    <div className="flex flex-col h-screen bg-[#1a1a1a] text-white font-sans">
  {/* Header/Navbar */}
  <Navbar roomSlug={slug} roomName={roomName} />

  {/* Main Body */}
  <div className="flex flex-1 overflow-hidden">

    {/* File Panel */}
    <EditorFIlePanel
      files={files}
      onFileClick={openFile}
      slug={slug}
      activeFileId={activeFile?.id || null}
      onFileAdded={(file) =>
        setFiles((prev) => (prev.find((f) => f.id === file.id) ? prev : [...prev, file]))
      }
      onFileDeleted={(id) => setFiles((prev) => prev.filter((f) => f.id !== id))}
      onFileRenamed={(id, newName) =>
        setFiles((prev) =>
          prev.map((f) => (f.id === id ? { ...f, name: newName } : f))
        )
      }
    />

    {/* Code Editor Section */}
    <div className="flex flex-col flex-1 overflow-hidden border-l border-gray-700">

      {/* Tabs */}
      <Tabs
        tabs={openTabs}
        activeFileId={activeFile?.id || ""}
        onTabClick={(file) => setActiveFile(file)}
        onClose={closeFile}
      />

      {/* Run Button */}
      <div className="flex justify-end bg-[#1e1e1e] px-4 py-2 border-b border-[#333] shadow-inner">
        <button
          onClick={runCode}
          className="flex items-center gap-2 bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 active:scale-[0.96] text-sm font-semibold px-4 py-1.5 rounded-md shadow-md transition-transform duration-150 cursor-pointer"
        >
          ▶ Run
        </button>
      </div>


      {/* Editor + Terminal */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Editor View */}
        <div className="flex-1 overflow-auto bg-[#1e1e1e]">
        {session && activeFile ? (
          <CodeEditor
            slug={slug}
            fileId={activeFile.id}
            user={{
              id: session.user.id,
              name: session.user.name || "Anonymous",
              image: session.user.image,
            }}
          />
        
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500 text-sm">
            Select or create a file to start coding
          </div>
        )}
        </div>

        {/* Terminal */}
        <div className="h-52 border-t border-gray-700 bg-black">
          <Terminal ref={terminalRef} roomId={slug} />
        </div>
      </div>
    </div>
  </div>
</div>

  );
}
