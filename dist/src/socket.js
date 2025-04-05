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
exports.initializeSocket = initializeSocket;
const socket_io_1 = require("socket.io");
const prisma_1 = __importDefault(require("./app/utils/prisma"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("./app/config"));
function initializeSocket(server) {
    const io = new socket_io_1.Server(server, {
        cors: {
            origin: '*', // adjust this for production
            methods: ['GET', 'POST', 'PATCH', 'DELETE'],
        },
    });
    // Socket middleware for authentication
    io.use((socket, next) => __awaiter(this, void 0, void 0, function* () {
        try {
            const token = socket.handshake.auth.token;
            if (!token) {
                return next(new Error('Authentication error: Token not provided'));
            }
            const decoded = jsonwebtoken_1.default.verify(token, config_1.default.jwt_access_token_secret);
            const user = yield prisma_1.default.user.findUnique({
                where: { id: decoded.id },
            });
            if (!user) {
                return next(new Error('Authentication error: User not found'));
            }
            // Attach user data to socket
            socket.user_id = user.id;
            socket.user_email = user.email;
            // Update user's online status and socket_id
            yield prisma_1.default.user.update({
                where: { id: user.id },
                data: {
                    is_online: true,
                    socket_id: socket.id,
                    last_seen: new Date(),
                },
            });
            next();
        }
        catch (error) {
            console.error('Authentication error:', error);
            return next(new Error('Authentication error'));
        }
    }));
    io.on('connection', (socket) => __awaiter(this, void 0, void 0, function* () {
        console.log('Client connected:', socket.id);
        const user_id = socket.user_id;
        if (!user_id) {
            socket.disconnect();
            return;
        }
        // Broadcast to all users that this user is online
        socket.broadcast.emit('user:status', {
            user_id: user_id,
            is_online: true,
        });
        // Send message event
        socket.on('message:send', (data) => __awaiter(this, void 0, void 0, function* () {
            console.log('Received chat message:', data);
            try {
                // Verify sender
                if (data.sender_id !== user_id) {
                    socket.emit('error', {
                        message: 'Unauthorized: Cannot send message as another user',
                    });
                    return;
                }
                // Check if the user is in the room
                const isUserInRoom = yield prisma_1.default.threadUser.findFirst({
                    where: {
                        thread_id: data.thread_id,
                        user_id: user_id,
                    },
                });
                if (!isUserInRoom) {
                    socket.emit('error', {
                        message: 'Unauthorized: You are not a member of this room',
                    });
                    return;
                }
                // Save the message to the database
                const message = yield prisma_1.default.message.create({
                    data: {
                        content: data.content,
                        sender_id: data.sender_id,
                        thread_id: data.thread_id,
                        file_url: data.file_url,
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
                // Emit the saved message to all clients in that room
                io.to(data.thread_id).emit('message:received', message);
            }
            catch (error) {
                console.error('Error saving chat message:', error);
                socket.emit('error', { message: 'Failed to send message' });
            }
        }));
        // Handle disconnect
        socket.on('disconnect', () => __awaiter(this, void 0, void 0, function* () {
            console.log('Client disconnected:', socket.id);
            if (user_id) {
                // Update user's online status and last seen
                yield prisma_1.default.user.update({
                    where: { id: user_id },
                    data: {
                        is_online: false,
                        last_seen: new Date(),
                        socket_id: null,
                    },
                });
                // Broadcast to all users that this user is offline
                io.emit('user:status', {
                    user_id: user_id,
                    is_online: false,
                    last_seen: new Date(),
                });
            }
        }));
    }));
    return io;
}
