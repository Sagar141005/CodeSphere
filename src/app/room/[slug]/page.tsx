"use client";

import { use } from "react";
import CodeEditor from "@/components/room/Editor";
import Navbar from "@/components/room/RoomNavbar";
import TabbedSidebar from "@/components/room/TabbedSidebar";
import Tabs from "@/components/room/Tabs";
import Terminal, { TerminalRef } from "@/components/room/Terminal";
import { getSocket } from "@/lib/socket";
import { useSession } from "next-auth/react";
import { useEffect, useState, useRef } from "react";
import clsx from "clsx";
import type { FileData } from "@/types/FileData";
import ThemeSelector from "@/components/room/ThemeSelector";
import LivePreviewPane from "@/components/room/LivePreviewModal";
import {
  Check,
  Loader2,
  Maximize2,
  MessageSquareQuote,
  Minimize2,
  MonitorDot,
  Play,
  Redo,
  Undo,
  X,
} from "lucide-react";
import DiffView from "@/components/room/DiffView";
import { useRouter } from "next/navigation";
import MobileBlocker from "@/components/MobileBlocker";
import { Loader } from "@/components/Loader";
import toast from "react-hot-toast";

type Diff = {
  id: string;
  name: string;
  language: string;
  oldContent: string;
  content: string;
};

type Commit = {
  id: string;
  message: string;
  createdAt: string;
  user: { name: string; [key: string]: any };
  files: Diff[];
};

