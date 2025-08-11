"use client";

import { DiffEditor } from "@monaco-editor/react";

interface DiffViewProps {
  original: string;
  modified: string;
  language: string;
  fileName: string;
}

export default function DiffView({ original, modified, language, fileName }: DiffViewProps) {
  return (
    <div className="mb-6">
      <h3 className="text-sm font-semibold text-white mb-2">{fileName}</h3>
      <div className="border border-gray-700 rounded overflow-hidden">
        <DiffEditor
          height="300px"
          theme="vs-dark"
          language={language || "plaintext"}
          original={original}
          modified={modified}
          options={{
            readOnly: true,
            renderSideBySide: true,
            minimap: { enabled: false },
          }}
        />
      </div>
    </div>
  );
}