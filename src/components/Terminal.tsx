'use client';

import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { Terminal as XTerm } from '@xterm/xterm';
import { getSocket } from "@/lib/socket";
import '@xterm/xterm/css/xterm.css';

export interface TerminalRef {
  runCode: (language: string, code: string) => void;
}

interface TerminalProps {
  roomId: string;
}

const Terminal = forwardRef<TerminalRef, TerminalProps>(({ roomId }, ref) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xterm = useRef<XTerm | null>(null);
  const socket = getSocket();

  useEffect(() => {
    if (terminalRef.current && !xterm.current) {
      xterm.current = new XTerm({
        cursorBlink: true,
        fontSize: 14,
        theme: { background: '#000000', foreground: '#ffffff' }
      });
      xterm.current.open(terminalRef.current);
      xterm.current.writeln('Welcome to Live Terminal!');
    }
  }, []);

  useEffect(() => {
    const handleTerminalUpdate = (output: string) => {
      xterm.current?.clear();
      xterm.current?.writeln(output);
    };

    socket.on('terminal-update', handleTerminalUpdate);
    return () => {
      socket.off('terminal-update', handleTerminalUpdate);
    };
  }, [socket]);


  const runCode = async (language: string, code: string) => {
    if (!xterm.current) return;
    xterm.current.clear();
    xterm.current.writeln(`$ Running ${language} code...\n`);

    const res = await fetch('/api/exec', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ language, code }),
    });

    const data = await res.json();
    const output = data.output || data.error || "No output";
    xterm.current.writeln(output);

    socket.emit('terminal-output', { roomId, output });
  };

  useImperativeHandle(ref, () => ({ runCode }));

  return (
    <div ref={terminalRef} className="w-full h-full" />
  );
});

Terminal.displayName = 'Terminal';
export default Terminal;
