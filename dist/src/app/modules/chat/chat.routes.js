"use strict";
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
const router = express_1.default.Router();
router.post('/rooms', (0, auth_1.default)(), (0, validateRequest_1.default)(chat_validation_1.default.CreateRoomSchema), chat_controller_1.default.CreateRoom);
router.get('/rooms', (0, auth_1.default)(), chat_controller_1.default.GetRoomsByUserId);
router.post('/messages', (0, auth_1.default)(), (0, validateRequest_1.default)(chat_validation_1.default.SendMessageSchema), chat_controller_1.default.SendMessage);
router.get('/rooms/:roomId/messages', (0, auth_1.default)(), chat_controller_1.default.GetMessagesByRoomId);
exports.ChatRoutes = router;
