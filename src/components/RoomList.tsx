import { ArrowRightCircle, LogOut, Trash2 } from "lucide-react";
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
    <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {rooms.map((room) => (
        <li
          key={room.id}
          tabIndex={0}
          className="group relative rounded-2xl border border-white/10 bg-[#141414] hover:bg-white/5 hover:border-white/20 transition-all shadow hover:shadow-2xl backdrop-blur-md focus:outline-none"
        >
          <div className="relative z-10 p-5 flex flex-col gap-3 h-full">
            {/* Top Row */}
            <div className="flex items-baseline justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 text-white/70 flex items-center justify-center font-bold text-lg">
                  {room.name[0].toUpperCase()}
                </div>
                <h3 className="text-lg font-semibold truncate w-20 group-hover:text-white/90 transition">
                  {room.name}
                </h3>
              </div>
              {room.owned && onDelete ? (
                <div
                  onClick={() => onDelete(room)}
                  className="p-2 border border-white/10 rounded-md hover:text-red-400 transition-colors cursor-pointer"
                  title="Delete Room"
                >
                  <Trash2 width={15} height={15} />
                </div>
              ) : (
                onLeave && (
                  <div
                    onClick={() => onLeave(room.slug)}
                    className="p-2 border border-white/10 rounded-md hover:text-yellow-400 transition-colors cursor-pointer"
                    title="Leave Room"
                  >
                    <LogOut width={15} height={15} />
                  </div>
                )
              )}
            </div>

            {/* Metadata Row */}
            <div className="text-xs text-gray-400 flex justify-between items-center pt-1">
              <span className="uppercase tracking-wide">Created</span>
              <span className="text-white/80">
                {new Date(room.createdAt).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>

            {/* CTA */}
            <div
              onClick={() => router.push(`/room/${room.slug}`)}
              className="flex items-center justify-between pt-2 border-t border-white/10 text-sm font-semibold cursor-pointer text-gray-400 hover:text-white transition mt-auto"
            >
              <span>Enter Room</span>
              <ArrowRightCircle className="w-4 h-4" />
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
};
