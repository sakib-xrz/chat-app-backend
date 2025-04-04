import { z } from 'zod';
import { MessageType, UserRole } from '@prisma/client';

const CreateRoomSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    type: z.enum(['ONE_TO_ONE', 'GROUP']),
    participants: z
      .array(z.string())
      .min(1, 'At least one participant is required'),
  }),
});

const SendMessageSchema = z.object({
  body: z.object({
    content: z.string().min(1, 'Message content is required'),
    sender_id: z.string(),
    room_id: z.string(),
    type: z.nativeEnum(MessageType).optional(),
    fileUrl: z.string().optional(),
  }),
});

const EditMessageSchema = z.object({
  body: z.object({
    message_id: z.string(),
    content: z.string().min(1, 'Message content is required'),
    sender_id: z.string(),
  }),
});

const DeleteMessageSchema = z.object({
  body: z.object({
    message_id: z.string(),
    sender_id: z.string(),
  }),
});

const MarkAsReadSchema = z.object({
  body: z.object({
    message_id: z.string(),
    user_id: z.string(),
  }),
});

const AddUserToRoomSchema = z.object({
  body: z.object({
    room_id: z.string(),
    user_id: z.string(),
  }),
});

const RemoveUserFromRoomSchema = z.object({
  body: z.object({
    room_id: z.string(),
    user_id: z.string(),
  }),
});

const UpdateRoleSchema = z.object({
  body: z.object({
    room_id: z.string(),
    user_id: z.string(),
    role: z.nativeEnum(UserRole),
  }),
});

const ChatValidation = {
  CreateRoomSchema,
  SendMessageSchema,
  EditMessageSchema,
  DeleteMessageSchema,
  MarkAsReadSchema,
  AddUserToRoomSchema,
  RemoveUserFromRoomSchema,
  UpdateRoleSchema,
};

export default ChatValidation;
