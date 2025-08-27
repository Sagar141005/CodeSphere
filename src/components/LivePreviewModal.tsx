"use client";

import { AppWindow, X } from "lucide-react";
import React, { useCallback, useEffect } from "react";
import toast from "react-hot-toast";

type Props = {
  html: string;
  css: string;
  js: string;
  cssFileName: string;
  jsFileName: string;
  onClose: () => void;
  error?: string | null;
};

export default function LivePreviewModal({
  html,
  css,
  js,
  onClose,
  cssFileName,
  jsFileName,
  error = null,
}: Props) {
  let cleanedHTML = html;

  // Replace CSS <link> tag with inline <style>
  if (cssFileName && css) {
    const cssLinkRegex = new RegExp(
      `<link[^>]*href=["'][^"']*${cssFileName}["'][^>]*>`,
      "i"
    );
    if (cssLinkRegex.test(cleanedHTML)) {
      cleanedHTML = cleanedHTML.replace(cssLinkRegex, `<style>${css}</style>`);
    }
  }

  // Replace external JS <script src="..."> with inline <script type="module">
  if (jsFileName && js) {
    const jsScriptRegex = new RegExp(
      `<script[^>]*src=["'][^"']*${jsFileName}["'][^>]*><\\/script>`,
      "i"
    );
    if (jsScriptRegex.test(cleanedHTML)) {
      cleanedHTML = cleanedHTML.replace(
        jsScriptRegex,
        `<script type="module">${js}</script>`
      );
    }
  }

  // Wrap in full HTML doc, show error if exists
  const combined = error
    ? `
      <html>
        <body style="background:#1e1e1e; color:#ff4d4d; font-family: monospace; padding: 10px;">
          <h3>⚠️ Error Detected</h3>
          <pre>${error.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</pre>
        </body>
      </html>`
    : `
      <html>
        <head>
          <style>
            html, body {
              height: 100%;
              margin: 0;
              padding: 0;
            }
            *, *::before, *::after {
              box-sizing: border-box;
            }
            #__user-root__ {
              min-height: 100vh;
              width: 100%;
              display: flex;
              flex-direction: column;
            }
          </style>
        </head>
        <body>
          <div id="__user-root__">
            ${cleanedHTML}
          </div>
        </body>
      </html>`;

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    document.body.classList.add("disable-cursor-blob");
    return () => {
      document.body.classList.remove("disable-cursor-blob");
    };
  }, []);

  const openInNewTab = () => {
    const blob = new Blob([combined], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center previewModal"
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" />

      {/* Modal Shell */}
      <div className="relative w-[95%] h-[95%] border border-[#2a2a2e] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-scaleIn">
        {/* Glow Overlay */}
        <div className="absolute inset-0 rounded-2xl pointer-events-none bg-gradient-to-br from-blue-500/10 to-purple-500/10 blur-md opacity-0 hover:opacity-100 transition-all duration-300" />

        {/* Header */}
        <div className="relative z-10 flex items-center justify-between px-4 py-3 border-b border-[#2a2a2e] bg-[#1e1e1e]">
          <h2 className="text-sm font-semibold text-white">Live Preview</h2>

          <div className="flex items-center gap-3">
            <button
              onClick={openInNewTab}
              aria-label="Open live preview in new tab"
              className="flex items-center gap-2 bg-gradient-to-br from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 active:scale-95 active:brightness-90 transition text-white font-semibold text-sm px-5 py-2.5 rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1 cursor-pointer"
            >
              <AppWindow className="w-5 h-5" /> Open in New Tab
            </button>

            <button
              onClick={onClose}
              aria-label="Close live preview"
              className="bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 text-white p-2 rounded-full transition-all cursor-pointer shadow-md"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Iframe Preview */}
        <div className="flex-1 bg-white">
          <iframe
            className="w-full h-full border-none"
            srcDoc={combined}
            sandbox="allow-scripts allow-same-origin allow-modals"
            loading="lazy"
          />
        </div>
      </div>
    </div>
  );
}
