'use client';

import { useEffect, useState, useRef } from "react";
import { io, Socket } from 'socket.io-client';
import { useSession } from "next-auth/react";
import { Users, Sparkles } from "lucide-react";

interface UserPresence {
  id: string;
  name: string;
  image?: string;
}

const MAX_VISIBLE_AVATARS = 5;

export default function Navbar({ roomSlug, roomName }: { roomSlug: string; roomName: string }) {
  const { data: session, status } = useSession();
  const [users, setUsers] = useState<UserPresence[]>([]);
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
        sock.emit("leave-room", { roomId: roomSlug, userId: userIdRef.current });
      }
      sock.disconnect();
      socketRef.current = null;
    };
  }, [roomSlug, session, status]);

  // Split avatars + overflow count
  const visibleUsers = users.slice(0, MAX_VISIBLE_AVATARS);
  const overflowCount = users.length - visibleUsers.length;

  return (
    <nav
      role="navigation"
      aria-label="Room navigation bar"
      className="h-14 bg-[#1f1f1f] border-b border-gray-700 px-6 flex items-center justify-between shadow-md"
    >
      {/* Left: Room name */}
      <div className="flex items-center gap-3 text-white min-w-0">
        <Users className="w-6 h-6 text-blue-400 flex-shrink-0" aria-hidden="true" />
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
                (e.currentTarget as HTMLImageElement).src = "/default-avatar.jpg";
              }}
              loading="lazy"
            />
          ))}
          {overflowCount > 0 && (
            <div
              className="w-9 h-9 rounded-full bg-gray-700 text-gray-300 flex items-center justify-center text-sm font-medium border-2 border-gray-900 shadow-sm"
              title={`${overflowCount} more users`}
              aria-hidden="true"
            >
              +{overflowCount}
            </div>
          )}
        </div>

        {/* AI Assist Button */}
        <button
          type="button"
          aria-label="Activate AI Assist"
          title="AI Assist helps you code faster with AI suggestions"
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 transition px-4 py-2 rounded-md text-sm font-semibold shadow-lg select-none"
        >
          <Sparkles className="w-5 h-5" aria-hidden="true" />
          AI Assist
        </button>
      </div>
    </nav>
  );
}
