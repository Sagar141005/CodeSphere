"use client";

import { use } from "react";
import CodeEditor from "@/components/Editor";
import Navbar from "@/components/RoomNavbar";
import TabbedSidebar from "@/components/TabbedSidebar";
import Tabs from "@/components/Tabs";
import Terminal, { TerminalRef } from "@/components/Terminal";
import { getSocket } from "@/lib/socket";
import { useSession } from "next-auth/react";
import { useEffect, useState, useRef } from "react";
import type { FileData } from "@/types/FileData";
import ThemeSelector from "@/components/ThemeSelector";
import LivePreviewModal from "@/components/LivePreviewModal";
import { MessageSquareQuote, MonitorDot, Redo, Undo, X } from "lucide-react";
import DiffView from "@/components/DiffView";
import { useRouter } from "next/navigation";
import MobileBlocker from "@/components/MobileBlocker";

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
  const terminalRef = useRef<TerminalRef>(null);
  const editorRef = useRef<any>(null);

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
    if (!slug) return;

    const loadRoomAndFiles = async () => {
      try {
        const roomRes = await fetch(`/api/room/${slug}`);
        const roomData = await roomRes.json();
        setRoomName(roomData.name);
        setRoomId(roomData.id);
      } catch {
        setRoomName(slug);
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
  }, [slug, session, status]);

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
    return "javascript"; // default fallback
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

  const handlePreview = async () => {
    const htmlFile = openTabs.find((f) => f.name.endsWith(".html"));
    if (!htmlFile) return;

    const htmlRes = await fetch(`/api/file/${htmlFile.id}`);
    const htmlData = await htmlRes.json();
    const htmlContent = htmlData.content;

    // 🧠 Extract linked file names
    const { cssFiles, jsFiles } = extractReferencedFiles(htmlContent);
    const cssHref = cssFiles[0] ?? "";
    const jsSrc = jsFiles[0] ?? "";

    setCssFileName(cssHref);
    setJsFileName(jsSrc);

    const cssFile = openTabs.find((f) => cssHref.endsWith(f.name));
    const jsFile = openTabs.find((f) => jsSrc.endsWith(f.name));

    let cssContent = "";
    let jsContent = "";

    try {
      if (cssFile) {
        const cssRes = await fetch(`/api/file/${cssFile.id}`);
        const cssData = await cssRes.json();
        cssContent = cssData.content || "";
      }

      if (jsFile) {
        const jsRes = await fetch(`/api/file/${jsFile.id}`);
        const jsData = await jsRes.json();
        jsContent = jsData.content || "";
      }

      const jsFilesMap: Record<string, string> = {};
      await Promise.all(
        openTabs
          .filter((f) => f.name.endsWith(".js"))
          .map(async (f) => {
            const res = await fetch(`/api/file/${f.id}`);
            const data = await res.json();
            jsFilesMap[f.name] = data.content || "";
          })
      );

      if (jsFile && jsSrc) {
        const jsExecRes = await fetch("/api/exec", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            language: "javascript",
            entry: jsSrc,
            files: jsFilesMap,
            mode: "preview",
          }),
        });

        const execData = await jsExecRes.json();
        const existing = files.find((f) => f.name === "package.json");
        const packageContent = JSON.stringify(execData.packageJson, null, 2);

        if (existing) {
          // Update case
          const updateRes = await fetch(`/api/file/${existing.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content: packageContent }),
          });
          const updated = await updateRes.json();
          setFiles((prev) =>
            prev.map((f) => (f.id === existing.id ? updated : f))
          );
        } else {
          // Create case
          const createRes = await fetch(`/api/room/${slug}/files`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: "package.json",
              content: packageContent,
              type: "file",
              parentId: null,
              roomSlug: slug,
            }),
          });
          const newFile = await createRes.json();
          setFiles((prev) => [...prev, newFile]);
          setOpenTabs((prev) => [...prev, newFile]);
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

    terminalRef.current?.setRunning(true); //

    try {
      // Step 1: Gather all file contents from open tabs
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

      // Step 2: Call the execution API
      const execRes = await fetch("/api/exec", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language: getLanguage(activeFile.name),
          files: fileMap,
          entry,
          mode: "execute",
        }),
      });

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

      // Step 4: Emit to other users
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
    } finally {
      terminalRef.current?.setRunning(false); // ✅ Hide the running message
    }
  };

  const fetchCommitDetails = async (commitId: string) => {
    const res = await fetch(`/api/room/${slug}/commit/${commitId}`);
    if (!res.ok) throw new Error("Cannot fetch commit");
    return res.json(); // includes { id, message, createdAt, user }
  };

  const explainSelection = async () => {
    const editor = editorRef.current;
    if (!editor) return;

    const selection = editor.getModel()?.getValueInRange(editor.getSelection());
    if (!selection || selection.trim().length === 0) {
      alert("Please select some code first.");
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
      alert("Failed to explain the selected code.");
    }
  };

  const refactorSelection = async () => {
    const editor = editorRef.current;
    if (!editor) return;

    const selectionRange = editor.getSelection();
    const selection = editor.getModel()?.getValueInRange(selectionRange);
    if (!selection || selection.trim().length === 0) {
      alert("Please select some code first.");
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
      // Build diff
      setDiffs([
        {
          id: "ai-change",
          name: activeFile?.name || "current-file",
          oldContent: selection,
          content: data.result,
          language: getLanguage(activeFile?.name || "javascript"),
        },
      ]);

      // Store range and mark diff source
      setPendingApplyRange(selectionRange);
      setDiffSource("ai");
      setShowDiffModal(true);
    } catch (error) {
      console.error(error);
      alert("Failed to explain the selected code.");
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
        // replace only the selected code
        editor.executeEdits("", [
          { range: editor.getSelection(), text: data.result },
        ]);
      } else {
        // replace entire file
        editor.setValue(data.result);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to explain the selected code.");
    }
  };

  const fixErrorsInFile = async () => {
    const editor = editorRef.current;
    if (!editor) return;

    const currentCode = editor.getValue();
    if (!lastError) {
      alert("No error to fix. Run the code first.");
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
      // Build diff (oldContent=currentCode, content=AI fix)
      setDiffs([
        {
          id: "ai-error-fix",
          name: activeFile?.name || "current-file",
          oldContent: currentCode,
          content: data.result,
          language: getLanguage(activeFile?.name || "javascript"),
        },
      ]);

      // Store range (entire document) for apply
      const fullRange = editor.getModel()?.getFullModelRange();
      setPendingApplyRange(fullRange);
      setDiffSource("ai");
      setShowDiffModal(true);

      setLastError(null);
    } catch (error) {
      console.log(error);
      alert("Failed to apply AI fix.");
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
    // Avoid hydration mismatch
    return null;
  }

  if (isSmallScreen) {
    return <MobileBlocker />;
  }

  if (!slug) {
    return <div className="text-white p-4">Loading room...</div>;
  }

  return (
    <div className="flex flex-col h-screen bg-[#1a1a1a] text-white">
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
            // explicitly type commitId as string
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
                  <span className="text-green-400 animate-pulse">
                    Saving...
                  </span>
                ) : (
                  <span className="text-gray-500">Saved</span>
                )}
              </div>

              {/* Undo / Redo */}
              <div className="flex items-center gap-1">
                <button
                  className="flex items-center gap-1 text-sm font-medium text-white bg-neutral-800 hover:bg-neutral-700 px-2 py-1.5 rounded-md shadow transition cursor-pointer"
                  onClick={() => editorRef.current?.trigger("", "undo", null)}
                >
                  <Undo className="w-4 h-4" />
                </button>
                <button
                  className="flex items-center gap-1 text-sm font-medium text-white bg-neutral-800 hover:bg-neutral-700 px-2 py-1.5 rounded-md shadow transition cursor-pointer"
                  onClick={() => editorRef.current?.trigger("", "redo", null)}
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
                  className="flex items-center gap-2 bg-gradient-to-br from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 active:scale-[0.96] text-sm font-semibold px-4 py-1.5 rounded-md shadow-md transition-transform duration-150 cursor-pointer"
                >
                  <MonitorDot className="w-4 h-4" /> Preview
                </button>
              ) : (
                <button
                  onClick={runCode}
                  className="flex items-center gap-2 text-white bg-green-600 hover:bg-green-700 active:bg-green-800
                  px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-150 cursor-pointer"
                >
                  ▶ Run
                </button>
              )}
            </div>
          </div>

          {/* Editor + Terminal */}
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Editor View */}
            <div
              className="flex-1 overflow-auto bg-[#1e1e1e]"
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
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                  Select or create a file to start coding
                </div>
              )}
            </div>

            {/* Terminal */}
            <div className="relative border-t border-gray-700">
              {aiOutput ? (
                <div
                  style={{ height: aiExpanded ? aiHeight : 40 }}
                  className="relative w-full flex flex-col bg-[#1e1e1e] group border-t border-[#2c2c2c]"
                >
                  {/* Drag Handle */}
                  {aiExpanded && (
                    <div
                      onMouseDown={(e) =>
                        handleResize(e, aiHeight, setAiHeight, 40, 500)
                      }
                      className="absolute top-0 left-0 w-full h-2 cursor-row-resize bg-transparent z-10"
                      title="Drag to resize AI explanation"
                    />
                  )}

                  {/* Header */}
                  <div className="flex items-center justify-between px-4 py-2 border-b border-[#2c2c2c] bg-[#1f1f1f]">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 flex items-center justify-center bg-[#242424] rounded-md">
                        <MessageSquareQuote className="w-4 h-4 text-blue-300" />
                      </div>
                      <span className="text-sm font-medium text-gray-300">
                        AI Explanation
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setAiExpanded(!aiExpanded)}
                        className="flex items-center gap-1.5 text-xs px-3 py-1 rounded-md text-gray-400 hover:text-white hover:bg-[#2c2c2c] border border-[#333] transition"
                      >
                        {aiExpanded ? "Collapse" : "Expand"}
                      </button>
                      <button
                        onClick={() => setAiOutput(null)}
                        className="flex items-center gap-1.5 text-xs px-3 py-1 rounded-md text-gray-400 hover:text-white hover:bg-[#2c2c2c] border border-[#333] transition"
                      >
                        Close
                      </button>
                    </div>
                  </div>

                  {/* Content */}
                  {aiExpanded && (
                    <div className="p-4 overflow-auto flex-1 text-sm text-gray-200 bg-[#1e1e2e]/50 backdrop-blur-sm border border-[#313244]">
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

      {showDiffModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center px-4 sm:px-6">
          <div className="relative bg-[#1e1e1e] w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-xl shadow-2xl border border-white/10 flex flex-col">
            {/* Header */}
            <div className="sticky top-0 z-20 bg-[#1e1e1e] border-b border-white/10 flex justify-between items-start sm:items-center px-6 py-4">
              <div>
                <h2 className="text-white text-lg font-semibold">
                  Preview Changes
                </h2>
                {diffSource === "commit" && currentCommit && (
                  <p className="text-sm text-gray-400 mt-1">
                    Committed by{" "}
                    <span className="text-white font-medium">
                      {currentCommit.user?.name || "Unknown"}
                    </span>{" "}
                    on {new Date(currentCommit.createdAt).toLocaleString()}
                  </p>
                )}
              </div>
              <button
                onClick={() => setShowDiffModal(false)}
                className="text-gray-400 hover:text-white text-xl transition-colors rounded cursor-pointer"
                aria-label="Close"
              >
                <X />
              </button>
            </div>

            {/* Diffs */}
            <div className="overflow-y-auto flex-grow px-6 py-4 space-y-6">
              {diffs.length === 0 ? (
                <p className="text-gray-400 text-sm italic">
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
              <div className="border-t border-white/10 px-6 py-4 flex justify-end gap-3 bg-[#1e1e1e] sticky bottom-0 z-10">
                <button
                  onClick={() => {
                    setShowDiffModal(false);
                    setPendingApplyRange(null);
                    setDiffs([]);
                    setDiffSource(null);
                  }}
                  className="px-5 py-2 rounded-md bg-neutral-700 text-white hover:bg-neutral-600 transition font-medium cursor-pointer"
                >
                  Cancel
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
                  className="px-5 py-2 rounded-md bg-green-600 hover:bg-green-700 text-white transition font-medium shadow cursor-pointer"
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
