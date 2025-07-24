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
    <div className="min-h-screen flex bg-gradient-to-b from-gray-900 to-gray-950 text-white overflow-hidden">
      <Sidebar />
  
      <main className="flex-1 max-w-7xl mx-auto px-6 md:px-12 py-12 space-y-16 overflow-y-auto h-screen">
        {/* Header */}
        <header className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-sm text-gray-400">
            <Users className="w-4 h-4" />
            Team Management
          </div>
          <h1 className="text-5xl font-extrabold bg-gradient-to-r from-gray-100 to-gray-300 text-transparent bg-clip-text pb-2 mb-2">
            Manage Your Teams
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Create and manage your project teams seamlessly in one place.
          </p>
        </header>
  
        {/* Create Team Section */}
        <div className="relative max-w-3xl mx-auto w-full group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none" />
          <div className="relative flex flex-col sm:flex-row items-center gap-4 bg-[#1a1a1a] p-6 rounded-2xl border border-[#313244]">
            <input
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="Create new team..."
              className="flex-1 w-full px-4 py-3 rounded-lg bg-[#121212] text-white border border-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              aria-label="Team name input"
              spellCheck={false}
              autoComplete="off"
            />
            <button
              onClick={createTeam}
              className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 active:scale-95 transition-all rounded-xl font-semibold shadow-md"
            >
              Create Team
            </button>
          </div>
        </div>
  
        {/* Teams List */}
        <section className="max-w-5xl mx-auto w-full">
          {loadingTeams ? (
            <div className="space-y-6 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-28 bg-[#1b1b1b] rounded-2xl shadow-inner" />
              ))}
            </div>
          ) : teams.length === 0 ? (
            <div className="text-center mt-20">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 ring-1 ring-white/10 mb-6">
                <Users className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-medium text-white mb-2">No Teams Found</h3>
              <p className="text-gray-400 mb-4">Create a new team to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {teams.map((team) => (
               <Link
               href={`/team/${team.id}`}
               key={team.id}
                 className="group relative flex flex-col gap-4 p-6 rounded-3xl border border-[#2a2a2e] bg-[#141418] hover:bg-gradient-to-br hover:from-[#1b1c25] hover:to-[#222434] shadow-sm hover:shadow-xl hover:border-blue-600 transition duration-300 focus:outline-none focus:ring-4 focus:ring-blue-500/30"
               tabIndex={0}
             >
               {/* Top: Avatar or Initials */}
               <div className="flex items-center gap-4">
                 <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 text-blue-300 font-semibold text-lg uppercase tracking-wide ring-1 ring-white/10 shadow-sm">
                   {team.name.charAt(0)}
                 </div>
             
                 <div className="flex-1">
                   <h2 className="text-xl font-semibold group-hover:text-blue-400 transition-colors truncate font-mono">
                     {team.name}
                   </h2>
                   <p className="text-sm text-gray-500 font-mono mt-1">
                     {team.members.length} members · {team.rooms.length} rooms
                   </p>
                 </div>
               </div>
             
               {/* Divider */}
               <div className="border-t border-[#2e2e32] my-2" />
             
               {/* Bottom: CTA */}
               <div className="flex items-center justify-between text-sm">
                 <span className="text-blue-500 font-semibold group-hover:underline flex items-center gap-1">
                   View Details <ArrowRightCircle className="w-4 h-4" />
                 </span>
                 <div className="flex items-center gap-2 text-gray-500">
                   <Users className="w-4 h-4" />
                   <span className="hidden sm:inline">Team Access</span>
                 </div>
               </div>
             </Link>
             
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
  
  
}
