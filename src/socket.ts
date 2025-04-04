import { Server, Socket } from 'socket.io';
import http from 'http';
import prisma from './app/utils/prisma';
import jwt from 'jsonwebtoken';
import config from './app/config';
import { MessageStatusType, MessageType, UserRole } from '@prisma/client';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userEmail?: string;
}

export function initializeSocket(server: http.Server): Server {
  const io = new Server(server, {
    cors: {
      origin: '*', // adjust this for production
      methods: ['GET', 'POST'],
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
      socket.userId = user.id;
      socket.userEmail = user.email;

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
    const user_id = socket.userId;

    if (!user_id) {
      socket.disconnect();
      return;
    }

    // Broadcast to all users that this user is online
    socket.broadcast.emit('user:status', {
      user_id: user_id,
      is_online: true,
    });

    // Join all rooms that the user is a part of
    const userRooms = await prisma.chatRoomUser.findMany({
      where: { user_id: user_id },
      select: { room_id: true },
    });

    userRooms.forEach((room) => {
      socket.join(room.room_id);
    });

    // Client can join a specific chat room
    socket.on('room:join', async (room_id: string) => {
      socket.join(room_id);
      console.log(`Socket ${socket.id} joined room ${room_id}`);
    });

    // Client can leave a room if needed
    socket.on('room:leave', (room_id: string) => {
      socket.leave(room_id);
      console.log(`Socket ${socket.id} left room ${room_id}`);
    });

    // Send message event
    socket.on(
      'message:send',
      async (data: {
        content: string;
        sender_id: string;
        room_id: string;
        type?: MessageType;
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
          const isUserInRoom = await prisma.chatRoomUser.findFirst({
            where: {
              room_id: data.room_id,
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
          const message = await prisma.chatMessage.create({
            data: {
              content: data.content,
              sender_id: data.sender_id,
              room_id: data.room_id,
              type: data.type || MessageType.TEXT,
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

          // Get room participants to create message status for each
          const roomParticipants = await prisma.chatRoomUser.findMany({
            where: { room_id: data.room_id },
            select: { user_id: true },
          });

          // Create message status entries for all participants
          for (const participant of roomParticipants) {
            // Mark as READ for the sender, DELIVERED for others
            const status =
              participant.user_id === user_id
                ? MessageStatusType.READ
                : MessageStatusType.DELIVERED;

            await prisma.messageStatus.create({
              data: {
                message_id: message.id,
                user_id: participant.user_id,
                status,
              },
            });
          }

          // Get message with status
          const messageWithStatus = await prisma.chatMessage.findUnique({
            where: { id: message.id },
            include: {
              sender: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  image: true,
                },
              },
              read_by: {
                include: {
                  user: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
            },
          });

          // Emit the saved message to all clients in that room
          io.to(data.room_id).emit('message:received', messageWithStatus);

          // Send notification to all users in the room except sender
          const roomUsers = await prisma.chatRoomUser.findMany({
            where: {
              room_id: data.room_id,
              user_id: { not: user_id },
            },
            include: {
              user: {
                select: {
                  id: true,
                  socket_id: true,
                  is_online: true,
                },
              },
            },
          });

          // Get room details for notification
          const room = await prisma.chatRoom.findUnique({
            where: { id: data.room_id },
            select: { name: true, type: true },
          });

          // Sender details for notification
          const sender = await prisma.user.findUnique({
            where: { id: user_id },
            select: { name: true },
          });

          // Build notification data
          const notification = {
            message_id: message.id,
            room_id: data.room_id,
            room_name: room?.name,
            room_type: room?.type,
            sender_id: user_id,
            sender_name: sender?.name,
            content: data.content,
            type: data.type || MessageType.TEXT,
            timestamp: new Date(),
          };

          // Send notification to each user
          for (const roomUser of roomUsers) {
            if (roomUser.user.socket_id && roomUser.user.is_online) {
              io.to(roomUser.user.socket_id).emit(
                'notification:new',
                notification,
              );
            }
          }
        } catch (error) {
          console.error('Error saving chat message:', error);
          socket.emit('error', { message: 'Failed to send message' });
        }
      },
    );

    // Edit message
    socket.on(
      'message:edit',
      async (data: {
        messageId: string;
        content: string;
        senderId: string;
      }) => {
        try {
          // Verify sender
          if (data.senderId !== user_id) {
            socket.emit('error', {
              message: "Unauthorized: Cannot edit another user's message",
            });
            return;
          }

          // Find the message
          const message = await prisma.chatMessage.findUnique({
            where: { id: data.messageId },
          });

          if (!message) {
            socket.emit('error', { message: 'Message not found' });
            return;
          }

          // Check if user is the sender
          if (message.sender_id !== user_id) {
            socket.emit('error', {
              message: 'Unauthorized: You can only edit your own messages',
            });
            return;
          }

          // Update the message
          const updatedMessage = await prisma.chatMessage.update({
            where: { id: data.messageId },
            data: {
              content: data.content,
              edited: true,
              updated_at: new Date(),
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
              read_by: {
                include: {
                  user: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
            },
          });

          // Notify all users in the room about the edit
          io.to(message.room_id).emit('message:edited', updatedMessage);
        } catch (error) {
          console.error('Error editing message:', error);
          socket.emit('error', { message: 'Failed to edit message' });
        }
      },
    );

    // Delete message
    socket.on(
      'message:delete',
      async (data: { message_id: string; sender_id: string }) => {
        try {
          // Verify sender
          if (data.sender_id !== user_id) {
            socket.emit('error', {
              message: "Unauthorized: Cannot delete another user's message",
            });
            return;
          }

          // Find the message
          const message = await prisma.chatMessage.findUnique({
            where: { id: data.message_id },
            include: {
              room: {
                include: {
                  participants: {
                    where: {
                      user_id: user_id,
                      role: UserRole.ADMIN,
                    },
                  },
                },
              },
            },
          });

          if (!message) {
            socket.emit('error', { message: 'Message not found' });
            return;
          }

          // Check if user is the sender or an admin
          const isAdmin = message.room.participants.length > 0;
          if (message.sender_id !== user_id && !isAdmin) {
            socket.emit('error', {
              message:
                'Unauthorized: You can only delete your own messages or as an admin',
            });
            return;
          }

          // Soft delete the message
          const deletedMessage = await prisma.chatMessage.update({
            where: { id: data.message_id },
            data: {
              content: 'This message has been deleted',
              deleted: true,
              updated_at: new Date(),
            },
          });

          // Notify all users in the room about the deletion
          io.to(message.room_id).emit('message:deleted', {
            id: deletedMessage.id,
            room_id: deletedMessage.room_id,
          });
        } catch (error) {
          console.error('Error deleting message:', error);
          socket.emit('error', { message: 'Failed to delete message' });
        }
      },
    );

    // Mark message as read
    socket.on(
      'message:read',
      async (data: { message_id: string; user_id: string }) => {
        try {
          // Verify user
          if (data.user_id !== user_id) {
            socket.emit('error', {
              message:
                'Unauthorized: Cannot mark messages as read for another user',
            });
            return;
          }

          // Find the message
          const message = await prisma.chatMessage.findUnique({
            where: { id: data.message_id },
          });

          if (!message) {
            socket.emit('error', { message: 'Message not found' });
            return;
          }

          // Update or create message status
          const messageStatus = await prisma.messageStatus.upsert({
            where: {
              message_id_user_id: {
                message_id: data.message_id,
                user_id: data.user_id,
              },
            },
            update: {
              status: MessageStatusType.READ,
              updated_at: new Date(),
            },
            create: {
              message_id: data.message_id,
              user_id: data.user_id,
              status: MessageStatusType.READ,
            },
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          });

          // Notify everyone in the room about the read status
          io.to(message.room_id).emit('message:read', {
            message_id: data.message_id,
            user_id: data.user_id,
            status: MessageStatusType.READ,
            user: messageStatus.user,
          });
        } catch (error) {
          console.error('Error marking message as read:', error);
          socket.emit('error', { message: 'Failed to mark message as read' });
        }
      },
    );

    // Typing indicator
    socket.on(
      'typing:start',
      async (data: { room_id: string; user_id: string }) => {
        try {
          // Verify user
          if (data.user_id !== user_id) {
            socket.emit('error', {
              message:
                'Unauthorized: Cannot set typing status for another user',
            });
            return;
          }

          // Update typing status
          await prisma.typingStatus.upsert({
            where: {
              room_id_user_id: {
                room_id: data.room_id,
                user_id: data.user_id,
              },
            },
            update: {
              is_typing: true,
              updated_at: new Date(),
            },
            create: {
              room_id: data.room_id,
              user_id: data.user_id,
              is_typing: true,
            },
          });

          // Get user info for the typing indicator
          const user = await prisma.user.findUnique({
            where: { id: data.user_id },
            select: {
              id: true,
              name: true,
              image: true,
            },
          });

          // Broadcast to room that user is typing
          socket.to(data.room_id).emit('typing:update', {
            room_id: data.room_id,
            user,
            is_typing: true,
          });
        } catch (error) {
          console.error('Error setting typing status:', error);
        }
      },
    );

    // Typing stopped
    socket.on(
      'typing:stop',
      async (data: { room_id: string; user_id: string }) => {
        try {
          // Verify user
          if (data.user_id !== user_id) {
            socket.emit('error', {
              message:
                'Unauthorized: Cannot set typing status for another user',
            });
            return;
          }

          // Update typing status
          await prisma.typingStatus.upsert({
            where: {
              room_id_user_id: {
                room_id: data.room_id,
                user_id: data.user_id,
              },
            },
            update: {
              is_typing: false,
              updated_at: new Date(),
            },
            create: {
              room_id: data.room_id,
              user_id: data.user_id,
              is_typing: false,
            },
          });

          // Get user info for the typing indicator
          const user = await prisma.user.findUnique({
            where: { id: data.user_id },
            select: {
              id: true,
              name: true,
              image: true,
            },
          });

          // Broadcast to room that user stopped typing
          socket.to(data.room_id).emit('typing:update', {
            room_id: data.room_id,
            user,
            is_typing: false,
          });
        } catch (error) {
          console.error('Error setting typing status:', error);
        }
      },
    );

    // Add user to group
    socket.on(
      'group:addUser',
      async (data: {
        room_id: string;
        user_id: string;
        target_user_id: string;
        role?: UserRole;
      }) => {
        try {
          // Verify user is admin
          const userInRoom = await prisma.chatRoomUser.findFirst({
            where: {
              room_id: data.room_id,
              user_id: user_id,
              role: UserRole.ADMIN,
            },
          });

          if (!userInRoom) {
            socket.emit('error', {
              message: 'Unauthorized: Only admins can add users to groups',
            });
            return;
          }

          // Check if room is a group
          const room = await prisma.chatRoom.findUnique({
            where: { id: data.room_id },
          });

          if (!room || room.type !== 'GROUP') {
            socket.emit('error', {
              message: 'This operation is only allowed for group chats',
            });
            return;
          }

          // Add user to group
          const newRoomUser = await prisma.chatRoomUser.create({
            data: {
              room_id: data.room_id,
              user_id: data.target_user_id,
              role: data.role || UserRole.MEMBER,
            },
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  image: true,
                  socket_id: true,
                  is_online: true,
                },
              },
            },
          });

          // Notify all room members about the new user
          io.to(data.room_id).emit('group:userAdded', {
            room_id: data.room_id,
            added_by: user_id,
            user: newRoomUser.user,
            role: newRoomUser.role,
          });

          // If the user is online, add them to the room's socket channel
          if (newRoomUser.user.socket_id && newRoomUser.user.is_online) {
            const userSocket = io.sockets.sockets.get(
              newRoomUser.user.socket_id,
            );
            if (userSocket) {
              userSocket.join(data.room_id);
            }
          }
        } catch (error) {
          console.error('Error adding user to group:', error);
          socket.emit('error', { message: 'Failed to add user to group' });
        }
      },
    );

    // Remove user from group
    socket.on(
      'group:removeUser',
      async (data: {
        room_id: string;
        user_id: string;
        target_user_id: string;
      }) => {
        try {
          // Check if the current user is an admin or is removing themselves
          const isAdmin = await prisma.chatRoomUser.findFirst({
            where: {
              room_id: data.room_id,
              user_id: user_id,
              role: UserRole.ADMIN,
            },
          });

          const isSelfRemoval = user_id === data.target_user_id;

          if (!isAdmin && !isSelfRemoval) {
            socket.emit('error', {
              message: 'Unauthorized: Only admins can remove users from groups',
            });
            return;
          }

          // Check if room is a group
          const room = await prisma.chatRoom.findUnique({
            where: { id: data.room_id },
          });

          if (!room || room.type !== 'GROUP') {
            socket.emit('error', {
              message: 'This operation is only allowed for group chats',
            });
            return;
          }

          // Get user info before removing
          const targetUser = await prisma.user.findUnique({
            where: { id: data.target_user_id },
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              socket_id: true,
            },
          });

          // Remove user from group
          await prisma.chatRoomUser.deleteMany({
            where: {
              room_id: data.room_id,
              user_id: data.target_user_id,
            },
          });

          // Notify all room members about the removal
          io.to(data.room_id).emit('group:userRemoved', {
            room_id: data.room_id,
            removed_by: user_id,
            user: targetUser,
          });

          // Remove the user from the room's socket channel
          if (targetUser?.socket_id) {
            const userSocket = io.sockets.sockets.get(targetUser.socket_id);
            if (userSocket) {
              userSocket.leave(data.room_id);
            }
          }
        } catch (error) {
          console.error('Error removing user from group:', error);
          socket.emit('error', { message: 'Failed to remove user from group' });
        }
      },
    );

    // Update user role in group
    socket.on(
      'group:updateRole',
      async (data: {
        room_id: string;
        user_id: string;
        target_user_id: string;
        role: UserRole;
      }) => {
        try {
          // Verify user is admin
          const userInRoom = await prisma.chatRoomUser.findFirst({
            where: {
              room_id: data.room_id,
              user_id: user_id,
              role: UserRole.ADMIN,
            },
          });

          if (!userInRoom) {
            socket.emit('error', {
              message: 'Unauthorized: Only admins can update user roles',
            });
            return;
          }

          // Check if room is a group
          const room = await prisma.chatRoom.findUnique({
            where: { id: data.room_id },
          });

          if (!room || room.type !== 'GROUP') {
            socket.emit('error', {
              message: 'This operation is only allowed for group chats',
            });
            return;
          }

          // Update user role
          const updatedRoomUser = await prisma.chatRoomUser.update({
            where: {
              room_id_user_id: {
                room_id: data.room_id,
                user_id: data.target_user_id,
              },
            },
            data: {
              role: data.role,
            },
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  image: true,
                },
              },
            },
          });

          // Notify all room members about the role update
          io.to(data.room_id).emit('group:roleUpdated', {
            room_id: data.room_id,
            updated_by: user_id,
            user: updatedRoomUser.user,
            role: updatedRoomUser.role,
          });
        } catch (error) {
          console.error('Error updating user role:', error);
          socket.emit('error', { message: 'Failed to update user role' });
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

        // Clear typing indicators
        await prisma.typingStatus.updateMany({
          where: { user_id: user_id },
          data: { is_typing: false },
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
