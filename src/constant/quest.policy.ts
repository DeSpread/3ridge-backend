import { registerEnumType } from '@nestjs/graphql';

export enum QuestPolicyType {
  QUIZ = 'QUIZ',
  VERIFY_TWITTER_FOLLOW = 'VERIFY_TWITTER_FOLLOW',
  VERIFY_TWITTER_RETWEET = 'VERIFY_TWITTER_RETWEET',
  VERIFY_TWITTER_LIKING = 'VERIFY_TWITTER_LIKING',
  VERIFY_DISCORD = 'VERIFY_DISCORD',
  VERIFY_TELEGRAM = 'VERIFY_TELEGRAM',
  VERIFY_3RIDGE_POINT = 'VERIFY_3RIDGE_POINT',
  VERIFY_APTOS_BRIDGE_TO_APTOS = 'VERIFY_APTOS_BRIDGE_TO_APTOS',
  VERIFY_APTOS_HAS_NFT = 'VERIFY_APTOS_HAS_NFT',
  VERIFY_APTOS_EXIST_TX = 'VERIFY_APTOS_EXIST_TX',
  VERIFY_APTOS_HAS_ANS = 'VERIFY_APTOS_HAS_ANS',
  VERIFY_EMAIL = 'VERIFY_EMAIL',
  VERIFY_WALLET_ADDRESS = 'VERIFY_WALLET_ADDRESS',
  VERIFY_HAS_EMAIL = 'VERIFY_HAS_EMAIL',
  VERIFY_HAS_WALLET_ADDRESS = 'VERIFY_HAS_WALLET_ADDRESS',
  VERIFY_HAS_TWITTER = 'VERIFY_HAS_TWITTER',
  VERIFY_HAS_TELEGRAM = 'VERIFY_HAS_TELEGRAM',
  VERIFY_VISIT_WEBSITE = 'VERIFY_VISIT_WEBSITE'
}

registerEnumType(QuestPolicyType, { name: 'QuestPolicyType' });
