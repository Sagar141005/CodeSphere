import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;
const NEXT_PUBLIC_BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "https://my-socket-server-5tzd.onrender.com";

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(NEXT_PUBLIC_BACKEND_URL, {
      path: "/api/socket",
    });
  }
  return socket;
};
