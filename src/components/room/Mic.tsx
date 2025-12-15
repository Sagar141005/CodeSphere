"use client";

import { Mic, MicOff } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "motion/react";

type RemoteAudio = {
  peerId: string;
  stream: MediaStream;
};

const RemoteAudioPlayer = ({ stream }: { stream: MediaStream }) => {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.srcObject = stream;
      audioRef.current.play().catch(() => {});
    }
  }, [stream]);

  return (
    <audio
      ref={audioRef}
      autoPlay
      controls={false}
      style={{ display: "none" }}
    />
  );
};

const VoiceChatButton = ({
  roomId,
  userId,
}: {
  roomId: string;
  userId: string;
}) => {
  const { data: session, status } = useSession();
  const [isMuted, setIsMuted] = useState(true);
  const [remoteAudios, setRemoteAudios] = useState<RemoteAudio[]>([]);
  const socketRef = useRef<Socket | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peersRef = useRef<Record<string, RTCPeerConnection>>({});

  useEffect(() => {
    if (status !== "authenticated" || !session?.user) return;

    socketRef.current = io(process.env.NEXT_PUBLIC_BACKEND_URL, {
      path: "/api/socket",
    });

    socketRef.current.on("connect", () => {
      socketRef.current?.emit("join-room", {
        roomId,
        user: {
          id: session.user.id || session.user.email!,
          name: session.user.name || "Anonymous",
          image: session.user.image || null,
        },
      });
    });

    socketRef.current.on("user-joined", ({ socketId }) => {
      if (socketId === socketRef.current?.id) return;

      const pc = createPeerConnection(socketId);
      peersRef.current[socketId] = pc;

      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => {
          pc.addTrack(track, localStreamRef.current!);
        });
      }
    });

    socketRef.current.on("voice-offer", async ({ from, offer }) => {
      const pc = createPeerConnection(from);
      peersRef.current[from] = pc;

      try {
        await pc.setRemoteDescription(new RTCSessionDescription(offer));

        if (localStreamRef.current) {
          localStreamRef.current.getTracks().forEach((track) => {
            pc.addTrack(track, localStreamRef.current!);
          });
        }

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        socketRef.current?.emit("voice-answer", {
          roomId,
          to: from,
          answer,
        });
      } catch (err) {
        console.error("Error handling voice offer:", err);
      }
    });

    socketRef.current.on("voice-answer", async ({ from, answer }) => {
      const pc = peersRef.current[from];
      if (pc) {
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(answer));
        } catch (err) {
          console.error("Error setting remote description for answer:", err);
        }
      }
    });

    socketRef.current.on("voice-candidate", async ({ from, candidate }) => {
      const pc = peersRef.current[from];
      if (pc && candidate) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          console.warn("Error adding ICE candidate:", err);
        }
      }
    });

    socketRef.current.on("disconnect", cleanupAllPeers);

    socketRef.current.on(
      "mic-status-update",
      ({ userId: updatedUserId, status }) => {
        if (updatedUserId === userId) {
          setIsMuted(status === "muted");
        }
      }
    );

    return () => {
      cleanupAllPeers();
      socketRef.current?.emit("mic-status", {
        roomId,
        userId,
        status: "muted",
      });
      socketRef.current?.removeAllListeners();

      socketRef.current?.disconnect();
    };
  }, [roomId]);

  const cleanupAllPeers = () => {
    setRemoteAudios([]);

    for (const peerId in peersRef.current) {
      const pc = peersRef.current[peerId];
      pc.getSenders().forEach((sender) => {
        if (sender.track) sender.track.stop();
      });
      pc.close();
      delete peersRef.current[peerId];
    }

    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    localStreamRef.current = null;
    setIsMuted(true);
  };

  const createPeerConnection = (peerId: string): RTCPeerConnection => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current?.emit("voice-candidate", {
          roomId,
          to: peerId,
          candidate: event.candidate,
        });
      }
    };

    pc.onconnectionstatechange = () => {
      if (
        pc.connectionState === "disconnected" ||
        pc.connectionState === "failed" ||
        pc.connectionState === "closed"
      ) {
        removePeer(peerId);
      }
    };

    pc.ontrack = (event) => {
      const [stream] = event.streams;
      if (!stream) return;

      setRemoteAudios((prev) => {
        if (prev.find((r) => r.peerId === peerId)) return prev;
        return [...prev, { peerId, stream }];
      });
    };

    pc.onnegotiationneeded = async () => {
      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        socketRef.current?.emit("voice-offer", {
          roomId,
          to: peerId,
          offer,
        });
      } catch (err) {
        console.error(`Negotiation error with ${peerId}:`, err);
      }
    };

    return pc;
  };

  const removePeer = (peerId: string) => {
    const pc = peersRef.current[peerId];
    if (pc) {
      pc.getSenders().forEach((sender) => {
        if (sender.track) sender.track.stop();
      });
      pc.close();
      delete peersRef.current[peerId];
    }

    setRemoteAudios((prev) => prev.filter((r) => r.peerId !== peerId));
  };

  const toggleMic = async () => {
    if (isMuted) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        localStreamRef.current = stream;

        for (const peerId in peersRef.current) {
          const pc = peersRef.current[peerId];
          stream.getTracks().forEach((track) => {
            pc.addTrack(track, stream);
          });
        }

        socketRef.current?.emit("mic-status", {
          roomId,
          userId,
          status: "unmuted",
        });

        setIsMuted(false);
      } catch (err) {
        console.error("Mic access denied:", err);
      }
    } else {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
        localStreamRef.current = null;
      }

      for (const peerId in peersRef.current) {
        const pc = peersRef.current[peerId];
        pc.getSenders().forEach((sender) => {
          if (sender.track?.kind === "audio") {
            pc.removeTrack(sender);
          }
        });
      }

      socketRef.current?.emit("mic-status", {
        roomId,
        userId,
        status: "muted",
      });

      setIsMuted(true);
    }
  };

  return (
    <>
      <motion.button
        onClick={toggleMic}
        whileTap={{ scale: 0.95 }}
        title={isMuted ? "Unmute Mic" : "Mute Mic"}
        className={`
          relative flex items-center justify-center w-9 h-9 rounded-lg border transition-all duration-300
          ${
            isMuted
              ? "bg-neutral-900 border-neutral-800 text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800"
              : "bg-emerald-500/10 border-emerald-500/20 text-emerald-500 shadow-[0_0_10px_-4px_rgba(16,185,129,0.5)]"
          }
        `}
      >
        <AnimatePresence mode="wait" initial={false}>
          {isMuted ? (
            <motion.div
              key="muted"
              initial={{ scale: 0.5, opacity: 0, rotate: -20 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0.5, opacity: 0, rotate: 20 }}
              transition={{ duration: 0.15 }}
            >
              <MicOff className="w-4 h-4" />
            </motion.div>
          ) : (
            <motion.div
              key="unmuted"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="relative"
            >
              <Mic className="w-4 h-4" />
              <span className="absolute -inset-3 rounded-full border border-emerald-500/30 opacity-0 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {remoteAudios.map(({ peerId, stream }) => (
        <RemoteAudioPlayer key={peerId} stream={stream} />
      ))}
    </>
  );
};

export default VoiceChatButton;
