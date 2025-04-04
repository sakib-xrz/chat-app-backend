import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import ChatValidation from './chat.validation';
import ChatController from './chat.controller';
import auth from '../../middlewares/auth';

const router = express.Router();

router.post(
  '/rooms',
  auth(),
  validateRequest(ChatValidation.CreateRoomSchema),
  ChatController.CreateRoom,
);

router.get('/rooms', auth(), ChatController.GetRoomsByUserId);

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

export const ChatRoutes = router;
