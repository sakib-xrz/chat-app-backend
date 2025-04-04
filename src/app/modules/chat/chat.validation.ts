import { z } from 'zod';
import { MessageType, UserRole } from '@prisma/client';

const CreateRoomSchema = z.object({
  name: z.string().optional(),
  type: z.enum(['ONE_TO_ONE', 'GROUP']),
  participants: z
    .array(z.string())
    .min(1, 'At least one participant is required'),
});

const SendMessageSchema = z.object({
  content: z.string().min(1, 'Message content is required'),
  senderId: z.string(),
  roomId: z.string(),
  type: z.nativeEnum(MessageType).optional(),
  fileUrl: z.string().optional(),
});

const EditMessageSchema = z.object({
  messageId: z.string(),
  content: z.string().min(1, 'Message content is required'),
  senderId: z.string(),
});

const DeleteMessageSchema = z.object({
  messageId: z.string(),
  senderId: z.string(),
});

const MarkAsReadSchema = z.object({
  messageId: z.string(),
  userId: z.string(),
});

const AddUserToRoomSchema = z.object({
  roomId: z.string(),
  userId: z.string(),
  role: z.nativeEnum(UserRole).optional(),
});

const RemoveUserFromRoomSchema = z.object({
  roomId: z.string(),
  userId: z.string(),
});

const UpdateRoleSchema = z.object({
  roomId: z.string(),
  userId: z.string(),
  role: z.nativeEnum(UserRole),
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
