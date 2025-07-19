import { Server as SocketIOServer } from 'socket.io'
import type { NextApiRequest, NextApiResponse } from 'next';

export const config = {
    api: { bodyParser: false }
}

export default function SocketHandler(req: NextApiRequest, res: NextApiResponse) {
    if(!(res.socket as any).server.io) {
        console.log("Starting Socket.IO server...");
        const io = new SocketIOServer((res.socket as any).server, {
            path: '/api/socket'
        });

        const roomUsers: Record<string, { id: string, name: string, image?: string }[]> = {};

        io.on('connection', (socket) => {
            console.log("Client connected", socket.id);

            socket.on('join-room', ({ roomId, user}) => {
                socket.join(roomId);

                if(!roomUsers[roomId]) roomUsers[roomId] = [];
                roomUsers[roomId].push({ id: socket.id, ...user });
                
                io.to(roomId).emit('presence-update', roomUsers[roomId]);
            });

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

            socket.on('leave-room', ({ roomId }) => {
                socket.leave(roomId);
                if(roomUsers[roomId]) {
                    roomUsers[roomId] = roomUsers[roomId].filter((u) => u.id !== socket.id);
                    io.to(roomId).emit('presence-update', roomUsers[roomId]);
                }
            });

            socket.on('disconnect', () => {
                console.log(`Socket ${socket.id} disconnected`);
                for(const roomId in roomUsers) {
                    const before = roomUsers[roomId].length;
                    roomUsers[roomId] = roomUsers[roomId].filter((u) => u.id !== socket.id);

                    if(before !== roomUsers[roomId].length) {
                        io.to(roomId).emit('presence-update', roomUsers[roomId])
                    }
                }
            });
        });

        (res.socket as any).server.io = io;
    }

    res.end();
}