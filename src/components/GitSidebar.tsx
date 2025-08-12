'use client';

import { useEffect, useState } from "react";
import { ArrowLeftToLine, GitCommit, History } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import clsx from "clsx";
import { useSession } from "next-auth/react";

interface GitSidebarProps {
  roomId: string;
  onPreview?: (commitId: string) => void;
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

export default function GitSidebar({ roomId, onPreview }: GitSidebarProps) {
  const [commits, setCommits] = useState<Commit[]>([]);
  const [message, setMessage] = useState('');
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
        const commitRes = await fetch(`/api/room/${roomId}/commit/${latestCommitId}`);
        if (commitRes.ok) {
          const commitData = await commitRes.json();
          // Ensure fileId is present & matches roomFiles IDs
          setLastCommitFiles(commitData.files.map((f: any) => ({
            fileId: f.fileId,
            content: f.content,
            oldContent: f.oldContent || ''
          })));
        }
      }
    } catch (err) {
      console.error("Failed to fetch commits:", err);
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
    }
  }

  async function previewCommit(commitId: string) {
    // Get clicked commit data
    const commitRes = await fetch(`/api/room/${roomId}/commit/${commitId}`);
    if (!commitRes.ok) return console.error("Failed to fetch commit");
    const commitData = await commitRes.json();
  
    // Find parent commit id from commits[] list
    const idx = commits.findIndex(c => c.id === commitId);
    let parentFiles: any[] = [];
    if (idx >= 0 && idx + 1 < commits.length) {
      const parentId = commits[idx + 1].id;
      const parentRes = await fetch(`/api/room/${roomId}/commit/${parentId}`);
      if (parentRes.ok) {
        const parentData = await parentRes.json();
        parentFiles = parentData.files || [];
      }
    }
  
    // Build diffs (just like your old code but commit vs parent)
    const changes = (commitData.files || [])
      .map((file: any) => {
        const prev = parentFiles.find(f => f.fileId === file.fileId);
        if (!prev || prev.content !== file.content) {
          return {
            id: file.fileId,
            name: file.name,
            language: file.language,
            oldContent: prev?.content || file.oldContent || '',
            newContent: file.content || '',
          };
        }
        return null;
      })
      .filter(Boolean);
  
    if (onPreview) {
      onPreview(commitId);
    }
  }

  function getFileStatus(file: RoomFile): 'modified' | 'new' | 'unchanged' {
    const prev = lastCommitFiles.find(f => f.fileId === file.id);
    if (!prev) return 'new';
    if (prev.content.trim() !== file.content.trim()) return 'modified';
    return 'unchanged';
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
          userId
        }),
      });

      if (!res.ok) throw new Error("Failed to create commit");

      setMessage('');
      await fetchCommits();
    } catch (err) {
      console.error("Failed to create commit:", err);
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
    } catch (err) {
      console.error("Failed to revert commit:", err);
    }
  }

  function toggleFileSelection(fileId: string) {
    setSelectedFiles(prev =>
      prev.includes(fileId) ? prev.filter(id => id !== fileId) : [...prev, fileId]
    );
  }

  return (
    <div className="text-sm text-gray-200 p-3 space-y-6 overflow-y-auto h-full">
      {/* Header */}
      <h2 className="text-xs uppercase tracking-wide text-gray-400 flex items-center gap-2 font-semibold">
        <History className="w-4 h-4" /> Version Control
      </h2>

      {/* Commit Form */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Commit Message</label>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Describe your changes"
          className="w-full px-2 py-1.5 bg-[#252526] border border-[#3a3a3a] text-white rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <button
          onClick={createCommit}
          disabled={loading || !message.trim()}
          className="mt-2 w-full flex items-center justify-center gap-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white py-1.5 rounded disabled:opacity-50 transition"
        >
          <GitCommit className="w-4 h-4" /> Commit Changes
        </button>
      </div>

      <ul className="space-y-1 max-h-48 overflow-auto">
        {roomFiles.length === 0 ? (
            <li className="text-gray-500 italic">No files found</li>
        ) : (
            roomFiles.map((file) => {
            const status = getFileStatus(file);
            const statusStyles = {
                new: "bg-green-600 text-green-100",
                modified: "bg-yellow-500 text-yellow-900",
                unchanged: "bg-gray-700 text-gray-300",
            };
            return (
                <li
                key={file.id}
                className="flex items-center justify-between gap-2 px-2 py-1 rounded cursor-pointer select-none hover:bg-[#2e2e2e]"
                onClick={() => toggleFileSelection(file.id)}
                >
                <div className="flex items-center gap-2">
                    {/* Custom checkbox */}
                    <div
                    className={clsx(
                        "w-4 h-4 flex items-center justify-center border rounded-sm",
                        selectedFiles.includes(file.id)
                        ? "bg-blue-600 border-blue-600"
                        : "border-gray-600"
                    )}
                    >
                    {selectedFiles.includes(file.id) && (
                        <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-3 h-3 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                        />
                        </svg>
                    )}
                    </div>

                    <span className="truncate font-mono text-sm text-white">{file.name}</span>
                </div>

                {/* Status badge */}
                <span
                    className={clsx(
                    "text-[10px] font-semibold px-2 py-[2px] rounded-full select-none",
                    statusStyles[status]
                    )}
                >
                    {status === "new"
                    ? "N"
                    : status === "modified"
                    ? "M"
                    : "U"}
                </span>
                </li>
            );
            })
        )}
        </ul>


      {/* Commit History */}
      <div>
        <h3 className="text-xs font-semibold text-gray-400 mb-1">History</h3>
        <ul className="space-y-2 max-h-72 overflow-auto">
          {commits.length === 0 ? (
            <li className="text-gray-500 italic">No commits yet</li>
          ) : (
            commits.map((commit) => (
              <li
                key={commit.id}
                className="bg-[#252526] px-3 py-2 rounded hover:bg-[#2e2e2e] flex justify-between items-start"
              >
                <div
                  className="cursor-pointer flex-1"
                  onClick={() => previewCommit(commit.id)}
                >
                  <div className="text-white text-sm truncate">{commit.message}</div>
                  <div className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(commit.createdAt), { addSuffix: true })}
                  </div>
                </div>
                <button
                  onClick={() => revertCommit(commit.id)}
                  className="text-red-400 hover:text-red-500 text-xs flex items-center gap-1"
                >
                  <ArrowLeftToLine className="w-4 h-4" /> Revert
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
