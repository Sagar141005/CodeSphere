'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Room {
    id: string,
    name: string,
    slug: string,
    createdAt: string
}

export default function RoomsPage() {
    const [ rooms, setRooms ] = useState<Room[]>([]);
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
        <div className="flex flex-col items-center min-h-screen bg-gray-900 text-white p-8">
            <h1 className="text-3xl font-bold mb-4">Rooms</h1>
            <div className="flex gap-4">
                <input 
                type="text"
                placeholder="Enter room name"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                className="px-3 py-2 bg-gray-600 text-black rounded" />
                <button
                onClick={handleCreate}
                className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded">
                    Create Room
                </button>
            </div>

            <div className="w-full max-w-md bg-gray-800 rounded-lg p-4">
                <h2 className="text-xl font-semibold mb-4">Your Rooms</h2>
                {rooms.length === 0 ? (
                    <p className="text-gray-400">No rooms yet. Create one!</p>
                ) : (
                    <ul className="space-y-2">
                        {rooms.map((room) => (
                            <li
                            key={room.id}
                            className="flex justify-between items-center bg-gray-700 p-3 rounded hover:bg-gray-600 cursor-pointer"
                            onClick={() => router.push(`/room/${room.slug}`)}>
                                <span>{room.slug}</span>
                                <span className="text-sm text-gray-400">
                                    {new Date(room.createdAt).toLocaleDateString()}
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    )
}
