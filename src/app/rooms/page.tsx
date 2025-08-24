"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRightCircle,
  ChevronDown,
  DoorClosed,
  LogOut,
  Send,
  Trash2,
  User,
  Users,
  X,
} from "lucide-react";
import HomeNavbar from "@/components/HomeNavbar";
import { useSession } from "next-auth/react";
import ConfirmModal from "@/components/ConfirmModal";

interface Room {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  owned: boolean;
}

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
      alert("Please select a room to invite to");
      return;
    }

    if (!inviteEmail.trim()) {
      alert("Please enter an email to invite");
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

      setInviteEmail("");
      setSelectedRoomSlug("");

      loadRoomsAndInvites();
    } catch (error: any) {
      console.log(error);
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
    }
  };

  const handleCreate = async () => {
    if (!roomName.trim()) return alert("Please enter a room name");

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
      setRooms((prev) => [...prev, newRoom]);
      setRoomName("");
      router.push(`/room/${newRoom.slug}`);
    } else {
      const error = await res.json();
      alert(error.error || "Failed to create room");
    }
  };

  const handleDelete = async (slug: string) => {
    const res = await fetch(`/api/room/${slug}`, {
      method: "DELETE",
    });

    if (res.ok) {
      setRooms((prev) => prev.filter((room) => room.slug !== slug));
    } else {
      const error = await res.json();
      alert(error.error || "Failed to delete room");
    }
  };

  const handleLeave = async (slug: string) => {
    const res = await fetch(`/api/room/${slug}`, {
      method: "POST",
    });

    if (res.ok) {
      setRooms((prev) => prev.filter((room) => room.slug !== slug));
    } else {
      const error = await res.json();
      alert(error.error || "Failed to leave room");
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-black via-[#111111] to-gray-900 text-white">
      <HomeNavbar />

      <main className="max-w-7xl mx-auto px-6 md:px-12 py-20 space-y-20">
        {/* Header */}
        <header className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4 bg-white/5 text-sm text-gray-400 border border-white/10">
            <DoorClosed className="w-4 h-4" />
            Collaborative Coding Rooms
          </div>
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white to-gray-300 text-transparent bg-clip-text mb-4">
            Your Rooms
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Manage real-time collaborative coding spaces — easily and securely.
          </p>
        </header>

        {/* Create Room */}
        <section className="max-w-3xl mx-auto w-full">
          <div className="relative rounded-2xl bg-gradient-to-br from-white/5 to-white/10 border border-white/10 p-6 shadow-xl backdrop-blur-md">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <input
                type="text"
                placeholder="e.g. Design Sync, Project X"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                className="flex-1 w-full px-4 py-3 rounded-lg bg-black/60 text-white border border-white/10 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 transition"
              />
              <button
                onClick={handleCreate}
                className="px-6 py-3
                bg-gradient-to-r from-indigo-300 to-cyan-300
                text-black font-semibold rounded-lg
                hover:brightness-105 active:scale-95
                transition-all duration-150 cursor-pointer"
              >
                Create Room
              </button>
              <div className="relative inline-block">
                <button
                  onClick={() => setShowInviteModal(true)}
                  className="px-6 py-3
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
        <section className="max-w-5xl mx-auto space-y-14">
          {/* Owned Rooms */}
          {rooms.filter((r) => r.owned).length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-white/70" />
                <h2 className="text-xl font-semibold">Owned Rooms</h2>
              </div>

              <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {rooms
                  .filter((room) => room.owned)
                  .map((room) => (
                    <li
                      key={room.id}
                      tabIndex={0}
                      className="group relative rounded-2xl border border-white/10 bg-[#141414] hover:bg-white/5 hover:border-white/20 transition-all shadow hover:shadow-2xl backdrop-blur-md focus:outline-none"
                    >
                      <div className="relative z-10 p-5 flex flex-col gap-3 h-full">
                        {/* Top Row */}
                        <div className="flex items-baseline justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white/10 text-white/70 flex items-center justify-center font-bold text-lg">
                              {room.name[0].toUpperCase()}
                            </div>
                            <h3 className="text-lg font-semibold truncate w-20 group-hover:text-white/90 transition">
                              {room.slug}
                            </h3>
                          </div>
                          {room.owned ? (
                            <div
                              onClick={() => {
                                setSelectedRoomToDelete(room);
                                setShowDeleteConfirm(true);
                              }}
                              className="p-2 border border-white/10 rounded-md hover:text-red-400 transition-colors cursor-pointer"
                              title="Delete Room"
                            >
                              <Trash2 width={15} height={15} />
                            </div>
                          ) : (
                            <div
                              onClick={() => {
                                handleLeave(room.slug);
                              }}
                              className="p-2 border border-white/10 rounded-md hover:text-yellow-400 transition-colors cursor-pointer"
                              title="Leave Room"
                            >
                              <LogOut width={15} height={15} />
                            </div>
                          )}
                        </div>

                        {/* Metadata Row */}
                        <div className="text-xs text-gray-400 flex justify-between items-center pt-1">
                          <span className="uppercase tracking-wide">
                            Created
                          </span>
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
                          onClick={() => router.push(`/room/${room.slug}`)}
                          className="flex items-center justify-between pt-2 border-t border-white/10 text-sm font-semibold cursor-pointer text-gray-400 hover:text-white transition mt-auto"
                        >
                          <span>Enter Room</span>
                          <ArrowRightCircle className="w-4 h-4" />
                        </div>
                      </div>
                    </li>
                  ))}
              </ul>
            </div>
          )}

          {/* Joined Rooms */}
          {rooms.filter((r) => !r.owned).length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-white/70" />
                <h2 className="text-xl font-semibold">Joined Rooms</h2>
              </div>

              <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {rooms
                  .filter((room) => !room.owned)
                  .map((room) => (
                    <li
                      key={room.id}
                      tabIndex={0}
                      className="group relative rounded-2xl border border-white/10 bg-[#141414] hover:bg-white/5 hover:border-white/20 transition-all shadow hover:shadow-2xl backdrop-blur-md focus:outline-none"
                    >
                      <div className="relative z-10 p-5 flex flex-col gap-3 h-full">
                        {/* Top Row */}
                        <div className="flex items-baseline justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white/10 text-white/70 flex items-center justify-center font-bold text-lg">
                              {room.name[0].toUpperCase()}
                            </div>
                            <h3 className="text-lg font-semibold truncate w-20 group-hover:text-white/90 transition">
                              {room.slug}
                            </h3>
                          </div>
                          {room.owned ? (
                            <div
                              onClick={() => {
                                setSelectedRoomToDelete(room);
                                setShowDeleteConfirm(true);
                              }}
                              className="p-2 border border-white/10 rounded-md hover:text-red-400 transition-colors cursor-pointer"
                              title="Delete Room"
                            >
                              <Trash2 width={15} height={15} />
                            </div>
                          ) : (
                            <div
                              onClick={() => {
                                handleLeave(room.slug);
                              }}
                              className="p-2 border border-white/10 rounded-md hover:text-yellow-400 transition-colors cursor-pointer"
                              title="Leave Room"
                            >
                              <LogOut width={15} height={15} />
                            </div>
                          )}
                        </div>

                        {/* Metadata Row */}
                        <div className="text-xs text-gray-400 flex justify-between items-center pt-1">
                          <span className="uppercase tracking-wide">
                            Created
                          </span>
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
                          onClick={() => router.push(`/room/${room.slug}`)}
                          className="flex items-center justify-between pt-2 border-t border-white/10 text-sm font-semibold cursor-pointer text-gray-400 hover:text-white transition mt-auto"
                        >
                          <span>Enter Room</span>
                          <ArrowRightCircle className="w-4 h-4" />
                        </div>
                      </div>
                    </li>
                  ))}
              </ul>
            </div>
          )}

          {/* Empty State */}
          {rooms.length === 0 && (
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
          )}
        </section>

        {showInviteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
            <div className="relative w-full max-w-xl bg-[#1a1a1a] border border-white/10 rounded-2xl p-8 shadow-2xl text-white space-y-8">
              {/* Close Icon */}
              <button
                onClick={() => setShowInviteModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition cursor-pointer"
                aria-label="Close"
              >
                <X />
              </button>

              {/* Modal Header */}
              <div className="space-y-1">
                <h2 className="text-2xl font-bold tracking-tight">
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
                      className="appearance-none w-full px-4 py-3 rounded-lg bg-neutral-900 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 transition pr-10"
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
                    {/* Custom Arrow */}
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
                    className="w-full px-4 py-3 rounded-lg bg-neutral-900 text-white border border-white/10 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 transition"
                  />
                </div>

                {/* Send Invite Button */}
                <div className="flex justify-end">
                  <button
                    onClick={sendInvite}
                    className="w-full flex justify-around px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-indigo-500 text-sm font-semibold text-white rounded-md shadow hover:brightness-110 active:scale-95 transition-transform cursor-pointer"
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
                <h3 className="text-lg font-semibold">Pending Invites</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {pendingInvites.length === 0 ? (
                    <p className="text-sm text-gray-500 italic">
                      You have no pending invites.
                    </p>
                  ) : (
                    pendingInvites.map((invite) => (
                      <div
                        key={invite.id}
                        className="flex items-center justify-between gap-3 bg-neutral-800 border border-white/10 px-4 py-2 rounded-md"
                      >
                        <div className="text-sm text-white flex-1">
                          Invitation to join{" "}
                          <span className="font-semibold text-cyan-400">
                            {invite.room.name}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => respondToInvite(invite.id, "ACCEPT")}
                            className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-sm rounded-md text-white cursor-pointer"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => respondToInvite(invite.id, "REJECT")}
                            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-sm rounded-md text-white cursor-pointer"
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

        {/* Delete Modal */}
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
            handleDelete(selectedRoomToDelete!.slug);
            setShowDeleteConfirm(false);
            setSelectedRoomToDelete(null);
          }}
        />
      </main>
    </div>
  );
}
