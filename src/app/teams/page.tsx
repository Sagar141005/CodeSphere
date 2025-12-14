"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import HomeNavbar from "@/components/home/HomeNavbar";
import {
  Users,
  ArrowRight,
  Loader2,
  X,
  Plus,
  Mail,
  Shield,
  Check,
  Ban,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Loader } from "@/components/Loader";
import toast from "react-hot-toast";
import useSWR, { mutate } from "swr";
import { motion, AnimatePresence } from "framer-motion";
import Footer from "@/components/Footer";

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

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function TeamsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [teamName, setTeamName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const { data, error, isLoading } = useSWR(
    session ? "/api/team/my-teams" : null,
    fetcher
  );

  const teams: Team[] = data?.teams ?? [];
  const invites: TeamInvite[] = data?.teamInvites ?? [];

  const createTeam = async () => {
    if (!teamName.trim()) {
      toast.error("Team name is required");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/team/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: teamName }),
      });

      if (res.ok) {
        const newTeam = await res.json();
        toast.success("Team created successfully");
        setTeamName("");

        mutate(
          "/api/team/my-teams",
          { ...data, teams: [...teams, newTeam] },
          false
        );
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to create team");
      }
    } catch (err) {
      console.error("[Team] Creation failed:", err);
      toast.error("Something went wrong while creating the team.");
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
        toast.success("Invite accepted");
        mutate("/api/team/my-teams");
      } else {
        toast.error("Failed to accept invite");
      }
    } catch (err) {
      console.error("[Team] Accept invite failed:", err);
      toast.error("Something went wrong while accepting invite");
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
        toast.success("Invite rejected");
        mutate("/api/team/my-teams");
      } else {
        toast.error("Failed to reject invite");
      }
    } catch (err) {
      console.error("[Team] Reject invite failed:", err);
      toast.error("Something went wrong while rejecting invite");
    }
  };

  if (status === "loading" || isLoading) {
    return <Loader />;
  }
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-neutral-500">
        Failed to load teams. Please refresh.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-50">
      <HomeNavbar />

      <main className="max-w-6xl mx-auto px-6 lg:px-8 py-20">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 border-b border-neutral-800 pb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-neutral-900 border border-neutral-800">
                <Users className="w-5 h-5 text-neutral-400" />
              </div>
              <span className="font-mono text-xs font-medium text-neutral-500 uppercase tracking-widest">
                Workspace
              </span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-neutral-50">
              Teams
            </h1>
            <p className="mt-2 text-neutral-400 max-w-md">
              Collaborate across projects. Create a new team or manage existing
              memberships.
            </p>
          </div>

          <button
            onClick={() => setShowInviteModal(true)}
            className="group relative flex items-center gap-3 px-4 py-2.5 rounded-lg border border-neutral-800 bg-neutral-900/50 hover:bg-neutral-900 hover:border-neutral-700 transition-all"
          >
            <Mail className="w-4 h-4 text-neutral-400 group-hover:text-neutral-200" />
            <span className="text-sm font-medium text-neutral-300 group-hover:text-neutral-50">
              Invitations
            </span>
            {invites.length > 0 && (
              <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-blue-600 text-[10px] font-bold text-white">
                {invites.length}
              </span>
            )}
          </button>
        </header>

        <div className="mb-12">
          <div className="flex flex-col sm:flex-row gap-4 max-w-2xl">
            <div className="relative flex-grow group">
              <input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="New team name..."
                className="w-full h-12 bg-neutral-900 border border-neutral-800 rounded-lg px-4 text-sm text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-neutral-600 focus:ring-1 focus:ring-neutral-600 transition-all"
                spellCheck={false}
              />
            </div>

            <button
              onClick={createTeam}
              disabled={loading || !teamName.trim()}
              className="px-4 py-2 rounded-lg bg-neutral-50 hover:bg-white disabled:bg-neutral-800 disabled:text-neutral-600 text-neutral-950 text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow-md disabled:shadow-none"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Create</span>
                </>
              )}
            </button>
          </div>
        </div>

        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider">
              Your Teams ({teams.length})
            </h2>
          </div>

          {teams.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-neutral-800 rounded-xl bg-neutral-900/20">
              <div className="w-12 h-12 rounded-full bg-neutral-900 flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-neutral-600" />
              </div>
              <p className="text-neutral-400 font-medium">No teams yet</p>
              <p className="text-neutral-600 text-sm mt-1">
                Create one above to get started.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teams.map((team) => (
                <Link
                  href={`/team/${team.id}`}
                  key={team.id}
                  className="group relative flex flex-col justify-between p-6 rounded-xl border border-neutral-800 bg-neutral-900/30 hover:bg-neutral-900 hover:border-neutral-700 transition-all duration-300"
                >
                  <div className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded bg-gradient-to-br from-neutral-800 to-neutral-900 border border-neutral-700 flex items-center justify-center text-sm font-bold text-neutral-300 uppercase">
                        {team.name.charAt(0)}
                      </div>
                      <h3 className="font-semibold text-neutral-200 group-hover:text-white truncate">
                        {team.name}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-neutral-800/50 pt-4 mt-auto">
                    <div className="flex items-center gap-2 text-xs text-neutral-500 font-mono">
                      <Users className="w-3 h-3" />
                      <span>
                        {team.members.length} member
                        {team.members.length !== 1 ? "s" : ""}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-xs font-medium text-neutral-500 group-hover:text-neutral-300 transition-colors">
                      <span>Open</span>
                      <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        <AnimatePresence>
          {showInviteModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowInviteModal(false)}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="relative w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl overflow-hidden"
              >
                <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-900">
                  <h3 className="text-sm font-semibold text-neutral-200">
                    Pending Invitations
                  </h3>
                  <button
                    onClick={() => setShowInviteModal(false)}
                    className="text-neutral-500 hover:text-neutral-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-6 max-h-[60vh] overflow-y-auto">
                  {invites.length === 0 ? (
                    <div className="text-center py-8">
                      <Mail className="w-8 h-8 text-neutral-700 mx-auto mb-3" />
                      <p className="text-neutral-500 text-sm">
                        No pending invitations
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {invites.map((invite) => (
                        <div
                          key={invite.id}
                          className="p-4 rounded-lg bg-neutral-950 border border-neutral-800"
                        >
                          <div className="mb-4">
                            <span className="text-xs font-mono text-neutral-500 block mb-1">
                              INVITED BY{" "}
                              {invite.invitedBy.name || invite.invitedBy.email}
                            </span>
                            <h4 className="font-bold text-neutral-200">
                              {invite.team.name}
                            </h4>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <button
                              onClick={() => acceptTeamInvite(invite.id)}
                              className="flex items-center justify-center gap-2 py-2 rounded bg-neutral-50 hover:bg-white text-neutral-950 text-xs font-bold transition-colors"
                            >
                              <Check className="w-3 h-3" /> Accept
                            </button>
                            <button
                              onClick={() => rejectTeamInvite(invite.id)}
                              className="flex items-center justify-center gap-2 py-2 rounded border border-neutral-800 hover:border-red-900/50 hover:bg-red-900/10 text-neutral-400 hover:text-red-400 text-xs font-bold transition-colors"
                            >
                              <Ban className="w-3 h-3" /> Reject
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
}
