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
        socket.on('chat message', (data) => __awaiter(this, void 0, void 0, function* () {
            console.log('Received chat message:', data);
            try {
                const message = yield prisma_1.default.chat.create({
                    data: {
                        content: data.content,
                        sender_id: data.senderId,
                    },
                });
                // Broadcast the saved message to all connected clients
                io.emit('chat message', message);
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
