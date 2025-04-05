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
router.post('/thread', (0, auth_1.default)(), (0, validateRequest_1.default)(chat_validation_1.default.CreateThreadSchema), chat_controller_1.default.CreateThread);
router.get('/threads', (0, auth_1.default)(), chat_controller_1.default.GetThreadsByUserId);
router.get('/thread/:thread_id', (0, auth_1.default)(), chat_controller_1.default.GetThreadDetails);
// Message routes
router.post('/messages', (0, auth_1.default)(), (0, validateRequest_1.default)(chat_validation_1.default.SendMessageSchema), chat_controller_1.default.SendMessage);
router.get('/rooms/:thread_id/messages', (0, auth_1.default)(), chat_controller_1.default.GetMessagesByThreadId);
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
exports.ChatRoutes = router;
