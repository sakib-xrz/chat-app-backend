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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const prisma_1 = __importDefault(require("../../utils/prisma"));
const CreateThread = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.thread.create({
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
});
const GetThreadsByUserId = (user_id) => __awaiter(void 0, void 0, void 0, function* () {
    const threads = yield prisma_1.default.thread.findMany({
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
        var _a;
        const { participants, messages } = thread, rest = __rest(thread, ["participants", "messages"]);
        return Object.assign(Object.assign({}, rest), { participant: (_a = participants.find((p) => p.user_id !== user_id)) === null || _a === void 0 ? void 0 : _a.user, last_message: messages[0] || null });
    });
    return result;
});
const GetThreadDetails = (thread_id, user_id) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userInThread = yield prisma_1.default.threadUser.findFirst({
        where: {
            thread_id,
            user_id,
        },
    });
    if (!userInThread) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'You are not a participant of this thread');
    }
    const thread = yield prisma_1.default.thread.findUnique({
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
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Thread not found');
    }
    const { participants } = thread, rest = __rest(thread, ["participants"]);
    const participant = (_a = participants.find((p) => p.user_id !== user_id)) === null || _a === void 0 ? void 0 : _a.user;
    if (!participant) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Participant not found');
    }
    const threadDetails = Object.assign(Object.assign({}, rest), { participant });
    return threadDetails;
});
const SendMessage = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    // Check if user is in thread
    const userInThread = yield prisma_1.default.threadUser.findFirst({
        where: {
            thread_id: payload.thread_id,
            user_id: payload.sender_id,
        },
    });
    if (!userInThread) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'You are not a participant of this thread');
    }
    const message = yield prisma_1.default.message.create({
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
    yield prisma_1.default.thread.update({
        where: { id: payload.thread_id },
        data: { updated_at: new Date() },
    });
    return message;
});
const GetMessagesByThreadId = (thread_id, user_id) => __awaiter(void 0, void 0, void 0, function* () {
    const userInThread = yield prisma_1.default.threadUser.findFirst({
        where: {
            thread_id,
            user_id,
        },
    });
    if (!userInThread) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'You are not a participant of this thread');
    }
    const messages = yield prisma_1.default.message.findMany({
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
});
const ChatServices = {
    CreateThread,
    GetThreadsByUserId,
    GetThreadDetails,
    SendMessage,
    GetMessagesByThreadId,
};
exports.default = ChatServices;
