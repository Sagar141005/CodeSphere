'use client';

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface Team {
  id: string;
  name: string;
  createdById: string;
  members: { id: string; name: string | null; email: string }[];
  rooms: { id: string }[];
}

export default function TeamsPage() {
  const { data: session, status } = useSession();
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamName, setTeamName] = useState("");

  useEffect(() => {
    if (!session) return;
    fetch("/api/team/my-teams")
      .then(res => res.json())
      .then(data => setTeams(data))
      .catch(err => console.error("Failed to fetch teams", err));
  }, [session]);

  const createTeam = async () => {
    if (!teamName.trim()) return alert("Team name is required");
    const res = await fetch("/api/team/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: teamName }),
    });
    if (res.ok) {
      const newTeam = await res.json();
      setTeams(prev => [...prev, newTeam]);
      setTeamName("");
    } else {
      const err = await res.json();
      alert(err.error || "Failed to create team");
    }
  };

  if (status === "loading") {
    return <p className="text-center mt-10">Loading session...</p>;
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Your Teams</h1>

      {/* Create Team */}
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={teamName}
          onChange={e => setTeamName(e.target.value)}
          placeholder="Enter team name"
          className="border p-2 rounded flex-1"
        />
        <button
          onClick={createTeam}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Create
        </button>
      </div>

      {/* Teams List */}
      {teams.length === 0 && <p>No teams yet.</p>}
      {teams.map(team => (
        <div key={team.id} className="border p-4 mb-4 rounded shadow">
          <h2 className="font-semibold text-lg mb-1">{team.name}</h2>
          <p className="text-sm text-gray-500 mb-2">
            Members: {team.members.length} | Rooms: {team.rooms.length}
          </p>
          <Link
            href={`/team/${team.id}`}
            className="text-blue-500 hover:underline"
          >
            View Details
          </Link>
        </div>
      ))}
    </div>
  );
}
