"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const LoginSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z
            .string({
            required_error: 'Email is required',
            invalid_type_error: 'Email must be a string',
        })
            .email('Invalid email format'),
        password: zod_1.z.string({
            required_error: 'Password is required',
            invalid_type_error: 'Password must be a string',
        }),
    }),
});
const RegisterSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z
            .string({
            required_error: 'Name is required',
            invalid_type_error: 'Name must be a string',
        })
            .min(3, 'Name must be at least 3 characters')
            .max(255, 'Name must be at most 255 characters'),
        email: zod_1.z
            .string({
            required_error: 'Email is required',
            invalid_type_error: 'Email must be a string',
        })
            .email('Email must be a valid email'),
        password: zod_1.z
            .string({
            required_error: 'Password is required',
            invalid_type_error: 'Password must be a string',
        })
            .min(6, 'Password must be at least 6 characters'),
        gender: zod_1.z.enum([client_1.Gender.MALE, client_1.Gender.FEMALE], {
            invalid_type_error: 'Gender must be either MALE or FEMALE',
            message: 'Gender is required and must be either MALE or FEMALE',
        }),
    }),
});
const ChangePasswordSchema = zod_1.z.object({
    body: zod_1.z.object({
        oldPassword: zod_1.z.string({
            required_error: 'Old password is required',
            invalid_type_error: 'Old password must be a string',
        }),
        newPassword: zod_1.z.string({
            required_error: 'New password is required',
            invalid_type_error: 'New password must be a string',
        }),
    }),
});
const AuthValidation = { LoginSchema, RegisterSchema, ChangePasswordSchema };
exports.default = AuthValidation;
