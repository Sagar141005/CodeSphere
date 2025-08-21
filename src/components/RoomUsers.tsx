import { Mic, MicOff } from "lucide-react";
import { useState } from "react";

interface UserPresence {
  id: string;
  name: string;
  image?: string;
  micStatus: "muted" | "unmuted" | "talking"; // talking = optional for future
}

const UserListPanel = ({ users }: { users: UserPresence[] }) => {
  return (
    <div className="absolute right-0 mt-2 w-64 bg-[#1a1a1a] border border-white/10 text-white rounded-md shadow-lg z-50">
      <div className="px-4 py-2 border-b border-white/10 font-semibold">
        Room Members ({users.length})
      </div>
      <ul className="max-h-64 overflow-auto">
        {users.map((user) => (
          <li
            key={user.id}
            className="flex items-center gap-3 px-4 py-2 hover:bg-white/5 transition"
          >
            <img
              src={user.image || "/default-avatar.jpg"}
              className="w-8 h-8 rounded-full border border-gray-700 object-cover"
              alt={user.name}
            />
            <span className="flex-1 truncate">{user.name}</span>
            {user.micStatus === "muted" ? (
              <MicOff className="w-4 h-4 text-gray-400" />
            ) : (
              <Mic className="w-4 h-4 text-green-400" />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};
