import { z } from 'zod';

const CreateThreadSchema = z.object({
  body: z.object({
    participants: z
      .array(z.string())
      .min(1, 'At least one participant is required'),
  }),
});

const SendMessageSchema = z.object({
  body: z.object({
    content: z.string().min(1, 'Message content is required'),
    sender_id: z.string(),
    thread_id: z.string(),
    fileUrl: z.string().optional(),
  }),
});

const ChatValidation = {
  CreateThreadSchema,
  SendMessageSchema,
};

export default ChatValidation;
