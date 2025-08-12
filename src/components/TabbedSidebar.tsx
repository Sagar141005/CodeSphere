'use client';

import { useState } from "react";
import { Files, GitGraph } from 'lucide-react';
import EditorFilePanel from "./EditorFilePanel";
import GitSidebar from "./GitSidebar";
import type { FileData } from "@/types/FileData";
import clsx from 'clsx';

interface TabbedSidebarProps {
  files: FileData[];
  onFileClick: (file: FileData) => void;
  slug: string;
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
  activeFileId,
  onFileAdded,
  onFileDeleted,
  onFileRenamed,
  onPreview,
}: TabbedSidebarProps) {
  const [activeTab, setActiveTab] = useState<'explorer' | 'git'>('explorer');

  return (
    <div className="w-64 flex h-full">
      {/* Vertical Activity Bar (like VSCode) */}
      <div className="w-12 bg-[#1e1e1e] border-r border-gray-700 flex flex-col items-center py-2 space-y-2">
        <button
          onClick={() => setActiveTab("explorer")}
          className={clsx(
            "p-2 rounded-md hover:bg-[#2a2a2a] transition",
            activeTab === "explorer" && "bg-[#333333] text-white"
          )}
        >
          <Files className="w-5 h-5" />
        </button>
        <button
          onClick={() => setActiveTab("git")}
          className={clsx(
            "p-2 rounded-md hover:bg-[#2a2a2a] transition",
            activeTab === "git" && "bg-[#333333] text-white"
          )}
        >
          <GitGraph className="w-5 h-5" />
        </button>
      </div>

      {/* Active Sidebar Panel */}
      <div className="w-[216px] bg-[#1e1e1e] border-r border-gray-700 overflow-y-auto">
        {activeTab === "explorer" ? (
          <EditorFilePanel
            files={files}
            onFileClick={onFileClick}
            slug={slug}
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
