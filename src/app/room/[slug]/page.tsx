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
import ThemeSelector from '@/components/ThemeSelector';

export default function RoomPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { data: session, status } = useSession();

  const [ files, setFiles] = useState<FileData[]>([]);
  const [ roomName, setRoomName ] = useState<string>("");
  const [ openTabs, setOpenTabs ] = useState<FileData[]>([]);
  const [ activeFile, setActiveFile ] = useState<FileData | null>(null);
  const [theme, setTheme] = useState("vs-dark");
  const [isSaving, setIsSaving] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [terminalHeight, setTerminalHeight] = useState(40); 
  const [terminalExpanded, setTerminalExpanded] = useState(false);
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

    if (!terminalExpanded) {
      setTerminalHeight(220); // default expanded height
      setTerminalExpanded(true);
    }

    // Expand terminal only on first run
    const res = await fetch(`/api/file/${activeFile.id}`);
    const file = await res.json();

    const execRes = await fetch('/api/exec', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language: getLanguage(activeFile.name),
        code: file.content,
      }),
    });
  
    const data = await execRes.json();
    const { output, error } = data;
    
    // Show it locally
    terminalRef.current?.runCode(getLanguage(activeFile.name), file.content);

    // Get current user info
    const username = session?.user.name || "Unknown user";
    const timeStamp = new Date().toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    })
    

    // Emit output to the room
    const socket = getSocket();
    socket.emit('terminal-output', {
      roomId: slug, // slug is your room ID
      output,
      error,
      ranBy: username,
      timeStamp
    });
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
      <div className="flex items-center justify-between bg-[#1e1e1e] px-4 py-2 border-b border-[#333] shadow-inner">
        <div className='text-xs'>
          {isTyping || isSaving ? (
            <span className='text-green-400 animate-pulse'>Saving...</span>
          ) : (
            <span className='text-gray-500'>Saved</span>
          )}
        </div>

        <div className='flex items-center gap-3'>
            <ThemeSelector theme={theme} setTheme={setTheme} />
            <button
              onClick={runCode}
              className="flex items-center gap-2 bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 active:scale-[0.96] text-sm font-semibold px-4 py-1.5 rounded-md shadow-md transition-transform duration-150 cursor-pointer"
            >
              ▶ Run
            </button>
        </div>
      </div>


      {/* Editor + Terminal */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Editor View */}
        <div className="flex-1 overflow-auto bg-[#1e1e1e]"
        style={{ height: 'calc(100% - 40px)', pointerEvents: 'auto' }}>
        {session && activeFile ? (
          <CodeEditor
            slug={slug}
            fileId={activeFile.id}
            user={{
              id: session.user.id,
              name: session.user.name || "Anonymous",
              image: session.user.image,
            }}
            theme={theme}
            setIsSaving={setIsSaving}
            setIsTyping={setIsTyping}
          />
        
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500 text-sm">
            Select or create a file to start coding
          </div>
        )}
        </div>

        {/* Terminal */}
        <div style={{ height: terminalHeight }} className="relative border-t border-gray-700">
          <Terminal
            ref={terminalRef}
            roomId={slug}
            height={terminalHeight}
            setHeight={setTerminalHeight}
             isExpanded={terminalExpanded}
          />
        </div>
      </div>
    </div>
  </div>
</div>

  );
}
