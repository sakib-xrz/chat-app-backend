"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = __importDefault(require("../../utils/prisma"));
const CreateRoom = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.chatRoom.create({
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
});
const GetRoomsByUserId = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.chatRoom.findMany({
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
});
const SendMessage = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.chatMessage.create({
        data: {
            content: payload.content,
            sender_id: payload.sender_id,
            room_id: payload.room_id,
        },
    });
    return result;
});
const GetMessagesByRoomId = (roomId) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.chatMessage.findMany({
        where: {
            room_id: roomId,
        },
        orderBy: { created_at: 'asc' },
    });
    return result;
});
const ChatServices = {
    CreateRoom,
    GetRoomsByUserId,
    SendMessage,
    GetMessagesByRoomId,
};
exports.default = ChatServices;
