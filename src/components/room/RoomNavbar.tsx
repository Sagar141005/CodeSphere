"use client";

import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useSession } from "next-auth/react";
import {
  Bug,
  ChevronDown,
  Download,
  Loader2,
  MessageSquareQuote,
  Mic,
  MicOff,
  StickyNote,
  Users,
  WandSparkles,
  Wrench,
} from "lucide-react";
import VoiceChatButton from "./Mic";
import toast from "react-hot-toast";
import { UserAvatar } from "../UserAvatar";

interface UserPresence {
  id: string;
  name: string;
  image?: string;
}

const MAX_VISIBLE_AVATARS = 5;

export default function RoomNavbar({
  roomSlug,
  roomName,
  handleExplain,
  handleRefactor,
  handleComments,
  handleFix,
  roomId,
}: {
  roomSlug: string;
  roomName: string;
  roomId: string;
  handleExplain: () => void;
  handleRefactor: () => void;
  handleComments: () => void;
  handleFix: () => void;
}) {
  const { data: session, status } = useSession();
  const [users, setUsers] = useState<UserPresence[]>([]);
  const [open, setOpen] = useState(false);
  const [AILoading, setAILoading] = useState(false);
  const [AILoadingAction, setAILoadingAction] = useState<string | null>(null);
  const [zipLoading, setZIPLoading] = useState(false);
  const [micStatuses, setMicStatuses] = useState<
    Record<string, "muted" | "unmuted">
  >({});
  const [showUserList, setShowUserList] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const userIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (status !== "authenticated" || !session?.user) return;

    if (!socketRef.current) {
      const socket = io(process.env.NEXT_PUBLIC_BACKEND_URL, {
        path: "/api/socket",
      });
      socketRef.current = socket;

      socket.on("connect", () => {
        const userPayload = {
          id: session.user.id || session.user.email!,
          name: session.user.name || "Anonymous",
          image: session.user.image || null,
        };
        userIdRef.current = userPayload.id;

        socket.emit("join-room", {
          roomId,
          user: userPayload,
        });
      });

      socketRef.current?.emit("mic-status", {
        roomId,
        userId: session.user.id,
        status: "muted",
      });

      socket.on("presence-update", (onlineUsers: UserPresence[]) => {
        setUsers([...new Map(onlineUsers.map((u) => [u.id, u])).values()]);
      });

      socket.on("mic-status-update", ({ userId, status }) => {
        setMicStatuses((prev) => ({ ...prev, [userId]: status }));
      });
    }

    return () => {
      if (socketRef.current && userIdRef.current) {
        socketRef.current.emit("leave-room", {
          roomId,
          userId: userIdRef.current,
        });
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [roomId, session, status]);

  const visibleUsers = users.slice(0, MAX_VISIBLE_AVATARS);
  const overflowCount = users.length - visibleUsers.length;

  const handleAIAction = async (
    action: string,
    callback: () => Promise<void> | void
  ) => {
    setOpen(false);
    setAILoading(true);
    setAILoadingAction(action);

    try {
      await callback();
    } catch (err) {
      console.error(err);
    } finally {
      setAILoading(false);
      setAILoadingAction(null);
    }
  };

  const handleZIPDownload = async () => {
    try {
      setZIPLoading(true);
      toast.loading("Preparing download...");

      const res = await fetch(`/api/room/${roomSlug}/export`);
      if (!res.ok) throw new Error("Failed to download project");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${roomName}.zip`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
      toast.error("Failed to download project");
    } finally {
      setZIPLoading(false);
      toast.dismiss();
    }
  };

  return (
    <nav
      role="navigation"
      aria-label="Room navigation bar"
      className="sticky top-0 left-0 right-0 z-50 h-14 px-6 flex items-center justify-between bg-neutral-950/80 backdrop-blur-md border-b border-neutral-800"
    >
      <div className="flex items-center gap-3 text-neutral-200 min-w-0">
        <Users
          className="w-5 h-5 text-neutral-500 flex-shrink-0"
          aria-hidden="true"
        />
        <h1
          className="text-sm font-mono font-medium truncate select-text text-neutral-300"
          title={`Room: ${roomName}`}
        >
          {roomName}
        </h1>
      </div>

      <div className="flex items-center gap-4">
        {session?.user && (
          <VoiceChatButton
            roomId={roomId}
            userId={session.user.id || session.user.email!}
          />
        )}

        <div className="relative">
          <button
            type="button"
            aria-haspopup="true"
            aria-expanded={open}
            onClick={() => setOpen(!open)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider
               text-neutral-300 bg-neutral-900 border border-neutral-800
               hover:bg-neutral-50 hover:text-neutral-950 transition-colors duration-200 cursor-pointer"
          >
            {AILoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {AILoadingAction === "explain" && "Explaining"}
                {AILoadingAction === "refactor" && "Refactoring"}
                {AILoadingAction === "comments" && "Adding"}
                {AILoadingAction === "fix" && "Fixing"}
                <span className="animate-pulse -ml-1">...</span>
              </>
            ) : (
              <>
                <WandSparkles className="w-4 h-4" />
                AI Actions
                <ChevronDown
                  className={`w-3 h-3 transition-transform ${
                    open ? "rotate-180" : "rotate-0"
                  }`}
                />
              </>
            )}
          </button>

          {open && (
            <div
              className="absolute right-0 mt-2 w-56 rounded-lg border border-neutral-800 bg-neutral-900 shadow-2xl z-50 overflow-hidden"
              role="menu"
            >
              <button
                onClick={() => handleAIAction("explain", handleExplain)}
                className="w-full px-4 py-2.5 text-sm text-left text-neutral-300 hover:bg-neutral-800 hover:text-neutral-50 flex items-center gap-3 transition cursor-pointer"
                role="menuitem"
              >
                <MessageSquareQuote className="w-4 h-4 text-blue-400" />
                Explain Selection
              </button>
              <button
                onClick={() => handleAIAction("refactor", handleRefactor)}
                className="w-full px-4 py-2.5 text-sm text-left text-neutral-300 hover:bg-neutral-800 hover:text-neutral-50 flex items-center gap-3 transition cursor-pointer"
                role="menuitem"
              >
                <Wrench className="w-4 h-4 text-purple-400" />
                Refactor Selection
              </button>
              <button
                onClick={() => handleAIAction("comments", handleComments)}
                className="w-full px-4 py-2.5 text-sm text-left text-neutral-300 hover:bg-neutral-800 hover:text-neutral-50 flex items-center gap-3 transition cursor-pointer"
                role="menuitem"
              >
                <StickyNote className="w-4 h-4 text-amber-400" />
                Add Comments
              </button>
              <div className="h-px bg-neutral-800 my-1 mx-2" />
              <button
                onClick={() => handleAIAction("fix", handleFix)}
                className="w-full px-4 py-2.5 text-sm text-left text-neutral-300 hover:bg-neutral-800 hover:text-neutral-50 flex items-center gap-3 transition cursor-pointer"
                role="menuitem"
              >
                <Bug className="w-4 h-4 text-red-400" />
                Fix Errors
              </button>
            </div>
          )}
        </div>

        <button
          onClick={handleZIPDownload}
          disabled={zipLoading}
          title="Download Project as ZIP"
          className="p-2 rounded-md text-neutral-400 bg-neutral-900 border border-neutral-800
        hover:bg-neutral-800 hover:text-neutral-50 transition-colors duration-200 cursor-pointer"
        >
          {zipLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
        </button>

        {users.length > 0 ? (
          <div
            className="flex items-center -space-x-3 pl-2"
            aria-label={`${users.length} users online`}
            role="group"
            onClick={() => setShowUserList(!showUserList)}
          >
            {visibleUsers.map((user) => (
              <div
                key={user.id}
                className="ring-2 ring-neutral-950 rounded-full"
              >
                <UserAvatar user={user} />
              </div>
            ))}
            {overflowCount > 0 && (
              <div
                className="w-9 h-9 rounded-full bg-neutral-800 text-neutral-400 flex items-center justify-center text-xs font-bold border-2 border-neutral-950 shadow-sm cursor-pointer hover:bg-neutral-700 hover:text-neutral-200 transition-colors"
                title={`${overflowCount} more users`}
                aria-hidden="true"
              >
                +{overflowCount}
              </div>
            )}
          </div>
        ) : (
          <span className="text-xs text-neutral-600 animate-pulse">
            Connecting...
          </span>
        )}
      </div>

      {showUserList && (
        <div className="absolute right-4 top-14 w-64 rounded-lg border border-neutral-800 bg-neutral-900 shadow-2xl z-50 overflow-hidden">
          <div className="px-4 py-3 text-neutral-500 text-xs font-bold uppercase tracking-widest bg-neutral-950/50 border-b border-neutral-800">
            Online Users ({users.length})
          </div>
          <ul className="max-h-60 overflow-y-auto divide-y divide-neutral-800">
            {users.map((user) => (
              <li
                key={user.id}
                className="flex items-center gap-3 px-4 py-2.5 text-neutral-300 hover:bg-neutral-800 transition-colors"
              >
                <UserAvatar user={user} size="xs" />
                <span className="truncate flex-1 text-sm">{user.name}</span>

                {micStatuses[user.id] === "muted" ? (
                  <MicOff className="w-3.5 h-3.5 text-neutral-600" />
                ) : micStatuses[user.id] === "unmuted" ? (
                  <Mic className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <MicOff className="w-3.5 h-3.5 text-neutral-700" />
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  );
}
