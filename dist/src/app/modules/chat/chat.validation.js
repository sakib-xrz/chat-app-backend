"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const zod_1 = require("zod");
const CreateRoomSchema = zod_1.z.object({
    name: zod_1.z.string().optional(),
    type: zod_1.z.enum(['one-to-one', 'group']),
    participants: zod_1.z
        .array(zod_1.z.string())
        .min(1, 'At least one participant is required'),
});
const SendMessageSchema = zod_1.z.object({
    content: zod_1.z.string().min(1, 'Message content is required'),
    senderId: zod_1.z.string(),
    roomId: zod_1.z.string(),
});
const ChatValidation = { CreateRoomSchema, SendMessageSchema };
exports.default = ChatValidation;
