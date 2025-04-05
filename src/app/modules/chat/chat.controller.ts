import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import ChatService from './chat.services';

const CreateThread = catchAsync(async (req, res) => {
  if (!req.body.participants.includes(req.user.id)) {
    req.body.participants.unshift(req.user.id);
  }
  const room = await ChatService.CreateThread(req.body);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: 'Room created successfully',
    data: room,
  });
});

const GetThreadsByUserId = catchAsync(async (req, res) => {
  const rooms = await ChatService.GetThreadsByUserId(req.user.id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Rooms fetched successfully',
    data: rooms,
  });
});

const GetThreadDetails = catchAsync(async (req, res) => {
  const room = await ChatService.GetThreadDetails(
    req.params.thread_id,
    req.user.id,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Room details fetched successfully',
    data: room,
  });
});

const SendMessage = catchAsync(async (req, res) => {
  const message = await ChatService.SendMessage({
    ...req.body,
    sender_id: req.user.id,
  });

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: 'Message sent successfully',
    data: message,
  });
});

const GetMessagesByThreadId = catchAsync(async (req, res) => {
  const messages = await ChatService.GetMessagesByThreadId(
    req.params.thread_id,
    req.user.id,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Messages fetched successfully',
    data: messages,
  });
});

const ChatController = {
  CreateThread,
  GetThreadsByUserId,
  GetThreadDetails,
  SendMessage,
  GetMessagesByThreadId,
};

export default ChatController;
