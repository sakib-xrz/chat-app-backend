export type ErrorSourcesType = {
  message: string;
  path: string;
}[];

export type GenericErrorResponseType = {
  statusCode: number;
  message: string;
  errorSources: ErrorSourcesType;
};
