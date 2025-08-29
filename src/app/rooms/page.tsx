"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  DoorClosed,
  Loader2,
  Send,
  User,
  Users,
  X,
} from "lucide-react";
import HomeNavbar from "@/components/HomeNavbar";
import { useSession } from "next-auth/react";
import ConfirmModal from "@/components/ConfirmModal";
import { RoomList } from "@/components/RoomList";
import { Room } from "@/types/Room";
import toast from "react-hot-toast";
import { Loader } from "@/components/Loader";

interface Invite {
  id: string;
  status: "PENDING" | string;
  room: Room;
  invitedBy: { id: string; name: string | null };
}

export default function RoomsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomName, setRoomName] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedRoomToDelete, setSelectedRoomToDelete] = useState<Room | null>(
    null
  );
  const [selectedRoomSlug, setSelectedRoomSlug] = useState("");
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [pendingInvites, setPendingInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(false);
  const [roomToLeave, setRoomToLeave] = useState<Room | null>(null);

  const loadRoomsAndInvites = async () => {
    try {
      const [roomRes, inviteRes] = await Promise.all([
        fetch("/api/rooms", { credentials: "include" }),
        fetch("api/invite", { credentials: "include" }),
      ]);

      const roomsData = await roomRes.json();
      const invitesData = await inviteRes.json();

      setRooms(Array.isArray(roomsData) ? roomsData : []);
      setPendingInvites(Array.isArray(invitesData) ? invitesData : []);
    } catch (error) {
      toast.error("Failed to load rooms or invites");
      setRooms([]);
      setPendingInvites([]);
    }
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status]);

  useEffect(() => {
    loadRoomsAndInvites();
  }, []);

  useEffect(() => {
    if (!showInviteModal) {
      loadRoomsAndInvites();
    }
  }, [showInviteModal]);

  const sendInvite = async () => {
    if (!selectedRoomSlug) {
      toast.error("Please select a room to invite to");
      return;
    }

    if (!inviteEmail.trim()) {
      toast.error("Please enter an email to invite");
      return;
    }

    try {
      const res = await fetch(`/api/room/${selectedRoomSlug}/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: inviteEmail.trim(),
          roomSlug: selectedRoomSlug,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to send invite");
      }

      toast.success("Invite sent successfully");
      setInviteEmail("");
      setSelectedRoomSlug("");
      loadRoomsAndInvites();
    } catch (error: any) {
      toast.error(error.message || "Something went wrong while sending invite");
    }
  };

  const respondToInvite = async (
    inviteId: string,
    action: "ACCEPT" | "REJECT"
  ) => {
    try {
      await fetch(`/api/invite/${inviteId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      loadRoomsAndInvites();
    } catch (err) {
      console.error(err);
      toast.error("Failed to respond to invite");
    }
  };

  const handleCreate = async () => {
    if (!roomName.trim()) {
      toast.error("Please enter a room name");
      return;
    }
    setLoading(true);

    try {
      const res = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: roomName,
          slug: roomName.toLowerCase().replace(/\s+/g, "-"),
        }),
      });

      if (res.ok) {
        const newRoom = await res.json();
        setRooms((prev) => [...prev, { ...newRoom, owned: true }]);
        setRoomName("");
        toast.success("Room created");
        router.push(`/room/${newRoom.slug}`);
      } else {
        const error = await res.json();
        toast.error(error.error || "Failed to create room");
      }
    } catch (err) {
      console.error("Room creation failed:", err);
      toast.error("Something went wrong while creating the room");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (slug: string) => {
    try {
      const res = await fetch(`/api/room/${slug}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setRooms((prev) => prev.filter((room) => room.slug !== slug));
        toast.success("Room deleted successfully");
      } else {
        const error = await res.json();
        toast.error(error.error || "Failed to delete room");
      }
    } catch (err) {
      console.error("Delete room failed:", err);
      toast.error("Something went wrong while deleting the room");
    }
  };

  const handleLeave = async (slug: string) => {
    try {
      const res = await fetch(`/api/room/${slug}`, {
        method: "POST",
      });

      if (res.ok) {
        setRooms((prev) => prev.filter((room) => room.slug !== slug));
        toast.success("Room leaved successfully");
      } else {
        const error = await res.json();
        toast.error(error.error || "Failed to leave room");
      }
    } catch (err) {
      console.error("Leave room failed:", err);
      toast.error("Something went wrong while leaving the room");
    }
  };

  if (status === "loading") {
    return <Loader />;
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-black via-[#111111] to-gray-900 text-white">
      <HomeNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 py-12 sm:py-20 space-y-16 sm:space-y-20">
        {/* Header */}
        <header className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full mb-4 bg-white/5 text-xs sm:text-sm text-gray-400 border border-white/10">
            <DoorClosed className="w-4 h-4" />
            Collaborative Coding Rooms
          </div>
          <h1 className="leading-[1.2] text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-white to-gray-300 text-transparent bg-clip-text mb-4">
            Your Rooms
          </h1>
          <p className="text-gray-400 text-base sm:text-lg max-w-xl mx-auto">
            Manage real-time collaborative coding spaces — easily and securely.
          </p>
        </header>

        {/* Create Room */}
        <section className="max-w-3xl mx-auto w-full">
          <div className="relative rounded-2xl bg-gradient-to-br from-white/5 to-white/10 border border-white/10 p-4 sm:p-6 shadow-xl backdrop-blur-md">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
              <input
                type="text"
                placeholder="e.g. Design Sync, Project X"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                className="flex-1 w-full px-4 py-3 rounded-lg bg-black/60 text-white border border-white/10 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 transition"
              />
              <button
                onClick={handleCreate}
                disabled={loading}
                className={`w-full sm:w-auto px-6 py-3 text-sm rounded-lg font-medium transition-all duration-150 cursor-pointer
                ${
                  loading
                    ? "bg-gray-500 text-white cursor-not-allowed"
                    : "bg-gradient-to-r from-indigo-300 to-cyan-300 text-black hover:brightness-105 active:scale-95"
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating{" "}
                    <span className="animate-pulse -ml-2 text-white">...</span>
                  </div>
                ) : (
                  "Create Room"
                )}
              </button>
              <div className="relative w-full sm:w-auto">
                <button
                  onClick={() => setShowInviteModal(true)}
                  className="w-full sm:w-auto px-6 py-3
                  bg-white/5 text-white/80
                  hover:bg-white/10 hover:text-white
                  border border-white/10
                  text-sm font-medium rounded-lg transition duration-200 cursor-pointer"
                >
                  Manage Invitations
                </button>
                {pendingInvites.length > 0 && (
                  <span className="absolute -top-2 -right-2 px-1.5 py-0.5 text-[10px] font-semibold bg-red-500 text-white rounded-full">
                    {pendingInvites.length}
                  </span>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Room List */}
        <section className="max-w-5xl mx-auto space-y-10 sm:space-y-14">
          {/* Owned Rooms */}
          {rooms.filter((r) => r.owned).length > 0 && (
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-white/70" />
                <h2 className="text-lg sm:text-xl font-semibold">
                  Owned Rooms
                </h2>
              </div>
              <RoomList
                rooms={rooms.filter((room) => room.owned)}
                onDelete={(room) => {
                  setSelectedRoomToDelete(room);
                  setShowDeleteConfirm(true);
                }}
              />
            </div>
          )}

          {/* Joined Rooms */}
          {rooms.filter((r) => !r.owned).length > 0 && (
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-white/70" />
                <h2 className="text-lg sm:text-xl font-semibold">
                  Joined Rooms
                </h2>
              </div>
              <RoomList
                rooms={rooms.filter((room) => !room.owned)}
                onLeave={(slug) => {
                  const room = rooms.find((r) => r.slug === slug);
                  if (room) setRoomToLeave(room);
                }}
              />
            </div>
          )}

          {/* Empty State */}
          {rooms.length === 0 && (
            <div className="text-center mt-12 sm:mt-20">
              <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-white/5 ring-1 ring-white/10 mb-6">
                <DoorClosed className="w-7 h-7 sm:w-8 sm:h-8 text-gray-400" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">
                No Rooms Yet
              </h3>
              <p className="text-gray-500 italic max-w-xs mx-auto text-sm sm:text-base">
                Start by creating one above.
              </p>
            </div>
          )}
        </section>

        {/* Invite Modal (responsive) */}
        {showInviteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-3 sm:px-4">
            <div className="relative w-full max-w-md sm:max-w-xl bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl text-white space-y-6 sm:space-y-8">
              {/* Close Icon */}
              <button
                onClick={() => setShowInviteModal(false)}
                className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-400 hover:text-white transition cursor-pointer"
                aria-label="Close"
              >
                <X />
              </button>

              {/* Modal Header */}
              <div className="space-y-1">
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                  Manage Invitations
                </h2>
                <p className="text-sm text-gray-400">
                  Invite users to a room and manage pending invitations.
                </p>
              </div>

              {/* Invite Form */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Select Room Dropdown */}
                  <div className="relative">
                    <select
                      value={selectedRoomSlug}
                      onChange={(e) => setSelectedRoomSlug(e.target.value)}
                      className="appearance-none w-full px-4 py-3 rounded-lg bg-neutral-900 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 transition pr-10 text-sm sm:text-base"
                    >
                      <option value="" disabled>
                        Select Room
                      </option>
                      {rooms
                        .filter((room) => room.owned)
                        .map((room) => (
                          <option key={room.id} value={room.slug}>
                            {room.name}
                          </option>
                        ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400">
                      <ChevronDown />
                    </div>
                  </div>

                  {/* Email Input */}
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="Enter user email"
                    className="w-full px-4 py-3 rounded-lg bg-neutral-900 text-white border border-white/10 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 transition text-sm sm:text-base"
                  />
                </div>

                {/* Send Invite Button */}
                <div className="flex justify-end">
                  <button
                    onClick={sendInvite}
                    className="w-full sm:w-auto flex justify-center sm:justify-around px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-indigo-500 text-sm font-semibold text-white rounded-md shadow hover:brightness-110 active:scale-95 transition-transform cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Send />
                      Send Invite
                    </span>
                  </button>
                </div>
              </div>

              {/* Pending Invites */}
              <div className="space-y-3">
                <h3 className="text-base sm:text-lg font-semibold">
                  Pending Invites
                </h3>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {pendingInvites.length === 0 ? (
                    <p className="text-sm text-gray-500 italic">
                      You have no pending invites.
                    </p>
                  ) : (
                    pendingInvites.map((invite) => (
                      <div
                        key={invite.id}
                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-neutral-800 border border-white/10 px-4 py-2 rounded-md"
                      >
                        <div className="text-sm text-white flex-1">
                          Invitation to join{" "}
                          <span className="font-semibold text-cyan-400">
                            {invite.room.name}
                          </span>
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto">
                          <button
                            onClick={() => respondToInvite(invite.id, "ACCEPT")}
                            className="flex-1 sm:flex-none px-3 py-1.5 bg-green-600 hover:bg-green-700 text-sm rounded-md text-white cursor-pointer"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => respondToInvite(invite.id, "REJECT")}
                            className="flex-1 sm:flex-none px-3 py-1.5 bg-red-600 hover:bg-red-700 text-sm rounded-md text-white cursor-pointer"
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
          </div>
        )}

        {/* Confirm Modals (already centered, just ensure spacing works on mobile) */}
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
          onConfirm={async () => {
            await handleDelete(selectedRoomToDelete!.slug);
            setShowDeleteConfirm(false);
            setSelectedRoomToDelete(null);
          }}
        />

        <ConfirmModal
          isOpen={!!roomToLeave}
          title="Leave Room"
          message={
            <>
              Are you sure you want to leave{" "}
              <strong className="text-white">{roomToLeave?.name}</strong>?
              You’ll lose access to its content.
            </>
          }
          confirmLabel="Leave Room"
          cancelLabel="Cancel"
          onCancel={() => setRoomToLeave(null)}
          onConfirm={async () => {
            if (roomToLeave) {
              await handleLeave(roomToLeave.slug);
              setRoomToLeave(null);
            }
          }}
        />
      </main>
    </div>
  );
}
