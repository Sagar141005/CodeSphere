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
      <div className="flex bg-[#1a1a1a] border-b border-[#2c2c2c] overflow-x-auto text-sm">
        <div className="flex">
          {tabs.map((file) => (
            <div
              key={file.id}
              onClick={() => onTabClick(file)}
              className={`px-4 py-2 cursor-pointer flex items-center gap-2 rounded-t-md
                transition-all duration-150 border-b-2
                ${
                  activeFileId === file.id
                    ? "bg-[#2d2d2d] border-blue-500 text-white shadow-inner"
                    : "bg-[#242424] text-gray-400 hover:text-white hover:bg-[#262626] border-[1px] border-b border-b-transparent border-[#232020]"
                }`}
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