export default function RoomPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { data: session, status } = useSession();
  const router = useRouter();

  const [isSmallScreen, setIsSmallScreen] = useState<boolean | null>(null);
  const [files, setFiles] = useState<FileData[]>([]);
  const [roomName, setRoomName] = useState<string>("");
  const [roomId, setRoomId] = useState<string>("");
  const [openTabs, setOpenTabs] = useState<FileData[]>([]);
  const [activeFile, setActiveFile] = useState<FileData | null>(null);
  const [theme, setTheme] = useState("vs-dark");
  const [isSaving, setIsSaving] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [terminalHeight, setTerminalHeight] = useState(40);
  const [terminalExpanded, setTerminalExpanded] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [htmlCode, setHtmlCode] = useState("");
  const [cssCode, setCssCode] = useState("");
  const [jsCode, setJsCode] = useState("");
  const [cssFileName, setCssFileName] = useState("");
  const [jsFileName, setJsFileName] = useState("");
  const [diffs, setDiffs] = useState<Diff[]>([]);
  const [currentCommit, setCurrentCommit] = useState<Commit | null>(null);
  const [showDiffModal, setShowDiffModal] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const [pendingApplyRange, setPendingApplyRange] = useState<any>(null);
  const [diffSource, setDiffSource] = useState<"commit" | "ai" | null>(null);
  const [aiOutput, setAiOutput] = useState<string | null>(null);
  const [aiExpanded, setAiExpanded] = useState(false);
  const [aiHeight, setAiHeight] = useState(200);
  const [loading, setLoading] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [execError, setExecError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const terminalRef = useRef<TerminalRef>(null);
  const editorRef = useRef<any>(null);
  const previewDebounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status]);

  useEffect(() => {
    const checkScreen = () => setIsSmallScreen(window.innerWidth < 1024);
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  useEffect(() => {
    if (!slug || status !== "authenticated" || !session?.user?.id) return;

    const socket = getSocket();

    socket.emit("join-room", {
      roomId: roomId,
      user: {
        id: session.user.id,
        name: session.user.name || "Anonymous",
        image: session.user.image || null,
        email: session.user.email || null,
      },
    });
  }, [slug, session, status, roomId]);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);

    const loadRoomAndFiles = async () => {
      try {
        const roomRes = await fetch(`/api/room/${slug}`);
        const roomData = await roomRes.json();
        setRoomName(roomData.name);
        setRoomId(roomData.id);
      } catch {
        setRoomName(slug);
      } finally {
        setLoading(false);
      }

      try {
        const filesRes = await fetch(`/api/room/${slug}/files`);
        const filesData = await filesRes.json();
        const normalized = filesData.map((f: any) => ({
          ...f,
          type: f.type === "folder" ? "folder" : "file",
        }));
        setFiles(normalized);
      } catch (error) {
        console.error("Failed to load files:", error);
      }
    };

    loadRoomAndFiles();
  }, [slug]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        setIsSidebarOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const openFile = async (file: FileData) => {
    if (!openTabs.find((f) => f.id === file.id)) {
      setOpenTabs((prev) => [...prev, file]);
    }
    setActiveFile(file);
  };

  const hasHtml = openTabs.some((f) => f.name.endsWith(".html"));
  const hasCss = openTabs.some((f) => f.name.endsWith(".css"));
  const hasJs = openTabs.some((f) => f.name.endsWith(".js"));

  const closeFile = (fileId: string) => {
    setOpenTabs((prev) => prev.filter((f) => f.id !== fileId));
    if (activeFile?.id === fileId) {
      const remaining = openTabs.filter((f) => f.id !== fileId);
      setActiveFile(
        remaining.length > 0 ? remaining[remaining.length - 1] : null
      );
    }
  };

  const getLanguage = (filename: string) => {
    if (filename.endsWith(".js")) return "javascript";
    if (filename.endsWith(".py")) return "python";
    if (filename.endsWith(".cpp")) return "cpp";
    if (filename.endsWith(".c")) return "c";
    if (filename.endsWith(".java")) return "java";
    return "javascript";
  };

  function extractReferencedFiles(html: string) {
    const jsMatches = Array.from(
      html.matchAll(/<script\s+[^>]*src=["']([^"']+)["']/gi)
    );
    const cssMatches = Array.from(
      html.matchAll(/<link\s+[^>]*href=["']([^"']+)["']/gi)
    );

    return {
      jsFiles: jsMatches.map((m) => m[1].trim()),
      cssFiles: cssMatches.map((m) => m[1].trim()),
    };
  }

  const handleEditorChange = (newCode: string) => {
    if (!previewOpen || !activeFile) return;

    if (previewDebounceRef.current) clearTimeout(previewDebounceRef.current);

    previewDebounceRef.current = setTimeout(() => {
      if (activeFile.name.endsWith(".html")) {
        setHtmlCode(newCode);
      } else if (activeFile.name.endsWith(".css")) {
        setCssCode(newCode);
      } else if (activeFile.name.endsWith(".js")) {
        setJsCode(newCode);
      }
    }, 1000);
  };

  const handlePreview = async () => {
    const htmlFile = openTabs.find((f) => f.name.endsWith(".html"));
    if (!htmlFile) {
      toast.error("No HTML file found to preview.");
      return;
    }

    setExecuting(true);

    try {
      const htmlRes = await fetch(`/api/file/${htmlFile.id}`);
      if (!htmlRes.ok) throw new Error("Failed to fetch HTML file");
      const htmlData = await htmlRes.json();
      const htmlContent = htmlData.content || "";

      let cssContent = "";
      let jsContent = "";
      let foundCssName = "";
      let foundJsName = "";

      try {
        const { cssFiles, jsFiles } = extractReferencedFiles(htmlContent);
        const cssHref = cssFiles[0] ?? "";
        const jsSrc = jsFiles[0] ?? "";

        foundCssName = cssHref;
        foundJsName = jsSrc;

        const cssFile = openTabs.find((f) => cssHref.endsWith(f.name));
        const jsFile = openTabs.find((f) => jsSrc.endsWith(f.name));

        if (cssFile) {
          const cssRes = await fetch(`/api/file/${cssFile.id}`);
          if (cssRes.ok) {
            const cssData = await cssRes.json();
            cssContent = cssData.content || "";
          }
        }

        if (jsFile && jsSrc) {
          const jsRes = await fetch(`/api/file/${jsFile.id}`);
          if (jsRes.ok) {
            const jsData = await jsRes.json();
            jsContent = jsData.content || "";
          }

          const jsFilesMap: Record<string, string> = {};
          await Promise.all(
            openTabs
              .filter((f) => f.name.endsWith(".js"))
              .map(async (f) => {
                try {
                  const res = await fetch(`/api/file/${f.id}`);
                  if (res.ok) {
                    const data = await res.json();
                    jsFilesMap[f.name] = data.content || "";
                  }
                } catch (e) {
                  console.warn(`Skipping file ${f.name} in bundler:`, e);
                }
              })
          );

          try {
            const jsExecRes = await fetch(
              `${process.env.NEXT_PUBLIC_BACKEND_URL!}/api/exec`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  language: "javascript",
                  entry: jsSrc,
                  files: jsFilesMap,
                  mode: "preview",
                }),
              }
            );

            if (jsExecRes.ok) {
              const execData = await jsExecRes.json();
              if (execData.error) {
                console.error("Bundler error:", execData.error);
                setExecError(execData.error);
              } else {
                setExecError(null);

                if (execData.packageJson) {
                  updatePackageJson(
                    execData.packageJson,
                    slug,
                    files,
                    setFiles
                  ).catch((err) =>
                    console.warn("Failed to update package.json", err)
                  );
                }
              }
            }
          } catch (bundleErr) {
            console.error("Bundling request failed:", bundleErr);
          }
        }
      } catch (linkedFileError) {
        console.warn("Soft error loading linked files:", linkedFileError);
      }

      setHtmlCode(htmlContent);
      setCssCode(cssContent);
      setJsCode(jsContent);
      setCssFileName(foundCssName);
      setJsFileName(foundJsName);
      setPreviewOpen(true);
    } catch (criticalError) {
      console.error("Critical preview error:", criticalError);
      toast.error("Failed to load preview.");
    } finally {
      setExecuting(false);
    }
  };

  const updatePackageJson = async (
    packageJsonContent: any,
    roomSlug: string,
    currentFiles: FileData[],
    updateFilesState: any
  ) => {
    const contentStr = JSON.stringify(packageJsonContent, null, 2);
    const existing = currentFiles.find((f) => f.name === "package.json");

    if (existing) {
      await fetch(`/api/file/${existing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: contentStr }),
      });
    } else {
      const createRes = await fetch(`/api/room/${roomSlug}/files`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "package.json",
          content: contentStr,
          type: "file",
          parentId: null,
          roomSlug: roomSlug,
        }),
      });
      const newFile = await createRes.json();
      updateFilesState((prev: any[]) => [...prev, newFile]);
    }
  };

  const runCode = async () => {
    if (!activeFile) return;

    if (!terminalExpanded) {
      setTerminalHeight(220);
      setTerminalExpanded(true);
    }

    terminalRef.current?.setRunning(true);

    try {
      const filesToFetch = [...openTabs];
      const fileMap: Record<string, string> = {};
      let entry = activeFile.name;

      await Promise.all(
        filesToFetch.map(async (file) => {
          try {
            const res = await fetch(`/api/file/${file.id}`);
            const fileData = await res.json();
            fileMap[file.name] = fileData.content || "";
          } catch (error) {
            console.warn(`Failed to fetch ${file.name}:`, error);
          }
        })
      );

      const execRes = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL!}/api/exec`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            language: getLanguage(activeFile.name),
            files: fileMap,
            entry,
            mode: "execute",
          }),
        }
      );

      const data = await execRes.json();
      const output = data.stdout?.trim();
      const error = data.stderr?.trim();

      setLastError(error || null);

      if (error) {
        terminalRef.current?.displayOutput(error, "error");
      }

      if (output) {
        terminalRef.current?.displayOutput(output, "success");
      }
      const username = session?.user.name || "Unknown user";
      const timeStamp = new Date().toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      });

      const socket = getSocket();
      socket.emit("terminal-output", {
        roomId: roomId,
        output,
        error,
        ranBy: username,
        timeStamp,
      });
    } catch (error) {
      console.error("Execution failed:", error);
      terminalRef.current?.displayOutput("Execution failed.", "error");
      toast.error("Failed to run code.");
    } finally {
      terminalRef.current?.setRunning(false);
    }
  };

  const fetchCommitDetails = async (commitId: string) => {
    const res = await fetch(`/api/room/${slug}/commit/${commitId}`);
    if (!res.ok) throw new Error("Cannot fetch commit");
    return res.json();
  };

  const explainSelection = async () => {
    const editor = editorRef.current;
    if (!editor) return;

    const selection = editor.getModel()?.getValueInRange(editor.getSelection());
    if (!selection || selection.trim().length === 0) {
      toast.error("Please select some code first.");
      return;
    }

    try {
      const res = await fetch("/api/ai/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: selection,
          language: getLanguage(activeFile?.name || "javascript"),
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to get explanation");
      }

      const data = await res.json();

      setAiOutput(data.explanation);
      setAiExpanded(true);
    } catch (error) {
      console.error(error);
      toast.error("Failed to explain the selected code.");
    }
  };

  const refactorSelection = async () => {
    const editor = editorRef.current;
    if (!editor) return;

    const selectionRange = editor.getSelection();
    const selection = editor.getModel()?.getValueInRange(selectionRange);
    if (!selection || selection.trim().length === 0) {
      toast.error("Please select some code first.");
      return;
    }

    try {
      const res = await fetch("/api/ai/refactor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: selection,
          language: getLanguage(activeFile?.name || "javascript"),
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to get explanation");
      }

      const data = await res.json();
      setDiffs([
        {
          id: "ai-change",
          name: activeFile?.name || "current-file",
          oldContent: selection,
          content: data.result,
          language: getLanguage(activeFile?.name || "javascript"),
        },
      ]);

      setPendingApplyRange(selectionRange);
      setDiffSource("ai");
      setShowDiffModal(true);
    } catch (error) {
      console.error(error);
      toast.error("Failed to refactor the selected code.");
    }
  };

  const addCommentsToSelection = async () => {
    const editor = editorRef.current;
    if (!editor) return;

    const selection = editor.getModel()?.getValueInRange(editor.getSelection());
    const codeToComment =
      selection && selection.trim().length > 0 ? selection : editor.getValue();

    try {
      const res = await fetch("/api/ai/comment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: codeToComment,
          language: getLanguage(activeFile?.name || "javascript"),
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to get explanation");
      }

      const data = await res.json();
      if (selection && selection.trim().length > 0) {
        editor.executeEdits("", [
          { range: editor.getSelection(), text: data.result },
        ]);
      } else {
        editor.setValue(data.result);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to comment the code.");
    }
  };

  const fixErrorsInFile = async () => {
    const editor = editorRef.current;
    if (!editor) return;

    const currentCode = editor.getValue();
    if (!lastError) {
      toast.error("No error to fix. Run the code first.");
      return;
    }

    try {
      const res = await fetch("/api/ai/fix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: currentCode,
          language: getLanguage(activeFile?.name || "javascript"),
          error: lastError,
        }),
      });

      if (!res.ok) {
        const e = await res.json();
        throw new Error(e.error || "Could not fix this error");
      }

      const data = await res.json();
      setDiffs([
        {
          id: "ai-error-fix",
          name: activeFile?.name || "current-file",
          oldContent: currentCode,
          content: data.result,
          language: getLanguage(activeFile?.name || "javascript"),
        },
      ]);

      const fullRange = editor.getModel()?.getFullModelRange();
      setPendingApplyRange(fullRange);
      setDiffSource("ai");
      setShowDiffModal(true);

      setLastError(null);
    } catch (error) {
      toast.error("Failed to apply AI fix.");
    }
  };

  const handleResize = (
    e: React.MouseEvent,
    startHeight: number,
    setHeight: (h: number) => void,
    min = 40,
    max = 500
  ) => {
    const startY = e.clientY;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const delta = moveEvent.clientY - startY;
      const newHeight = Math.max(min, Math.min(max, startHeight - delta));
      setHeight(newHeight);
    };

    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  if (isSmallScreen === null) {
    return null;
  }

  if (isSmallScreen) {
    return <MobileBlocker />;
  }

  if (status === "loading" || loading) return <Loader />;

  if (!slug) {
    return <Loader />;
  }

  return (
    <div className="flex flex-col h-screen bg-neutral-950 text-neutral-50 overflow-hidden font-sans selection:bg-blue-500/30">
      {/* Header/Navbar */}
      <Navbar
        roomSlug={slug}
        roomName={roomName}
        handleExplain={explainSelection}
        handleRefactor={refactorSelection}
        handleComments={addCommentsToSelection}
        handleFix={fixErrorsInFile}
        roomId={roomId}
      />

      {/* Main Body */}
      <div className="flex flex-1 overflow-hidden">
        <div
          className={clsx(
            "flex-shrink-0 overflow-hidden transition-all duration-300 ease-in-out",
            isSidebarOpen ? "w-64 opacity-100" : "w-0 opacity-0"
          )}
        >
          {/* File Panel */}
          <TabbedSidebar
            files={files}
            onFileClick={openFile}
            slug={slug}
            roomId={roomId}
            activeFileId={activeFile?.id || null}
            onFileAdded={(file) =>
              setFiles((prev) =>
                prev.find((f) => f.id === file.id) ? prev : [...prev, file]
              )
            }
            onFileDeleted={(id) =>
              setFiles((prev) => prev.filter((f) => f.id !== id))
            }
            onFileRenamed={(id, newName) =>
              setFiles((prev) =>
                prev.map((f) => (f.id === id ? { ...f, name: newName } : f))
              )
            }
            onPreview={async (commitId: string) => {
              try {
                const commitData = await fetchCommitDetails(commitId);
                setCurrentCommit(commitData);
                setDiffs(commitData.files);
                setDiffSource("commit");
                setShowDiffModal(true);
              } catch (err) {
                console.error("Failed to fetch commit:", err);
              }
            }}
          />
        </div>

        {/* Code Editor Section */}
        <div className="flex flex-col flex-1 overflow-hidden border-l border-neutral-800">
          {/* Tabs */}
          <Tabs
            tabs={openTabs}
            activeFileId={activeFile?.id || ""}
            onTabClick={(file) => setActiveFile(file)}
            onClose={closeFile}
          />

          {/* Editor Toolbar */}
          <div className="flex items-center justify-between bg-neutral-900 px-4 py-2 border-b border-neutral-800 shadow-sm h-12">
            {/* Status & History Controls */}
            <div className="flex items-center gap-4">
              {/* Save Status */}
              <div className="text-xs w-16">
                {isTyping || isSaving ? (
                  <span className="text-blue-400 animate-pulse flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" /> Saving
                  </span>
                ) : (
                  <span className="text-neutral-500 flex items-center gap-1">
                    <Check className="w-3 h-3" /> Saved
                  </span>
                )}
              </div>

              {/* Undo / Redo */}
              <div className="flex items-center gap-1">
                <button
                  className="flex items-center gap-1 text-sm font-medium text-neutral-400 hover:text-neutral-100 bg-neutral-800 hover:bg-neutral-700 p-1.5 rounded transition cursor-pointer"
                  onClick={() => editorRef.current?.trigger("", "undo", null)}
                  title="Undo"
                >
                  <Undo className="w-4 h-4" />
                </button>
                <button
                  className="flex items-center gap-1 text-sm font-medium text-neutral-400 hover:text-neutral-100 bg-neutral-800 hover:bg-neutral-700 p-1.5 rounded transition cursor-pointer"
                  onClick={() => editorRef.current?.trigger("", "redo", null)}
                  title="Redo"
                >
                  <Redo className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Editor Actions */}
            <div className="flex items-center gap-3">
              <ThemeSelector theme={theme} setTheme={setTheme} />

              {hasHtml && hasCss && hasJs ? (
                <button
                  onClick={handlePreview}
                  disabled={executing}
                  className={`flex items-center gap-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white
                  text-xs font-bold px-3 py-1.5 rounded-lg transition-all shadow-sm
                  ${executing ? "opacity-50 cursor-not-allowed" : ""}
                `}
                >
                  {executing ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <MonitorDot className="w-3.5 h-3.5" />
                  )}
                  Preview
                </button>
              ) : (
                <button
                  onClick={runCode}
                  className="flex items-center gap-2 text-white bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700
                  px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm"
                >
                  <Play className="w-3.5 h-3.5 fill-current" /> Run
                </button>
              )}
            </div>
          </div>

          {/* Editor + Terminal */}
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Editor View */}
            <div
              className="flex-1 overflow-hidden bg-neutral-950"
              style={{ height: "calc(100% - 40px)", pointerEvents: "auto" }}
            >
              {session && activeFile ? (
                <CodeEditor
                  roomId={roomId}
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
                  onCodeChange={handleEditorChange}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-neutral-500 text-sm italic">
                  Select a file to start coding
                </div>
              )}
            </div>

            {/* Terminal / AI Output */}
            <div className="relative border-t border-neutral-800 bg-neutral-950">
              {aiOutput ? (
                <div
                  style={{ height: aiExpanded ? aiHeight : 40 }}
                  className="relative w-full flex flex-col bg-neutral-950 group border-t border-neutral-800"
                >
                  {/* Drag Handle */}
                  {aiExpanded && (
                    <div
                      onMouseDown={(e) =>
                        handleResize(e, aiHeight, setAiHeight, 40, 500)
                      }
                      className="absolute top-0 left-0 w-full h-1 cursor-row-resize bg-transparent hover:bg-blue-500/50 z-10 transition-colors"
                      title="Drag to resize"
                    />
                  )}

                  {/* Header */}
                  <div className="flex items-center justify-between px-4 h-10 border-b border-neutral-800 bg-neutral-900">
                    <div className="flex items-center gap-2">
                      <div className="p-1 bg-neutral-800 rounded text-neutral-400">
                        <MessageSquareQuote className="w-3.5 h-3.5 text-blue-400" />
                      </div>
                      <span className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                        AI Assistant
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setAiExpanded(!aiExpanded)}
                        className="p-1 rounded text-neutral-500 hover:text-neutral-200 hover:bg-neutral-800 transition"
                      >
                        {aiExpanded ? (
                          <Minimize2 className="w-3.5 h-3.5" />
                        ) : (
                          <Maximize2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <button
                        onClick={() => setAiOutput(null)}
                        className="p-1 rounded text-neutral-500 hover:text-red-400 hover:bg-neutral-800 transition"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Content */}
                  {aiExpanded && (
                    <div className="p-4 overflow-auto flex-1 text-sm text-neutral-300 bg-neutral-950 font-mono leading-relaxed">
                      <pre className="whitespace-pre-wrap break-words">
                        {aiOutput}
                      </pre>
                    </div>
                  )}
                </div>
              ) : (
                <Terminal
                  ref={terminalRef}
                  roomId={roomId}
                  height={terminalHeight}
                  setHeight={setTerminalHeight}
                  isExpanded={terminalExpanded}
                  handleResize={handleResize}
                />
              )}
            </div>
          </div>
        </div>

        <div
          className={clsx(
            "flex-shrink-0 overflow-hidden transition-all duration-300 ease-in-out bg-neutral-950",
            previewOpen
              ? "w-[40%] opacity-100 border-l border-neutral-800"
              : "w-0 opacity-0 border-l-0"
          )}
        >
          {/* We keep the component mounted but hidden when width is 0 */}
          <div className="w-full h-full min-w-[300px]">
            <LivePreviewPane
              html={htmlCode}
              css={cssCode}
              js={jsCode}
              cssFileName={cssFileName}
              jsFileName={jsFileName}
              error={execError}
              onClose={() => setPreviewOpen(false)}
            />
          </div>
        </div>
      </div>

      {/* Diff Modal */}
      {showDiffModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center px-4 sm:px-6">
          <div className="relative bg-neutral-900 w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-xl shadow-2xl border border-neutral-800 flex flex-col">
            {/* Header */}
            <div className="sticky top-0 z-20 bg-neutral-900 border-b border-neutral-800 flex justify-between items-center px-6 py-3">
              <div>
                <h2 className="text-neutral-100 text-sm font-bold uppercase tracking-wider">
                  Review Changes
                </h2>
                {diffSource === "commit" && currentCommit && (
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Commit by{" "}
                    <span className="text-neutral-300">
                      {currentCommit.user?.name || "Unknown"}
                    </span>
                  </p>
                )}
              </div>
              <button
                onClick={() => setShowDiffModal(false)}
                className="p-1.5 text-neutral-500 hover:text-neutral-200 hover:bg-neutral-800 rounded transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Diffs */}
            <div className="overflow-y-auto flex-grow px-6 py-4 space-y-6 bg-neutral-950/50">
              {diffs.length === 0 ? (
                <p className="text-neutral-500 text-sm italic text-center py-10">
                  No changes to display.
                </p>
              ) : (
                diffs.map((file) => (
                  <DiffView
                    key={file.id}
                    fileName={file.name}
                    original={file.oldContent}
                    modified={file.content}
                    language={file.language || "plaintext"}
                  />
                ))
              )}
            </div>

            {/* Footer Actions for AI Diffs */}
            {diffSource === "ai" && (
              <div className="border-t border-neutral-800 px-6 py-4 flex justify-end gap-3 bg-neutral-900 sticky bottom-0 z-10">
                <button
                  onClick={() => {
                    setShowDiffModal(false);
                    setPendingApplyRange(null);
                    setDiffs([]);
                    setDiffSource(null);
                  }}
                  className="px-4 py-2 rounded text-sm font-medium text-neutral-300 hover:text-white hover:bg-neutral-800 transition"
                >
                  Discard
                </button>
                <button
                  onClick={() => {
                    if (editorRef.current && pendingApplyRange && diffs[0]) {
                      editorRef.current.executeEdits("", [
                        {
                          range: pendingApplyRange,
                          text: diffs[0].content,
                        },
                      ]);
                    }
                    setShowDiffModal(false);
                    setPendingApplyRange(null);
                    setDiffSource(null);
                    setDiffs([]);
                  }}
                  className="px-4 py-2 rounded text-sm font-bold bg-green-600 hover:bg-green-500 text-white shadow-sm transition"
                >
                  Apply Changes
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
