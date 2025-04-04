import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import AuthService from './auth.services';
import { Request, Response } from 'express';
import AppError from '../../errors/AppError';

const Login = catchAsync(async (req, res) => {
  const result = await AuthService.Login(req.body);

  const { accessToken, refreshToken } = result;

  res.cookie('REFRESH_TOKEN', refreshToken, {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Login successful',
    data: {
      accessToken,
    },
  });
});

const Register = catchAsync(async (req, res) => {
  const result = await AuthService.Register(req.body);

  const { accessToken, refreshToken } = result;

  res.cookie('REFRESH_TOKEN', refreshToken, {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: 'User registered successfully',
    data: {
      accessToken,
    },
  });
});

const ChangePassword = catchAsync(async (req, res) => {
  await AuthService.ChangePassword(req.body, req.user);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Password changed successfully',
  });
});

const GetProfile = catchAsync(async (req, res) => {
  const result = await AuthService.GetProfile(req.user);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Profile fetched successfully',
    data: result,
  });
});

const SearchUsers = catchAsync(async (req: Request, res: Response) => {
  const searchQuery = req.query.search as string;

  if (!searchQuery) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Search query is required');
  }

  const users = await AuthService.SearchUsers(searchQuery);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Users retrieved successfully',
    data: users,
  });
});

const AuthController = {
  Login,
  Register,
  ChangePassword,
  GetProfile,
  SearchUsers,
};

export default AuthController;
