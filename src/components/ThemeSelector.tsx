"use client";

import { useEffect, useRef, useState } from "react";
import {
  Moon,
  Sun,
  Github,
  Laptop,
  Star,
  Code,
  Ghost,
  Snowflake,
  Eclipse,
} from "lucide-react";

const THEMES = [
  { id: "vs-dark", label: "Dark", color: "#1e1e1e" },
  { id: "vs-light", label: "Light", color: "#ffffff" },
  { id: "github-dark", label: "GitHub", color: "#0d1117" },
  { id: "github-light", label: "GitHub Light", color: "#ffffff" },
  { id: "monokai", label: "Monokai", color: "#272822" },
  { id: "solarized-dark", label: "Solarized Dark", color: "#002b36" },
  { id: "one-dark-pro", label: "One Dark Pro", color: "#282c34" },
  { id: "dracula", label: "Dracula", color: "#282a36" },
  { id: "nord", label: "Nord", color: "#2e3440" },
];

const THEME_ICONS: Record<string, React.ReactNode> = {
  "vs-dark": <Moon className="w-4 h-4" />,
  "vs-light": <Sun className="w-4 h-4" />,
  "github-dark": <Github className="w-4 h-4" />,
  "github-light": <Code className="w-4 h-4" />,
  monokai: <Laptop className="w-4 h-4" />,
  "solarized-dark": <Eclipse className="w-4 h-4" />,
  "one-dark-pro": <Star className="w-4 h-4" />,
  dracula: <Ghost className="w-4 h-4" />,
  nord: <Snowflake className="w-4 h-4" />,
};

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
        {THEME_ICONS[current?.id ?? "vs-dark"]}
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
              className={`w-full flex items-center justify-between px-3 py-2 text-left hover:bg-[#2a2a2a] cursor-pointer ${
                t.id === theme ? "text-blue-400" : "text-gray-300"
              }`}
            >
              <div className="flex items-center gap-2">
                {THEME_ICONS[t.id]}
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
