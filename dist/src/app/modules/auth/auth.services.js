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
const AppError_1 = __importDefault(require("../../errors/AppError"));
const prisma_1 = __importDefault(require("../../utils/prisma"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const auth_utils_1 = __importDefault(require("./auth.utils"));
const config_1 = __importDefault(require("../../config"));
const client_1 = require("@prisma/client");
const Login = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield prisma_1.default.user.findFirst({
        where: { email: payload.email },
    });
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'No user found with this email');
    }
    const isPasswordMatched = yield yield bcrypt_1.default.compare(payload.password, user.password);
    if (!isPasswordMatched) {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, 'Invalid password');
    }
    const jwtPayload = {
        id: user.id,
        email: user.email,
    };
    const accessToken = auth_utils_1.default.CreateToken(jwtPayload, config_1.default.jwt_access_token_secret, config_1.default.jwt_access_token_expires_in);
    const refreshToken = auth_utils_1.default.CreateToken(jwtPayload, config_1.default.jwt_refresh_token_secret, config_1.default.jwt_refresh_token_expires_in);
    return { accessToken, refreshToken };
});
const Register = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const isUserExists = yield prisma_1.default.user.findFirst({
        where: { email: payload.email },
    });
    if (isUserExists) {
        throw new AppError_1.default(http_status_1.default.CONFLICT, 'User already exists');
    }
    const hashedPassword = yield bcrypt_1.default.hash(payload.password, Number(config_1.default.bcrypt_salt_rounds));
    const user = yield prisma_1.default.user.create({
        data: {
            email: payload.email,
            password: hashedPassword,
            name: payload.name,
            gender: payload.gender,
            phone: payload.phone,
            image: payload.gender === client_1.Gender.MALE
                ? 'https://avatar.iran.liara.run/public/boy'
                : 'https://avatar.iran.liara.run/public/girl',
        },
    });
    const jwtPayload = {
        id: user.id,
        email: user.email,
    };
    const accessToken = auth_utils_1.default.CreateToken(jwtPayload, config_1.default.jwt_access_token_secret, config_1.default.jwt_access_token_expires_in);
    const refreshToken = auth_utils_1.default.CreateToken(jwtPayload, config_1.default.jwt_refresh_token_secret, config_1.default.jwt_refresh_token_expires_in);
    return { accessToken, refreshToken };
});
const ChangePassword = (payload, user) => __awaiter(void 0, void 0, void 0, function* () {
    const isUserValid = yield prisma_1.default.user.findFirst({
        where: { id: user.id },
    });
    if (!isUserValid) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'No user found');
    }
    const isPasswordMatched = yield bcrypt_1.default.compare(payload.oldPassword, isUserValid.password);
    if (!isPasswordMatched) {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, 'Invalid password');
    }
    const hashedPassword = yield bcrypt_1.default.hash(payload.newPassword, Number(config_1.default.bcrypt_salt_rounds));
    yield prisma_1.default.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
    });
});
const AuthService = { Login, Register, ChangePassword };
exports.default = AuthService;
