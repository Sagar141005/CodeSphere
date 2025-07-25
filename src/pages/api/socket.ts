import { Server as SocketIOServer } from 'socket.io'
import type { NextApiRequest, NextApiResponse } from 'next';

export const config = {
    api: { bodyParser: false }
}

export default function SocketHandler(req: NextApiRequest, res: NextApiResponse) {
    if (!(res.socket as any).server.io) {
        console.log("Starting Socket.IO server...");
        const io = new SocketIOServer((res.socket as any).server, {
            path: '/api/socket'
        });

        // roomUsers = { roomId: Map<userId, {id, name, image, sockets: Set<string>}> }
        const roomUsers: Record<string, Map<string, { id: string, name: string, image?: string, sockets: Set<string> }>> = {};

        io.on('connection', (socket) => {
            console.log("Client connected", socket.id);

            socket.on('join-room', ({ roomId, user }) => {
                socket.join(roomId);

                if (!roomUsers[roomId]) {
                    roomUsers[roomId] = new Map();
                }

                const existingUser = roomUsers[roomId].get(user.id);
                if (existingUser) {
                    existingUser.sockets.add(socket.id);
                } else {
                    roomUsers[roomId].set(user.id, { ...user, sockets: new Set([socket.id]) });
                }

                io.to(roomId).emit('presence-update', Array.from(roomUsers[roomId].values()));
            });

            socket.on('leave-room', ({ roomId, userId }) => {
                socket.leave(roomId);

                const room = roomUsers[roomId];
                if (room && room.has(userId)) {
                    const user = room.get(userId)!;
                    user.sockets.delete(socket.id);
                    if (user.sockets.size === 0) {
                        room.delete(userId);
                    }
                    io.to(roomId).emit('presence-update', Array.from(room.values()));
                }
            });

            socket.on('disconnect', () => {
                console.log(`Socket ${socket.id} disconnected`);

                // Cleanup socket from all rooms
                for (const roomId in roomUsers) {
                    const room = roomUsers[roomId];
                    let changed = false;

                    for (const [userId, user] of room) {
                        if (user.sockets.has(socket.id)) {
                            user.sockets.delete(socket.id);
                            if (user.sockets.size === 0) {
                                room.delete(userId);
                            }
                            changed = true;
                        }
                    }

                    if (changed) {
                        io.to(roomId).emit('presence-update', Array.from(room.values()));
                    }
                }
            });

            // Broadcast file/code events
            socket.on('code-change', ({ roomId, fileId, code }) => {
                socket.to(roomId).emit('code-update', { fileId, code });
            });

            socket.on('file-add', ({ roomId, file }) => {
                io.to(roomId).emit('file-added', file);
            });

            socket.on('file-delete', ({ roomId, fileId }) => {
                io.to(roomId).emit('file-deleted', fileId);
            });

            socket.on('file-rename', ({ roomId, fileId, newName }) => {
                io.to(roomId).emit('file-renamed', { fileId, newName });
            });

            socket.on('terminal-output', ({ roomId, output }) => {
                io.to(roomId).emit('terminal-update', output);
            });
        });

        (res.socket as any).server.io = io;
    }

    res.end();
}
