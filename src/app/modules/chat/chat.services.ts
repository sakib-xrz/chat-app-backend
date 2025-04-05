import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import prisma from '../../utils/prisma';
import { ICreateThread, ISendMessage } from './chat.interface';

const CreateThread = async (payload: ICreateThread) => {
  const result = await prisma.thread.create({
    data: {
      participants: {
        create: payload.participants.map((user_id) => ({
          user_id,
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

const GetThreadsByUserId = async (user_id: string) => {
  const threads = await prisma.thread.findMany({
    where: {
      participants: {
        some: {
          user_id,
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
        },
      },
    },
    orderBy: {
      updated_at: 'desc',
    },
  });

  const result = threads.map((thread) => {
    const { participants, messages, ...rest } = thread;
    return {
      ...rest,
      participant: participants.find((p) => p.user_id !== user_id)?.user,
      last_message: messages[0] || null,
    };
  });

  return result;
};

const GetThreadDetails = async (thread_id: string, user_id: string) => {
  const userInThread = await prisma.threadUser.findFirst({
    where: {
      thread_id,
      user_id,
    },
  });

  if (!userInThread) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'You are not a participant of this thread',
    );
  }

  const thread = await prisma.thread.findUnique({
    where: { id: thread_id },
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

  if (!thread) {
    throw new AppError(httpStatus.NOT_FOUND, 'Thread not found');
  }

  const { participants, ...rest } = thread;
  const participant = participants.find((p) => p.user_id !== user_id)?.user;

  if (!participant) {
    throw new AppError(httpStatus.NOT_FOUND, 'Participant not found');
  }

  const threadDetails = {
    ...rest,
    participant,
  };

  return threadDetails;
};

const SendMessage = async (payload: ISendMessage) => {
  // Check if user is in thread
  const userInThread = await prisma.threadUser.findFirst({
    where: {
      thread_id: payload.thread_id,
      user_id: payload.sender_id,
    },
  });

  if (!userInThread) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'You are not a participant of this thread',
    );
  }

  const message = await prisma.message.create({
    data: {
      content: payload.content,
      sender_id: payload.sender_id,
      thread_id: payload.thread_id,
      file_url: payload.file_url,
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

  await prisma.thread.update({
    where: { id: payload.thread_id },
    data: { updated_at: new Date() },
  });

  return message;
};

const GetMessagesByThreadId = async (thread_id: string, user_id: string) => {
  const userInThread = await prisma.threadUser.findFirst({
    where: {
      thread_id,
      user_id,
    },
  });

  if (!userInThread) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'You are not a participant of this thread',
    );
  }

  const messages = await prisma.message.findMany({
    where: { thread_id },
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
    orderBy: { created_at: 'asc' },
  });

  return messages;
};

const ChatServices = {
  CreateThread,
  GetThreadsByUserId,
  GetThreadDetails,
  SendMessage,
  GetMessagesByThreadId,
};

export default ChatServices;
