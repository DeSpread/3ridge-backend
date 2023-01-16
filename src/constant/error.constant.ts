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
  BAD_REQUEST_QUEST: new ApolloError('quest is not valid', 'BAD_REQUEST_QUEST'),
  BAD_REQUEST_QUIZ_QUEST_COLLECTION: new ApolloError(
    'quiz quest collection is not valid',
    'BAD_REQUEST_QUIZ_QUEST_COLLECTION',
  ),
  BAD_REQUEST_TICKET_MANDATORY: new ApolloError(
    'ticket needs to have mandatory fields',
    'BAD_REQUEST_TICKET_MANDATORY',
  ),
} as const;
