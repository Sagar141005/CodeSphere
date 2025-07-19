'use client';

import { useState, useRef, useEffect } from "react";
import { getSocket } from "@/lib/socket";
import type { FileData } from "@/types/FileData";
import { getIconForFile, getIconForFolder, getIconForOpenFolder } from "vscode-icons-js";

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

export default function Sidebar({
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
        <div key={file.id} className="ml-2 relative">
          <div
            className="flex items-center justify-between px-2 py-1 cursor-pointer hover:bg-gray-700 rounded"
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
                className="bg-gray-700 px-2 py-1 rounded text-sm w-full"
                autoFocus
              />
            ) : (
              <span
                className="flex items-center gap-1"
                onClick={() => {
                  if (file.type === "folder") {
                    toggleExpand(file.id);
                  } else {
                    onFileClick(file);
                  }
                }}
              >
                {file.type === "folder"
                  ? (expanded[file.id] ? <span>▼</span> : <span>▶</span>)
                  : null}
                {file.type === "folder"
                  ? getFolderIcon(file.name, expanded[file.id])
                  : getFileIcon(file.name)}
                {file.name}
              </span>
            )}
          </div>

          {file.type === "folder" && expanded[file.id] && (
            <div className="ml-4">
              {creatingInFolder === file.id && (
                <input
                  type="text"
                  placeholder="Enter name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && createItem(file.id)}
                  className="bg-gray-700 px-2 py-1 rounded text-sm mb-2 w-full"
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
    <div className="w-64 bg-gray-800 p-4 overflow-y-auto relative">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold">Files</h2>
        <button
          className="text-sm bg-gray-700 px-2 py-1 rounded"
          onClick={() => setCreatingInFolder("root")}
        >
          +
        </button>
      </div>

      {creatingInFolder === "root" && (
        <input
          type="text"
          placeholder="Enter name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && createItem(null)}
          className="bg-gray-700 px-2 py-1 rounded text-sm mb-2 w-full"
          autoFocus
        />
      )}

      {renderTree(null)}

      {contextMenu && (
        <div
          ref={menuRef}
          style={{ top: contextMenu.y, left: contextMenu.x }}
          className="absolute bg-gray-700 text-white rounded shadow-lg w-32 z-50"
        >
          <div
            className="px-3 py-2 hover:bg-gray-600 cursor-pointer"
            onClick={() => {
              setCreatingInFolder(contextMenu.fileId || "root");
              setContextMenu(null);
            }}
          >
            New File / Folder
          </div>
          <div
            className="px-3 py-2 hover:bg-gray-600 cursor-pointer"
            onClick={() => {
              setRenamingId(contextMenu.fileId!);
              const current = files.find((f) => f.id === contextMenu.fileId);
              setNewName(current?.name || "");
              setContextMenu(null);
            }}
          >
            Rename
          </div>
          <div
            className="px-3 py-2 hover:bg-red-600 cursor-pointer"
            onClick={() => {
              handleDelete(contextMenu.fileId!);
              setContextMenu(null);
            }}
          >
            Delete
          </div>
        </div>
      )}
    </div>
  );
}
