'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRightCircle, DoorClosed, DoorOpen } from "lucide-react";
import Sidebar from "@/components/Sidebar";

interface Room {
    id: string,
    name: string,
    slug: string,
    createdAt: string
}

export default function RoomsPage() {
    const [ rooms, setRooms ] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);
    const [roomName, setRoomName] = useState("");
    const router = useRouter();

    useEffect(() => {
        fetch('/api/rooms', { credentials: 'include' }) 
          .then((res) => res.json())
          .then((data) => {
            if (Array.isArray(data)) setRooms(data);
            else {
              console.error("Failed to load rooms:", data);
              setRooms([]);
            }
          });
        setLoading(false);
    }, []);      
    

    const handleCreate = async () => {
        if (!roomName.trim()) return alert("Please enter a room name");

        const res = await fetch('/api/rooms', {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: roomName, slug: roomName.toLowerCase().replace(/\s+/g, "-") })
        });
    
        if (res.ok) {
            const newRoom = await res.json();
            setRooms((prev) => [...prev, newRoom]);
            setRoomName("");
            router.push(`/room/${newRoom.slug}`);
        } else {
            const error = await res.json();
            alert(error.error || "Failed to create room");
        }
    };

    return (
        <div className="min-h-screen flex bg-gradient-to-b from-gray-900 to-gray-950 text-white overflow-hidden">
            <Sidebar />
    
            <main className="flex-1 max-w-7xl mx-auto px-6 md:px-12 py-12 space-y-16 overflow-y-auto h-screen">
            {/* Header */}
            <header className="text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-sm text-gray-400">
                <DoorClosed className="w-4 h-4" />
                Collaborative Coding Rooms
              </div>
              <h1 className="text-5xl font-extrabold bg-gradient-to-r from-gray-100 to-gray-300 text-transparent bg-clip-text pb-2 mb-2">
                Your Rooms
              </h1>
              <p className="text-gray-400 text-lg max-w-xl mx-auto">
                Create and manage collaborative spaces with real-time coding and terminal access.
              </p>
            </header>
      
            {/* Create Room Section */}
            <section className="relative group max-w-3xl mx-auto w-full">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none" />
              <div className="relative flex flex-col sm:flex-row items-center gap-4 bg-[#16161a] p-6 border border-[#2a2a2e] rounded-2xl">
                <input
                  type="text"
                  placeholder="Enter room name"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  className="flex-1 w-full px-4 py-3 rounded-lg bg-[#1e1e22] text-white border border-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
                <button
                  onClick={handleCreate}
                  className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 active:scale-95 transition-all rounded-xl font-semibold shadow-md"
                >
                  + Create Room
                </button>
              </div>
            </section>
      
            {/* Rooms List */}
            <section className="relative max-w-5xl mx-auto space-y-8">
                <div className="flex items-center gap-2">
                    <DoorClosed className="w-5 h-5 text-blue-400" />
                    <h2 className="text-xl font-semibold text-white">Existing Rooms</h2>
                </div>

                {loading ? (
                    <ul className="space-y-4 animate-pulse">
                    {[1, 2, 3].map((i) => (
                        <li key={i} className="h-16 bg-[#1d1d1f] rounded-xl" />
                    ))}
                    </ul>
                ) : rooms.length === 0 ? (
                    <p className="text-gray-500 text-sm italic">No rooms yet. Start by creating one above.</p>
                ) : (
                    <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {rooms.map((room) => (
                        <li
                        key={room.id}
                        onClick={() => router.push(`/room/${room.slug}`)}
                        tabIndex={0}
                        className="group relative cursor-pointer rounded-2xl border border-[#2a2a2e] bg-[#15151a]/80 hover:border-blue-500 
                                    transition-all duration-300 shadow-md hover:shadow-xl backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                        >
                        {/* Glow effect */}
                        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none bg-gradient-to-br from-blue-500/10 to-purple-500/10 blur-md" />

                        <div className="relative z-10 p-5 space-y-3">
                            {/* Top Row */}
                            <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-mono font-bold text-lg">
                                {room.slug[0].toUpperCase()}
                            </div>
                            <h3 className="text-lg font-semibold text-white truncate w-20 group-hover:text-blue-400 transition">
                                {room.slug}
                            </h3>
                            </div>

                            {/* Metadata Row */}
                            <div className="text-sm text-gray-400 flex items-center justify-between font-mono">
                            <span>Created</span>
                            <span>{new Date(room.createdAt).toLocaleDateString()}</span>
                            </div>

                            {/* CTA */}
                            <div className="flex items-center justify-between pt-2 border-t border-gray-800 text-blue-500 group-hover:underline text-sm font-semibold">
                            <span>Enter Room</span>
                            <ArrowRightCircle className="w-4 h-4" />
                            </div>
                        </div>
                        </li>
                    ))}
                    </ul>
                )}
            </section>

          </main>
        </div>
      );
      
}
