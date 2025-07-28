'use client';

import { forwardRef, useImperativeHandle, useRef, useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, Clock, Copy, Terminal as TerminalIcon } from 'lucide-react';
import { getSocket } from '@/lib/socket';

export interface TerminalRef {
  runCode: (language: string, code: string) => void;
}

interface TerminalProps {
  roomId: string;
  height: number;
  setHeight: (h: number) => void;
  isExpanded: boolean;
}

interface TerminalEntry {
  output?: string,
  error?: string
  ranBy: string,
  timeStamp: string
}

const Terminal = forwardRef<TerminalRef, TerminalProps>(({ roomId, height, setHeight, isExpanded }, ref) => {
  const [ output, setOutput ] = useState('');
  const [ error, setError ] = useState('');
  const [ isCopied, setIsCopied ] = useState(false);
  const [ isRunning, setIsRunning ] = useState(false);
  const [ log, setLog ] = useState<TerminalEntry[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const MIN_HEIGHT = 40;
  const MAX_HEIGHT = 500;

  const runCode = async (language: string, code: string) => {
    setIsRunning(true);
    setOutput('');
    setError('');

    try {
      const res = await fetch('/api/exec', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language, code }),
      });

      const data = await res.json();
      setOutput(data.output || '');
      setError(data.error || '');
    } catch {
      setError('An error occurred while executing code.');
    } finally {
      setIsRunning(false);
    }
  };

  useImperativeHandle(ref, () => ({ runCode }));

  const handleCopy = async () => {
    if (!output && !error) return;
    await navigator.clipboard.writeText(error || output);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [output, error]);

  useEffect(() => {
    const socket = getSocket();
  
    const handleTerminalUpdate = (data: any) => {
        console.log("Received terminal-update:", data, typeof data);
      
    
      const payload = typeof data === 'string'
        ? { output: data, error: '', ranBy: 'Unknown', timeStamp: new Date().toLocaleTimeString(), roomId }
        : data;
    
      if (payload.roomId !== roomId) return;
    
      setLog((prev) => [
        ...prev,
        {
          output: payload.output || '',
          error: payload.error || '',
          ranBy: payload.ranBy || 'Unknown',
          timeStamp: payload.timeStamp || new Date().toLocaleTimeString(),
        },
      ]);
      setIsRunning(false);
    
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    };
    
  
    socket.on('terminal-update', handleTerminalUpdate);
  
    return () => {
      socket.off('terminal-update', handleTerminalUpdate);
    };
  }, [roomId]);
  

  // Resize logic
  const handleMouseDown = (e: React.MouseEvent) => {
    const startY = e.clientY;
    const startHeight = height;

    const handleMouseMove = (e: MouseEvent) => {
      const delta = e.clientY - startY;
      const newHeight = Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, startHeight - delta));
      setHeight(newHeight);
    };

    const handleMouseUp = () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <div
    style={{ height }}
    className="relative w-full flex flex-col bg-[#1e1e1e]"
  >
    {/* Drag Handle */}
    <div
      onMouseDown={handleMouseDown}
      className="absolute top-0 left-0 w-full h-2 cursor-row-resize bg-transparent z-10"
      title="Drag to resize terminal"
    />

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#2c2c2c] bg-[#1f1f1f]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 flex items-center justify-center bg-[#242424] rounded-md">
            <TerminalIcon className="w-4 h-4 text-blue-400" />
          </div>
          <span className="text-sm font-medium text-gray-300">Terminal</span>
        </div>

        {(output || error) && (
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-xs px-3 py-1 rounded-md text-gray-400 hover:text-white hover:bg-[#2c2c2c] border border-[#333] transition"
          >
            {isCopied ? (
              <>
                <CheckCircle className="w-4 h-4" /> Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" /> Copy
              </>
            )}
          </button>
        )}
      </div>

      {/* Output Area */}
      {/* Show full output if expanded or output/error exists, else show collapsed */}
      {(isExpanded || log.length > 0) ? (
        <div
          ref={scrollRef}
          className="relative bg-[#1e1e2e]/50 backdrop-blur-sm border border-[#313244] 
            rounded-xl p-4 flex-1 overflow-auto font-mono text-sm mt-2"
        >
          {isRunning ? (
            <div className="text-gray-400">Running...</div>
          ) : log.length > 0 ? (
            log.map(({ output, error, ranBy, timeStamp }, i) => (
              <div key={i} className="mb-4 last:mb-0">
                <div className="mb-1 text-xs text-gray-400 italic select-none">
                  Last run by <span className="font-semibold">{ranBy}</span> at {timeStamp}
                </div>
                {error ? (
                  <pre className="whitespace-pre-wrap text-red-400">{error}</pre>
                ) : (
                  <pre className="whitespace-pre-wrap text-gray-300">{output}</pre>
                )}
                <hr className="my-2 border-gray-700" />
              </div>
            ))
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-500">
              <div className="w-12 h-12 bg-[#2c2c2c] rounded-lg flex items-center justify-center mb-2">
                <Clock className="w-6 h-6" />
              </div>
              <p className="text-sm text-gray-400">Run your code to see output here</p>
            </div>
          )}
        </div>
      ) : (
        // Collapsed minimal view
        <div className="flex flex-col items-center justify-center flex-1 px-4 pb-3 pt-2 text-gray-400 font-mono text-sm">
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 bg-[#2c2c2c] rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
            <p className="text-sm text-gray-400">Run your code to see output here</p>
          </div>
        </div>
      )}
    </div>
  );
});

Terminal.displayName = 'Terminal';
export default Terminal;
