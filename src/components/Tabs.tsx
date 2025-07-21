'use client';
import type { FileData } from "@/types/FileData";
import { X } from "lucide-react";

interface TabsProps {
    tabs: FileData[],
    activeFileId: string,
    onTabClick: (file: FileData) => void,
    onClose: (fileId: string) => void,
}

export default function Tabs({ tabs, activeFileId, onTabClick, onClose }: TabsProps) {
    return (
        <div className="flex bg-[#1e1e1e] border-b border-gray-700 overflow-x-auto text-sm">
          <div className="flex">
            {tabs.map((file) => (
              <div
                key={file.id}
                onClick={() => onTabClick(file)}
                className={`px-4 py-2 cursor-pointer flex items-center gap-2 rounded-t-md
                  transition-colors duration-200 border-b-2
                  ${activeFileId === file.id
                    ? "bg-[#2c2c2c] border-blue-500 text-white"
                    : "bg-[#1e1e1e] border-transparent text-gray-400 hover:text-white hover:bg-[#2a2a2a]"}`}
              >
                <span className="truncate max-w-[150px]">{file.name}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onClose(file.id);
                  }}
                  className="hover:text-red-400 text-gray-500 transition"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      );
}
