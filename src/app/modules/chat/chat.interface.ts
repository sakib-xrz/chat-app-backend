export interface IThread {
  id: string;
  participants: IThreadUser[];
}

export interface IMessage {
  id: string;
  content: string;
  sender_id: string;
  thread_id: string;
  file_url?: string;
  edited: boolean;
  deleted: boolean;
  sender?: IUser;
}

export interface IThreadUser {
  id: string;
  thread_id: string;
  user_id: string;
  created_at: Date;
  user?: IUser;
}

export interface IUser {
  id: string;
  name: string;
  email: string;
  image?: string;
  is_online: boolean;
  last_seen?: Date;
}

export interface ICreateThread {
  participants: string[];
}

export interface ISendMessage {
  content: string;
  sender_id: string;
  thread_id: string;
  file_url?: string;
}

export interface IEditMessage {
  thread_id: string;
  message_id: string;
  sender_id: string;
  content: string;
}

export interface IUserPresence {
  user_id: string;
  is_online: boolean;
  socket_id?: string;
  last_seen?: Date;
}
