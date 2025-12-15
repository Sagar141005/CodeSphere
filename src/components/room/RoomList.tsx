"use client";

import { ArrowRight, LogOut, Trash2, Calendar, Terminal } from "lucide-react";
import { useRouter } from "next/navigation";
import { Room } from "@/types/Room";

type RoomListProps = {
  rooms: Room[];
  onDelete?: (room: Room) => void;
  onLeave?: (slug: string) => void;
};

export const RoomList = ({ rooms, onDelete, onLeave }: RoomListProps) => {
  const router = useRouter();

  if (rooms.length === 0) return null;

  return (
    <>
      {rooms.map((room) => (
        <li
          key={room.id}
          className="group relative flex flex-col justify-between p-5 rounded-xl border border-neutral-800 bg-neutral-900/40 hover:bg-neutral-900 hover:border-neutral-700 transition-all duration-300 shadow-sm hover:shadow-lg"
        >
          <div className="flex items-start justify-between mb-6 relative z-20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-neutral-800 border border-neutral-700 flex items-center justify-center text-neutral-300 font-bold text-sm shadow-inner">
                {room.name.charAt(0).toUpperCase()}
              </div>

              <div className="flex flex-col">
                <h3 className="font-semibold text-neutral-200 group-hover:text-white truncate max-w-[120px] sm:max-w-[150px] transition-colors">
                  {room.name}
                </h3>

                <div className="flex items-center gap-1.5 mt-1">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                  </span>
                  <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider group-hover:text-neutral-400 transition-colors">
                    Ready
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              {room.owned && onDelete ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(room);
                  }}
                  className="p-1.5 text-neutral-500 hover:text-red-400 hover:bg-red-950/30 rounded-md transition-all"
                  title="Delete Room"
                >
                  <Trash2 size={14} />
                </button>
              ) : (
                onLeave && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onLeave(room.slug);
                    }}
                    className="p-1.5 text-neutral-500 hover:text-amber-400 hover:bg-amber-950/30 rounded-md transition-all"
                    title="Leave Room"
                  >
                    <LogOut size={14} />
                  </button>
                )
              )}
            </div>
          </div>

          <div className="mt-auto pt-4 border-t border-neutral-800/50 flex items-center justify-between relative z-20">
            <div className="flex items-center gap-1.5 text-xs text-neutral-600 font-mono group-hover:text-neutral-500 transition-colors">
              <Calendar size={12} />
              <span>
                {new Date(room.createdAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>

            <button
              onClick={() => router.push(`/room/${room.slug}`)}
              className="flex items-center gap-1.5 text-xs font-medium text-neutral-400 group-hover:text-neutral-100 transition-colors"
            >
              <Terminal size={12} />
              <span>Open Editor</span>
              <ArrowRight
                size={12}
                className="group-hover:translate-x-0.5 transition-transform"
              />
            </button>
          </div>

          <div
            className="absolute inset-0 z-10 cursor-pointer"
            onClick={() => router.push(`/room/${room.slug}`)}
          />
        </li>
      ))}
    </>
  );
};
