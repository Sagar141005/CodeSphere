'use client';

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import { Users, PlusCircle, ArrowRightCircle } from "lucide-react";

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
  const [loadingTeams, setLoadingTeams] = useState(true);

  useEffect(() => {
    if (!session) return;
    setLoadingTeams(true);
    fetch("/api/team/my-teams")
      .then(res => res.json())
      .then(data => setTeams(data))
      .catch(err => console.error("Failed to fetch teams", err))
      .finally(() => setLoadingTeams(false));
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
    <div className="min-h-screen flex bg-[#1a1a1a] text-white font-sans">
      <Sidebar />
  
      <main className="flex-1 max-w-7xl mx-auto px-10 py-14 flex flex-col gap-14">
        {/* Header */}
        <header className="max-w-4xl">
          <h1 className="text-4xl font-extrabold tracking-wide font-mono mb-3">Your Teams</h1>
          <p className="text-gray-400 text-lg max-w-xl leading-relaxed">
            Manage your teams and collaborate seamlessly.
          </p>
        </header>
  
        {/* Create Team Section */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <input
            type="text"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            placeholder="Create new team..."
            className="flex-1 w-full px-4 py-3 rounded-lg bg-[#1a1a1a] text-white border border-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Team name input"
            spellCheck={false}
            autoComplete="off"
          />
          <button
            onClick={createTeam}
            className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all rounded-xl font-semibold shadow-md"
          >
            Create Team
          </button>
        </div>
  
        {/* Teams List */}
        <section className="max-w-5xl">
          {loadingTeams ? (
            <div className="space-y-6 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-28 bg-[#222222] rounded-2xl shadow-inner"
                  aria-busy="true"
                  aria-label="Loading team"
                />
              ))}
            </div>
          ) : teams.length === 0 ? (
            <p className="text-gray-600 text-center text-xl mt-10 font-mono">
              You don&apos;t have any teams yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {teams.map((team) => (
                <Link
                  href={`/team/${team.id}`}
                  key={team.id}
                  className="group flex flex-col p-6 rounded-3xl bg-[#1b1b1b] border border-gray-800 shadow-lg
                             hover:shadow-xl hover:border-blue-600 transition cursor-pointer focus:outline-none focus:ring-4 focus:ring-blue-500"
                  tabIndex={0}
                  aria-label={`View details for team ${team.name}`}
                >
                  <h2 className="text-2xl font-semibold mb-3 group-hover:text-blue-400 transition font-mono truncate">
                    {team.name}
                  </h2>
  
                  <div className="flex items-center gap-8 text-gray-400 mb-4">
                    <div className="flex items-center gap-2 font-mono">
                      <Users className="w-5 h-5 text-gray-400" />
                      <span>
                        <span className="text-white font-semibold">{team.members.length}</span> members
                      </span>
                    </div>
  
                    <div className="flex items-center gap-2 font-mono">
                      <ArrowRightCircle className="w-5 h-5 text-gray-400 rotate-90" />
                      <span>
                        <span className="text-white font-semibold">{team.rooms.length}</span> rooms
                      </span>
                    </div>
                  </div>
  
                  <span className="text-blue-500 font-semibold group-hover:underline flex items-center gap-1 font-mono">
                    View Details <ArrowRightCircle className="w-5 h-5" />
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
  
}
