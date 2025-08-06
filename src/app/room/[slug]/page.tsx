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
import LivePreviewModal from '@/components/LivePreviewModal';
import { MonitorDot, Redo, Undo } from 'lucide-react';

export default function RoomPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { data: session, status } = useSession();

  const [ files, setFiles] = useState<FileData[]>([]);
  const [ roomName, setRoomName ] = useState<string>("");
  const [ openTabs, setOpenTabs ] = useState<FileData[]>([]);
  const [ activeFile, setActiveFile ] = useState<FileData | null>(null);
  const [ theme, setTheme ] = useState("vs-dark");
  const [ isSaving, setIsSaving ] = useState(false);
  const [ isTyping, setIsTyping ] = useState(false);
  const [ terminalHeight, setTerminalHeight ] = useState(40); 
  const [ terminalExpanded, setTerminalExpanded ] = useState(false);
  const [ previewOpen, setPreviewOpen ] = useState(false);
  const [ htmlCode, setHtmlCode ] = useState('');
  const [ cssCode, setCssCode ] = useState('');
  const [ jsCode, setJsCode ] = useState('');
  const [cssFileName, setCssFileName] = useState('');
  const [jsFileName, setJsFileName] = useState('');
  const terminalRef = useRef<TerminalRef>(null);
  const editorRef = useRef<any>(null);

  useEffect(() => {
    const loadRoomAndFiles = async () => {
      try {
        const roomRes = await fetch(`/api/room/${slug}`);
        const roomData = await roomRes.json();
        setRoomName(roomData.name);
      } catch {
        setRoomName(slug);
      }
  
      try {
        const filesRes = await fetch(`/api/room/${slug}/files`);
        const filesData = await filesRes.json();
        const normalized = filesData.map((f: any) => ({
          ...f,
          type: f.type === "folder" ? "folder" : "file"
        }));
        setFiles(normalized);
      } catch (error) {
        console.error("Failed to load files:", error);
      }
    };
  
    loadRoomAndFiles();
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
  

  const openFile = async (file: FileData) => {
    if (!openTabs.find((f) => f.id === file.id)) {
      setOpenTabs((prev) => [...prev, file]);
    }
    setActiveFile(file);
  };

  const hasHtml = openTabs.some(f => f.name.endsWith('.html'));
  const hasCss = openTabs.some(f => f.name.endsWith('.css'));
  const hasJs = openTabs.some(f => f.name.endsWith('.js'));


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

  function extractReferencedFiles(html: string) {
    const jsMatches = Array.from(html.matchAll(/<script\s+[^>]*src=["']([^"']+)["']/gi));
    const cssMatches = Array.from(html.matchAll(/<link\s+[^>]*href=["']([^"']+)["']/gi));
  
    return {
      jsFiles: jsMatches.map(m => m[1].trim()),
      cssFiles: cssMatches.map(m => m[1].trim()),
    };
  }  
  

  const handlePreview = async () => {
    const htmlFile = openTabs.find(f => f.name.endsWith('.html'));
    if (!htmlFile) return;
  
    const htmlRes = await fetch(`/api/file/${htmlFile.id}`);
    const htmlData = await htmlRes.json();
    const htmlContent = htmlData.content;
  
    // 🧠 Extract linked file names
    const { cssFiles, jsFiles } = extractReferencedFiles(htmlContent);
    const cssHref = cssFiles[0] ?? '';
    const jsSrc = jsFiles[0] ?? '';

    setCssFileName(cssHref);
    setJsFileName(jsSrc);  

    const cssFile = openTabs.find(f => cssHref.endsWith(f.name));
    const jsFile = openTabs.find(f => jsSrc.endsWith(f.name));

    let cssContent = '';
    let jsContent = '';

    try {
      if (cssFile) {
        const cssRes = await fetch(`/api/file/${cssFile.id}`);
        const cssData = await cssRes.json();
        cssContent = cssData.content || '';
      }

      if (jsFile) {
        const jsRes = await fetch(`/api/file/${jsFile.id}`);
        const jsData = await jsRes.json();
        jsContent = jsData.content || '';
      }

      const jsFilesMap: Record<string, string> = {};
        await Promise.all(
          openTabs
            .filter(f => f.name.endsWith('.js'))
            .map(async (f) => {
              const res = await fetch(`/api/file/${f.id}`);
              const data = await res.json();
              jsFilesMap[f.name] = data.content || '';
            })
        );


      if (jsFile && jsSrc) {
        const jsExecRes = await fetch('/api/exec', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            language: 'javascript',
            entry: jsSrc,
            files: jsFilesMap,
            mode: 'preview'
          }),
        });
        
  
        const execData = await jsExecRes.json();
        const existing = files.find(f => f.name === 'package.json');
        const packageContent = JSON.stringify(execData.packageJson, null, 2);

        if (existing) {
          // Update case
          const updateRes = await fetch(`/api/file/${existing.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: packageContent }),
          });
          const updated = await updateRes.json();
          setFiles(prev => prev.map(f => f.id === existing.id ? updated : f));
        } else {
          // Create case
          const createRes = await fetch(`/api/room/${slug}/files`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: 'package.json',
              content: packageContent,
              type: 'file',
              parentId: null,
              roomSlug: slug,
            }),
          });
          const newFile = await createRes.json();
          setFiles(prev => [...prev, newFile]);
          setOpenTabs(prev => [...prev, newFile]);
        }
      }
    } catch (error) {
      console.warn("Failed to load linked files:", error);
    }

      setHtmlCode(htmlContent);
      setCssCode(cssContent);
      setJsCode(jsContent);
      setPreviewOpen(true);
    };

  const runCode = async () => {
    if (!activeFile) return;

    if (!terminalExpanded) {
      setTerminalHeight(220); // default expanded height
      setTerminalExpanded(true);
    }

    let output = "", error = "";

    // Expand terminal only on first run
    let fileContent = '';
    try {
      // Step 1: Gather all file contents from open tabs
      const filesToFetch = [...openTabs];
      const fileMap: Record<string, string> = {};
      let entry = activeFile.name;

      await Promise.all(
        filesToFetch.map(async(file) => {
          try {
            const res = await fetch(`/api/file/${file.id}`);
            const fileData = await res.json();
            fileMap[file.name] = fileData.content || "";
          } catch(error) {
            console.warn(`Failed to fetch ${file.name}:`, error);
          }
        })
      )

      // Step 2: Call the execution API
      const execRes = await fetch('/api/exec', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: getLanguage(activeFile.name),
          files: fileMap,
          entry
        }),
      });

      const data = await execRes.json();
      output = data.output;
      error = data.error;

       // Step 3: Show it locally in the Terminal component
       terminalRef.current?.runCode(getLanguage(activeFile.name), fileMap[entry]);

      // Step 4: Emit to other users
      const username = session?.user.name || "Unknown user";
      const timeStamp = new Date().toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });

      const socket = getSocket();
      socket.emit('terminal-output', {
        roomId: slug,
        output,
        error,
        ranBy: username,
        timeStamp
      });

    } catch (error) {
      console.error("Execution failed:", error);
    }
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

          {/* Editor Toolbar */}
          <div className="flex items-center justify-between bg-[#1e1e1e] px-4 py-2 border-b border-[#333] shadow-inner">
            {/* Status & History Controls */}
            <div className="flex items-center gap-4">
              {/* Save Status */}
              <div className="text-xs">
                {isTyping || isSaving ? (
                  <span className="text-green-400 animate-pulse">Saving...</span>
                ) : (
                  <span className="text-gray-500">Saved</span>
                )}
              </div>

              {/* Undo / Redo */}
              <div className='flex items-center gap-1'>
                <button
                  className="flex items-center gap-1 text-sm font-medium text-white bg-neutral-800 hover:bg-neutral-700 px-2 py-1.5 rounded-md shadow transition"
                  onClick={() => editorRef.current?.trigger('', 'undo', null)}
                >
                  <Undo className='w-4 h-4' />
                </button>
                <button
                  className="flex items-center gap-1 text-sm font-medium text-white bg-neutral-800 hover:bg-neutral-700 px-2 py-1.5 rounded-md shadow transition"
                  onClick={() => editorRef.current?.trigger('', 'redo', null)}
                >
                  <Redo className='w-4 h-4' />
                </button>
              </div>
            
            </div>

            {/* Editor Actions */}
            <div className="flex items-center gap-3">

              <ThemeSelector theme={theme} setTheme={setTheme} />

              {hasHtml && hasCss && hasJs ? (
                <button
                  onClick={handlePreview}
                  className="flex items-center gap-2 bg-gradient-to-br from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 active:scale-[0.96] text-sm font-semibold px-4 py-1.5 rounded-md shadow-md transition-transform duration-150 cursor-pointer"
                >
                  <MonitorDot className="w-4 h-4" /> Preview
                </button>
              ) : (
                <button
                  onClick={runCode}
                  className="flex items-center gap-2 bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 active:scale-[0.96] text-sm font-semibold px-4 py-1.5 rounded-md shadow-md transition-transform duration-150 cursor-pointer"
                >
                  ▶ Run
                </button>
              )}
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
                editorRef={editorRef}
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
      {previewOpen && (
        <LivePreviewModal
          html={htmlCode}
          css={cssCode}
          js={jsCode}
          cssFileName={cssFileName}
          jsFileName={jsFileName}
          onClose={() => setPreviewOpen(false)}
        />
      )}
    </div>
  );
}
