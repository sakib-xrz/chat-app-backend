import { MessageStatusType, MessageType, UserRole } from '@prisma/client';
import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import prisma from '../../utils/prisma';
import {
  IAddUserToRoom,
  ICreateRoom,
  IDeleteMessage,
  IEditMessage,
  IMarkMessageAsRead,
  IRemoveUserFromRoom,
  ISendMessage,
  IUpdateRoomAdmin,
} from './chat.interface';

const CreateRoom = async (payload: ICreateRoom) => {
  // Check if one-to-one chat already exists between these users
  if (payload.type === 'ONE_TO_ONE' && payload.participants.length === 2) {
    const existingRoom = await prisma.chatRoom.findFirst({
      where: {
        type: 'ONE_TO_ONE',
        participants: {
          every: {
            user_id: {
              in: payload.participants,
            },
          },
        },
        AND: [
          {
            participants: {
              some: {
                user_id: payload.participants[0],
              },
            },
          },
          {
            participants: {
              some: {
                user_id: payload.participants[1],
              },
            },
          },
        ],
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
                is_online: true,
                last_seen: true,
              },
            },
          },
        },
        messages: {
          take: 1,
          orderBy: { created_at: 'desc' },
        },
      },
    });

    if (existingRoom) {
      return existingRoom;
    }
  }

  // For group chats or if one-to-one chat doesn't exist yet
  const result = await prisma.chatRoom.create({
    data: {
      name: payload.name,
      type: payload.type,
      participants: {
        create: payload.participants.map((participant, index) => ({
          user_id: participant,
          // Make the first participant an admin for group chats
          role:
            payload.type === 'GROUP' && index === 0
              ? UserRole.ADMIN
              : UserRole.MEMBER,
        })),
      },
    },
    include: {
      participants: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              is_online: true,
              last_seen: true,
            },
          },
        },
      },
    },
  });

  return result;
};

const GetRoomsByUserId = async (userId: string) => {
  const result = await prisma.chatRoom.findMany({
    where: {
      participants: {
        some: {
          user_id: userId,
        },
      },
    },
    include: {
      participants: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              is_online: true,
              last_seen: true,
            },
          },
        },
      },
      messages: {
        take: 1,
        orderBy: { created_at: 'desc' },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
            },
          },
          read_by: {
            where: {
              user_id: userId,
            },
          },
        },
      },
    },
    orderBy: {
      updated_at: 'desc',
    },
  });

  return result;
};

