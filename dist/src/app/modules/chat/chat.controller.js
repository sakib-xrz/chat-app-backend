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
const CreateRoom = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.body.participants.includes(req.user.id)) {
        req.body.participants.unshift(req.user.id);
    }
    const room = yield chat_services_1.default.CreateRoom(req.body);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.CREATED,
        message: 'Room created successfully',
        data: room,
    });
}));
const GetRoomsByUserId = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const rooms = yield chat_services_1.default.GetRoomsByUserId(req.user.id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Rooms fetched successfully',
        data: rooms,
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
const GetMessagesByRoomId = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const messages = yield chat_services_1.default.GetMessagesByRoomId(req.params.room_id, req.user.id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Messages fetched successfully',
        data: messages,
    });
}));
const EditMessage = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const message = yield chat_services_1.default.EditMessage(Object.assign(Object.assign({}, req.body), { sender_id: req.user.id }));
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Message edited successfully',
        data: message,
    });
}));
const DeleteMessage = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield chat_services_1.default.DeleteMessage(Object.assign(Object.assign({}, req.body), { sender_id: req.user.id }));
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Message deleted successfully',
        data: result,
    });
}));
const MarkMessageAsRead = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield chat_services_1.default.MarkMessageAsRead(Object.assign(Object.assign({}, req.body), { user_id: req.user.id }));
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Message marked as read',
        data: result,
    });
}));
const AddUserToRoom = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield chat_services_1.default.AddUserToRoom(req.body, req.user.id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'User added to room successfully',
        data: result,
    });
}));
const RemoveUserFromRoom = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield chat_services_1.default.RemoveUserFromRoom(req.body, req.user.id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'User removed from room successfully',
        data: result,
    });
}));
const UpdateRoomAdmin = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield chat_services_1.default.UpdateRoomAdmin(req.body, req.user.id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'User role updated successfully',
        data: result,
    });
}));
const GetRoomDetails = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const room = yield chat_services_1.default.GetRoomDetails(req.params.room_id, req.user.id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Room details fetched successfully',
        data: room,
    });
}));
const ChatController = {
    CreateRoom,
    GetRoomsByUserId,
    SendMessage,
    GetMessagesByRoomId,
    EditMessage,
    DeleteMessage,
    MarkMessageAsRead,
    AddUserToRoom,
    RemoveUserFromRoom,
    UpdateRoomAdmin,
    GetRoomDetails,
};
exports.default = ChatController;
