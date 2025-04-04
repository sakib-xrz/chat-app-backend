// socket.ts
import { Server } from 'socket.io';
import http from 'http';
import prisma from './app/utils/prisma';

export function initializeSocket(server: http.Server): Server {
  const io = new Server(server, {
    cors: {
      origin: '*', // adjust this for production
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on(
      'chat message',
      async (data: { content: string; senderId: string }) => {
        console.log('Received chat message:', data);
        try {
          const message = await prisma.chat.create({
            data: {
              content: data.content,
              sender_id: data.senderId,
            },
          });
          // Broadcast the saved message to all connected clients
          io.emit('chat message', message);
        } catch (error) {
          console.error('Error saving chat message:', error);
        }
      },
    );

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
}
