import { ApolloError } from 'apollo-server-express';

export const ErrorCode = {
  // User
  NOT_FOUND_USER: new ApolloError('Does not exist user', 'NOT_FOUND_USER'),
  BAD_REQUEST_USER_ID: new ApolloError(
    'user id is not valid',
    'BAD_REQUEST_USER_ID',
  ),
  NOT_FOUND_PROJECT: new ApolloError(
    'project id is not found',
    'NOT_FOUND_PROJECT',
  ),
} as const;
