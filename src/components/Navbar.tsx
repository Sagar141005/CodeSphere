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

export default function Navbar({ roomSlug, roomName }: { roomSlug: string, roomName: string }) {
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

        // Store user ID for cleanup
        const userPayload = {
            id: session.user.id || session.user.email!,
            name: session.user.name || 'Anonymous',
            image: session.user.image || "/default-avatar.jpg",
        };
        userIdRef.current = userPayload.id;

        // Join room
        sock.emit('join-room', {
            roomId: roomSlug,
            user: userPayload,
        });

        // Listen for presence updates
        sock.on('presence-update', (onlineUsers: UserPresence[]) => {
            const uniqueUsers = Array.from(
                new Map(
                    onlineUsers.filter(u => u.id).map((user) => [user.id, user])
                ).values()
            );
            setUsers(uniqueUsers);
        });
        
        // Cleanup on unmount
        return () => {
            if (sock && userIdRef.current) {
                sock.emit('leave-room', { roomId: roomSlug, userId: userIdRef.current });
            }
            sock.disconnect();
            socketRef.current = null;
        };
    }, [roomSlug, session, status]);

    return (
        <div className="h-14 bg-[#1f1f1f] border-b border-gray-700 px-6 flex items-center justify-between">
          {/* Left: Room name */}
          <div className="flex items-center gap-2 text-white">
            <Users className="w-5 h-5 text-blue-400" />
            <span className="text-base font-semibold tracking-wide">Room: {roomName}</span>
          </div>
      
          {/* Right: Users + AI Assist */}
          <div className="flex items-center gap-4">
            {/* Avatars */}
            <div className="flex -space-x-2">
              {users.map((user) => (
                <img
                  key={user.id}
                  src={user.image || "/default-avatar.jpg"}
                  alt={user.name}
                  title={user.name}
                  className="w-8 h-8 rounded-full border-2 border-gray-800 object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = "/default-avatar.jpg";
                  }}
                />
              ))}
            </div>
      
            {/* AI Assist Button */}
            <button
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 transition px-3 py-1.5 rounded-md text-sm font-medium shadow-sm"
            >
              <Sparkles className="w-4 h-4" />
              AI Assist
            </button>
          </div>
        </div>
      );
}
