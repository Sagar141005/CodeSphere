"use client";

import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import useSWR, { mutate } from "swr";
import toast from "react-hot-toast";
import { Loader } from "@/components/Loader";
import HomeNavbar from "@/components/home/HomeNavbar";
import ConfirmModal from "@/components/ConfirmModal";
import { RoomList } from "@/components/room/RoomList";
import { UserAvatar } from "@/components/UserAvatar";
import {
  Users,
  Trash2,
  LogOut,
  Crown,
  DoorClosed,
  Loader2,
  Plus,
  Mail,
  Shield,
} from "lucide-react";
import { Room } from "@/types/Room";
import { useState, useEffect } from "react";
import Footer from "@/components/Footer";

interface TeamMember {
  id: string;
  name: string | null;
  email: string;
  image?: string;
}

interface Team {
  id: string;
  name: string;
  createdById: string;
  members: TeamMember[];
  rooms: Room[];
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function TeamDetailsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const {
    data: team,
    error,
    isLoading,
  } = useSWR<Team>(id && session ? `/api/team/${id}` : null, fetcher);

  const [newRoomName, setNewRoomName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [creatingRoom, setCreatingRoom] = useState(false);
  const [inviting, setInviting] = useState(false);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDeleteTeamConfirm, setShowDeleteTeamConfirm] = useState(false);
  const [selectedRoomToDelete, setSelectedRoomToDelete] = useState<Room | null>(
    null
  );
  const [memberToRemove, setMemberToRemove] = useState<TeamMember | null>(null);
  const [confirmLeaveTeam, setConfirmLeaveTeam] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

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
        toast.success("Room created");
        setNewRoomName("");
        mutate(`/api/team/${id}`);
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to create room");
      }
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setCreatingRoom(false);
    }
  };

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
        toast.success("Invitation sent");
        setInviteEmail("");
        mutate(`/api/team/${id}`);
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to invite member");
      }
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setInviting(false);
    }
  };

  const removeMember = async (memberId: string) => {
    try {
      const res = await fetch(`/api/team/${id}/remove-member`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: memberId }),
      });
      if (res.ok) {
        toast.success("Member removed");
        mutate(`/api/team/${id}`);
      } else {
        toast.error("Failed to remove member");
      }
    } catch (err) {
      toast.error("Something went wrong");
    }
  };

  const handleDeleteRoom = async (slug: string) => {
    try {
      const res = await fetch(`/api/room/${slug}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Room deleted");
        mutate(`/api/team/${id}`);
      } else {
        toast.error("Failed to delete room");
      }
    } catch (err) {
      toast.error("Something went wrong");
    }
  };

  const handleDeleteTeam = async (id: string) => {
    try {
      const res = await fetch(`/api/team/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Team deleted");
        router.push("/teams");
      } else {
        toast.error("Failed to delete team");
      }
    } catch (err) {
      toast.error("Something went wrong");
    }
  };

  const leaveTeam = async () => {
    try {
      const res = await fetch(`/api/team/${id}/leave`, { method: "DELETE" });
      if (res.ok) {
        router.push("/teams");
        toast.success("Left team successfully");
      } else {
        toast.error("Failed to leave team");
      }
    } catch (err) {
      toast.error("Something went wrong");
    }
  };

  if (status === "loading" || isLoading) return <Loader />;
  if (error || !team)
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-neutral-500">
        Team not found.
      </div>
    );

  const isOwner = session?.user?.id === team.createdById;

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-50">
      <HomeNavbar />

      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-20 relative">
        <div className="relative z-10 space-y-12">
          <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-neutral-800 pb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-neutral-900 border border-neutral-800">
                  <Users className="w-5 h-5 text-neutral-400" />
                </div>
                <span className="font-mono text-xs font-medium text-neutral-500 uppercase tracking-widest">
                  Team Dashboard
                </span>
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-neutral-50 capitalize">
                {team.name}
              </h1>
              <p className="mt-2 text-neutral-400 text-sm flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                Team Workspace
                <span className="text-neutral-600 px-2">|</span>
                <span className="font-mono text-neutral-500">
                  ID: {team.id}
                </span>
              </p>
            </div>

            <div className="flex items-center gap-3">
              {isOwner && (
                <button
                  onClick={() => setShowDeleteTeamConfirm(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-red-900/30 text-red-500 hover:bg-red-950/20 hover:border-red-900/50 transition-colors text-sm font-medium"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Delete Team</span>
                </button>
              )}

              {!isOwner && (
                <button
                  onClick={() => setConfirmLeaveTeam(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-neutral-800 text-neutral-400 hover:bg-neutral-900 hover:text-neutral-200 transition-colors text-sm font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Leave Team</span>
                </button>
              )}
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-1 space-y-6">
              <div className="rounded-xl border border-neutral-800 bg-neutral-900/30 overflow-hidden">
                <div className="p-4 border-b border-neutral-800 bg-neutral-900/50 flex justify-between items-center">
                  <h3 className="text-sm font-semibold text-neutral-300">
                    Team Members
                  </h3>
                  <span className="px-2 py-0.5 rounded bg-neutral-800 text-neutral-400 text-xs font-mono">
                    {team.members.length}
                  </span>
                </div>

                <ul className="divide-y divide-neutral-800 max-h-[400px] overflow-y-auto">
                  {team.members.map((member) => {
                    const isTeamOwner = member.id === team.createdById;
                    return (
                      <li
                        key={member.id}
                        className="p-4 flex items-center justify-between group hover:bg-neutral-900/50 transition-colors"
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="w-8 h-8 shrink-0">
                            <UserAvatar
                              user={{
                                name: member.name ?? "Anonymous",
                                image: member.image,
                              }}
                              size="full"
                            />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-neutral-200 truncate">
                                {member.name || "Unknown"}
                              </span>
                              {isTeamOwner && (
                                <Crown className="w-3 h-3 text-yellow-500" />
                              )}
                            </div>
                            <span className="text-xs text-neutral-500 truncate block max-w-[300px]">
                              {member.email}
                            </span>
                          </div>
                        </div>

                        {isOwner && member.email !== session?.user?.email && (
                          <button
                            onClick={() => setMemberToRemove(member)}
                            className="opacity-0 group-hover:opacity-100 p-2 text-neutral-500 hover:text-red-500 transition-all rounded hover:bg-red-950/20"
                            title="Remove member"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </li>
                    );
                  })}
                </ul>

                {isOwner && (
                  <div className="p-4 border-t border-neutral-800 bg-neutral-900/20">
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        inviteMember();
                      }}
                      className="flex flex-col gap-3"
                    >
                      <div className="relative">
                        <Mail className="absolute left-3 top-2.5 w-4 h-4 text-neutral-500" />
                        <input
                          type="email"
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                          placeholder="Invite by email..."
                          className="w-full bg-neutral-950 border border-neutral-800 rounded-lg py-2 pl-9 pr-3 text-sm text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-neutral-600 transition-colors"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={inviting || !inviteEmail}
                        className="w-full py-2 bg-neutral-100 hover:bg-white disabled:bg-neutral-800 disabled:text-neutral-600 text-neutral-950 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        {inviting ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          "Send Invite"
                        )}
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
              {isOwner && (
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      placeholder="Create new team room..."
                      value={newRoomName}
                      onChange={(e) => setNewRoomName(e.target.value)}
                      className="w-full h-10 bg-neutral-900 border border-neutral-800 rounded-lg px-4 text-sm text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-neutral-600 focus:ring-1 focus:ring-neutral-600 transition-all"
                    />
                  </div>
                  <button
                    onClick={createRoom}
                    disabled={creatingRoom || !newRoomName.trim()}
                    className="h-10 px-4 rounded-lg bg-neutral-50 hover:bg-white disabled:bg-neutral-800 disabled:text-neutral-600 text-neutral-950 text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-sm"
                  >
                    {creatingRoom ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                    <span>Create</span>
                  </button>
                </div>
              )}

              <div className="flex items-center justify-between pt-4">
                <div className="flex items-center gap-2">
                  <DoorClosed className="w-4 h-4 text-neutral-500" />
                  <h2 className="text-sm font-semibold text-neutral-300 uppercase tracking-widest">
                    Active Rooms
                  </h2>
                </div>
                <span className="text-xs text-neutral-500 font-mono">
                  {team.rooms.length} TOTAL
                </span>
              </div>

              {team.rooms.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 border border-neutral-800 rounded-xl bg-neutral-900/20">
                  <Shield className="w-8 h-8 text-neutral-700 mb-3" />
                  <p className="text-neutral-500 font-medium">No rooms yet</p>
                  {isOwner && (
                    <p className="text-neutral-600 text-sm">
                      Create one above to get started.
                    </p>
                  )}
                </div>
              ) : (
                <ul className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <RoomList
                    rooms={team.rooms.map((r) => ({ ...r, owned: isOwner }))}
                    onDelete={(room) => {
                      setSelectedRoomToDelete(room);
                      setShowDeleteConfirm(true);
                    }}
                  />
                </ul>
              )}
            </div>
          </div>
        </div>

        <ConfirmModal
          isOpen={showDeleteConfirm && !!selectedRoomToDelete}
          title="Delete Room?"
          message={`Are you sure you want to delete "${selectedRoomToDelete?.name}"?`}
          confirmLabel="Delete"
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

        <ConfirmModal
          isOpen={showDeleteTeamConfirm}
          title="Delete Team?"
          message={
            <span className="text-red-400">
              Warning: This will permanently delete the team, its rooms, and
              remove all members.
            </span>
          }
          confirmLabel="Delete Forever"
          onCancel={() => setShowDeleteTeamConfirm(false)}
          onConfirm={async () => {
            await handleDeleteTeam(team.id);
            setShowDeleteTeamConfirm(false);
          }}
        />

        <ConfirmModal
          isOpen={!!memberToRemove}
          title="Remove Member?"
          message={`Remove ${
            memberToRemove?.name || memberToRemove?.email
          } from the team?`}
          confirmLabel="Remove"
          onCancel={() => setMemberToRemove(null)}
          onConfirm={async () => {
            if (memberToRemove) await removeMember(memberToRemove.id);
            setMemberToRemove(null);
          }}
        />

        <ConfirmModal
          isOpen={confirmLeaveTeam}
          title="Leave Team?"
          message="Are you sure you want to leave this team? You will lose access to all rooms."
          confirmLabel="Leave"
          cancelLabel="Cancel"
          onCancel={() => setConfirmLeaveTeam(false)}
          onConfirm={async () => {
            await leaveTeam();
            setConfirmLeaveTeam(false);
          }}
        />
      </main>
      <Footer />
    </div>
  );
}
