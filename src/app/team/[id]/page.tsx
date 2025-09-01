"use client";

import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import useSWR, { mutate } from "swr";
import toast from "react-hot-toast";
import { Loader } from "@/components/Loader";
import HomeNavbar from "@/components/HomeNavbar";
import ConfirmModal from "@/components/ConfirmModal";
import { RoomList } from "@/components/RoomList";
import { UserAvatar } from "@/components/UserAvatar";
import {
  User,
  Users,
  Trash2,
  LogOut,
  Crown,
  UserPlus,
  DoorClosed,
  Loader2,
} from "lucide-react";
import { Room } from "@/types/Room";
import { useState, useEffect } from "react";

interface TeamMember {
  id: string;
  name: string | null;
  email: string;
  profilePic?: string;
  image?: string;
}

interface TeamInvite {
  id: string;
  email: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  invitedAt: string;
}

interface Team {
  id: string;
  name: string;
  createdById: string;
  members: TeamMember[];
  rooms: Room[];
  invites: TeamInvite[];
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
  }, [status]);

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
      console.error("Invite failed:", err);
      toast.error("Something went wrong while inviting");
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
        toast.success("Member removed successfully");
        mutate(`/api/team/${id}`);
      } else {
        const error = await res.json();
        toast.error(error.error || "Failed to remove member");
      }
    } catch (err) {
      console.error("Remove member failed:", err);
      toast.error("Something went wrong while removing member");
    }
  };

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
      console.error("Room creation failed:", err);
      toast.error("Something went wrong while creating the room.");
    } finally {
      setCreatingRoom(false);
    }
  };

  const leaveTeam = async () => {
    try {
      const res = await fetch(`/api/team/${id}/leave`, { method: "DELETE" });
      if (res.ok) {
        router.push("/teams");
        toast.success("Room leaved successfully");
      } else {
        const error = await res.json();
        toast.error(error.error || "Failed to leave team");
      }
    } catch (err) {
      console.error("Leave team failed:", err);
      toast.error("Something went wrong while leaving the team");
    }
  };

  const handleDeleteRoom = async (slug: string) => {
    try {
      const res = await fetch(`/api/room/${slug}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Room deleted successfully");
        mutate(`/api/team/${id}`);
      } else {
        const error = await res.json();
        toast.error(error.error || "Failed to delete room");
      }
    } catch (err) {
      console.error("Delete room failed:", err);
      toast.error("Something went wrong while deleting the room");
    }
  };

  const handleDeleteTeam = async (id: string) => {
    try {
      const res = await fetch(`/api/team/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Team deleted successfully");
        router.push("/teams");
      } else {
        const error = await res.json();
        toast.error(error.error || "Failed to delete team");
      }
    } catch (err) {
      console.error("Delete team failed:", err);
      toast.error("Something went wrong while deleting the team");
    }
  };

  if (status === "loading" || isLoading) {
    return <Loader />;
  }

  if (error || !team) {
    return <p className="text-center mt-10">Team not found.</p>;
  }

  const isOwner = session?.user?.id === team.createdById;

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-black via-[#111111] to-gray-900 text-white font-sans">
      <HomeNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 py-10 sm:py-16 md:py-20 space-y-16 sm:space-y-20">
        {/* Header */}
        <section className="max-w-5xl mx-auto bg-black/60 border border-white/10 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-xl space-y-6 sm:space-y-8">
          {/* Top Row: Team Info + Delete Button */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 sm:gap-6 relative">
            {/* Team Name & Creator */}
            <div className="space-y-2 text-center md:text-left">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight capitalize break-words">
                {team.name}
              </h1>
              <p className="text-xs sm:text-sm text-gray-400 flex flex-wrap items-center justify-center md:justify-start gap-1">
                <User className="w-4 h-4 text-gray-500" />
                Created by:
                <code className="ml-1 px-1 py-0.5 bg-gray-900 text-white rounded text-[10px] sm:text-xs break-all">
                  {team.createdById}
                </code>
              </p>
            </div>

            {/* Delete Button (if owner) */}
            {isOwner && (
              <>
                {/* For small screens: absolute top-right */}
                <button
                  onClick={() => setShowDeleteTeamConfirm(true)}
                  className="absolute top-0 right-0 sm:hidden flex items-center justify-center gap-1 
                   text-xs text-red-500 hover:text-white hover:bg-red-600 
                   border border-red-600 px-3 py-1.5 rounded-lg transition cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                {/* For md+ screens: inline button */}
                <button
                  onClick={() => setShowDeleteTeamConfirm(true)}
                  className="hidden sm:flex items-center justify-center gap-1 
                   text-xs sm:text-sm text-red-500 hover:text-white hover:bg-red-600 
                   border border-red-600 px-3 py-1.5 rounded-lg transition cursor-pointer w-full md:w-auto"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </>
            )}
          </div>

          {/* Members Section */}
          <div>
            <h2 className="text-2xl sm:text-3xl font-semibold flex items-center gap-2 sm:gap-3 text-white mb-4 sm:mb-6">
              <Users className="w-6 h-6 sm:w-7 sm:h-7 text-neutral-400" />
              Members
            </h2>

            <ul className="space-y-3 sm:space-y-4 mb-6 max-h-[300px] sm:max-h-[400px] overflow-y-auto">
              {team.members.map((member) => {
                const isTeamOwner = member.id === team.createdById;
                return (
                  <li
                    key={member.id}
                    className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0 rounded-xl px-4 sm:px-6 py-3 sm:py-4 bg-[#111111] hover:bg-white/5 transition cursor-default"
                  >
                    <div className="flex items-center gap-3 sm:gap-5 w-full sm:w-auto">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl overflow-hidden shadow-md">
                        <UserAvatar
                          user={{
                            name: member.name ?? "Anonymous",
                            image: member.image ?? undefined,
                          }}
                          size="full"
                        />
                      </div>

                      <div className="flex flex-col max-w-[150px] sm:max-w-xs">
                        <span className="font-semibold truncate">
                          {member.name || member.email}
                        </span>
                        <span className="text-xs text-gray-400 truncate">
                          {member.email}
                        </span>
                      </div>

                      {isTeamOwner && (
                        <span
                          className="flex items-center gap-1 bg-yellow-400 text-gray-900 text-[10px] sm:text-xs font-semibold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full select-none"
                          title="Team Owner"
                        >
                          <Crown className="w-3 h-3 sm:w-4 sm:h-4" />
                          Owner
                        </span>
                      )}
                    </div>

                    {isOwner &&
                      member.email !== session?.user?.email &&
                      !isTeamOwner && (
                        <button
                          onClick={() => setMemberToRemove(member)}
                          className="flex items-center justify-center gap-1 text-xs sm:text-sm text-red-500 hover:text-red-600 transition font-semibold focus:outline-none rounded cursor-pointer"
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
                className="flex flex-col sm:flex-row gap-3 sm:gap-4"
              >
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="Invite member by email"
                  className="flex-1 rounded-lg bg-black/60 border border-white/20 px-4 sm:px-5 py-2.5 sm:py-3 text-sm sm:text-base text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-300 w-full"
                  aria-label="Email to invite"
                  required
                  spellCheck={false}
                  autoComplete="off"
                />
                <button
                  type="submit"
                  disabled={inviting}
                  className={`flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-medium rounded-lg transition duration-200 cursor-pointer w-full sm:w-auto
                    ${
                      inviting
                        ? "bg-gray-500 cursor-not-allowed text-white/70"
                        : "bg-white/5 text-white/80 hover:bg-white/10 hover:text-white border border-white/10"
                    }
                  `}
                >
                  {inviting ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                      Sending{" "}
                      <span className="animate-pulse -ml-2 text-white">
                        ...
                      </span>
                    </div>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      Invite
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
                className="group relative cursor-pointer rounded-2xl border border-white/20 
                   bg-gradient-to-br from-black/70 to-black/90
                   hover:border-blue-300 hover:shadow-xl transition-all duration-300 
                   shadow-lg backdrop-blur-md p-6"
              >
                <div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 
                        transition-all duration-500 pointer-events-none 
                        bg-gradient-to-br from-cyan-500/10 to-indigo-500/10 blur-md"
                />

                <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  {/* Left: Title */}
                  <div className="flex-1 text-center sm:text-left">
                    <h3 className="text-lg font-semibold text-white group-hover:text-cyan-200 transition-colors mb-1">
                      Create a New Room
                    </h3>
                    <p className="text-sm text-gray-400">
                      Give your room a name and start collaborating instantly.
                    </p>
                  </div>

                  {/* Right: Input + Button */}
                  <div className="flex flex-col sm:flex-row gap-3 sm:items-center w-full sm:w-auto">
                    <input
                      type="text"
                      value={newRoomName}
                      onChange={(e) => setNewRoomName(e.target.value)}
                      placeholder="Enter room name"
                      className="px-4 py-2.5 rounded-lg bg-black/70 text-white border border-white/20 
                         placeholder-gray-500 focus:outline-none focus:ring-2 
                         focus:ring-blue-300 text-sm w-full sm:w-64"
                      aria-label="Room name input"
                      spellCheck={false}
                      autoComplete="off"
                    />
                    <button
                      onClick={createRoom}
                      disabled={creatingRoom}
                      className={`px-6 py-3 rounded-lg font-semibold transition-all duration-150 
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

          {/* Rooms Heading if user is NOT owner */}
          {!isOwner && team.rooms.length > 0 && (
            <h2 className="text-2xl font-semibold flex items-center gap-3 text-white mb-6">
              <DoorClosed className="w-6 h-6 text-neutral-400" />
              Rooms
            </h2>
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
            <RoomList
              rooms={team.rooms.map((room) => ({
                ...room,
                owned: room.ownerId === session?.user?.id,
              }))}
              onDelete={(room) => {
                setSelectedRoomToDelete(room);
                setShowDeleteConfirm(true);
              }}
            />
          )}
        </section>
        {/* Leave Team Button */}
        {!isOwner && (
          <div className="max-w-5xl mx-auto text-right">
            <button
              onClick={() => setConfirmLeaveTeam(true)}
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
        {/* Remove Member */}
        <ConfirmModal
          isOpen={!!memberToRemove}
          title="Remove Team Member"
          message={
            <>
              Are you sure you want to remove{" "}
              <strong className="text-white">
                {memberToRemove?.name || memberToRemove?.email}
              </strong>{" "}
              from the team?
            </>
          }
          confirmLabel="Remove"
          cancelLabel="Cancel"
          onCancel={() => setMemberToRemove(null)}
          onConfirm={async () => {
            if (memberToRemove) {
              await removeMember(memberToRemove.id);
              setMemberToRemove(null);
            }
          }}
        />
        {/* Leave Room */}
        <ConfirmModal
          isOpen={confirmLeaveTeam}
          title="Leave Team"
          message={
            <>
              Are you sure you want to leave{" "}
              <strong className="text-white">{team?.name}</strong>? You will
              lose access to all rooms and team data.
            </>
          }
          confirmLabel="Leave Team"
          cancelLabel="Stay"
          onCancel={() => setConfirmLeaveTeam(false)}
          onConfirm={async () => {
            await leaveTeam();
            setConfirmLeaveTeam(false);
          }}
        />
      </main>
    </div>
  );
}
