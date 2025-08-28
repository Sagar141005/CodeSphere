import { Mic, MicOff } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useSession } from "next-auth/react";

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

    socketRef.current = io({ path: "/api/socket" });

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
      <button
        onClick={toggleMic}
        title={isMuted ? "Unmute Mic" : "Mute Mic"}
        className={`flex items-center gap-2 p-2 rounded-full text-sm font-medium
        border border-white/10 transition-colors duration-200 cursor-pointer
        ${
          isMuted
            ? "text-gray-400 hover:text-white hover:bg-white/5"
            : "text-green-400 bg-white/5 hover:bg-white/10"
        }`}
      >
        {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
      </button>

      {remoteAudios.map(({ peerId, stream }) => (
        <RemoteAudioPlayer key={peerId} stream={stream} />
      ))}
    </>
  );
};

export default VoiceChatButton;
