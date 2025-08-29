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
import { UserAvatar } from "./UserAvatar";

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

  // Split avatars + overflow count
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
      className="sticky top-0 left-0 right-0 z-50 h-14 px-6 flex items-center justify-between bg-white/5 backdrop-blur-md border-b border-white/10"
    >
      {/* Left: Room name */}
      <div className="flex items-center gap-3 text-white min-w-0">
        <Users
          className="w-6 h-6 text-neutral-400 flex-shrink-0"
          aria-hidden="true"
        />
        <h1
          className="text-lg font-semibold truncate select-text"
          title={`Room: ${roomName}`}
        >
          {roomName}
        </h1>
      </div>

      {/* Right: User avatars + AI Assist */}
      <div className="flex items-center gap-6">
        {/* Mic */}
        {session?.user && (
          <VoiceChatButton
            roomId={roomId}
            userId={session.user.id || session.user.email!}
          />
        )}

        {/* AI Assist Dropdown */}
        <div className="relative">
          <button
            type="button"
            aria-haspopup="true"
            aria-expanded={open}
            onClick={() => setOpen(!open)}
            className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium
               text-white bg-[#1a1a1a] border border-white/10
               hover:bg-white hover:text-black transition-colors duration-200 cursor-pointer"
          >
            {AILoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {AILoadingAction === "explain" && "Explaining"}
                {AILoadingAction === "refactor" && "Refactoring"}
                {AILoadingAction === "comments" && "Adding"}
                {AILoadingAction === "fix" && "Fixing"}
                <span className="animate-pulse -ml-1 text-white">...</span>
              </>
            ) : (
              <>
                <WandSparkles className="w-5 h-5" />
                AI Assist
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    open ? "rotate-180" : "rotate-0"
                  }`}
                />
              </>
            )}
          </button>

          {open && (
            <div
              className="absolute right-0 mt-2 w-56 rounded-md border border-white/10 bg-[#1a1a1a] shadow-xl z-50 animate-fadeIn"
              role="menu"
            >
              <button
                onClick={() => handleAIAction("explain", handleExplain)}
                className="w-full px-4 py-2 text-sm text-left text-white hover:bg-white/10 flex items-center gap-2 transition cursor-pointer"
                role="menuitem"
              >
                <MessageSquareQuote className="w-4 h-4 text-blue-300" />
                Explain Selection
              </button>
              <button
                onClick={() => handleAIAction("refactor", handleRefactor)}
                className="w-full px-4 py-2 text-sm text-left text-white hover:bg-white/10 flex items-center gap-2 transition cursor-pointer"
                role="menuitem"
              >
                <Wrench className="w-4 h-4 text-indigo-300" />
                Refactor Selection
              </button>
              <button
                onClick={() => handleAIAction("comments", handleComments)}
                className="w-full px-4 py-2 text-sm text-left text-white hover:bg-white/10 flex items-center gap-2 transition cursor-pointer"
                role="menuitem"
              >
                <StickyNote className="w-4 h-4 text-yellow-300" />
                Add Comments
              </button>
              <button
                onClick={() => handleAIAction("fix", handleFix)}
                className="w-full px-4 py-2 text-sm text-left text-white hover:bg-white/10 flex items-center gap-2 transition cursor-pointer"
                role="menuitem"
              >
                <Bug className="w-4 h-4 text-red-400" />
                Fix Errors in File
              </button>
            </div>
          )}
        </div>

        {/* Download Button */}
        <button
          onClick={handleZIPDownload}
          disabled={zipLoading}
          title="Download Project as ZIP"
          className="px-3 py-2 rounded-md text-sm font-medium
        text-white bg-[#1a1a1a] border border-white/10
        hover:bg-white/10 hover:text-white transition-colors duration-200 cursor-pointer"
        >
          {zipLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
            </>
          )}
        </button>

        {/* Avatars */}
        {/* Avatars UI */}
        {users.length > 0 ? (
          <div
            className="flex items-center -space-x-3"
            aria-label={`${users.length} users online`}
            role="group"
            onClick={() => setShowUserList(!showUserList)}
          >
            {visibleUsers.map((user) => (
              <UserAvatar key={user.id} user={user} />
            ))}
            {overflowCount > 0 && (
              <div
                className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-800 text-white flex items-center justify-center text-sm font-medium border-2 border-gray-900 shadow-md"
                title={`${overflowCount} more users`}
                aria-hidden="true"
              >
                +{overflowCount}
              </div>
            )}
          </div>
        ) : (
          <span className="text-sm text-gray-400">
            Waiting for others to join...
          </span>
        )}
      </div>

      {showUserList && (
        <div className="absolute right-4 top-14 w-64 rounded-md border border-white/10 bg-[#1a1a1a] shadow-xl z-50">
          <div className="p-3 text-white text-sm font-medium">
            Users in Room
          </div>
          <ul className="max-h-60 overflow-y-auto divide-y divide-white/10">
            {users.map((user) => (
              <li
                key={user.id}
                className="flex items-center gap-2 px-3 py-2 text-white"
              >
                <UserAvatar user={user} />
                <span className="truncate flex-1">{user.name}</span>

                {/* Mic status icon - e.g. muted/unmuted */}
                {micStatuses[user.id] === "muted" ? (
                  <MicOff className="w-4 h-4 text-gray-400" />
                ) : micStatuses[user.id] === "unmuted" ? (
                  <Mic className="w-4 h-4 text-green-400" />
                ) : (
                  <MicOff className="w-4 h-4 text-gray-500 opacity-50" /> // fallback for unknown
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  );
}
