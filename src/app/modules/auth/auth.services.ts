import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import prisma from '../../utils/prisma';
import bcrypt from 'bcrypt';
import AuthUtils from './auth.utils';
import config from '../../config';
import { Gender } from '@prisma/client';
import { JwtPayload } from 'jsonwebtoken';
import { ILogin, IRegister } from './auth.interface';

const Login = async (payload: ILogin) => {
  const user = await prisma.user.findFirst({
    where: { email: payload.email },
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'No user found with this email');
  }

  const isPasswordMatched = await await bcrypt.compare(
    payload.password,
    user.password,
  );

  if (!isPasswordMatched) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Invalid password');
  }

  const jwtPayload = {
    id: user.id,
    email: user.email,
  };

  const accessToken = AuthUtils.CreateToken(
    jwtPayload,
    config.jwt_access_token_secret as string,
    config.jwt_access_token_expires_in as string,
  );

  const refreshToken = AuthUtils.CreateToken(
    jwtPayload,
    config.jwt_refresh_token_secret as string,
    config.jwt_refresh_token_expires_in as string,
  );

  return { accessToken, refreshToken };
};

const Register = async (payload: IRegister) => {
  const isUserExists = await prisma.user.findFirst({
    where: { email: payload.email },
  });

  if (isUserExists) {
    throw new AppError(httpStatus.CONFLICT, 'User already exists');
  }

  const hashedPassword = await bcrypt.hash(
    payload.password,
    Number(config.bcrypt_salt_rounds),
  );

  const user = await prisma.user.create({
    data: {
      email: payload.email,
      password: hashedPassword,
      name: payload.name,
      gender: payload.gender,
      phone: payload.phone,
      image:
        payload.gender === Gender.MALE
          ? 'https://avatar.iran.liara.run/public/boy'
          : 'https://avatar.iran.liara.run/public/girl',
    },
  });

  const jwtPayload = {
    id: user.id,
    email: user.email,
  };

  const accessToken = AuthUtils.CreateToken(
    jwtPayload,
    config.jwt_access_token_secret as string,
    config.jwt_access_token_expires_in as string,
  );

  const refreshToken = AuthUtils.CreateToken(
    jwtPayload,
    config.jwt_refresh_token_secret as string,
    config.jwt_refresh_token_expires_in as string,
  );

  return { accessToken, refreshToken };
};

const ChangePassword = async (
  payload: {
    oldPassword: string;
    newPassword: string;
  },
  user: JwtPayload,
) => {
  const isUserValid = await prisma.user.findFirst({
    where: { id: user.id },
  });

  if (!isUserValid) {
    throw new AppError(httpStatus.NOT_FOUND, 'No user found');
  }

  const isPasswordMatched = await bcrypt.compare(
    payload.oldPassword,
    isUserValid.password,
  );

  if (!isPasswordMatched) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Invalid password');
  }

  const hashedPassword = await bcrypt.hash(
    payload.newPassword,
    Number(config.bcrypt_salt_rounds),
  );

  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword },
  });
};

const GetProfile = async (user: JwtPayload) => {
  const userData = await prisma.user.findFirst({
    where: { id: user.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      gender: true,
      phone: true,
      created_at: true,
      updated_at: true,
    },
  });

  return userData;
};

const SearchUsers = async (searchQuery: string) => {
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { name: { contains: searchQuery, mode: 'insensitive' } },
        { email: { contains: searchQuery, mode: 'insensitive' } },
      ],
    },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      is_online: true,
      last_seen: true,
    },
  });

  return users;
};

const AuthService = {
  Login,
  Register,
  ChangePassword,
  GetProfile,
  SearchUsers,
};

export default AuthService;
