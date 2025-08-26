"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import HomeNavbar from "@/components/HomeNavbar";
import { Users, ArrowRightCircle, Loader2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { Loader } from "@/components/Loader";

interface TeamInvite {
  id: string;
  team: { id: string; name: string };
  invitedBy: { id: string; name: string | null; email: string };
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  createdAt: string;
}

interface Team {
  id: string;
  name: string;
  createdById: string;
  members: { id: string; name: string | null; email: string }[];
  rooms: { id: string }[];
}

export default function TeamsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamName, setTeamName] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingTeams, setLoadingTeams] = useState(true);
  const [invites, setInvites] = useState<TeamInvite[]>([]);
  const [loadingInvites, setLoadingInvites] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status]);

  useEffect(() => {
    if (!session) return;
    setLoadingTeams(true);
    fetch("/api/team/my-teams")
      .then((res) => res.json())
      .then((data) => setTeams(data?.teams ?? []))
      .catch((err) => console.error("Failed to fetch teams", err))
      .finally(() => setLoadingTeams(false));
  }, [session]);

  useEffect(() => {
    if (!session) return;
    setLoadingInvites(true);

    fetch("/api/team/my-teams")
      .then((res) => res.json())
      .then((data) => setInvites(data?.teamInvites ?? []))
      .catch((err) => console.error("Failed to fetch invites", err))
      .finally(() => setLoadingInvites(false));

    console.log(invites);
  }, [session]);

  const createTeam = async () => {
    if (!teamName.trim()) return alert("Team name is required");
    setLoading(true);

    try {
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
    } catch (err) {
      console.error("Team creation failed:", err);
      alert("Something went wrong while creating the team.");
    } finally {
      setLoading(false);
    }
  };

  const acceptTeamInvite = async (inviteId: string) => {
    try {
      const res = await fetch(`/api/team/invite/${inviteId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "ACCEPT" }),
      });

      if (res.ok) {
        alert("Invite accepted!");
        setInvites((prev) => prev.filter((i) => i.id !== inviteId));
        // optionally refresh teams
        fetch("/api/team/my-teams")
          .then((res) => res.json())
          .then((data) => setTeams(data?.teams ?? []));
      }
    } catch (err) {
      console.error("Accept invite failed:", err);
    }
  };

  const rejectTeamInvite = async (inviteId: string) => {
    try {
      const res = await fetch(`/api/team/invite/${inviteId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "REJECT" }),
      });

      if (res.ok) {
        alert("Invite rejected!");
        setInvites((prev) => prev.filter((i) => i.id !== inviteId));
      }
    } catch (err) {
      console.error("Reject invite failed:", err);
    }
  };

  console.log(teams);

  if (status === "loading") {
    return <Loader />;
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-black via-[#111111] to-gray-900 text-white">
      <HomeNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 py-12 sm:py-16 md:py-20 space-y-14 sm:space-y-16 md:space-y-20">
        {/* Header */}
        <header className="text-center max-w-3xl mx-auto px-2">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full mb-4 bg-white/5 text-xs sm:text-sm text-gray-400 border border-white/10">
            <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Team Management
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl leading-[1.1] font-bold bg-gradient-to-r from-white to-gray-300 text-transparent bg-clip-text mb-3 sm:mb-4">
            Manage Your Teams
          </h1>
          <p className="text-gray-400 text-base sm:text-lg max-w-xl mx-auto px-2">
            Create and manage your project teams seamlessly in one place.
          </p>
        </header>

        {/* Create Team Section */}
        <div className="max-w-3xl mx-auto w-full px-2 sm:px-0">
          <div className="relative rounded-2xl bg-gradient-to-br from-white/5 to-white/10 border border-white/10 p-4 sm:p-6 shadow-xl backdrop-blur-md">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
              <input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="e.g. Microsoft, Netflix"
                className="flex-1 w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg bg-black/60 text-white border border-white/10 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 transition text-sm sm:text-base"
                aria-label="Team name input"
                spellCheck={false}
                autoComplete="off"
              />

              <button
                onClick={createTeam}
                disabled={loading}
                className={`w-full sm:w-auto px-5 sm:px-6 py-2.5 sm:py-3 text-sm rounded-lg font-medium transition-all duration-150 cursor-pointer
                ${
                  loading
                    ? "bg-gray-500 text-white cursor-not-allowed"
                    : "bg-gradient-to-r from-indigo-300 to-cyan-300 text-black hover:brightness-105 active:scale-95"
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                    Creating{" "}
                    <span className="animate-pulse -ml-2 text-white">...</span>
                  </div>
                ) : (
                  "Create Team"
                )}
              </button>

              <div className="relative inline-block w-full sm:w-auto">
                <button
                  onClick={() => setShowInviteModal(true)}
                  className="w-full sm:w-auto px-5 sm:px-6 py-2.5 sm:py-3 bg-white/5 text-white/80 hover:bg-white/10 hover:text-white border border-white/10 text-sm font-medium rounded-lg transition duration-200 cursor-pointer"
                >
                  Manage Invitations
                </button>
                {invites.length > 0 && (
                  <span className="absolute -top-2 -right-2 px-1.5 py-0.5 text-[10px] font-semibold bg-red-500 text-white rounded-full">
                    {invites.length}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Teams List */}
        <section className="max-w-5xl mx-auto w-full space-y-8 px-2 sm:px-0">
          {loadingTeams ? (
            <ul className="space-y-3 sm:space-y-4 animate-pulse">
              {[1, 2, 3].map((i) => (
                <li key={i} className="h-14 sm:h-16 bg-[#1f1f1f] rounded-xl" />
              ))}
            </ul>
          ) : teams.length === 0 ? (
            <div className="text-center mt-16 sm:mt-20">
              <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-white/5 ring-1 ring-white/10 mb-5 sm:mb-6">
                <Users className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">
                No Teams Found
              </h3>
              <p className="text-gray-400 italic max-w-xs mx-auto text-sm sm:text-base">
                Create a new team to get started.
              </p>
            </div>
          ) : (
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {teams.map((team) => (
                <Link
                  href={`/team/${team.id}`}
                  key={team.id}
                  className="group relative rounded-2xl border border-white/10 bg-[#141414] hover:bg-white/5 hover:border-white/20 transition-all shadow hover:shadow-2xl backdrop-blur-md focus:outline-none cursor-pointer"
                >
                  <div className="relative z-10 p-4 sm:p-5 space-y-2 sm:space-y-3">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/10 text-white/70 flex items-center justify-center font-bold text-base sm:text-lg uppercase">
                        {team.name.charAt(0)}
                      </div>
                      <h3 className="text-base sm:text-lg font-semibold truncate max-w-[6rem] sm:max-w-[8rem] group-hover:text-white/90 transition">
                        {team.name}
                      </h3>
                    </div>

                    <div className="text-xs sm:text-sm text-gray-500 flex items-center justify-between">
                      <span>Members</span>
                      <span>{team.members.length}</span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs sm:text-sm font-semibold cursor-pointer text-gray-400 group-hover:text-white transition">
                      <span>View Team</span>
                      <ArrowRightCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </div>
                  </div>
                </Link>
              ))}
            </ul>
          )}
        </section>

        {/* Invite Modal */}
        {showInviteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-3 sm:px-4">
            <div className="relative w-full max-w-lg bg-[#1a1a1a] border border-white/10 rounded-2xl p-5 sm:p-8 shadow-2xl text-white space-y-6 sm:space-y-8">
              <button
                onClick={() => setShowInviteModal(false)}
                className="absolute top-3 sm:top-4 right-3 sm:right-4 text-gray-400 hover:text-white transition cursor-pointer"
                aria-label="Close"
              >
                <X />
              </button>

              <div className="space-y-1">
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                  Manage Invitations
                </h2>
                <p className="text-xs sm:text-sm text-gray-400">
                  Review your team invites and respond accordingly.
                </p>
              </div>

              <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                {invites.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">
                    You have no pending team invites.
                  </p>
                ) : (
                  invites.map((invite) => (
                    <div
                      key={invite.id}
                      className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4 bg-neutral-800 border border-white/10 px-4 py-3 rounded-md"
                    >
                      <div>
                        <p className="text-sm font-semibold text-white">
                          {invite.team.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          Invited by{" "}
                          {invite.invitedBy.name || invite.invitedBy.email}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => acceptTeamInvite(invite.id)}
                          className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-xs sm:text-sm rounded-md text-white cursor-pointer"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => rejectTeamInvite(invite.id)}
                          className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-xs sm:text-sm rounded-md text-white cursor-pointer"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
