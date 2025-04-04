import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import ChatService from './chat.services';

const CreateRoom = catchAsync(async (req, res) => {
  const room = await ChatService.CreateRoom(req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: 'Room created successfully',
    data: room,
  });
});

const GetRoomsByUserId = catchAsync(async (req, res) => {
  const rooms = await ChatService.GetRoomsByUserId(req.user.id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Rooms fetched successfully',
    data: rooms,
  });
});

const SendMessage = catchAsync(async (req, res) => {
  const message = await ChatService.SendMessage(req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: 'Message sent successfully',
    data: message,
  });
});

const GetMessagesByRoomId = catchAsync(async (req, res) => {
  const messages = await ChatService.GetMessagesByRoomId(req.params.roomId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Messages fetched successfully',
    data: messages,
  });
});

const ChatController = {
  CreateRoom,
  GetRoomsByUserId,
  SendMessage,
  GetMessagesByRoomId,
};

export default ChatController;
