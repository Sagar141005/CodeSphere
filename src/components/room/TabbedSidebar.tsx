"use client";

import { useState } from "react";
import { Files, GitGraph } from "lucide-react";
import EditorFilePanel from "./EditorFilePanel";
import GitSidebar from "./GitSidebar";
import type { FileData } from "@/types/FileData";
import clsx from "clsx";

interface TabbedSidebarProps {
  files: FileData[];
  onFileClick: (file: FileData) => void;
  slug: string;
  roomId: string;
  activeFileId: string | null;
  onFileAdded: (file: FileData) => void;
  onFileDeleted: (id: string) => void;
  onFileRenamed: (id: string, newName: string) => void;
  onPreview?: (commitId: string) => void;
}

export default function TabbedSidebar({
  files,
  onFileClick,
  slug,
  roomId,
  activeFileId,
  onFileAdded,
  onFileDeleted,
  onFileRenamed,
  onPreview,
}: TabbedSidebarProps) {
  const [activeTab, setActiveTab] = useState<"explorer" | "git">("explorer");

  return (
    <div className="w-full flex h-full bg-neutral-950 border-r border-neutral-800">
      <div className="w-12 bg-neutral-950 border-r border-neutral-800 flex flex-col items-center py-3 space-y-3">
        <button
          onClick={() => setActiveTab("explorer")}
          title="Explorer"
          className={clsx(
            "p-2 rounded-lg transition-colors duration-200",
            activeTab === "explorer"
              ? "bg-neutral-800 text-neutral-50"
              : "text-neutral-500 hover:bg-neutral-900 hover:text-neutral-300"
          )}
        >
          <Files className="w-5 h-5" />
        </button>
        <button
          onClick={() => setActiveTab("git")}
          title="Source Control"
          className={clsx(
            "p-2 rounded-lg transition-colors duration-200",
            activeTab === "git"
              ? "bg-neutral-800 text-neutral-50"
              : "text-neutral-500 hover:bg-neutral-900 hover:text-neutral-300"
          )}
        >
          <GitGraph className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 bg-neutral-950 overflow-y-auto no-scrollbar">
        {activeTab === "explorer" ? (
          <EditorFilePanel
            files={files}
            onFileClick={onFileClick}
            slug={slug}
            roomId={roomId}
            activeFileId={activeFileId}
            onFileAdded={onFileAdded}
            onFileDeleted={onFileDeleted}
            onFileRenamed={onFileRenamed}
          />
        ) : (
          <GitSidebar roomId={slug} onPreview={onPreview} />
        )}
      </div>
    </div>
  );
}
