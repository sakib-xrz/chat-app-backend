import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import ChatValidation from './chat.validation';
import ChatController from './chat.controller';
import auth from '../../middlewares/auth';
import { upload, uploadToCloudinary } from '../../utils/handelFile';

const router = express.Router();

// Room routes
router.post(
  '/thread',
  auth(),
  validateRequest(ChatValidation.CreateThreadSchema),
  ChatController.CreateThread,
);

router.get('/threads', auth(), ChatController.GetThreadsByUserId);

router.get('/thread/:thread_id', auth(), ChatController.GetThreadDetails);

// Message routes
router.post(
  '/messages',
  auth(),
  validateRequest(ChatValidation.SendMessageSchema),
  ChatController.SendMessage,
);

router.get(
  '/rooms/:thread_id/messages',
  auth(),
  ChatController.GetMessagesByThreadId,
);

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

export const ChatRoutes = router;
