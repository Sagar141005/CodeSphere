"use client";
import type { FileData } from "@/types/FileData";
import { X } from "lucide-react";

interface TabsProps {
  tabs: FileData[];
  activeFileId: string;
  onTabClick: (file: FileData) => void;
  onClose: (fileId: string) => void;
}

export default function Tabs({
  tabs,
  activeFileId,
  onTabClick,
  onClose,
}: TabsProps) {
  return (
    <div className="flex bg-neutral-950 border-b border-neutral-800 overflow-x-auto text-sm scrollbar-thin scrollbar-thumb-neutral-800 scrollbar-track-transparent">
      <div className="flex">
        {tabs.map((file) => (
          <div
            key={file.id}
            onClick={() => onTabClick(file)}
            className={`px-4 py-2.5 cursor-pointer flex items-center gap-2 min-w-[120px] max-w-[200px]
                transition-all duration-150 border-r border-neutral-800 border-t-2
                ${
                  activeFileId === file.id
                    ? "bg-neutral-900 border-t-blue-500 text-neutral-50"
                    : "bg-neutral-950 border-t-transparent text-neutral-500 hover:text-neutral-300 hover:bg-neutral-900"
                }`}
          >
            <span className="truncate flex-1 text-xs font-medium">
              {file.name}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose(file.id);
              }}
              className="text-neutral-600 hover:text-red-400 hover:bg-neutral-800 rounded p-0.5 transition-colors"
              title="Close"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
