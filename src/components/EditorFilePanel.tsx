'use client';

import { useState, useRef, useEffect } from "react";
import { getSocket } from "@/lib/socket";
import type { FileData } from "@/types/FileData";
import { getIconForFile, getIconForFolder, getIconForOpenFolder } from "vscode-icons-js";
import { ChevronDown, ChevronRight, Folder, FolderOpen, File, Plus, Trash2, Edit3 } from "lucide-react";

interface SidebarProps {
  files: FileData[];
  onFileClick: (file: FileData) => void;
  slug: string;
  onFileAdded: (file: FileData) => void;
  onFileDeleted: (id: string) => void;
  onFileRenamed: (id: string, newName: string) => void;
}

// Get colorful file icons
const getFileIcon = (filename: string) => {
  const iconPath = getIconForFile(filename);
  const iconUrl = iconPath
    ? `https://raw.githubusercontent.com/vscode-icons/vscode-icons/master/icons/${iconPath}`
    : `https://raw.githubusercontent.com/vscode-icons/vscode-icons/master/icons/default_file.svg`;
  return <img src={iconUrl} alt="file-icon" className="w-4 h-4 inline-block mr-1" />;
};

// Get folder icons (open/closed)
const getFolderIcon = (name: string, isOpen: boolean) => {
  const iconPath = isOpen ? getIconForOpenFolder(name) : getIconForFolder(name);
  const iconUrl = iconPath
    ? `https://raw.githubusercontent.com/vscode-icons/vscode-icons/master/icons/${iconPath}`
    : `https://raw.githubusercontent.com/vscode-icons/vscode-icons/master/icons/default_folder.svg`;
  return <img src={iconUrl} alt="folder-icon" className="w-4 h-4 inline-block mr-1" />;
};

