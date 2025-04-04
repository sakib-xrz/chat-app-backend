"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthRoutes = void 0;
const express_1 = __importDefault(require("express"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const auth_validation_1 = __importDefault(require("./auth.validation"));
const auth_controller_1 = __importDefault(require("./auth.controller"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const router = express_1.default.Router();
router.post('/login', (0, validateRequest_1.default)(auth_validation_1.default.LoginSchema), auth_controller_1.default.Login);
router.post('/register', (0, validateRequest_1.default)(auth_validation_1.default.RegisterSchema), auth_controller_1.default.Register);
router.patch('/change-password', (0, auth_1.default)(), (0, validateRequest_1.default)(auth_validation_1.default.ChangePasswordSchema), auth_controller_1.default.ChangePassword);
exports.AuthRoutes = router;
