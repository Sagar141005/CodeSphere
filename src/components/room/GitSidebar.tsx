"use client";

import { useEffect, useState } from "react";
import { Undo2, GitCommit, History } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import clsx from "clsx";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

interface GitSidebarProps {
  roomId: string;
  onPreview?: (commitId: string) => void;
  onRevert?: () => void;
}

interface Commit {
  id: string;
  message: string;
  createdAt: string;
}

interface RoomFile {
  id: string;
  name: string;
  language: string;
  content: string;
}

interface CommitFile {
  fileId: string;
  content: string;
  oldContent?: string;
}

export default function GitSidebar({
  roomId,
  onPreview,
  onRevert,
}: GitSidebarProps) {
  const [commits, setCommits] = useState<Commit[]>([]);
  const [message, setMessage] = useState("");
  const [roomFiles, setRoomFiles] = useState<RoomFile[]>([]);
  const [lastCommitFiles, setLastCommitFiles] = useState<CommitFile[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const { data: session } = useSession();
  const userId = session?.user.id;

  useEffect(() => {
    fetchCommits();
    fetchRoomFiles();
  }, [roomId]);

  async function fetchCommits() {
    try {
      const res = await fetch(`/api/room/${roomId}/commit`);
      if (!res.ok) throw new Error("Failed to fetch commits");
      const data = await res.json();
      setCommits(data);

      if (data.length > 0) {
        const latestCommitId = data[0].id;
        const commitRes = await fetch(
          `/api/room/${roomId}/commit/${latestCommitId}`
        );
        if (commitRes.ok) {
          const commitData = await commitRes.json();
          setLastCommitFiles(
            commitData.files.map((f: any) => ({
              fileId: f.fileId,
              content: f.content,
              oldContent: f.oldContent || "",
            }))
          );
        }
      }
    } catch (err) {
      console.error("Failed to fetch commits:", err);
      toast.error("Could not load commits");
    }
  }

  async function fetchRoomFiles() {
    try {
      const res = await fetch(`/api/room/${roomId}/files`);
      if (!res.ok) throw new Error("Failed to fetch files");
      const data = await res.json();
      setRoomFiles(data);
    } catch (err) {
      console.error("Failed to fetch room files:", err);
      toast.error("Failed to load room files");
    }
  }

  async function previewCommit(commitId: string) {
    try {
      const commitRes = await fetch(`/api/room/${roomId}/commit/${commitId}`);
      if (!commitRes.ok) throw new Error("Failed to fetch commit");

      const commitData = await commitRes.json();

      const idx = commits.findIndex((c) => c.id === commitId);
      let parentFiles: any[] = [];
      if (idx >= 0 && idx + 1 < commits.length) {
        const parentId = commits[idx + 1].id;
        const parentRes = await fetch(`/api/room/${roomId}/commit/${parentId}`);
        if (parentRes.ok) {
          const parentData = await parentRes.json();
          parentFiles = parentData.files || [];
        }
      }

      const changes = (commitData.files || [])
        .map((file: any) => {
          const prev = parentFiles.find((f) => f.fileId === file.fileId);
          if (!prev || prev.content !== file.content) {
            return {
              id: file.fileId,
              name: file.name,
              language: file.language,
              oldContent: prev?.content || file.oldContent || "",
              newContent: file.content || "",
            };
          }
          return null;
        })
        .filter(Boolean);

      if (onPreview) {
        onPreview(commitId);
      }
    } catch (err) {
      console.error("Commit preview failed:", err);
      toast.error("Unable to preview commit.");
    }
  }

  function getFileStatus(file: RoomFile): "modified" | "new" | "unchanged" {
    const prev = lastCommitFiles.find((f) => f.fileId === file.id);
    if (!prev) return "new";
    if (prev.content.trim() !== file.content.trim()) return "modified";
    return "unchanged";
  }

  async function createCommit() {
    if (!message.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/room/${roomId}/commit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          fileIds: selectedFiles,
          userId,
        }),
      });

      if (!res.ok) throw new Error("Failed to create commit");

      setMessage("");
      setSelectedFiles([]);
      await fetchCommits();
      toast.success("Commit created");
    } catch (err) {
      console.error("Failed to create commit:", err);
      toast.error("Commit creation failed");
    } finally {
      setLoading(false);
    }
  }

  async function revertCommit(id: string) {
    try {
      const res = await fetch(`/api/room/${roomId}/commit/${id}/revert`, {
        method: "POST",
      });

      if (!res.ok) throw new Error("Failed to revert commit");

      await fetchCommits();
      await fetchRoomFiles();

      if (onRevert) {
        onRevert();
      }

      toast.success("Commit reverted");
    } catch (err) {
      console.error("Failed to revert commit:", err);
      toast.error("Failed to revert commit");
    }
  }

  function toggleFileSelection(fileId: string) {
    setSelectedFiles((prev) =>
      prev.includes(fileId)
        ? prev.filter((id) => id !== fileId)
        : [...prev, fileId]
    );
  }

  return (
    <div className="text-sm text-neutral-300 p-3 space-y-6 overflow-y-auto h-full bg-neutral-950 border-l border-neutral-800">
      <h2 className="text-[10px] uppercase tracking-widest text-neutral-500 flex items-center gap-2 font-bold select-none">
        <History className="w-3 h-3" /> Version Control
      </h2>

      <div>
        <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1.5">
          Commit Message
        </label>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Describe changes..."
          className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 text-neutral-200 rounded-md text-xs placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 transition-colors"
        />
        <button
          onClick={createCommit}
          disabled={loading || !message.trim()}
          className="mt-3 w-full flex items-center justify-center gap-2 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-md disabled:bg-neutral-800 disabled:text-neutral-500 transition-colors"
        >
          {loading ? (
            <span className="animate-spin w-3 h-3 border-2 border-white/20 border-t-white rounded-full" />
          ) : (
            <GitCommit className="w-3.5 h-3.5" />
          )}
          Commit Changes
        </button>
      </div>

      <ul className="space-y-0.5 max-h-48 overflow-auto pr-1 scrollbar-thin scrollbar-thumb-neutral-800">
        {roomFiles.length === 0 ? (
          <li className="text-neutral-600 text-xs italic text-center py-4">
            No files found
          </li>
        ) : (
          roomFiles.map((file) => {
            const status = getFileStatus(file);

            const statusStyles = {
              new: "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20",
              modified:
                "bg-amber-500/10 text-amber-500 border border-amber-500/20",
              unchanged:
                "bg-neutral-800 text-neutral-500 border border-neutral-800",
            };

            const isSelected = selectedFiles.includes(file.id);

            return (
              <li
                key={file.id}
                className={clsx(
                  "flex items-center justify-between gap-2 px-2 py-1.5 rounded-md cursor-pointer select-none transition-colors",
                  isSelected ? "bg-neutral-900" : "hover:bg-neutral-900"
                )}
                onClick={() => toggleFileSelection(file.id)}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={clsx(
                      "w-3.5 h-3.5 flex items-center justify-center border rounded transition-all",
                      isSelected
                        ? "bg-blue-600 border-blue-600"
                        : "border-neutral-600 bg-transparent hover:border-neutral-400"
                    )}
                  >
                    {isSelected && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-2.5 h-2.5 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={4}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>

                  <span
                    className={clsx(
                      "truncate text-xs transition-colors",
                      isSelected ? "text-neutral-200" : "text-neutral-400"
                    )}
                  >
                    {file.name}
                  </span>
                </div>

                <span
                  className={clsx(
                    "text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider",
                    statusStyles[status]
                  )}
                >
                  {status === "new"
                    ? "NEW"
                    : status === "modified"
                    ? "MOD"
                    : "Ub"}
                </span>
              </li>
            );
          })
        )}
      </ul>

      <div>
        <h3 className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-3">
          Timeline
        </h3>
        <ul className="space-y-3 max-h-72 overflow-auto pr-1 relative border-l border-neutral-800 ml-1.5 pl-4">
          {commits.length === 0 ? (
            <li className="text-neutral-600 text-xs italic">No commits yet</li>
          ) : (
            commits.map((commit) => (
              <li key={commit.id} className="group relative">
                <div className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-neutral-900 border border-neutral-700 group-hover:border-blue-500 group-hover:bg-blue-500/20 transition-colors" />

                <div className="flex justify-between items-start gap-2">
                  <div
                    className="cursor-pointer flex-1"
                    onClick={() => previewCommit(commit.id)}
                  >
                    <div className="text-neutral-300 text-xs font-medium truncate group-hover:text-blue-400 transition-colors">
                      {commit.message}
                    </div>
                    <div className="text-[10px] text-neutral-600 mt-0.5">
                      {formatDistanceToNow(new Date(commit.createdAt), {
                        addSuffix: true,
                      })}
                    </div>
                  </div>

                  <button
                    onClick={() => revertCommit(commit.id)}
                    title="Revert to this commit"
                    className="opacity-0 group-hover:opacity-100 p-1 text-neutral-500 hover:text-red-400 hover:bg-red-950/30 rounded transition-all"
                  >
                    <Undo2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
