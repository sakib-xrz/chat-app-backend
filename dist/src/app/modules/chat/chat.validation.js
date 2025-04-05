"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const zod_1 = require("zod");
const CreateThreadSchema = zod_1.z.object({
    body: zod_1.z.object({
        participants: zod_1.z
            .array(zod_1.z.string())
            .min(1, 'At least one participant is required'),
    }),
});
const SendMessageSchema = zod_1.z.object({
    body: zod_1.z.object({
        content: zod_1.z.string().min(1, 'Message content is required'),
        sender_id: zod_1.z.string(),
        thread_id: zod_1.z.string(),
        fileUrl: zod_1.z.string().optional(),
    }),
});
const ChatValidation = {
    CreateThreadSchema,
    SendMessageSchema,
};
exports.default = ChatValidation;
