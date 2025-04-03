import httpStatus from 'http-status';
import { ZodError, ZodIssue } from 'zod';
import { ErrorSourcesType, GenericErrorResponseType } from '../interface/error';

const handelZodError = (err: ZodError): GenericErrorResponseType => {
  const errorSources: ErrorSourcesType = err.issues.map((issue: ZodIssue) => {
    return {
      message: issue.message,
      path: issue?.path[issue.path.length - 1] as string,
    };
  });

  return {
    statusCode: httpStatus.BAD_REQUEST,
    message: 'Validation Error!',
    errorSources,
  };
};

export default handelZodError;
