import { Server as NetServer } from 'http';
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

        io.on('connection', (socket) => {
            console.log("Client connected", socket.id);

            socket.on('join-room', (roomId) => {
                socket.join(roomId);
                console.log(`Socket ${socket.id} joined room ${roomId}`);
            });

            socket.on('code-change', ({ roomId, code }) => {
                socket.to(roomId).emit('code-update', code);
            });
        });

        (res.socket as any).server.io = io;
    }

    res.end();
}