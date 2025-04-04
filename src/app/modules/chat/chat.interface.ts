import { ChatType } from '@prisma/client';

export interface IChatRoom {
  id: string;
  name?: string;
  type: ChatType;
  participants: string[];
}

export interface IChatMessage {
  id: string;
  content: string;
  sender_id: string;
  room_id: string;
}

export interface ICreateRoom {
  name?: string;
  type: ChatType;
  participants: string[];
}

export interface ISendMessage {
  content: string;
  sender_id: string;
  room_id: string;
}
