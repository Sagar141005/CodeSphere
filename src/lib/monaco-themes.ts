import { Monaco } from "@monaco-editor/react";
import { Theme } from "@/types/Theme";

export const THEMES: Theme[] = [
  { id: "vs-dark", label: "VS Dark", color: "#1e1e1e" },
  { id: "vs-light", label: "VS Light", color: "#ffffff" },
  { id: "github-dark", label: "GitHub Dark", color: "#0d1117" },
  { id: "github-light", label: "GitHub Light", color: "#ffffff" },
  { id: "monokai", label: "Monokai", color: "#272822" },
  { id: "solarized-dark", label: "Solarized Dark", color: "#002b36" },
  { id: "one-dark-pro", label: "One Dark Pro", color: "#282c34" },
  { id: "dracula", label: "Dracula", color: "#282a36" },
  { id: "nord", label: "Nord", color: "#2e3440" },
];

type MonacoBaseTheme = "vs" | "vs-dark" | "hc-black";

type MonacoThemeDefinition = {
  base: MonacoBaseTheme;
  inherit: boolean;
  rules: { token: string; foreground: string }[];
  colors: Record<string, string>;
};

export const THEME_DEFINITONS: Record<string, MonacoThemeDefinition> = {
  "github-dark": {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "comment", foreground: "6e7681" },
      { token: "string", foreground: "a5d6ff" },
      { token: "keyword", foreground: "ff7b72" },
      { token: "number", foreground: "79c0ff" },
      { token: "type", foreground: "ffa657" },
      { token: "class", foreground: "ffa657" },
      { token: "function", foreground: "d2a8ff" },
      { token: "variable", foreground: "ffa657" },
      { token: "operator", foreground: "ff7b72" },
    ],
    colors: {
      "editor.background": "#0d1117",
      "editor.foreground": "#c9d1d9",
      "editor.lineHighlightBackground": "#161b22",
      "editorLineNumber.foreground": "#6e7681",
      "editorIndentGuide.background": "#21262d",
      "editor.selectionBackground": "#264f78",
      "editor.inactiveSelectionBackground": "#264f7855",
    },
  },
  "github-light": {
    base: "vs",
    inherit: true,
    rules: [
      { token: "comment", foreground: "6a737d" },
      { token: "string", foreground: "032f62" },
      { token: "keyword", foreground: "d73a49" },
      { token: "number", foreground: "005cc5" },
      { token: "type", foreground: "6f42c1" },
      { token: "class", foreground: "6f42c1" },
      { token: "function", foreground: "005cc5" },
      { token: "variable", foreground: "e36209" },
    ],
    colors: {
      "editor.background": "#ffffff",
      "editor.foreground": "#24292e",
      "editorLineNumber.foreground": "#d1d5da",
      "editor.selectionBackground": "#c8e1ff",
      "editor.lineHighlightBackground": "#f6f8fa",
    },
  },
  monokai: {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "comment", foreground: "75715E" },
      { token: "string", foreground: "E6DB74" },
      { token: "keyword", foreground: "F92672" },
      { token: "number", foreground: "AE81FF" },
      { token: "type", foreground: "66D9EF" },
      { token: "class", foreground: "A6E22E" },
      { token: "function", foreground: "A6E22E" },
      { token: "variable", foreground: "F8F8F2" },
      { token: "operator", foreground: "F92672" },
    ],
    colors: {
      "editor.background": "#272822",
      "editor.foreground": "#F8F8F2",
      "editorLineNumber.foreground": "#75715E",
      "editor.selectionBackground": "#49483E",
      "editor.lineHighlightBackground": "#3E3D32",
      "editorCursor.foreground": "#F8F8F2",
      "editor.selectionHighlightBackground": "#49483E",
    },
  },
  "solarized-dark": {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "comment", foreground: "586e75" },
      { token: "string", foreground: "2aa198" },
      { token: "keyword", foreground: "859900" },
      { token: "number", foreground: "d33682" },
      { token: "type", foreground: "b58900" },
      { token: "class", foreground: "b58900" },
      { token: "function", foreground: "268bd2" },
      { token: "variable", foreground: "839496" },
    ],
    colors: {
      "editor.background": "#002b36",
      "editor.foreground": "#839496",
      "editorLineNumber.foreground": "#586e75",
      "editor.selectionBackground": "#073642",
      "editor.lineHighlightBackground": "#073642",
    },
  },
  "one-dark-pro": {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "comment", foreground: "5c6370" },
      { token: "string", foreground: "98c379" },
      { token: "keyword", foreground: "c678dd" },
      { token: "number", foreground: "d19a66" },
      { token: "type", foreground: "e5c07b" },
      { token: "class", foreground: "e5c07b" },
      { token: "function", foreground: "61afef" },
      { token: "variable", foreground: "abb2bf" },
    ],
    colors: {
      "editor.background": "#282c34",
      "editor.foreground": "#abb2bf",
      "editor.lineHighlightBackground": "#2c313a",
      "editorLineNumber.foreground": "#5c6370",
      "editorCursor.foreground": "#528bff",
      "editor.selectionBackground": "#3e4451",
    },
  },
  dracula: {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "comment", foreground: "6272a4" },
      { token: "string", foreground: "f1fa8c" },
      { token: "keyword", foreground: "ff79c6" },
      { token: "number", foreground: "bd93f9" },
      { token: "type", foreground: "8be9fd" },
      { token: "class", foreground: "8be9fd" },
      { token: "function", foreground: "50fa7b" },
      { token: "variable", foreground: "f8f8f2" },
    ],
    colors: {
      "editor.background": "#282a36",
      "editor.foreground": "#f8f8f2",
      "editorLineNumber.foreground": "#6272a4",
      "editorCursor.foreground": "#f8f8f0",
      "editor.selectionBackground": "#44475a",
      "editor.lineHighlightBackground": "#44475a40",
    },
  },
  nord: {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "comment", foreground: "616e88" },
      { token: "string", foreground: "a3be8c" },
      { token: "keyword", foreground: "81a1c1" },
      { token: "number", foreground: "b48ead" },
      { token: "type", foreground: "88c0d0" },
      { token: "class", foreground: "8fbcbb" },
      { token: "function", foreground: "88c0d0" },
      { token: "variable", foreground: "d8dee9" },
    ],
    colors: {
      "editor.background": "#2e3440",
      "editor.foreground": "#d8dee9",
      "editorLineNumber.foreground": "#4c566a",
      "editor.selectionBackground": "#434c5ecc",
      "editor.lineHighlightBackground": "#3b4252",
    },
  },
};

// Helper function to define themes in Monaco
export const defineMonacoThemes = (monaco: Monaco) => {
  Object.entries(THEME_DEFINITONS).forEach(([themeName, themeData]) => {
    monaco.editor.defineTheme(themeName, {
      base: themeData.base,
      inherit: themeData.inherit,
      rules: themeData.rules.map((rule) => ({
        ...rule,
        foreground: rule.foreground,
      })),
      colors: themeData.colors,
    });
  });
};
