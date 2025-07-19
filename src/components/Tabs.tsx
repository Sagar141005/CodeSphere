'use client';
import type { FileData } from "@/types/FileData";

interface TabsProps {
    tabs: FileData[],
    activeFileId: string,
    onTabClick: (file: FileData) => void,
    onClose: (fileId: string) => void,
}

export default function Tabs({ tabs, activeFileId, onTabClick, onClose }: TabsProps) {
    return (
        <div className="flex bg-gray-800 border-b border-gray-700 justify-between">
            <div className="flex">
                {tabs.map((file) => (
                    <div
                        key={file.id}
                        onClick={() => onTabClick(file)}
                        className={`px-4 py-2 cursor-pointer flex items-center
                        ${activeFileId === file.id ? "bg-gray-700" : ""}`}>
                        <span>{file.name}</span>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onClose(file.id);
                            }}
                            className="ml-2 text-gray-400 hover:text-white">
                            ×
                        </button>
                    </div>
                ))}
            </div>
        </div>
    )
}
