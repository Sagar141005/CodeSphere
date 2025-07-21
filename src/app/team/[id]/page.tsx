'use client';

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import { User, Users, PlusCircle, Trash2, LogOut, DoorOpen, DoorClosed } from "lucide-react";


interface Room {
  id: string;
  slug: string;
  name: string,
  createdAt: string;
}

interface TeamMember {
  id: string;
  name: string | null;
  email: string;
}

interface Team {
  id: string;
  name: string;
  createdById: string;
  members: TeamMember[];
  rooms: Room[];
}

export default function TeamDetailsPage() {
  const params = useParams();
  const id = params?.id as string;    
  const { data: session, status } = useSession();
  const [team, setTeam] = useState<Team | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const router = useRouter();

  // Fetch team details
  useEffect(() => {
    if (!id || !session) return;
    fetch(`/api/team/${id}`)
      .then(res => res.json())
      .then(data => setTeam(data))
      .catch(() => setTeam(null));
  }, [id, session]);

  // Invite Member
  const inviteMember = async () => {
    if (!inviteEmail.trim()) return alert("Email is required");
    const res = await fetch(`/api/team/${id}/add-member`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: inviteEmail }),
    });
    if (res.ok) {
      const updatedTeam = await res.json();
      setTeam(updatedTeam);
      setInviteEmail("");
    } else {
      const err = await res.json();
      alert(err.error || "Failed to invite member");
    }
  };

  // Remove Member
  const removeMember = async (memberId: string) => {
    if (!confirm("Remove this member?")) return;
    const res = await fetch(`/api/team/${id}/remove-member`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: memberId }),
    });
    if (res.ok) {
      setTeam(prev =>
        prev
          ? { ...prev, members: prev.members.filter(m => m.id !== memberId) }
          : prev
      );
    }
  };

  // Create Room
  const createRoom = async () => {
    const roomName = prompt("Enter room name:");
    if (!roomName) return;
    const res = await fetch(`/api/team/${id}/room/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: roomName }),
    });
    if (res.ok) {
      const newRoom = await res.json();
      setTeam(prev =>
        prev ? { ...prev, rooms: [...prev.rooms, newRoom] } : prev
      );
    }
  };

  // Leave Team
  const leaveTeam = async () => {
    if (!confirm("Are you sure you want to leave this team?")) return;
    const res = await fetch(`/api/team/${id}/leave`, { method: "POST" });
    if (res.ok) {
      router.push("/teams");
    }
  };

  if (status === "loading") {
    return <p className="text-center mt-10">Loading session...</p>;
  }

  if (!team) {
    return <p className="text-center mt-10">Team not found.</p>;
  }
  const isOwner = session?.user?.id === team.createdById;


  return (
    <div className="min-h-screen flex bg-[#1a1a1a] text-white font-sans">
      <Sidebar />

      <main className="flex-1 max-w-7xl mx-auto px-10 py-12 flex flex-col gap-14">
        {/* Header */}
        <header className="max-w-5xl">
          <h1 className="text-4xl font-extrabold tracking-wide mb-1 font-mono">{team.name}</h1>
          <p className="text-gray-500 text-sm flex items-center gap-2">
            <User className="w-4 h-4 text-gray-400" />
            Created by: <code className="ml-1 px-1 rounded bg-gray-900">{team.createdById}</code>
          </p>
        </header>

        {/* Members Section */}
        <section className="max-w-5xl bg-[#1e1e1e] rounded-3xl p-8 shadow-lg border border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <Users className="w-6 h-6 text-blue-400" />
              Members
            </h2>
          </div>

          <ul className="space-y-4 mb-6">
            {team.members.map((member) => (
              <li
                key={member.id}
                className="flex justify-between items-center rounded-md px-5 py-3 bg-[#2c2c2c] hover:bg-[#3a3a3a] transition cursor-default"
              >
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-gray-400" />
                  <span className="font-mono truncate max-w-xs">{member.name || member.email}</span>
                </div>

                {isOwner && member.email !== session?.user?.email && (
                  <button
                    onClick={() => removeMember(member.id)}
                    className="flex items-center gap-1 text-red-500 hover:text-red-600 transition font-semibold focus:outline-none focus:ring-2 focus:ring-red-500 rounded"
                    aria-label={`Remove ${member.name || member.email}`}
                  >
                    <Trash2 className="w-4 h-4" />
                    Remove
                  </button>
                )}
              </li>
            ))}
          </ul>

          {isOwner && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                inviteMember();
              }}
              className="flex gap-4"
            >
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="Invite by email"
                className="flex-1 rounded-lg bg-[#1a1a1a] border border-gray-700 px-5 py-3 text-white placeholder-gray-500 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Email to invite"
                required
                spellCheck={false}
                autoComplete="off"
              />
              <button
                type="submit"
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold transition focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <PlusCircle className="w-5 h-5" />
                Invite
              </button>
            </form>
          )}
        </section>

        {/* Rooms Section */}
        <section className="max-w-5xl bg-[#1e1e1e] rounded-3xl p-8 shadow-lg border border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <DoorClosed className="w-6 h-6 text-blue-400" />
              Rooms
            </h2>
            <button
              onClick={createRoom}
              className="flex items-center gap-2 text-green-400 hover:text-green-500 font-semibold transition rounded"
              aria-label="Create new room"
            >
              <PlusCircle className="w-5 h-5" />
              Create Room
            </button>
          </div>

          {team.rooms.length === 0 ? (
            <p className="text-gray-400 text-sm italic">No rooms yet.</p>
          ) : (
            <ul className="space-y-3 text-gray-300 font-mono">
              {team.rooms.map((room) => (
                <li key={room.id} className="truncate flex items-center gap-2">
                  <DoorOpen className="w-5 h-5 text-blue-400 flex-shrink-0" />
                  <Link
                    href={`/room/${room.slug}`}
                    className="text-blue-500 hover:underline e rounded truncate"
                  >
                    {room.name}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>


        {/* Leave Team Button */}
        {!isOwner && (
          <div className="max-w-5xl text-right">
            <button
              onClick={leaveTeam}
              className="flex items-center gap-2 text-gray-500 hover:text-gray-400 underline font-mono text-sm transition focus:outline-none focus:ring-2 focus:ring-gray-400 rounded"
              aria-label="Leave team"
            >
              <LogOut className="w-5 h-5" />
              Leave Team
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
