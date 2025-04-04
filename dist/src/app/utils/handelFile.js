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
exports.deleteFromCloudinary = exports.uploadToCloudinary = exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const cloudinary_1 = require("cloudinary");
const index_1 = __importDefault(require("../config/index"));
// Cloudinary configuration
cloudinary_1.v2.config({
    cloud_name: index_1.default.cloudinary.cloud_name,
    api_key: index_1.default.cloudinary.api_key,
    api_secret: index_1.default.cloudinary.api_secret,
});
// Allowed file types
const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
// Multer memory storage (for serverless compatibility)
const storage = multer_1.default.memoryStorage();
// File filter for multer
const fileFilter = (_req, file, cb) => {
    const extname = allowedTypes.test(path_1.default.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
        cb(null, true);
    }
    else {
        cb(new Error('Only images, PDFs, and DOC/DOCX files are allowed'));
    }
};
// Multer instance
const upload = (0, multer_1.default)({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 30 * 1024 * 1024 }, // 30 MB limit
});
exports.upload = upload;
// Upload file to Cloudinary directly from memory
const uploadToCloudinary = (file_1, ...args_1) => __awaiter(void 0, [file_1, ...args_1], void 0, function* (file, options = {}) {
    return new Promise((resolve, reject) => {
        cloudinary_1.v2.uploader
            .upload_stream({
            folder: options.folder || 'uploads',
            public_id: options.public_id || Date.now().toString(),
            use_filename: true,
            overwrite: true,
            invalidate: true,
        }, (error, result) => {
            if (error) {
                return reject(new Error(`Cloudinary upload failed: ${error.message}`));
            }
            resolve(result);
        })
            .end(file.buffer); // Send file buffer directly
    });
});
exports.uploadToCloudinary = uploadToCloudinary;
// Delete file from Cloudinary
const deleteFromCloudinary = (publicIds) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve, reject) => {
        cloudinary_1.v2.api.delete_resources(publicIds, (error, result) => {
            if (error) {
                return reject(new Error(`Failed to delete from Cloudinary: ${error.message}`));
            }
            resolve(result);
        });
    });
});
exports.deleteFromCloudinary = deleteFromCloudinary;
