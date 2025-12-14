"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import useSWR, { mutate } from "swr";
import {
  DoorClosed,
  Loader2,
  Plus,
  Mail,
  X,
  Check,
  Ban,
  Shield,
  Search,
} from "lucide-react";
import HomeNavbar from "@/components/home/HomeNavbar";
import { useSession } from "next-auth/react";
import ConfirmModal from "@/components/ConfirmModal";
import { RoomList } from "@/components/room/RoomList";
import { Room } from "@/types/Room";
import toast from "react-hot-toast";
import { Loader } from "@/components/Loader";
import { motion, AnimatePresence } from "framer-motion";
import Footer from "@/components/Footer";

interface Invite {
  id: string;
  status: "PENDING" | string;
  room: Room;
  invitedBy: { id: string; name: string | null };
}

const fetcher = (url: string) =>
  fetch(url, { credentials: "include" }).then((res) => {
    if (!res.ok) throw new Error("Failed to fetch");
    return res.json();
  });

export default function RoomsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [roomName, setRoomName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedRoomToDelete, setSelectedRoomToDelete] = useState<Room | null>(
    null
  );
  const [roomToLeave, setRoomToLeave] = useState<Room | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [selectedRoomSlug, setSelectedRoomSlug] = useState("");

  const {
    data: rooms = [],
    isLoading: roomsLoading,
    error: roomsError,
  } = useSWR<Room[]>(status === "authenticated" ? "/api/rooms" : null, fetcher);

  const {
    data: pendingInvites = [],
    isLoading: invitesLoading,
    error: invitesError,
  } = useSWR<Invite[]>(
    status === "authenticated" ? "/api/invite" : null,
    fetcher
  );

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

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
        setRoomName("");
        toast.success("Room created successfully");
        mutate("/api/rooms");
      } else {
        const error = await res.json();
        toast.error(error.error || "Failed to create room");
      }
    } catch (err) {
      console.error("Room creation failed:", err);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (slug: string) => {
    try {
      const res = await fetch(`/api/room/${slug}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Room deleted");
        mutate("/api/rooms");
      } else {
        const error = await res.json();
        toast.error(error.error || "Failed to delete room");
      }
    } catch (err) {
      toast.error("Something went wrong");
    }
  };

  const handleLeave = async (slug: string) => {
    try {
      const res = await fetch(`/api/room/${slug}`, { method: "POST" });
      if (res.ok) {
        toast.success("Left room");
        mutate("/api/rooms");
      } else {
        const error = await res.json();
        toast.error(error.error || "Failed to leave room");
      }
    } catch (err) {
      toast.error("Something went wrong");
    }
  };

  const sendInvite = async () => {
    if (!selectedRoomSlug) return toast.error("Select a room");
    if (!inviteEmail.trim()) return toast.error("Enter an email");

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

      toast.success("Invite sent");
      setInviteEmail("");
      setSelectedRoomSlug("");
      mutate("/api/invite");
    } catch (error: any) {
      toast.error(error.message);
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
      mutate("/api/rooms");
      mutate("/api/invite");
      toast.success(action === "ACCEPT" ? "Joined room" : "Invite rejected");
    } catch (err) {
      toast.error("Failed to respond");
    }
  };

  if (status === "loading" || roomsLoading || invitesLoading) return <Loader />;
  if (roomsError)
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-neutral-500">
        Failed to load rooms.
      </div>
    );

  const ownedRooms = rooms.filter((r) => r.owned);
  const joinedRooms = rooms.filter((r) => !r.owned);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-50">
      <HomeNavbar />

      <main className="max-w-6xl mx-auto px-6 lg:px-8 py-20">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 border-b border-neutral-800 pb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-neutral-900 border border-neutral-800">
                <DoorClosed className="w-5 h-5 text-neutral-400" />
              </div>
              <span className="font-mono text-xs font-medium text-neutral-500 uppercase tracking-widest">
                Workspace
              </span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-neutral-50">
              Rooms
            </h1>
            <p className="mt-2 text-neutral-400 max-w-md">
              Your real-time coding environments. Create a new sandbox or jump
              back into a project.
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
            {pendingInvites.length > 0 && (
              <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-blue-600 text-[10px] font-bold text-white">
                {pendingInvites.length}
              </span>
            )}
          </button>
        </header>

        <div className="mb-12">
          <div className="flex flex-col sm:flex-row gap-4 max-w-2xl">
            <div className="relative flex-grow group">
              <input
                type="text"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder="New room name..."
                className="w-full h-12 bg-neutral-900 border border-neutral-800 rounded-lg px-4 text-sm text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-neutral-600 focus:ring-1 focus:ring-neutral-600 transition-all"
                spellCheck={false}
              />
            </div>

            <button
              onClick={handleCreate}
              disabled={loading || !roomName.trim()}
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

        <div className="space-y-12">
          {rooms.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-neutral-800 rounded-xl bg-neutral-900/20">
              <div className="w-12 h-12 rounded-full bg-neutral-900 flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-neutral-600" />
              </div>
              <p className="text-neutral-400 font-medium">No rooms found</p>
              <p className="text-neutral-600 text-sm mt-1">
                Create one above to get started.
              </p>
            </div>
          )}

          {ownedRooms.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-6">
                Your Rooms
              </h2>

              <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <RoomList
                  rooms={ownedRooms}
                  onDelete={(room) => {
                    setSelectedRoomToDelete(room);
                    setShowDeleteConfirm(true);
                  }}
                />
              </ul>
            </section>
          )}

          {joinedRooms.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-6">
                Shared with you
              </h2>

              <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <RoomList
                  rooms={joinedRooms}
                  onLeave={(slug) => {
                    const room = rooms.find((r) => r.slug === slug);
                    if (room) setRoomToLeave(room);
                  }}
                />
              </ul>
            </section>
          )}
        </div>

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
                    Invitations
                  </h3>
                  <button
                    onClick={() => setShowInviteModal(false)}
                    className="text-neutral-500 hover:text-neutral-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-6 max-h-[70vh] overflow-y-auto space-y-8">
                  <div className="space-y-4">
                    <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                      Invite to Room
                    </label>
                    <div className="space-y-3">
                      <div className="relative">
                        <select
                          value={selectedRoomSlug}
                          onChange={(e) => setSelectedRoomSlug(e.target.value)}
                          className="w-full appearance-none bg-neutral-950 border border-neutral-800 text-neutral-300 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-neutral-600"
                        >
                          <option value="" disabled>
                            Select Room
                          </option>
                          {ownedRooms.map((room) => (
                            <option key={room.id} value={room.slug}>
                              {room.name}
                            </option>
                          ))}
                        </select>
                        <div className="absolute right-3 top-3 pointer-events-none text-neutral-600">
                          <Search className="w-4 h-4" />
                        </div>
                      </div>
                      <input
                        type="email"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        placeholder="collaborator@email.com"
                        className="w-full bg-neutral-950 border border-neutral-800 text-neutral-300 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-neutral-600"
                      />
                      <button
                        onClick={sendInvite}
                        className="w-full py-2 bg-neutral-50 hover:bg-white text-neutral-950 text-sm font-bold rounded-lg transition-colors"
                      >
                        Send Invite
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider block mb-3">
                      Pending Requests
                    </label>
                    {pendingInvites.length === 0 ? (
                      <div className="text-center py-4 bg-neutral-950 border border-neutral-800 rounded-lg">
                        <p className="text-neutral-600 text-sm">
                          No pending invitations
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {pendingInvites.map((invite) => (
                          <div
                            key={invite.id}
                            className="p-3 rounded-lg bg-neutral-950 border border-neutral-800"
                          >
                            <div className="mb-3">
                              <span className="text-xs font-mono text-neutral-500 block mb-1">
                                FROM: {invite.invitedBy.name || "Unknown"}
                              </span>
                              <h4 className="font-bold text-neutral-200 text-sm">
                                {invite.room.name}
                              </h4>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <button
                                onClick={() =>
                                  respondToInvite(invite.id, "ACCEPT")
                                }
                                className="flex items-center justify-center gap-2 py-2 rounded bg-neutral-50 hover:bg-white text-neutral-950 text-xs font-bold transition-colors"
                              >
                                <Check className="w-3 h-3" /> Accept
                              </button>
                              <button
                                onClick={() =>
                                  respondToInvite(invite.id, "REJECT")
                                }
                                className="flex items-center justify-center gap-2 py-2 rounded bg-neutral-800 hover:bg-red-900/30 text-neutral-300 hover:text-red-400 text-xs font-bold transition-colors"
                              >
                                <Ban className="w-3 h-3" /> Reject
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

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
            handleDelete(selectedRoomToDelete!.slug);
            setShowDeleteConfirm(false);
            setSelectedRoomToDelete(null);
          }}
        />

        <ConfirmModal
          isOpen={!!roomToLeave}
          title="Leave Room?"
          message={`Are you sure you want to leave "${roomToLeave?.name}"?`}
          confirmLabel="Leave"
          cancelLabel="Cancel"
          onCancel={() => setRoomToLeave(null)}
          onConfirm={() => {
            if (roomToLeave) handleLeave(roomToLeave.slug);
            setRoomToLeave(null);
          }}
        />
      </main>
      <Footer />
    </div>
  );
}
