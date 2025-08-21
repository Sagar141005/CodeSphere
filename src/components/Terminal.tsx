"use client";

import {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
  useEffect,
} from "react";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Copy,
  Eraser,
  Loader,
  Terminal as TerminalIcon,
} from "lucide-react";
import { getSocket } from "@/lib/socket";

export interface TerminalRef {
  displayOutput: (output: string, error: string) => void;
  setRunning: (running: boolean) => void;
}

interface TerminalProps {
  roomId: string;
  height: number;
  setHeight: (h: number) => void;
  isExpanded: boolean;
  handleResize: (
    e: React.MouseEvent,
    startHeight: number,
    setHeight: (h: number) => void,
    min?: number,
    max?: number
  ) => void;
}

interface TerminalEntry {
  output?: string;
  error?: string;
  ranBy: string;
  timeStamp: string;
}

const Terminal = forwardRef<TerminalRef, TerminalProps>(
  ({ roomId, height, setHeight, isExpanded, handleResize }, ref) => {
    const [output, setOutput] = useState("");
    const [error, setError] = useState("");
    const [isCopied, setIsCopied] = useState(false);
    const [isRunning, setIsRunning] = useState(false);
    const [isExpandedOutput, setIsExpandedOutput] = useState(false);
    const [log, setLog] = useState<TerminalEntry[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () => ({
      displayOutput: (output: string, error: string) => {
        setOutput(output);
        setError(error);
      },
      setRunning: (running: boolean) => {
        setIsRunning(running);
      },
    }));

    const handleCopy = async () => {
      if (!output && !error) return;
      await navigator.clipboard.writeText(error || output);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    };

    const clearLog = () => {
      setLog([]);
      setOutput("");
      setError("");
    };

    useEffect(() => {
      const timeout = setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTo({
            top: scrollRef.current.scrollHeight,
            behavior: "smooth",
          });
        }
      }, 0);

      return () => clearTimeout(timeout);
    }, [log]);

    useEffect(() => {
      const socket = getSocket();

      const handleTerminalUpdate = (data: any) => {
        console.log("Received terminal-update:", data, typeof data);

        const payload =
          typeof data === "string"
            ? {
                output: data,
                error: "",
                ranBy: "Unknown",
                timeStamp: new Date().toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                  second: "2-digit",
                  hour12: true,
                }),
                roomId,
              }
            : data;

        if (payload.roomId !== roomId) return;

        setLog((prev) => [
          ...prev,
          {
            output: payload.output || "",
            error: payload.error || "",
            ranBy: payload.ranBy || "Unknown",
            timeStamp:
              payload.timeStamp ||
              new Date().toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
                second: "2-digit",
                hour12: true,
              }),
          },
        ]);
        setIsRunning(false);

        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      };

      socket.on("terminal-update", handleTerminalUpdate);

      return () => {
        socket.off("terminal-update", handleTerminalUpdate);
      };
    }, [roomId]);

    return (
      <div
        style={{ height }}
        className="relative w-full flex flex-col bg-[#1e1e1e] group"
      >
        {/* Drag Handle */}
        <div
          onMouseDown={(e) => handleResize(e, height, setHeight, 40, 500)}
          className="absolute top-0 left-0 w-full h-2 cursor-row-resize bg-transparent z-10"
          title="Drag to resize terminal"
        />

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-[#2c2c2c] bg-[#1f1f1f]">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 flex items-center justify-center bg-[#242424] rounded-md">
              <TerminalIcon className="w-4 h-4 text-neutral-400 group-hover:text-blue-400" />
            </div>
            <span className="text-sm font-medium text-gray-300">Terminal</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Clear Button */}
            {log.length > 0 && (
              <button
                onClick={clearLog}
                className="flex items-center gap-1.5 text-xs px-3 py-1 rounded-md text-gray-400 hover:text-white hover:bg-[#2c2c2c] border border-[#333] transition"
                title="Clear terminal output"
              >
                <Eraser className="w-3 h-3" />
                Clear
              </button>
            )}

            {/* Copy Button */}
            {(output || error) && (
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 text-xs px-3 py-1 rounded-md text-gray-400 hover:text-white hover:bg-[#2c2c2c] border border-[#333] transition"
              >
                {isCopied ? (
                  <>
                    <CheckCircle className="w-3 h-3" /> Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" /> Copy
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Output Area */}
        {/* Show full output if expanded or output/error exists, else show collapsed */}
        {isExpanded || log.length > 0 ? (
          <div
            ref={scrollRef}
            className="relative bg-[#1e1e2e]/50 backdrop-blur-sm border border-[#313244] 
            p-4 flex-1 overflow-auto text-sm"
          >
            {isRunning ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-500">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-2 animate-spin">
                  <Loader className="w-6 h-6 text-blue-400" />
                </div>
                <p className="text-sm text-gray-400">Running your code...</p>
              </div>
            ) : log.length > 0 ? (
              log.map(({ output, error, ranBy, timeStamp }, i) => {
                const isError = Boolean(error);
                const displayText = isError ? error : output;
                const isLongOutput = displayText!.length > 500;

                return (
                  <div
                    key={i}
                    className={`mb-4 last:mb-0 p-4 rounded-lg border text-sm font-mono transition-all duration-200 animate-fade-in
                    ${
                      isError
                        ? "border-red-500/20 bg-[#2b1a1a]"
                        : "border-emerald-500/20 bg-[#1a2b1a]"
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-2 text-xs text-gray-400 italic">
                      <div className="flex items-center gap-2">
                        <span>
                          Ran by{" "}
                          <span className="font-semibold text-white">
                            {ranBy}
                          </span>
                        </span>
                        {/* Pill Badge */}
                        <span
                          className={`px-2 py-0.5 text-[10px] rounded-full font-bold uppercase tracking-wide ${
                            isError
                              ? "bg-red-600/20 text-red-400 border border-red-400/40"
                              : "bg-emerald-600/20 text-emerald-400 border border-emerald-400/40"
                          }`}
                        >
                          {isError ? "Error" : "Success"}
                        </span>
                      </div>
                      <span>{timeStamp}</span>
                    </div>

                    {/* Output/Error Content */}
                    <div className="flex items-start gap-2 whitespace-pre-wrap break-words">
                      {isError ? (
                        <AlertTriangle className="text-red-400 w-4 h-4 mt-1" />
                      ) : (
                        <CheckCircle className="text-emerald-400 w-4 h-4 mt-1" />
                      )}
                      <pre
                        className={`flex-1 ${
                          isError ? "text-red-300" : "text-emerald-300"
                        }`}
                        style={{
                          maxHeight:
                            !isExpandedOutput && isLongOutput
                              ? "180px"
                              : "none",
                          overflow:
                            !isExpandedOutput && isLongOutput
                              ? "hidden"
                              : "visible",
                        }}
                      >
                        {displayText}
                      </pre>
                    </div>

                    {/* Show More Toggle */}
                    {isLongOutput && (
                      <div className="mt-2 text-right">
                        <button
                          onClick={() => setIsExpandedOutput(!isExpandedOutput)}
                          className="text-xs text-blue-400 hover:underline cursor-pointer"
                        >
                          {isExpandedOutput ? "Show less" : "Show more"}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-500">
                <div className="w-12 h-12 bg-[#2c2c2c] rounded-lg flex items-center justify-center mb-2">
                  <Clock className="w-6 h-6" />
                </div>
                <p className="text-sm text-gray-400">
                  Run your code to see output here
                </p>
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
              <p className="text-sm text-gray-400">
                Run your code to see output here
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }
);

Terminal.displayName = "Terminal";
export default Terminal;
