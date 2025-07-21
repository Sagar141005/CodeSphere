'use client';

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";

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

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">{team.name}</h1>
      <p className="text-gray-500 mb-4">
        Created by: {team.createdById}
      </p>

      {/* Members */}
      <section className="mb-6">
        <h2 className="font-semibold text-lg mb-2">Members</h2>
        <ul className="ml-4 mb-3 list-disc">
          {team.members.map(member => (
            <li key={member.id} className="flex justify-between items-center">
              <span>{member.name || member.email}</span>
              {session?.user?.id === team.createdById &&
                member.email !== session.user.email && (
                  <button
                    onClick={() => removeMember(member.id)}
                    className="text-red-500 text-sm hover:underline"
                  >
                    Remove
                  </button>
                )}
            </li>
          ))}
        </ul>

        {/* Invite */}
        {session?.user?.id === team.createdById && (
          <div className="flex gap-2">
            <input
              type="email"
              value={inviteEmail}
              onChange={e => setInviteEmail(e.target.value)}
              placeholder="Invite by email"
              className="border p-2 rounded flex-1"
            />
            <button
              onClick={inviteMember}
              className="bg-green-600 text-white px-3 py-1 rounded"
            >
              Invite
            </button>
          </div>
        )}
      </section>

      {/* Rooms */}
      <section className="mb-6">
        <h2 className="font-semibold text-lg mb-2">Rooms</h2>
        {team.rooms.length === 0 ? (
          <p className="text-gray-400 text-sm">No rooms yet.</p>
        ) : (
          <ul className="list-disc ml-5">
            {team.rooms.map(room => (
              <li key={room.id}>
                <Link href={`/room/${room.slug}`} className="text-blue-500 hover:underline">
                  {room.name}
                </Link>
              </li>
            ))}
          </ul>
        )}
        <button
          onClick={createRoom}
          className="text-sm text-green-600 hover:underline mt-2"
        >
          + Create Room
        </button>
      </section>

      {/* Leave */}
      {session?.user?.id !== team.createdById && (
        <button
          onClick={leaveTeam}
          className="text-sm text-gray-500 hover:underline"
        >
          Leave Team
        </button>
      )}
    </div>
  );
}
