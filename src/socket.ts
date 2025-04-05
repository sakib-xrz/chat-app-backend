import { Server, Socket } from 'socket.io';
import http from 'http';
import prisma from './app/utils/prisma';
import jwt from 'jsonwebtoken';
import config from './app/config';

interface AuthenticatedSocket extends Socket {
  user_id?: string;
  user_email?: string;
}

export function initializeSocket(server: http.Server): Server {
  const io = new Server(server, {
    cors: {
      origin: '*', // adjust this for production
      methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    },
  });

  // Socket middleware for authentication
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error('Authentication error: Token not provided'));
      }

      const decoded = jwt.verify(
        token,
        config.jwt_access_token_secret as string,
      ) as { id: string; email: string };

      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
      });

      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      // Attach user data to socket
      socket.user_id = user.id;
      socket.user_email = user.email;

      // Update user's online status and socket_id
      await prisma.user.update({
        where: { id: user.id },
        data: {
          is_online: true,
          socket_id: socket.id,
          last_seen: new Date(),
        },
      });

      next();
    } catch (error) {
      console.error('Authentication error:', error);
      return next(new Error('Authentication error'));
    }
  });

  io.on('connection', async (socket: AuthenticatedSocket) => {
    console.log('Client connected:', socket.id);
    const user_id = socket.user_id;

    if (!user_id) {
      socket.disconnect();
      return;
    }

    // Broadcast to all users that this user is online
    socket.broadcast.emit('user:status', {
      user_id: user_id,
      is_online: true,
    });

    // Send message event
    socket.on(
      'message:send',
      async (data: {
        content: string;
        sender_id: string;
        thread_id: string;
        file_url?: string;
      }) => {
        console.log('Received chat message:', data);
        try {
          // Verify sender
          if (data.sender_id !== user_id) {
            socket.emit('error', {
              message: 'Unauthorized: Cannot send message as another user',
            });
            return;
          }

          // Check if the user is in the room
          const isUserInRoom = await prisma.threadUser.findFirst({
            where: {
              thread_id: data.thread_id,
              user_id: user_id,
            },
          });

          if (!isUserInRoom) {
            socket.emit('error', {
              message: 'Unauthorized: You are not a member of this room',
            });
            return;
          }

          // Save the message to the database
          const message = await prisma.message.create({
            data: {
              content: data.content,
              sender_id: data.sender_id,
              thread_id: data.thread_id,
              file_url: data.file_url,
            },
            include: {
              sender: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  image: true,
                },
              },
            },
          });

          // Emit the saved message to all clients in that room
          io.to(data.thread_id).emit('message:received', message);
        } catch (error) {
          console.error('Error saving chat message:', error);
          socket.emit('error', { message: 'Failed to send message' });
        }
      },
    );

    // Handle disconnect
    socket.on('disconnect', async () => {
      console.log('Client disconnected:', socket.id);

      if (user_id) {
        // Update user's online status and last seen
        await prisma.user.update({
          where: { id: user_id },
          data: {
            is_online: false,
            last_seen: new Date(),
            socket_id: null,
          },
        });

        // Broadcast to all users that this user is offline
        io.emit('user:status', {
          user_id: user_id,
          is_online: false,
          last_seen: new Date(),
        });
      }
    });
  });

  return io;
}
