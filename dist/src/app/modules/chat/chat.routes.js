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
exports.ChatRoutes = void 0;
const express_1 = __importDefault(require("express"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const chat_validation_1 = __importDefault(require("./chat.validation"));
const chat_controller_1 = __importDefault(require("./chat.controller"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const handelFile_1 = require("../../utils/handelFile");
const router = express_1.default.Router();
// Room routes
router.post('/rooms', (0, auth_1.default)(), (0, validateRequest_1.default)(chat_validation_1.default.CreateRoomSchema), chat_controller_1.default.CreateRoom);
router.get('/rooms', (0, auth_1.default)(), chat_controller_1.default.GetRoomsByUserId);
router.get('/rooms/:room_id', (0, auth_1.default)(), chat_controller_1.default.GetRoomDetails);
// Message routes
router.post('/messages', (0, auth_1.default)(), (0, validateRequest_1.default)(chat_validation_1.default.SendMessageSchema), chat_controller_1.default.SendMessage);
router.get('/rooms/:room_id/messages', (0, auth_1.default)(), chat_controller_1.default.GetMessagesByRoomId);
router.patch('/messages', (0, auth_1.default)(), (0, validateRequest_1.default)(chat_validation_1.default.EditMessageSchema), chat_controller_1.default.EditMessage);
router.delete('/messages', (0, auth_1.default)(), (0, validateRequest_1.default)(chat_validation_1.default.DeleteMessageSchema), chat_controller_1.default.DeleteMessage);
router.post('/messages/read', (0, auth_1.default)(), (0, validateRequest_1.default)(chat_validation_1.default.MarkAsReadSchema), chat_controller_1.default.MarkMessageAsRead);
// File upload route with Cloudinary integration
router.post('/messages/file', (0, auth_1.default)(), handelFile_1.upload.single('file'), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (req.file) {
            // Upload file to Cloudinary
            const cloudinaryResult = (yield (0, handelFile_1.uploadToCloudinary)(req.file, {
                folder: 'chat_files',
            }));
            // Add file URL to the request body
            req.body.fileUrl = cloudinaryResult.secure_url;
            req.body.type = req.file.mimetype.startsWith('image/')
                ? 'IMAGE'
                : 'FILE';
        }
        next();
    }
    catch (error) {
        next(error);
    }
}), (0, validateRequest_1.default)(chat_validation_1.default.SendMessageSchema), chat_controller_1.default.SendMessage);
// Group management routes
router.post('/rooms/users', (0, auth_1.default)(), (0, validateRequest_1.default)(chat_validation_1.default.AddUserToRoomSchema), chat_controller_1.default.AddUserToRoom);
router.delete('/rooms/users', (0, auth_1.default)(), (0, validateRequest_1.default)(chat_validation_1.default.RemoveUserFromRoomSchema), chat_controller_1.default.RemoveUserFromRoom);
router.patch('/rooms/users/role', (0, auth_1.default)(), (0, validateRequest_1.default)(chat_validation_1.default.UpdateRoleSchema), chat_controller_1.default.UpdateRoomAdmin);
exports.ChatRoutes = router;