export default function EditorFilePanel({
  files,
  onFileClick,
  slug,
  onFileAdded,
  onFileDeleted,
  onFileRenamed,
}: SidebarProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [creatingInFolder, setCreatingInFolder] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; fileId: string | null } | null>(null);

  const menuRef = useRef<HTMLDivElement | null>(null);
  const socket = getSocket();

  useEffect(() => {
    socket.on("file-added", (file: FileData) => onFileAdded(file));
    socket.on("file-deleted", (fileId: string) => onFileDeleted(fileId));
    socket.on("file-renamed", ({ fileId, newName }) => onFileRenamed(fileId, newName));

    return () => {
      socket.off("file-added");
      socket.off("file-deleted");
      socket.off("file-renamed");
    };
  }, [slug]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setContextMenu(null);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const toggleExpand = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const detectType = (name: string) => (name.includes(".") ? "file" : "folder");

  const createItem = async (parentId: string | null) => {
    if (!newName.trim()) return;

    const type = detectType(newName);
    const res = await fetch(`/api/room/${slug}/files`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName, type, parentId }),
    });

    const newFile = await res.json();
    onFileAdded(newFile);
    socket.emit("file-add", { roomId: slug, file: newFile });
    setNewName("");
    setCreatingInFolder(null);
  };

  const handleRename = async (id: string) => {
    if (!newName.trim()) return;
    const res = await fetch(`/api/file/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName }),
    });

    const updatedFile = await res.json();
    onFileRenamed(id, updatedFile.name);
    socket.emit("file-rename", { roomId: slug, fileId: id, newName: updatedFile.name });
    setRenamingId(null);
    setNewName("");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    await fetch(`/api/file/${id}`, { method: "DELETE" });
    onFileDeleted(id);
    socket.emit("file-delete", { roomId: slug, fileId: id });
  };

  const renderTree = (parentId: string | null) => {
    return files
      .filter((f) => f.parentId === parentId)
      .map((file) => (
        <div key={file.id} className="ml-1 relative">
          <div
            className="flex items-center px-2 py-1 text-sm rounded cursor-pointer hover:bg-[#2a2a2a] transition"
            onContextMenu={(e) => {
              e.preventDefault();
              setContextMenu({ x: e.clientX, y: e.clientY, fileId: file.id });
            }}
          >
            {renamingId === file.id ? (
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleRename(file.id)}
                onBlur={() => handleRename(file.id)}
                className="bg-[#333] px-2 py-1 text-sm rounded w-full focus:outline-none"
                autoFocus
              />
            ) : (
              <div
                className="flex items-center gap-2 w-full truncate"
                onClick={() => {
                  if (file.type === "folder") {
                    toggleExpand(file.id);
                  } else {
                    onFileClick(file);
                  }
                }}
              >
                {file.type === "folder" ? (
                  expanded[file.id] ? (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  )
                ) : (
                  <span className="w-4 h-4" /> // spacer for alignment
                )}
  
                {file.type === "folder" ? (
                  expanded[file.id] ? (
                    <FolderOpen className="w-4 h-4 text-yellow-400" />
                  ) : (
                    <Folder className="w-4 h-4 text-yellow-400" />
                  )
                ) : (
                   getFileIcon(file.name)
                )}
  
                <span className="truncate">{file.name}</span>
              </div>
            )}
          </div>
  
          {/* Nested content */}
          {file.type === "folder" && expanded[file.id] && (
            <div className="ml-4">
              {creatingInFolder === file.id && (
                <input
                  type="text"
                  placeholder="Enter name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && createItem(file.id)}
                  className="bg-[#333] px-2 py-1 rounded text-sm mb-2 w-full focus:outline-none"
                  autoFocus
                />
              )}
              {renderTree(file.id)}
            </div>
          )}
        </div>
      ));
  };

  return (
    <aside className="w-64 bg-[#1e1e1e] text-gray-200 p-4 overflow-y-auto border-r border-gray-700 relative">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold text-sm uppercase tracking-wider text-gray-400">Explorer</h2>
        <button
          className="hover:bg-gray-700 p-1 rounded"
          onClick={() => setCreatingInFolder("root")}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
  
      {/* Input for New File/Folder */}
      {creatingInFolder === "root" && (
        <input
          type="text"
          placeholder="New file or folder"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && createItem(null)}
          className="w-full px-2 py-1 mb-2 text-sm bg-[#2a2a2a] text-white rounded border border-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
          autoFocus
        />
      )}
  
      {/* File Tree (renderTree handles indentation + icons) */}
      <div className="space-y-1 text-sm">
        {renderTree(null)}
      </div>
  
      {/* Context Menu */}
      {contextMenu && (
        <div
          ref={menuRef}
          style={{ top: contextMenu.y, left: contextMenu.x }}
          className="fixed bg-[#1f1f1f] text-white rounded-lg shadow-xl w-48 z-50 border border-gray-700"
        >
          <button
            onClick={() => {
              setCreatingInFolder(contextMenu.fileId || "root");
              setContextMenu(null);
            }}
            className="w-full flex items-center gap-2 text-left px-4 py-2 hover:bg-[#2a2a2a] transition text-sm"
          >
            <Plus className="w-4 h-4 text-green-400" />
            New File / Folder
          </button>
          <button
            onClick={() => {
              setRenamingId(contextMenu.fileId!);
              const current = files.find((f) => f.id === contextMenu.fileId);
              setNewName(current?.name || "");
              setContextMenu(null);
            }}
            className="w-full flex items-center gap-2 text-left px-4 py-2 hover:bg-[#2a2a2a] transition text-sm"
          >
            <Edit3 className="w-4 h-4 text-yellow-400" />
            Rename
          </button>
          <button
            onClick={() => {
              handleDelete(contextMenu.fileId!);
              setContextMenu(null);
            }}
            className="w-full flex items-center gap-2 text-left px-4 py-2 hover:bg-red-600 transition text-sm text-red-400"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      )}

    </aside>
  );
}
