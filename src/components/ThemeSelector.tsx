"use client";

import { useEffect, useRef, useState } from "react";
import { Moon, Sun, Palette } from "lucide-react";

const THEMES = [
  { id: "vs-dark", label: "Dark", color: "#1e1e1e", icon: <Moon className="w-4 h-4" /> },
  { id: "vs-light", label: "Light", color: "#ffffff", icon: <Sun className="w-4 h-4" /> },
  { id: "github-dark", label: "GitHub", color: "#0d1117", icon: <Palette className="w-4 h-4" /> },
  { id: "monokai", label: "Monokai", color: "#272822", icon: <Palette className="w-4 h-4" /> },
];

type Props = {
  theme: string;
  setTheme: (id: string) => void;
};

export default function ThemeSelector({ theme, setTheme }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = THEMES.find((t) => t.id === theme);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <div className="relative text-sm" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-3 py-1.5 border border-[#333] bg-[#1e1e1e] text-gray-300 hover:bg-[#2a2a2a] transition-colors rounded-md"
      >
        <Palette className="w-4 h-4 text-gray-400" />
        <span>{current?.label || "Theme"}</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-44 bg-[#1a1a1a] border border-[#333] shadow-lg z-50">
          {THEMES.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setTheme(t.id);
                setOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 text-left hover:bg-[#2a2a2a] ${
                t.id === theme ? "text-blue-400" : "text-gray-300"
              }`}
            >
              <div className="flex items-center gap-2">
                <div>{t.icon}</div>
                <span>{t.label}</span>
              </div>
              <div
                className="w-3 h-3 rounded-sm border border-gray-600"
                style={{ backgroundColor: t.color }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
