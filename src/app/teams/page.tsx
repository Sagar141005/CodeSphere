"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import HomeNavbar from "@/components/HomeNavbar";
import { Users, ArrowRightCircle } from "lucide-react";

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
      .then((res) => res.json())
      .then((data) => setTeams(data))
      .catch((err) => console.error("Failed to fetch teams", err))
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
      setTeams((prev) => [...prev, newTeam]);
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
    <div className="min-h-screen w-full bg-gradient-to-br from-black via-[#111111] to-gray-900 text-white">
      <HomeNavbar />

      <main className="max-w-7xl mx-auto px-6 md:px-12 py-20 space-y-20">
        {/* Header */}
        <header className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4 bg-white/5 text-sm text-gray-400 border border-white/10">
            <Users className="w-4 h-4" />
            Team Management
          </div>
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white to-gray-300 text-transparent bg-clip-text mb-4">
            Manage Your Teams
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Create and manage your project teams seamlessly in one place.
          </p>
        </header>

        {/* Create Team Section */}
        <div className="relative max-w-3xl mx-auto w-full group">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/10 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none" />
          <div className="relative flex flex-col sm:flex-row items-center gap-4 bg-black/60 p-6 rounded-2xl border border-white/10 shadow-xl backdrop-blur-md">
            <input
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="Create new team..."
              className="flex-1 w-full px-4 py-3 rounded-lg bg-black/70 text-white border border-white/10 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 transition"
              aria-label="Team name input"
              spellCheck={false}
              autoComplete="off"
            />
            <button
              onClick={createTeam}
              className="px-6 py-3
              bg-gradient-to-r from-indigo-300 to-cyan-300
              text-black font-medium rounded-lg shadow-md
              hover:brightness-110
              transition duration-200
              flex items-center justify-center gap-2
              cursor-pointer"
            >
              Create Team
            </button>
          </div>
        </div>

        {/* Teams List */}
        <section className="max-w-5xl mx-auto w-full space-y-8">
          {loadingTeams ? (
            <ul className="space-y-4 animate-pulse">
              {[1, 2, 3].map((i) => (
                <li key={i} className="h-16 bg-[#1f1f1f] rounded-xl" />
              ))}
            </ul>
          ) : teams.length === 0 ? (
            <div className="text-center mt-20">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-white/5 ring-1 ring-white/10 mb-6">
                <Users className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                No Teams Found
              </h3>
              <p className="text-gray-400 italic max-w-xs mx-auto">
                Create a new team to get started.
              </p>
            </div>
          ) : (
            <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {teams.map((team) => (
                <Link
                  href={`/team/${team.id}`}
                  key={team.id}
                  className="group relative rounded-2xl border border-white/10 bg-[#141414] hover:bg-white/5 hover:border-white/20 transition-all shadow hover:shadow-2xl backdrop-blur-md focus:outline-none cursor-pointer"
                  tabIndex={0}
                >
                  <div className="relative z-10 p-5 space-y-3">
                    {/* Top: Avatar or Initial */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/10 text-white/70 flex items-center justify-center font-mono font-bold text-lg uppercase">
                        {team.name.charAt(0)}
                      </div>
                      <h3 className="text-lg font-semibold truncate w-20 group-hover:text-white/90 transition font-mono">
                        {team.name}
                      </h3>
                    </div>

                    {/* Metadata */}
                    <div className="text-sm text-gray-500 flex items-center justify-between font-mono">
                      <span>Members</span>
                      <span>{team.members.length}</span>
                    </div>

                    {/* CTA */}
                    <div className="flex items-center justify-between pt-2 border-t border-white/10 text-sm font-semibold cursor-pointer text-gray-400 group-hover:text-white transition">
                      <span>View Team</span>
                      <ArrowRightCircle className="w-4 h-4" />
                    </div>
                  </div>
                </Link>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
