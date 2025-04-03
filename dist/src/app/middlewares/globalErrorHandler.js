"use strict";
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_status_1 = __importDefault(require("http-status"));
const zod_1 = require("zod");
const handelZodError_1 = __importDefault(require("../errors/handelZodError"));
const AppError_1 = __importDefault(require("../errors/AppError"));
const globalErrorHandler = (err, _req, res, next) => {
    var _a, _b;
    let statusCode = err.statusCode || http_status_1.default.INTERNAL_SERVER_ERROR;
    let message = err.message || 'Something went wrong!';
    let errorSources = [
        {
            message: err.message || 'Something went wrong!',
            path: (err === null || err === void 0 ? void 0 : err.path) || '',
        },
    ];
    // Prisma error handling via error code check
    if (err.code) {
        switch (err.code) {
            case 'P2002': // Unique constraint failed
                statusCode = http_status_1.default.CONFLICT;
                message = `It looks like the "${getUniqueField((_a = err.meta) === null || _a === void 0 ? void 0 : _a.target)}" you provided is already in use.`;
                errorSources = [
                    {
                        message,
                        path: getUniqueField((_b = err.meta) === null || _b === void 0 ? void 0 : _b.target),
                    },
                ];
                break;
            case 'P2025': // Record not found
                statusCode = http_status_1.default.NOT_FOUND;
                message =
                    'The item you are trying to access no longer exists or could not be found.';
                errorSources = [
                    {
                        message,
                        path: '',
                    },
                ];
                break;
            default:
                message = 'An error occurred while processing your request.';
                errorSources = [
                    {
                        message,
                        path: '',
                    },
                ];
                break;
        }
    }
    else if (err.isValidationError) {
        statusCode = http_status_1.default.BAD_REQUEST;
        message = 'There seems to be an issue with the data you provided.';
        errorSources = [
            {
                message: err.message,
                path: '',
            },
        ];
    }
    else if (err instanceof zod_1.ZodError) {
        const simplifiedError = (0, handelZodError_1.default)(err);
        statusCode = simplifiedError.statusCode;
        message = simplifiedError.message;
        errorSources = simplifiedError.errorSources;
    }
    else if (err instanceof AppError_1.default) {
        statusCode = err.statusCode;
        message = err.message;
        errorSources = [
            {
                message: err.message,
                path: '',
            },
        ];
    }
    else if (err instanceof Error) {
        errorSources = [
            {
                message: err.message,
                path: '',
            },
        ];
    }
    console.error('Detailed Error:', err);
    res.status(statusCode).json({
        success: false,
        message,
        error: errorSources,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
};
// Helper function to extract the unique field name from Prisma error metadata.
const getUniqueField = (target) => {
    if (!target)
        return 'field';
    if (Array.isArray(target))
        return target.join(', ');
    return String(target);
};
exports.default = globalErrorHandler;
