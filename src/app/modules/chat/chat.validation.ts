import { z } from 'zod';

const CreateRoomSchema = z.object({
  name: z.string().optional(),
  type: z.enum(['one-to-one', 'group']),
  participants: z
    .array(z.string())
    .min(1, 'At least one participant is required'),
});

const SendMessageSchema = z.object({
  content: z.string().min(1, 'Message content is required'),
  senderId: z.string(),
  roomId: z.string(),
});

const ChatValidation = { CreateRoomSchema, SendMessageSchema };

export default ChatValidation;
