import { Gender } from '@prisma/client';

export type LoginType = {
  email: string;
  password: string;
};

export type RegisterType = {
  name: string;
  email: string;
  password: string;
  gender: Gender;
  phone: string;
};
