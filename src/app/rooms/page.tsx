'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DoorClosed, DoorOpen } from "lucide-react";
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
        <div className="min-h-screen flex bg-[#1a1a1a] text-white">
    <Sidebar />

    <main className="flex-1 px-12 py-12 space-y-12 overflow-y-auto">
        {/* Header */}
        <header className="space-y-2">
        <h1 className="text-4xl font-extrabold tracking-tight">Your Rooms</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
            Create and manage collaborative spaces with real-time coding and terminal access.
        </p>
        </header>

        {/* Create Room Section */}
        <section className="flex flex-col sm:flex-row items-center gap-4 max-w-2xl">
        <input
            type="text"
            placeholder="Enter room name"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            className="flex-1 w-full px-4 py-3 rounded-lg bg-[#262626] text-white border border-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
            onClick={handleCreate}
            className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 transition-all rounded-xl font-semibold shadow-md"
        >
            + Create Room
        </button>
        </section>

        {/* Rooms List */}
        <section className="bg-[#1f1f1f] rounded-2xl p-6 border border-gray-800 shadow-lg max-w-5xl">
        <div className="mb-4">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <DoorClosed className="w-5 h-5 text-blue-400" />
            Existing Rooms
            </h2>
        </div>

        {loading ? (
            <ul className="space-y-4 animate-pulse">
            {[1, 2, 3].map((i) => (
                <li key={i} className="h-12 bg-[#2a2a2a] rounded-lg" />
            ))}
            </ul>
        ) : rooms.length === 0 ? (
            <p className="text-gray-500 text-sm italic">No rooms yet. Start by creating one above.</p>
        ) : (
            <ul className="space-y-3">
            {rooms.map((room) => (
                <li
                key={room.id}
                onClick={() => router.push(`/room/${room.slug}`)}
                className="flex justify-between items-center px-4 py-3 bg-[#262626] rounded-lg cursor-pointer hover:bg-[#333] transition group"
                >
                <div className="flex items-center gap-3">
                    <DoorOpen className="w-5 h-5 text-gray-400 group-hover:text-blue-400 transition" />
                    <span className="font-medium text-white">{room.slug}</span>
                </div>
                <span className="text-sm text-gray-500">
                    {new Date(room.createdAt).toLocaleDateString()}
                </span>
                </li>
            ))}
            </ul>
        )}
        </section>
    </main>
    </div>

    );
}
