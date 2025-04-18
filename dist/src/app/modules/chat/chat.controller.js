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
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const chat_services_1 = __importDefault(require("./chat.services"));
const CreateThread = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.body.participants.includes(req.user.id)) {
        req.body.participants.unshift(req.user.id);
    }
    const room = yield chat_services_1.default.CreateThread(req.body);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.CREATED,
        message: 'Room created successfully',
        data: room,
    });
}));
const GetThreadsByUserId = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const rooms = yield chat_services_1.default.GetThreadsByUserId(req.user.id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Rooms fetched successfully',
        data: rooms,
    });
}));
const GetThreadDetails = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const room = yield chat_services_1.default.GetThreadDetails(req.params.thread_id, req.user.id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Room details fetched successfully',
        data: room,
    });
}));
const SendMessage = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const message = yield chat_services_1.default.SendMessage(Object.assign(Object.assign({}, req.body), { sender_id: req.user.id }));
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.CREATED,
        message: 'Message sent successfully',
        data: message,
    });
}));
const GetMessagesByThreadId = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const messages = yield chat_services_1.default.GetMessagesByThreadId(req.params.thread_id, req.user.id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Messages fetched successfully',
        data: messages,
    });
}));
const ChatController = {
    CreateThread,
    GetThreadsByUserId,
    GetThreadDetails,
    SendMessage,
    GetMessagesByThreadId,
};
exports.default = ChatController;
