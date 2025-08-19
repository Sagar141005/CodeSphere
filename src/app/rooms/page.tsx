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
  X,
} from "lucide-react";
import HomeNavbar from "@/components/HomeNavbar";

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

  const router = useRouter();

  useEffect(() => {
    fetch("/api/rooms", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setRooms(data);
        else setRooms([]);
      })
      .catch(() => setRooms([]));
  }, []);

  useEffect(() => {
    async function load() {
      const roomRes = await fetch("/api/rooms");
      const roomsData = await roomRes.json();
      setRooms(Array.isArray(roomsData) ? roomsData : []);

      const inviteRes = await fetch("/api/invite");
      const inviteData = await inviteRes.json();
      setPendingInvites(Array.isArray(inviteData) ? inviteData : []);
    }
    load();
  }, []);

  useEffect(() => {
    if (!showInviteModal) return;

    fetch("/api/invite", { credentials: "include" })
      .then((res) => res.json())
      .then((data: Invite[]) => setPendingInvites(data))
      .catch(() => setPendingInvites([]));
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

      const invitesRes = await fetch("/api/invite", {
        credentials: "include",
      });
      const invitesData = await invitesRes.json();
      setPendingInvites(invitesData);
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

      setPendingInvites((prev) => prev.filter((i) => i.id !== inviteId));
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
                text-black font-medium rounded-lg shadow-md
                hover:brightness-110
                transition duration-200
                flex items-center justify-center gap-2
                cursor-pointer"
              >
                Create Room
              </button>
              <button
                onClick={() => setShowInviteModal(true)}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg shadow transition duration-200"
              >
                Manage Invitations
              </button>
            </div>
          </div>
        </section>

        {/* Room List */}
        <section className="max-w-5xl mx-auto space-y-8">
          <div className="flex items-center gap-2">
            <DoorClosed className="w-5 h-5 text-white/70" />
            <h2 className="text-xl font-semibold">Existing Rooms</h2>
          </div>

          {rooms.length === 0 ? (
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
              {rooms.map((room) => (
                <li
                  key={room.id}
                  tabIndex={0}
                  className="group relative rounded-2xl border border-white/10 bg-[#141414] hover:bg-white/5 hover:border-white/20 transition-all shadow hover:shadow-2xl backdrop-blur-md focus:outline-none"
                >
                  <div className="relative z-10 p-5 space-y-3">
                    {/* Top Row */}
                    <div className="flex items-baseline justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/10 text-white/70 flex items-center justify-center font-mono font-bold text-lg">
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
                    <div className="text-xs text-gray-400 font-mono flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-4">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white/70">
                          {room.owned ? "Owner" : "Joined"}
                        </span>
                      </div>
                      <div className="text-gray-500">
                        Created:{" "}
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
                    </div>

                    {/* CTA */}
                    <div
                      onClick={() => router.push(`/room/${room.slug}`)}
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
        {showDeleteConfirm && selectedRoomToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md px-4">
            <div className="relative max-w-md w-full bg-[#161616] border border-red-600 rounded-2xl p-6 shadow-xl text-white space-y-6">
              <div className="relative z-10 space-y-4 text-center">
                <h2 className="text-xl font-semibold">
                  Are you sure you want to delete this room?
                </h2>
                <p className="text-gray-400 text-sm">
                  <strong>{selectedRoomToDelete.name}</strong> will be
                  permanently removed. This action cannot be undone.
                </p>
              </div>
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setSelectedRoomToDelete(null);
                  }}
                  className="px-5 py-3 text-sm text-gray-300 rounded-lg hover:bg-neutral-700 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleDelete(selectedRoomToDelete.slug);
                    setShowDeleteConfirm(false);
                    setSelectedRoomToDelete(null);
                  }}
                  className="px-5 py-3 text-sm text-white font-semibold rounded-lg bg-red-600 hover:bg-red-700 transition"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