const SendMessage = async (payload: ISendMessage) => {
  // Check if user is in room
  const userInRoom = await prisma.chatRoomUser.findFirst({
    where: {
      room_id: payload.room_id,
      user_id: payload.sender_id,
    },
  });

  if (!userInRoom) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'You are not a member of this chat room',
    );
  }

  // Create the message
  const message = await prisma.chatMessage.create({
    data: {
      content: payload.content,
      sender_id: payload.sender_id,
      room_id: payload.room_id,
      type: payload.type || MessageType.TEXT,
      file_url: payload.file_url,
    },
  });

  // Get room participants to create message status for each
  const roomParticipants = await prisma.chatRoomUser.findMany({
    where: { room_id: payload.room_id },
    select: { user_id: true },
  });

  // Create message status entries for all participants
  for (const participant of roomParticipants) {
    // Mark as READ for the sender, DELIVERED for others
    const status =
      participant.user_id === payload.sender_id
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

  // Update the room's updated_at timestamp
  await prisma.chatRoom.update({
    where: { id: payload.room_id },
    data: { updated_at: new Date() },
  });

  // Return the message with status and sender info
  const result = await prisma.chatMessage.findUnique({
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

  return result;
};

const GetMessagesByRoomId = async (roomId: string, userId: string) => {
  // Check if user is in room
  const userInRoom = await prisma.chatRoomUser.findFirst({
    where: {
      room_id: roomId,
      user_id: userId,
    },
  });

  if (!userInRoom) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'You are not a member of this chat room',
    );
  }

  const result = await prisma.chatMessage.findMany({
    where: {
      room_id: roomId,
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
    orderBy: { created_at: 'asc' },
  });

  // Mark all unread messages as read
  const messageIds = result
    .filter(
      (message) =>
        !message.read_by.some(
          (status) =>
            status.user_id === userId &&
            status.status === MessageStatusType.READ,
        ),
    )
    .map((message) => message.id);

  if (messageIds.length > 0) {
    for (const messageId of messageIds) {
      await prisma.messageStatus.upsert({
        where: {
          message_id_user_id: {
            message_id: messageId,
            user_id: userId,
          },
        },
        update: {
          status: MessageStatusType.READ,
          updated_at: new Date(),
        },
        create: {
          message_id: messageId,
          user_id: userId,
          status: MessageStatusType.READ,
        },
      });
    }
  }

  return result;
};

const EditMessage = async (payload: IEditMessage) => {
  // Find the message
  const message = await prisma.chatMessage.findUnique({
    where: { id: payload.message_id },
  });

  if (!message) {
    throw new AppError(httpStatus.NOT_FOUND, 'Message not found');
  }

  // Check if user is the sender
  if (message.sender_id !== payload.sender_id) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'You can only edit your own messages',
    );
  }

  // Update the message
  const result = await prisma.chatMessage.update({
    where: { id: payload.message_id },
    data: {
      content: payload.content,
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

  return result;
};

const DeleteMessage = async (payload: IDeleteMessage) => {
  // Find the message
  const message = await prisma.chatMessage.findUnique({
    where: { id: payload.message_id },
    include: {
      room: {
        include: {
          participants: {
            where: {
              user_id: payload.sender_id,
              role: UserRole.ADMIN,
            },
          },
        },
      },
    },
  });

  if (!message) {
    throw new AppError(httpStatus.NOT_FOUND, 'Message not found');
  }

  // Check if user is the sender or an admin
  const isAdmin = message.room.participants.length > 0;
  if (message.sender_id !== payload.sender_id && !isAdmin) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'You can only delete your own messages or as an admin',
    );
  }

  // Soft delete the message
  const result = await prisma.chatMessage.update({
    where: { id: payload.message_id },
    data: {
      content: 'This message has been deleted',
      deleted: true,
      updated_at: new Date(),
    },
    include: {
      sender: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return result;
};

const MarkMessageAsRead = async (payload: IMarkMessageAsRead) => {
  // Find the message
  const message = await prisma.chatMessage.findUnique({
    where: { id: payload.message_id },
  });

  if (!message) {
    throw new AppError(httpStatus.NOT_FOUND, 'Message not found');
  }

  // Check if user is in the room
  const userInRoom = await prisma.chatRoomUser.findFirst({
    where: {
      room_id: message.room_id,
      user_id: payload.user_id,
    },
  });

  if (!userInRoom) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'You are not a member of this chat room',
    );
  }

  // Update or create message status
  const result = await prisma.messageStatus.upsert({
    where: {
      message_id_user_id: {
        message_id: payload.message_id,
        user_id: payload.user_id,
      },
    },
    update: {
      status: MessageStatusType.READ,
      updated_at: new Date(),
    },
    create: {
      message_id: payload.message_id,
      user_id: payload.user_id,
      status: MessageStatusType.READ,
    },
    include: {
      message: true,
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

  return result;
};

const AddUserToRoom = async (
  payload: IAddUserToRoom,
  currentUserId: string,
) => {
  // Get the room
  const room = await prisma.chatRoom.findUnique({
    where: { id: payload.room_id },
  });

  if (!room) {
    throw new AppError(httpStatus.NOT_FOUND, 'Chat room not found');
  }

  // Check if room is a group
  if (room.type !== 'GROUP') {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Users can only be added to group chats',
    );
  }

  // Check if current user is an admin
  const currentUserInRoom = await prisma.chatRoomUser.findFirst({
    where: {
      room_id: payload.room_id,
      user_id: currentUserId,
      role: UserRole.ADMIN,
    },
  });

  if (!currentUserInRoom) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'Only admins can add users to groups',
    );
  }

  // Check if user is already in the room
  const userAlreadyInRoom = await prisma.chatRoomUser.findFirst({
    where: {
      room_id: payload.room_id,
      user_id: payload.user_id,
    },
  });

  if (userAlreadyInRoom) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'User is already a member of this group',
    );
  }

  // Add user to room
  const result = await prisma.chatRoomUser.create({
    data: {
      room_id: payload.room_id,
      user_id: payload.user_id,
      role: payload.role || UserRole.MEMBER,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          is_online: true,
          last_seen: true,
        },
      },
      room: true,
    },
  });

  return result;
};

