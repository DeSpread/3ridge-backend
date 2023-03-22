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
  DOES_NOT_TWITTER_LIKING: new ApolloError(
    'user does not like twitter',
    'DOES_NOT_TWITTER_LIKING',
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
  ALREADY_INCLUDED_WINNER_USER: new ApolloError(
    'user already included winner list in ticket',
    'ALREADY_INCLUDED_WINNER_USER',
  ),
  ALREADY_EXIST_PROJECT: new ApolloError(
    'project already exist',
    'ALREADY_EXIST_PROJECT',
  ),
  DOES_NOT_CLAIMABLE: new ApolloError(
    'receiver does not claimable',
    'DOES_NOT_CLAIMABLE',
  ),
  DOES_NOT_WIN_TICKET: new ApolloError(
    'user does not win in ticket',
    'DOES_NOT_WIN_TICKET',
  ),
  DOES_NOT_BRIDGE_TO_APTOS: new ApolloError(
    'user does not bridge to aptos',
    'DOES_NOT_BRIDGE_TO_APTOS',
  ),
  DOES_NOT_HAVA_APTOS_WALLET: new ApolloError(
    'user does not have aptos wallet',
    'DOES_NOT_HAVA_APTOS_WALLET',
  ),
  DOES_NOT_HAVE_APTOS_NFT: new ApolloError(
    'user does not have aptos nft',
    'DOES_NOT_HAVE_APTOS_NFT',
  ),
  DOES_NOT_HAVE_ATPOS_TRANSACTION: new ApolloError(
    'user does not have aptos transaction',
    'DOES_NOT_HAVE_ATPOS_TRANSACTION',
  ),
  DOES_NOT_HAVE_ATPOS_ANS: new ApolloError(
    'user does not have aptos ans',
    'DOES_NOT_HAVE_ATPOS_ANS',
  ),
  APTOS_INDEXER_ERROR: new ApolloError(
    'aptos indexer has something error',
    'APTOS_INDEXER_ERROR',
  ),
  NOT_ENOUGH_3RIDGE_POINT: new ApolloError(
    'not enough 3ridge point',
    'NOT_ENOUGH_3RIDGE_POINT',
  ),
} as const;
