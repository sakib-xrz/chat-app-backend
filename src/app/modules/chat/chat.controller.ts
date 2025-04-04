import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import ChatService from './chat.services';

const CreateRoom = catchAsync(async (req, res) => {
  if (!req.body.participants.includes(req.user.id)) {
    req.body.participants.unshift(req.user.id);
  }
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

const GetMessagesByRoomId = catchAsync(async (req, res) => {
  const messages = await ChatService.GetMessagesByRoomId(
    req.params.room_id,
    req.user.id,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Messages fetched successfully',
    data: messages,
  });
});

const EditMessage = catchAsync(async (req, res) => {
  const message = await ChatService.EditMessage({
    ...req.body,
    sender_id: req.user.id,
  });

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Message edited successfully',
    data: message,
  });
});

const DeleteMessage = catchAsync(async (req, res) => {
  const result = await ChatService.DeleteMessage({
    ...req.body,
    sender_id: req.user.id,
  });

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Message deleted successfully',
    data: result,
  });
});

const MarkMessageAsRead = catchAsync(async (req, res) => {
  const result = await ChatService.MarkMessageAsRead({
    ...req.body,
    user_id: req.user.id,
  });

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Message marked as read',
    data: result,
  });
});

const AddUserToRoom = catchAsync(async (req, res) => {
  const result = await ChatService.AddUserToRoom(req.body, req.user.id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'User added to room successfully',
    data: result,
  });
});

const RemoveUserFromRoom = catchAsync(async (req, res) => {
  const result = await ChatService.RemoveUserFromRoom(req.body, req.user.id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'User removed from room successfully',
    data: result,
  });
});

const UpdateRoomAdmin = catchAsync(async (req, res) => {
  const result = await ChatService.UpdateRoomAdmin(req.body, req.user.id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'User role updated successfully',
    data: result,
  });
});

const GetRoomDetails = catchAsync(async (req, res) => {
  const room = await ChatService.GetRoomDetails(
    req.params.room_id,
    req.user.id,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Room details fetched successfully',
    data: room,
  });
});

const ChatController = {
  CreateRoom,
  GetRoomsByUserId,
  SendMessage,
  GetMessagesByRoomId,
  EditMessage,
  DeleteMessage,
  MarkMessageAsRead,
  AddUserToRoom,
  RemoveUserFromRoom,
  UpdateRoomAdmin,
  GetRoomDetails,
};

export default ChatController;
