"use client";

import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useSession } from "next-auth/react";
import {
  Bug,
  ChevronDown,
  Loader2,
  MessageSquareQuote,
  StickyNote,
  Users,
  WandSparkles,
  Wrench,
} from "lucide-react";

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
}: {
  roomSlug: string;
  roomName: string;
  handleExplain: () => void;
  handleRefactor: () => void;
  handleComments: () => void;
  handleFix: () => void;
}) {
  const { data: session, status } = useSession();
  const [users, setUsers] = useState<UserPresence[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const userIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (status !== "authenticated" || !session?.user) return;

    if (!socketRef.current) {
      socketRef.current = io({ path: "/api/socket" });
    }

    const sock = socketRef.current;

    const userPayload = {
      id: session.user.id || session.user.email!,
      name: session.user.name || "Anonymous",
      image: session.user.image || "/default-avatar.jpg",
    };
    userIdRef.current = userPayload.id;

    sock.emit("join-room", {
      roomId: roomSlug,
      user: userPayload,
    });

    sock.on("presence-update", (onlineUsers: UserPresence[]) => {
      const uniqueUsers = Array.from(
        new Map(
          onlineUsers.filter((u) => u.id).map((user) => [user.id, user])
        ).values()
      );
      setUsers(uniqueUsers);
    });

    return () => {
      if (sock && userIdRef.current) {
        sock.emit("leave-room", {
          roomId: roomSlug,
          userId: userIdRef.current,
        });
      }
      sock.disconnect();
      socketRef.current = null;
    };
  }, [roomSlug, session, status]);

  // Split avatars + overflow count
  const visibleUsers = users.slice(0, MAX_VISIBLE_AVATARS);
  const overflowCount = users.length - visibleUsers.length;

  const handleAIAction = async (
    action: string,
    callback: () => Promise<void> | void
  ) => {
    setOpen(false);
    setLoading(true);
    setLoadingAction(action);

    try {
      await callback();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setLoadingAction(null);
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
        {/* Avatars */}
        <div
          className="flex items-center -space-x-3"
          aria-label={`${users.length} users online`}
          role="group"
        >
          {visibleUsers.map((user) => (
            <img
              key={user.id}
              src={user.image || "/default-avatar.jpg"}
              alt={user.name}
              title={user.name}
              className="w-9 h-9 rounded-full border-2 border-gray-900 object-cover shadow-sm"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src =
                  "/default-avatar.jpg";
              }}
              loading="lazy"
            />
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
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {loadingAction === "explain" && "Explaining"}
                {loadingAction === "refactor" && "Refactoring"}
                {loadingAction === "comments" && "Adding"}
                {loadingAction === "fix" && "Fixing"}
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
      </div>
    </nav>
  );
}