const RemoveUserFromRoom = async (
  payload: IRemoveUserFromRoom,
  currentUserId: string,
) => {
  // Get the room
  const room = await prisma.chatRoom.findUnique({
    where: { id: payload.room_id },
  });

  if (!room) {
    throw new AppError(httpStatus.NOT_FOUND, 'Chat room not found');
  }

  // Check if room is a group
  if (room.type !== 'GROUP') {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Users can only be removed from group chats',
    );
  }

  // Check if the current user is an admin or is removing themselves
  const isSelfRemoval = currentUserId === payload.user_id;

  if (!isSelfRemoval) {
    const currentUserInRoom = await prisma.chatRoomUser.findFirst({
      where: {
        room_id: payload.room_id,
        user_id: currentUserId,
        role: UserRole.ADMIN,
      },
    });

    if (!currentUserInRoom) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        'Only admins can remove other users from groups',
      );
    }
  }

  // Check if user is in the room
  const userInRoom = await prisma.chatRoomUser.findFirst({
    where: {
      room_id: payload.room_id,
      user_id: payload.user_id,
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

  if (!userInRoom) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'User is not a member of this group',
    );
  }

  // Remove user from room
  await prisma.chatRoomUser.delete({
    where: {
      room_id_user_id: {
        room_id: payload.room_id,
        user_id: payload.user_id,
      },
    },
  });

  return {
    room_id: payload.room_id,
    user: userInRoom.user,
    removed_by: currentUserId,
  };
};

const UpdateRoomAdmin = async (
  payload: IUpdateRoomAdmin,
  currentUserId: string,
) => {
  // Get the room
  const room = await prisma.chatRoom.findUnique({
    where: { id: payload.room_id },
  });

  if (!room) {
    throw new AppError(httpStatus.NOT_FOUND, 'Chat room not found');
  }

  // Check if room is a group
  if (room.type !== 'GROUP') {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'User roles only apply to group chats',
    );
  }

  // Check if current user is an admin
  const currentUserInRoom = await prisma.chatRoomUser.findFirst({
    where: {
      room_id: payload.room_id,
      user_id: currentUserId,
      role: UserRole.ADMIN,
    },
  });

  if (!currentUserInRoom) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'Only admins can update user roles',
    );
  }

  // Check if target user is in the room
  const targetUserInRoom = await prisma.chatRoomUser.findFirst({
    where: {
      room_id: payload.room_id,
      user_id: payload.user_id,
    },
  });

  if (!targetUserInRoom) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'User is not a member of this group',
    );
  }

  // Update user role
  const result = await prisma.chatRoomUser.update({
    where: {
      room_id_user_id: {
        room_id: payload.room_id,
        user_id: payload.user_id,
      },
    },
    data: {
      role: payload.role,
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
      room: true,
    },
  });

  return result;
};

const GetRoomDetails = async (roomId: string, userId: string) => {
  // Check if user is in room
  const userInRoom = await prisma.chatRoomUser.findFirst({
    where: {
      room_id: roomId,
      user_id: userId,
    },
  });

  if (!userInRoom) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'You are not a member of this chat room',
    );
  }

  const result = await prisma.chatRoom.findUnique({
    where: { id: roomId },
    include: {
      participants: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              is_online: true,
              last_seen: true,
            },
          },
        },
      },
    },
  });

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Chat room not found');
  }

  return result;
};

const ChatServices = {
  CreateRoom,
  GetRoomsByUserId,
  SendMessage,
  GetMessagesByRoomId,
  EditMessage,
  DeleteMessage,
  MarkMessageAsRead,
  AddUserToRoom,
  RemoveUserFromRoom,
  UpdateRoomAdmin,
  GetRoomDetails,
};

export default ChatServices;
