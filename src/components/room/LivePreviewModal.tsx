"use client";

import { ExternalLink, X, MonitorPlay } from "lucide-react";
import React, { useEffect, useState } from "react";

type Props = {
  html: string;
  css: string;
  js: string;
  cssFileName: string;
  jsFileName: string;
  onClose: () => void;
  error?: string | null;
};

export default function LivePreviewPane({
  html,
  css,
  js,
  onClose,
  cssFileName,
  jsFileName,
  error = null,
}: Props) {
  const [iframeSrc, setIframeSrc] = useState("");

  useEffect(() => {
    let cleanedHTML = html || "";

    // 1. Inject CSS (Replace <link> with <style>)
    if (cssFileName && css) {
      const cssLinkRegex = new RegExp(
        `<link[^>]*href=["'][^"']*${cssFileName}["'][^>]*>`,
        "i"
      );
      if (cssLinkRegex.test(cleanedHTML)) {
        cleanedHTML = cleanedHTML.replace(
          cssLinkRegex,
          `<style>\n${css}\n</style>`
        );
      } else {
        // Fallback: append if not found
        cleanedHTML = cleanedHTML.replace(
          "</head>",
          `<style>\n${css}\n</style></head>`
        );
      }
    }

    // 2. Inject JS (Replace <script src="..."> with inline script)
    // We remove type="module" to ensure immediate execution and avoid opaque origin CORS issues
    if (jsFileName && js) {
      const jsScriptRegex = new RegExp(
        `<script[^>]*src=["'][^"']*${jsFileName}["'][^>]*><\\/script>`,
        "i"
      );
      if (jsScriptRegex.test(cleanedHTML)) {
        cleanedHTML = cleanedHTML.replace(
          jsScriptRegex,
          `<script>\n${js}\n</script>`
        );
      } else {
        // Fallback: append before body end
        cleanedHTML = cleanedHTML.replace(
          "</body>",
          `<script>\n${js}\n</script></body>`
        );
      }
    }

    // 3. System Script to Fix Iframe Navigation
    // This script intercepts anchor clicks (#id) to prevent the iframe from
    // reloading the parent page (which causes the Mobile Blocker to appear).
    const systemScript = `
      <script>
        document.addEventListener('DOMContentLoaded', () => {
          // Fix 1: Intercept Anchor Links
          document.body.addEventListener('click', (e) => {
            const link = e.target.closest('a[href^="#"]');
            if (link) {
              e.preventDefault();
              const id = link.getAttribute('href').slice(1);
              const target = document.getElementById(id);
              if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
              }
            }
          });

          // Fix 2: Prevent Form Refresh if JS fails
          // This ensures the page doesn't reload to 'about:srcdoc' or Parent URL
          document.querySelectorAll('form').forEach(form => {
             if (!form.getAttribute('action')) {
                form.setAttribute('action', 'javascript:void(0);');
             }
          });
        });
      </script>
    `;

    // 4. Construct Final HTML
    const combined = error
      ? `
      <html>
        <body style="background:#0a0a0a; color:#f87171; font-family: monospace; padding: 20px; box-sizing: border-box;">
          <h3 style="margin-top: 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #ef4444;">⚠️ Runtime Error</h3>
          <pre style="background: #171717; padding: 15px; border-radius: 8px; border: 1px solid #262626; overflow-x: auto;">${error
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")}</pre>
        </body>
      </html>`
      : `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <style>
            /* Force full height for modern layouts */
            html, body { min-height: 100%; margin: 0; padding: 0; }
            /* Basic Reset */
            *, *::before, *::after { box-sizing: border-box; }
          </style>
          ${
            !cleanedHTML.toLowerCase().includes("<head>")
              ? systemScript // Inject script if head is missing in user code
              : ""
          }
        </head>
        <body>
          <div id="__preview-root__" style="width:100%; height:100%;">
            ${
              cleanedHTML.toLowerCase().includes("<head>")
                ? cleanedHTML.replace("</head>", `${systemScript}</head>`) // Inject script into existing head
                : cleanedHTML
            }
          </div>
        </body>
      </html>`;

    setIframeSrc(combined);
  }, [html, css, js, cssFileName, jsFileName, error]);

  const openInNewTab = () => {
    const blob = new Blob([iframeSrc], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  };

  return (
    <div className="h-full flex flex-col bg-neutral-950 border-l border-neutral-800 w-full select-none">
      <div className="h-10 flex items-center justify-between px-3 border-b border-neutral-800 bg-neutral-900/50 flex-shrink-0">
        <div className="flex items-center gap-2">
          <MonitorPlay className="w-3.5 h-3.5 text-blue-500" />
          <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
            Browser Preview
          </span>

          <div className="flex items-center gap-1.5 px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
            <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[9px] font-bold text-emerald-500 uppercase">
              Live
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={openInNewTab}
            title="Open in New Tab"
            className="p-1.5 text-neutral-500 hover:text-neutral-200 hover:bg-neutral-800 rounded-md transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </button>

          <div className="w-px h-3 bg-neutral-800 mx-1" />

          <button
            onClick={onClose}
            title="Close Preview"
            className="p-1.5 text-neutral-500 hover:text-red-400 hover:bg-red-950/20 rounded-md transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="flex-1 bg-white relative">
        <iframe
          className="w-full h-full border-none block"
          srcDoc={iframeSrc}
          sandbox="allow-scripts allow-same-origin allow-modals allow-forms"
          title="Live Preview"
        />
      </div>
    </div>
  );
}
