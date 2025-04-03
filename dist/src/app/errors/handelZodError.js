"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_status_1 = __importDefault(require("http-status"));
const handelZodError = (err) => {
    const errorSources = err.issues.map((issue) => {
        return {
            message: issue.message,
            path: issue === null || issue === void 0 ? void 0 : issue.path[issue.path.length - 1],
        };
    });
    return {
        statusCode: http_status_1.default.BAD_REQUEST,
        message: 'Validation Error!',
        errorSources,
    };
};
exports.default = handelZodError;
