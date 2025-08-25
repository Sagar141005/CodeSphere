"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import HomeNavbar from "@/components/HomeNavbar";
import {
  User,
  Users,
  Trash2,
  LogOut,
  Crown,
  ArrowRightCircle,
  UserPlus,
  DoorClosed,
  Loader2,
} from "lucide-react";
import ConfirmModal from "@/components/ConfirmModal";
import { Loader } from "@/components/Loader";

interface Room {
  id: string;
  slug: string;
  name: string;
  createdAt: string;
}

interface TeamMember {
  id: string;
  name: string | null;
  email: string;
  profilePic?: string;
  image?: string;
}

interface Team {
  id: string;
  name: string;
  createdById: string;
  members: TeamMember[];
  rooms: Room[];
}

export default function TeamDetailsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [team, setTeam] = useState<Team | null>(null);
  const [newRoomName, setNewRoomName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [creatingRoom, setCreatingRoom] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDeleteTeamConfirm, setShowDeleteTeamConfirm] = useState(false);
  const [selectedRoomToDelete, setSelectedRoomToDelete] = useState<Room | null>(
    null
  );

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status]);

  // Fetch team details
  useEffect(() => {
    if (!id || !session) return;

    setLoading(true);

    fetch(`/api/team/${id}`)
      .then((res) => res.json())
      .then((data) => setTeam(data))
      .catch(() => setTeam(null))
      .finally(() => setLoading(false));
  }, [id, session]);

  // Invite Member
  const inviteMember = async () => {
    if (!inviteEmail.trim()) return;

    setInviting(true);
    try {
      const res = await fetch(`/api/team/${id}/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail }),
      });

      if (res.ok) {
        alert("Invitation sent!");
        setInviteEmail("");
      } else {
        const err = await res.json();
        alert(err.error || "Failed to invite member");
      }
    } catch (err) {
      console.error("Invite failed:", err);
      alert("Something went wrong while inviting.");
    } finally {
      setInviting(false);
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
      setTeam((prev) =>
        prev
          ? { ...prev, members: prev.members.filter((m) => m.id !== memberId) }
          : prev
      );
    }
  };

  // Create Room
  const createRoom = async () => {
    if (!newRoomName.trim()) return;

    setCreatingRoom(true);
    try {
      const res = await fetch(`/api/team/${id}/room/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newRoomName }),
      });

      if (res.ok) {
        const newRoom = await res.json();
        setTeam((prev) =>
          prev ? { ...prev, rooms: [...prev.rooms, newRoom] } : prev
        );
        setNewRoomName("");
      } else {
        const err = await res.json();
        alert(err.error || "Failed to create room");
      }
    } catch (err) {
      console.error("Room creation failed:", err);
      alert("Something went wrong while creating the room.");
    } finally {
      setCreatingRoom(false);
    }
  };

  // Leave Team
  const leaveTeam = async () => {
    if (!confirm("Are you sure you want to leave this team?")) return;
    const res = await fetch(`/api/team/${id}/leave`, { method: "DELETE" });
    if (res.ok) {
      router.push("/teams");
    }
  };

  const handleDeleteRoom = async (slug: string) => {
    const res = await fetch(`/api/room/${slug}`, {
      method: "DELETE",
    });

    if (res.ok) {
      setTeam((prev) =>
        prev
          ? { ...prev, rooms: prev.rooms.filter((room) => room.slug !== slug) }
          : prev
      );
    } else {
      const error = await res.json();
      alert(error.error || "Failed to delete room");
    }
  };

  const handleDeleteTeam = async (id: string) => {
    const res = await fetch(`/api/team/${id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      alert("Team deleted successfully");
      router.push("/teams");
    } else {
      const error = await res.json();
      alert(error.error || "Failed to delete team");
    }
  };
  if (status === "loading" || loading) {
    return <Loader />;
  }

  if (!team) {
    return <p className="text-center mt-10">Team not found.</p>;
  }

  const isOwner = session?.user?.id === team.createdById;

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-black via-[#111111] to-gray-900 text-white font-sans">
      <HomeNavbar />

      <main className="max-w-7xl mx-auto px-6 md:px-12 py-20 space-y-20 overflow-y-auto">
        {/* Header */}
        <section className="max-w-5xl mx-auto bg-black/60 border border-white/10 rounded-3xl p-8 shadow-xl space-y-8">
          {/* Top Row: Team Info + Delete Button */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            {/* Team Name & Creator */}
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight capitalize">
                {team.name}
              </h1>
              <p className="text-sm text-gray-400 flex items-center gap-2">
                <User className="w-4 h-4 text-gray-500" />
                Created by:
                <code className="ml-1 px-1 py-0.5 bg-gray-900 text-white rounded text-xs">
                  {team.createdById}
                </code>
              </p>
            </div>

            {/* Delete Button (if owner) */}
            {isOwner && (
              <button
                onClick={() => setShowDeleteTeamConfirm(true)}
                className="flex items-center gap-1 text-sm text-red-500 hover:text-white hover:bg-red-600 border border-red-600 px-3 py-1.5 rounded-lg transition cursor-pointer"
                aria-label="Delete team"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            )}
          </div>

          {/* Members Section */}
          <div>
            <h2 className="text-3xl font-semibold flex items-center gap-3 text-white mb-6">
              <Users className="w-7 h-7 text-neutral-400" />
              Members
            </h2>

            <ul className="space-y-4 mb-6 max-h-[400px] overflow-y-auto">
              {team.members.map((member) => {
                const isTeamOwner = member.id === team.createdById;
                return (
                  <li
                    key={member.id}
                    className="flex justify-between items-center rounded-xl px-6 py-4 bg-[#111111] hover:bg-white/5 transition cursor-default"
                  >
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-gradient-to-br from-cyan-600 to-indigo-700 text-white flex items-center justify-center font-bold text-lg select-none shadow-md">
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
                        <span className="text-xs text-gray-400 truncate">
                          {member.email}
                        </span>
                      </div>

                      {isTeamOwner && (
                        <span
                          className="flex items-center gap-1 bg-yellow-400 text-gray-900 text-xs font-semibold px-3 py-1 rounded-full select-none"
                          title="Team Owner"
                        >
                          <Crown className="w-4 h-4" />
                          Owner
                        </span>
                      )}
                    </div>

                    {isOwner &&
                      member.email !== session?.user?.email &&
                      !isTeamOwner && (
                        <button
                          onClick={() => removeMember(member.id)}
                          className="flex items-center gap-1 text-red-500 hover:text-red-600 transition font-semibold focus:outline-none rounded cursor-pointer"
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

            {/* Invite Member Form */}
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
                  className="flex-1 rounded-lg bg-black/60 border border-white/20 px-5 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  aria-label="Email to invite"
                  required
                  spellCheck={false}
                  autoComplete="off"
                />
                <button
                  type="submit"
                  disabled={inviting}
                  className={`flex items-center gap-2 px-6 py-3 text-sm font-medium rounded-lg transition duration-200 cursor-pointer
                    ${
                      inviting
                        ? "bg-gray-500 cursor-not-allowed text-white/70"
                        : "bg-white/5 text-white/80 hover:bg-white/10 hover:text-white border border-white/10"
                    }
                  `}
                >
                  {inviting ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Sending{" "}
                      <span className="animate-pulse -ml-2 text-white">
                        ...
                      </span>
                    </div>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      Invite Member
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </section>

        {/* Rooms Section */}
        <section className="max-w-5xl mx-auto">
          {isOwner && (
            <section className="relative max-w-5xl mx-auto mb-6">
              <div
                className="group relative cursor-pointer rounded-2xl border border-white/20 bg-gradient-to-br from-black/70 to-black/90
                           hover:border-blue-300 hover:shadow-xl transition-all duration-300 shadow-lg backdrop-blur-md p-6"
              >
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none bg-gradient-to-br from-cyan-500/10 to-indigo-500/10 blur-md" />

                <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white group-hover:text-cyan-200 transition-colors mb-1">
                      Create a New Room
                    </h3>
                    <p className="text-sm text-gray-400">
                      Give your room a name and start collaborating instantly.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 sm:items-center w-full sm:w-auto">
                    <input
                      type="text"
                      value={newRoomName}
                      onChange={(e) => setNewRoomName(e.target.value)}
                      placeholder="Enter room name"
                      className="px-4 py-2.5 rounded-lg bg-black/70 text-white border border-white/20 placeholder-gray-500 
                                 focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm w-full sm:w-64"
                      aria-label="Room name input"
                      spellCheck={false}
                      autoComplete="off"
                    />
                    <button
                      onClick={createRoom}
                      disabled={creatingRoom}
                      className={`px-6 py-3 rounded-lg font-semibold transition-all duration-150 cursor-pointer
                      ${
                        creatingRoom
                          ? "bg-gray-500 text-white cursor-not-allowed"
                          : "bg-gradient-to-r from-indigo-300 to-cyan-300 text-black hover:brightness-105 active:scale-95"
                      }
                    `}
                    >
                      {creatingRoom ? (
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Creating{" "}
                          <span className="animate-pulse -ml-2 text-white">
                            ...
                          </span>
                        </div>
                      ) : (
                        "Create Room"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </section>
          )}

          {team.rooms.length === 0 ? (
            <div className="text-center mt-20">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-white/5 ring-1 ring-white/10 mb-6">
                <DoorClosed className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                No Rooms Yet
              </h3>
              <p className="text-gray-500 italic max-w-xs mx-auto">
                Start by creating one above.
              </p>
            </div>
          ) : (
            <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {team.rooms.map((room) => (
                <li
                  key={room.id}
                  tabIndex={0}
                  className="group relative rounded-2xl border border-white/10 bg-[#141414] hover:bg-white/5 hover:border-white/20 transition-all shadow hover:shadow-2xl backdrop-blur-md focus:outline-none"
                >
                  <div className="relative z-10 p-5 space-y-3">
                    {/* Top Row */}
                    <div className="flex items-baseline justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/10 text-white/70 flex items-center justify-center font-bold text-lg">
                          {room.name[0].toUpperCase()}
                        </div>
                        <h3 className="text-lg font-semibold truncate w-20 group-hover:text-white/90 transition">
                          {room.name}
                        </h3>
                      </div>
                      {isOwner && (
                        <div
                          onClick={() => {
                            setSelectedRoomToDelete(room);
                            setShowDeleteConfirm(true);
                          }}
                          className="p-2 border border-white/10 rounded-md hover:text-red-400 transition-colors cursor-pointer"
                        >
                          <Trash2 width={15} height={15} />
                        </div>
                      )}
                    </div>

                    {/* Metadata Row */}
                    <div className="text-xs text-gray-400 flex justify-between items-center pt-1">
                      <span className="uppercase tracking-wide">Created</span>
                      <span className="text-white/80">
                        {new Date(room.createdAt).toLocaleDateString(
                          undefined,
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          }
                        )}
                      </span>
                    </div>

                    {/* CTA */}
                    <div
                      onClick={() =>
                        window.location.assign(`/room/${room.slug}`)
                      }
                      className="flex items-center justify-between pt-2 border-t border-white/10 text-sm font-semibold cursor-pointer text-gray-400 hover:text-white transition"
                    >
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
          <div className="max-w-5xl mx-auto text-right">
            <button
              onClick={leaveTeam}
              className="flex items-center gap-2 text-gray-400 hover:text-red-500 underline text-sm transition focus:outline-none focus:ring-2 focus:ring-gray-400 rounded"
              aria-label="Leave team"
            >
              <LogOut className="w-5 h-5" />
              Leave Team
            </button>
          </div>
        )}

        {/* Modals */}
        {/* Room Deletion */}
        <ConfirmModal
          isOpen={showDeleteConfirm && !!selectedRoomToDelete}
          title="Are you sure you want to delete this room?"
          message={
            <>
              <strong className="text-white">
                {selectedRoomToDelete?.name}
              </strong>{" "}
              will be permanently removed. This action cannot be undone.
            </>
          }
          onCancel={() => {
            setShowDeleteConfirm(false);
            setSelectedRoomToDelete(null);
          }}
          onConfirm={() => {
            handleDeleteRoom(selectedRoomToDelete!.slug);
            setShowDeleteConfirm(false);
            setSelectedRoomToDelete(null);
          }}
        />

        {/* Team Deletion */}
        <ConfirmModal
          isOpen={showDeleteTeamConfirm}
          title="Are you sure you want to delete this team?"
          message={
            <>
              <strong className="text-white">{team?.name}</strong> and all its
              rooms and members will be permanently removed. This action cannot
              be undone.
            </>
          }
          onCancel={() => setShowDeleteTeamConfirm(false)}
          onConfirm={async () => {
            await handleDeleteTeam(team!.id);
            setShowDeleteTeamConfirm(false);
          }}
        />
      </main>
    </div>
  );
}
