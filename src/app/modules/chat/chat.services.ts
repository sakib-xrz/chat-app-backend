import prisma from '../../utils/prisma';
import { ICreateRoom, ISendMessage } from './chat.interface';

const CreateRoom = async (payload: ICreateRoom) => {
  const result = await prisma.chatRoom.create({
    data: {
      name: payload.name,
      type: payload.type,
      participants: {
        create: payload.participants.map((participant) => ({
          user_id: participant,
        })),
      },
    },
    include: {
      participants: true,
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
      participants: true,
    },
  });

  return result;
};

const SendMessage = async (payload: ISendMessage) => {
  const result = await prisma.chatMessage.create({
    data: {
      content: payload.content,
      sender_id: payload.sender_id,
      room_id: payload.room_id,
    },
  });

  return result;
};

const GetMessagesByRoomId = async (roomId: string) => {
  const result = await prisma.chatMessage.findMany({
    where: {
      room_id: roomId,
    },
    orderBy: { created_at: 'asc' },
  });

  return result;
};

const ChatServices = {
  CreateRoom,
  GetRoomsByUserId,
  SendMessage,
  GetMessagesByRoomId,
};

export default ChatServices;
