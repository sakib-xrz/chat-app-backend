import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import AuthValidation from './auth.validation';
import AuthController from './auth.controller';
import auth from '../../middlewares/auth';

const router = express.Router();

router.post(
  '/login',
  validateRequest(AuthValidation.LoginSchema),
  AuthController.Login,
);

router.post(
  '/register',
  validateRequest(AuthValidation.RegisterSchema),
  AuthController.Register,
);

router.patch(
  '/change-password',
  auth(),
  validateRequest(AuthValidation.ChangePasswordSchema),
  AuthController.ChangePassword,
);

router.get('/profile', auth(), AuthController.GetProfile);

router.get('/users', auth(), AuthController.SearchUsers);

export const AuthRoutes = router;
