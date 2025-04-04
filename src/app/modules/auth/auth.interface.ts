import { Gender } from '@prisma/client';

export interface ILogin {
  email: string;
  password: string;
}

export interface IRegister {
  name: string;
  email: string;
  password: string;
  gender: Gender;
  phone: string;
}
