'use client';

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import {
  User,
  Users,
  Trash2,
  LogOut,
  DoorOpen,
  Crown,
  ArrowRightCircle,
  UserPlus,
} from "lucide-react";

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
  profilePic?: string;
  image?: string
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
  const [ newRoomName, setNewRoomName ] = useState("");
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
    if (!newRoomName) return;
    const res = await fetch(`/api/team/${id}/room/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newRoomName }),
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
    <div className="min-h-screen flex bg-gradient-to-b from-gray-900 to-gray-950 text-white font-sans overflow-hidden">
      <Sidebar />

      <main className="flex-1 max-w-7xl mx-auto px-10 py-12 flex flex-col gap-14 overflow-y-auto h-screen">
        {/* Header */}
        <header className="max-w-5xl">
          <h1 className="text-4xl font-extrabold tracking-wide mb-1 font-mono">
            {team.name}
          </h1>
          <p className="text-gray-500 text-sm flex items-center gap-2">
            <User className="w-4 h-4 text-gray-400" />
            Created by:{" "}
            <code className="ml-1 px-1 rounded bg-gray-900 font-mono">
              {team.createdById}
            </code>
          </p>
        </header>

        {/* Members Section */}
        <section className="max-w-5xl bg-[#16161a] rounded-3xl p-8 shadow-lg border border-[#2a2a2e]">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold flex items-center gap-2 text-white">
              <Users className="w-6 h-6 text-blue-400" />
              Members
            </h2>
          </div>

          <ul className="space-y-4 mb-6">
            {team.members.map((member) => {
              const isTeamOwner = member.id === team.createdById;
              return (
                <li
                  key={member.id}
                  className="flex justify-between items-center rounded-xl px-6 py-4 bg-[#1e1e22] hover:bg-[#2a2a2e] transition cursor-default"
                >
                  <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-gradient-to-br from-blue-600 to-purple-600 text-white flex items-center justify-center font-mono font-bold text-lg select-none shadow-sm">
                    {member.profilePic || member.image ? (
                      <img
                        src={member.profilePic || member.image}
                        alt={member.name || member.email}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>
                        {(member.name || member.email)?.[0]?.toUpperCase()}
                      </span>
                    )}
                  </div>

                    <div className="flex flex-col max-w-xs">
                      <span className="font-semibold truncate">
                        {member.name || member.email}
                      </span>
                      <span className="text-xs text-gray-400 font-mono truncate">
                        {member.email}
                      </span>
                    </div>
                    {isTeamOwner && (
                      <span
                        className="flex items-center gap-1 bg-yellow-400 text-gray-900 text-xs font-semibold px-2 py-1 rounded-full select-none"
                        title="Team Owner"
                      >
                        <Crown className="w-4 h-4" />
                        Owner
                      </span>
                    )}
                  </div>

                  {isOwner && member.email !== session?.user?.email && !isTeamOwner && (
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
              );
            })}
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
                placeholder="Invite member by email"
                className="flex-1 rounded-lg bg-[#1a1a1a] border border-[#2a2a2e] px-5 py-3 text-white placeholder-gray-500 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Email to invite"
                required
                spellCheck={false}
                autoComplete="off"
              />
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-5 py-2.5 border border-blue-500 bg-[#1a1a1a] 
                          text-blue-400 hover:bg-[#25272d] 
                          font-mono text-sm rounded-lg transition-all duration-200 
                          focus:outline-none focus:ring-2 focus:ring-blue-500/30 shadow-sm"
              >
                <UserPlus className="w-4 h-4" />
                Invite Member
              </button>
            </form>
          )}
        </section>

        {/* Rooms Section */}
        <section className="max-w-5xl">
          {/* Create Room Card */}
        <section className="relative max-w-5xl mx-auto mb-6">
          <div
            className="group relative cursor-pointer rounded-2xl border border-[#2a2a2e] bg-gradient-to-br from-[#1d1d22] to-[#1a1a1f] 
                      hover:border-blue-500 hover:shadow-xl transition-all duration-300 shadow-md backdrop-blur-sm p-6"
          >
            {/* Glowing background on hover */}
            <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none 
                            bg-gradient-to-br from-blue-500/10 to-purple-500/10 blur-md" />

            {/* Content */}
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors mb-1">
                  Create a New Room
                </h3>
                <p className="text-sm text-gray-400 font-mono">Give your room a name and start collaborating instantly.</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:items-center w-full sm:w-auto">
                <input
                  type="text"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  placeholder="Enter room name"
                  className="px-4 py-2.5 rounded-lg bg-[#121212] text-white border border-gray-700 placeholder-gray-500 
                            focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm w-full sm:w-64 font-mono"
                  aria-label="Room name input"
                  spellCheck={false}
                  autoComplete="off"
                />
                <button
                onClick={createRoom}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1f1f22] border border-[#2e2e32] 
                          hover:border-blue-500 hover:text-blue-400 text-gray-300 font-mono text-sm rounded-lg 
                          transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm"
              >
                <DoorOpen className="w-4 h-4" />
                Create Room
              </button>
              </div>
            </div>
          </div>
        </section>
          {team.rooms.length === 0 ? (
            <p className="text-gray-400 text-sm italic">No rooms yet.</p>
          ) : (
            <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {team.rooms.map((room) => (
                <li
                  key={room.id}
                  onClick={() => window.location.assign(`/room/${room.slug}`)}
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
                      <h3 className="text-lg font-semibold text-white truncate w-28 group-hover:text-blue-400 transition">
                        {room.name}
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

        {/* Leave Team Button */}
        {!isOwner && (
          <div className="max-w-5xl text-right">
            <button
              onClick={leaveTeam}
              className="flex items-center gap-2 text-gray-500 hover:text-red-400 underline font-mono text-sm transition focus:outline-none focus:ring-2 focus:ring-gray-400 rounded"
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
