"use client";

import { useState, useRef, useEffect } from "react";
import { getSocket } from "@/lib/socket";
import type { FileData } from "@/types/FileData";
import { getIconForFile } from "vscode-icons-js";
import {
  ChevronDown,
  ChevronRight,
  Folder,
  FolderOpen,
  Plus,
  Trash2,
  Edit3,
} from "lucide-react";
import clsx from "clsx";
import toast from "react-hot-toast";

interface SidebarProps {
  files: FileData[];
  onFileClick: (file: FileData) => void;
  slug: string;
  roomId: string;
  activeFileId: string | null;
  onFileAdded: (file: FileData) => void;
  onFileDeleted: (id: string) => void;
  onFileRenamed: (id: string, newName: string) => void;
}

const getFileIcon = (filename: string) => {
  const iconPath = getIconForFile(filename);
  const iconUrl = iconPath
    ? `https://raw.githubusercontent.com/vscode-icons/vscode-icons/master/icons/${iconPath}`
    : `https://raw.githubusercontent.com/vscode-icons/vscode-icons/master/icons/default_file.svg`;
  return (
    <img src={iconUrl} alt="file-icon" className="w-4 h-4 inline-block mr-1" />
  );
};

export default function EditorFilePanel({
  files,
  onFileClick,
  slug,
  roomId,
  activeFileId,
  onFileAdded,
  onFileDeleted,
  onFileRenamed,
}: SidebarProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [creatingInFolder, setCreatingInFolder] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    fileId: string | null;
  } | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const socket = getSocket();

  useEffect(() => {
    socket.on("file-added", onFileAdded);
    socket.on("file-deleted", onFileDeleted);
    socket.on("file-renamed", ({ fileId, newName }) =>
      onFileRenamed(fileId, newName)
    );

    return () => {
      socket.off("file-added", onFileAdded);
      socket.off("file-deleted", onFileDeleted);
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
    try {
      const res = await fetch(`/api/room/${slug}/files`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName, type, parentId }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create item");
      }

      const newFile = await res.json();
      onFileAdded(newFile);
      socket.emit("file-add", { roomId: roomId, file: newFile });
      setNewName("");
      setCreatingInFolder(null);
    } catch (error) {
      console.error("Create failed:", error);
      toast.error("Failed to create file or folder.");
    }
  };

  const handleRename = async (id: string) => {
    if (!newName.trim()) return;
    try {
      const res = await fetch(`/api/file/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Rename failed");
      }

      const updatedFile = await res.json();
      onFileRenamed(id, updatedFile.name);
      socket.emit("file-rename", {
        roomId: roomId,
        fileId: id,
        newName: updatedFile.name,
      });
      setRenamingId(null);
      setNewName("");
    } catch (error) {
      console.error("Rename failed:", error);
      toast.error("Failed to rename item.");
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = confirm("Are you sure you want to delete this item?");
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/file/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Delete failed");
      }

      onFileDeleted(id);
      socket.emit("file-delete", { roomId: roomId, fileId: id });
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error("Failed to delete item.");
    }
  };

  const renderTree = (parentId: string | null, depth = 0) => {
    return files
      .filter((f) => f.parentId === parentId)
      .map((file) => (
        <div key={file.id} className="ml-1 relative">
          <div
            className={clsx(
              "flex items-center text-md rounded-md cursor-pointer transition-colors py-2",
              file.id === activeFileId
                ? "bg-neutral-800 text-neutral-50 font-medium"
                : "hover:bg-neutral-900 text-neutral-400"
            )}
            onContextMenu={(e) => {
              e.preventDefault();
              setContextMenu({ x: e.clientX, y: e.clientY, fileId: file.id });
            }}
            style={{ paddingLeft: `${depth * 12}px` }}
          >
            {renamingId === file.id ? (
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleRename(file.id)}
                onBlur={() => handleRename(file.id)}
                className="bg-neutral-900 px-2 py-1 text-sm text-neutral-50 border border-neutral-800 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600 w-full"
                autoFocus
              />
            ) : (
              <div
                className="flex items-center gap-2 w-full truncate px-2"
                onClick={() => {
                  if (file.type === "folder") toggleExpand(file.id);
                  else onFileClick(file);
                }}
              >
                {file.type === "folder" ? (
                  expanded[file.id] ? (
                    <ChevronDown className="w-4 h-4 text-neutral-500" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-neutral-500" />
                  )
                ) : (
                  <span className="w-4 h-4" />
                )}

                {file.type === "folder" ? (
                  expanded[file.id] ? (
                    <FolderOpen className="w-4 h-4 text-amber-400" />
                  ) : (
                    <Folder className="w-4 h-4 text-amber-400" />
                  )
                ) : (
                  getFileIcon(file.name)
                )}
                <span className="truncate">{file.name}</span>
              </div>
            )}
          </div>

          {file.type === "folder" && expanded[file.id] && (
            <div className="ml-1">
              {creatingInFolder === file.id && (
                <input
                  type="text"
                  placeholder="Enter name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && createItem(file.id)}
                  className="bg-neutral-900 px-2 py-1 text-sm text-neutral-50 border border-neutral-800 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600 w-full mb-2"
                  autoFocus
                />
              )}
              {renderTree(file.id, depth + 1)}
            </div>
          )}
        </div>
      ));
  };

  return (
    <aside className="bg-neutral-950 text-neutral-300 p-3 overflow-y-auto relative h-full border-r border-neutral-800">
      <div className="flex justify-between items-center mb-3 px-1">
        <h2 className="font-semibold text-[10px] uppercase tracking-widest text-neutral-500 select-none">
          Explorer
        </h2>
        <button
          className="hover:bg-neutral-900 p-1.5 rounded transition text-neutral-400 hover:text-neutral-50"
          onClick={() => setCreatingInFolder("root")}
          aria-label="Add new file or folder"
          type="button"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {creatingInFolder === "root" && (
        <input
          type="text"
          placeholder="New file or folder"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && createItem(null)}
          className="bg-neutral-900 px-2 py-1 text-sm text-neutral-50 border border-neutral-800 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600 w-full mb-3"
          autoFocus
          aria-label="New file or folder name"
        />
      )}

      <div className="space-y-1 text-sm px-1">{renderTree(null)}</div>

      {contextMenu && (
        <div
          ref={menuRef}
          style={{ top: contextMenu.y, left: contextMenu.x }}
          className="fixed bg-neutral-900 text-neutral-200 rounded-md shadow-xl w-48 z-50 border border-neutral-800"
          role="menu"
          aria-orientation="vertical"
          tabIndex={-1}
        >
          <button
            onClick={() => {
              setCreatingInFolder(contextMenu.fileId || "root");
              setContextMenu(null);
            }}
            className="w-full flex items-center gap-2 text-left px-4 py-2 hover:bg-neutral-800 transition text-sm"
            role="menuitem"
            type="button"
          >
            <Plus className="w-4 h-4 text-emerald-500" />
            New File / Folder
          </button>
          <button
            onClick={() => {
              setRenamingId(contextMenu.fileId!);
              const current = files.find((f) => f.id === contextMenu.fileId);
              setNewName(current?.name || "");
              setContextMenu(null);
            }}
            className="w-full flex items-center gap-2 text-left px-4 py-2 hover:bg-neutral-800 transition text-sm"
            role="menuitem"
            type="button"
          >
            <Edit3 className="w-4 h-4 text-amber-400" />
            Rename
          </button>
          <button
            onClick={() => {
              handleDelete(contextMenu.fileId!);
              setContextMenu(null);
            }}
            className="w-full flex items-center gap-2 text-left px-4 py-2 hover:bg-red-900/20 hover:text-white transition text-sm text-red-400"
            role="menuitem"
            type="button"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      )}
    </aside>
  );
}
