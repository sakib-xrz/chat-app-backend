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

    // Client can join a specific chat room (one-to-one or group)
    socket.on('join room', (roomId: string) => {
      socket.join(roomId);
      console.log(`Socket ${socket.id} joined room ${roomId}`);
    });

    // Client can leave a room if needed
    socket.on('leave room', (roomId: string) => {
      socket.leave(roomId);
      console.log(`Socket ${socket.id} left room ${roomId}`);
    });

    // Chat message event with room id
    socket.on(
      'chat message',
      async (data: { content: string; senderId: string; roomId: string }) => {
        console.log('Received chat message:', data);
        try {
          // Save the message to the database. Note that your Prisma client
          // now refers to the ChatMessage model (mapped to chat_messages table)
          const message = await prisma.chatMessage.create({
            data: {
              content: data.content,
              sender_id: data.senderId,
              room_id: data.roomId,
            },
          });
          // Emit the saved message to all clients in that room only
          io.to(data.roomId).emit('chat message', message);
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
