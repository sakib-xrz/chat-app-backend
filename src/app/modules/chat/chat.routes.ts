import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import ChatValidation from './chat.validation';
import ChatController from './chat.controller';
import auth from '../../middlewares/auth';
import { upload, uploadToCloudinary } from '../../utils/handelFile';

const router = express.Router();

// Room routes
router.post(
  '/rooms',
  auth(),
  validateRequest(ChatValidation.CreateRoomSchema),
  ChatController.CreateRoom,
);

router.get('/rooms', auth(), ChatController.GetRoomsByUserId);

router.get('/rooms/:roomId', auth(), ChatController.GetRoomDetails);

// Message routes
router.post(
  '/messages',
  auth(),
  validateRequest(ChatValidation.SendMessageSchema),
  ChatController.SendMessage,
);

router.get(
  '/rooms/:roomId/messages',
  auth(),
  ChatController.GetMessagesByRoomId,
);

router.patch(
  '/messages',
  auth(),
  validateRequest(ChatValidation.EditMessageSchema),
  ChatController.EditMessage,
);

router.delete(
  '/messages',
  auth(),
  validateRequest(ChatValidation.DeleteMessageSchema),
  ChatController.DeleteMessage,
);

router.post(
  '/messages/read',
  auth(),
  validateRequest(ChatValidation.MarkAsReadSchema),
  ChatController.MarkMessageAsRead,
);

// File upload route with Cloudinary integration
router.post(
  '/messages/file',
  auth(),
  upload.single('file'),
  async (req, res, next) => {
    try {
      if (req.file) {
        // Upload file to Cloudinary
        const cloudinaryResult = (await uploadToCloudinary(req.file, {
          folder: 'chat_files',
        })) as { secure_url: string };

        // Add file URL to the request body
        req.body.fileUrl = cloudinaryResult.secure_url;
        req.body.type = req.file.mimetype.startsWith('image/')
          ? 'IMAGE'
          : 'FILE';
      }
      next();
    } catch (error) {
      next(error);
    }
  },
  validateRequest(ChatValidation.SendMessageSchema),
  ChatController.SendMessage,
);

// Group management routes
router.post(
  '/rooms/users',
  auth(),
  validateRequest(ChatValidation.AddUserToRoomSchema),
  ChatController.AddUserToRoom,
);

router.delete(
  '/rooms/users',
  auth(),
  validateRequest(ChatValidation.RemoveUserFromRoomSchema),
  ChatController.RemoveUserFromRoom,
);

router.patch(
  '/rooms/users/role',
  auth(),
  validateRequest(ChatValidation.UpdateRoleSchema),
  ChatController.UpdateRoomAdmin,
);

export const ChatRoutes = router;
