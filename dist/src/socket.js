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
// socket.ts
const socket_io_1 = require("socket.io");
const prisma_1 = __importDefault(require("./app/utils/prisma"));
function initializeSocket(server) {
    const io = new socket_io_1.Server(server, {
        cors: {
            origin: '*', // adjust this for production
            methods: ['GET', 'POST'],
        },
    });
    io.on('connection', (socket) => {
        console.log('Client connected:', socket.id);
        // Client can join a specific chat room (one-to-one or group)
        socket.on('join room', (roomId) => {
            socket.join(roomId);
            console.log(`Socket ${socket.id} joined room ${roomId}`);
        });
        // Client can leave a room if needed
        socket.on('leave room', (roomId) => {
            socket.leave(roomId);
            console.log(`Socket ${socket.id} left room ${roomId}`);
        });
        // Chat message event with room id
        socket.on('chat message', (data) => __awaiter(this, void 0, void 0, function* () {
            console.log('Received chat message:', data);
            try {
                // Save the message to the database. Note that your Prisma client
                // now refers to the ChatMessage model (mapped to chat_messages table)
                const message = yield prisma_1.default.chatMessage.create({
                    data: {
                        content: data.content,
                        sender_id: data.senderId,
                        room_id: data.roomId,
                    },
                });
                // Emit the saved message to all clients in that room only
                io.to(data.roomId).emit('chat message', message);
            }
            catch (error) {
                console.error('Error saving chat message:', error);
            }
        }));
        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
        });
    });
    return io;
}
