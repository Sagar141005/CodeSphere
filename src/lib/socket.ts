import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(process.env.BACKEND_URL, {
      path: "/api/socket",
    });
  }
  return socket;
};
