"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
const CreateRoomSchema = zod_1.z.object({
    name: zod_1.z.string().optional(),
    type: zod_1.z.enum(['ONE_TO_ONE', 'GROUP']),
    participants: zod_1.z
        .array(zod_1.z.string())
        .min(1, 'At least one participant is required'),
});
const SendMessageSchema = zod_1.z.object({
    content: zod_1.z.string().min(1, 'Message content is required'),
    senderId: zod_1.z.string(),
    roomId: zod_1.z.string(),
    type: zod_1.z.nativeEnum(client_1.MessageType).optional(),
    fileUrl: zod_1.z.string().optional(),
});
const EditMessageSchema = zod_1.z.object({
    messageId: zod_1.z.string(),
    content: zod_1.z.string().min(1, 'Message content is required'),
    senderId: zod_1.z.string(),
});
const DeleteMessageSchema = zod_1.z.object({
    messageId: zod_1.z.string(),
    senderId: zod_1.z.string(),
});
const MarkAsReadSchema = zod_1.z.object({
    messageId: zod_1.z.string(),
    userId: zod_1.z.string(),
});
const AddUserToRoomSchema = zod_1.z.object({
    roomId: zod_1.z.string(),
    userId: zod_1.z.string(),
    role: zod_1.z.nativeEnum(client_1.UserRole).optional(),
});
const RemoveUserFromRoomSchema = zod_1.z.object({
    roomId: zod_1.z.string(),
    userId: zod_1.z.string(),
});
const UpdateRoleSchema = zod_1.z.object({
    roomId: zod_1.z.string(),
    userId: zod_1.z.string(),
    role: zod_1.z.nativeEnum(client_1.UserRole),
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
exports.default = ChatValidation;
