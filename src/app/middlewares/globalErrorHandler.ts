/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */

import { ErrorRequestHandler } from 'express';
import httpStatus from 'http-status';
import { ZodError } from 'zod';
import handelZodError from '../errors/handelZodError';
import AppError from '../errors/AppError';
import { ErrorSourcesType } from '../interface/error';

const globalErrorHandler: ErrorRequestHandler = (err, _req, res, next) => {
  let statusCode: number = err.statusCode || httpStatus.INTERNAL_SERVER_ERROR;
  let message: string = err.message || 'Something went wrong!';
  let errorSources: ErrorSourcesType = [
    {
      message: err.message || 'Something went wrong!',
      path: (err as any)?.path || '',
    },
  ];

  // Prisma error handling via error code check
  if ((err as any).code) {
    switch ((err as any).code) {
      case 'P2002': // Unique constraint failed
        statusCode = httpStatus.CONFLICT;
        message = `It looks like the "${getUniqueField((err as any).meta?.target)}" you provided is already in use.`;
        errorSources = [
          {
            message,
            path: getUniqueField((err as any).meta?.target),
          },
        ];
        break;
      case 'P2025': // Record not found
        statusCode = httpStatus.NOT_FOUND;
        message =
          'The item you are trying to access no longer exists or could not be found.';
        errorSources = [
          {
            message,
            path: '',
          },
        ];
        break;
      default:
        message = 'An error occurred while processing your request.';
        errorSources = [
          {
            message,
            path: '',
          },
        ];
        break;
    }
  } else if ((err as any).isValidationError) {
    statusCode = httpStatus.BAD_REQUEST;
    message = 'There seems to be an issue with the data you provided.';
    errorSources = [
      {
        message: err.message,
        path: '',
      },
    ];
  } else if (err instanceof ZodError) {
    const simplifiedError = handelZodError(err);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = simplifiedError.errorSources;
  } else if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    errorSources = [
      {
        message: err.message,
        path: '',
      },
    ];
  } else if (err instanceof Error) {
    errorSources = [
      {
        message: err.message,
        path: '',
      },
    ];
  }

  console.error('Detailed Error:', err);

  res.status(statusCode).json({
    success: false,
    message,
    error: errorSources,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};

// Helper function to extract the unique field name from Prisma error metadata.
const getUniqueField = (target: unknown): string => {
  if (!target) return 'field';
  if (Array.isArray(target)) return target.join(', ');
  return String(target);
};

export default globalErrorHandler;
