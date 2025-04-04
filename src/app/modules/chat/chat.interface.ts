import { ChatType, MessageStatus, MessageType, UserRole } from '@prisma/client';

export interface IChatRoom {
  id: string;
  name?: string;
  type: ChatType;
  participants: IChatRoomUser[];
}

export interface IChatMessage {
  id: string;
  content: string;
  sender_id: string;
  room_id: string;
  type: MessageType;
  file_url?: string;
  edited: boolean;
  deleted: boolean;
  created_at: Date;
  updated_at: Date;
  read_by: IMessageStatus[];
}

export interface IMessageStatus {
  id: string;
  message_id: string;
  user_id: string;
  status: MessageStatus;
  created_at: Date;
  updated_at: Date;
}

export interface IChatRoomUser {
  id: string;
  room_id: string;
  user_id: string;
  role: UserRole;
  created_at: Date;
}

export interface ITypingStatus {
  id: string;
  room_id: string;
  user_id: string;
  is_typing: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface ICreateRoom {
  name?: string;
  type: ChatType;
  participants: string[];
}

export interface IAddUserToRoom {
  room_id: string;
  user_id: string;
  role?: UserRole;
}

export interface IRemoveUserFromRoom {
  room_id: string;
  user_id: string;
}

export interface IUpdateRoomAdmin {
  room_id: string;
  user_id: string;
  role: UserRole;
}

export interface ISendMessage {
  content: string;
  sender_id: string;
  room_id: string;
  type?: MessageType;
  file_url?: string;
}

export interface IEditMessage {
  message_id: string;
  content: string;
  sender_id: string;
}

export interface IDeleteMessage {
  message_id: string;
  sender_id: string;
}

export interface IMarkMessageAsRead {
  message_id: string;
  user_id: string;
}

export interface ITypingIndicator {
  room_id: string;
  user_id: string;
  is_typing: boolean;
}

export interface IUserPresence {
  user_id: string;
  is_online: boolean;
  socket_id?: string;
}
