import { ApolloError } from 'apollo-server-express';

export const ErrorCode = {
  // User
  NOT_FOUND_USER: new ApolloError('Does not exist user', 'NOT_FOUND_USER'),
  NOT_FOUND_COMPLETED_QUEST_USER: new ApolloError(
    'Does not exist completed quest user',
    'NOT_FOUND_COMPLETED_QUEST_USER',
  ),
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
  DOES_NOT_TWITTER_FOLLOW: new ApolloError(
    'user does not follow twitter',
    'DOES_NOT_TWITTER_FOLLOW',
  ),
  DOES_NOT_TWITTER_RETWEET: new ApolloError(
    'user does not retweet twitter',
    'DOES_NOT_TWITTER_RETWEET',
  ),
  ALREADY_VERIFIED_USER: new ApolloError(
    'user already has verification',
    'ALREADY_VERIFIED_USER',
  ),
  NOT_FOUND_QUEST: new ApolloError('Does not exist quest', 'NOT_FOUND_QUEST'),
  NOT_FOUND_TICKET: new ApolloError(
    'Does not exist ticket',
    'NOT_FOUND_TICKET',
  ),
  ALREADY_PARTICIPATED_USER: new ApolloError(
    'user already participated ticket',
    'ALREADY_PARTICIPATED_USER',
  ),
} as const;
