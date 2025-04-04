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
const auth_services_1 = __importDefault(require("./auth.services"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const Login = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield auth_services_1.default.Login(req.body);
    const { accessToken, refreshToken } = result;
    res.cookie('REFRESH_TOKEN', refreshToken, {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Login successful',
        data: {
            accessToken,
        },
    });
}));
const Register = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield auth_services_1.default.Register(req.body);
    const { accessToken, refreshToken } = result;
    res.cookie('REFRESH_TOKEN', refreshToken, {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.CREATED,
        message: 'User registered successfully',
        data: {
            accessToken,
        },
    });
}));
const ChangePassword = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield auth_services_1.default.ChangePassword(req.body, req.user);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Password changed successfully',
    });
}));
const GetProfile = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield auth_services_1.default.GetProfile(req.user);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Profile fetched successfully',
        data: result,
    });
}));
const SearchUsers = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const searchQuery = req.query.search;
    if (!searchQuery) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Search query is required');
    }
    const users = yield auth_services_1.default.SearchUsers(searchQuery);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Users retrieved successfully',
        data: users,
    });
}));
const AuthController = {
    Login,
    Register,
    ChangePassword,
    GetProfile,
    SearchUsers,
};
exports.default = AuthController;
