import { registerEnumType } from '@nestjs/graphql';

export enum QuestPolicyType {
  QUIZ = 'QUIZ',
  VERIFY_TWITTER_FOLLOW = 'VERIFY_TWITTER_FOLLOW',
  VERIFY_TWITTER_RETWEET = 'VERIFY_TWITTER_RETWEET',
  VERIFY_DISCORD = 'VERIFY_DISCORD',
  VERIFY_CONTRACT = 'VERIFY_CONTRACT',
}

registerEnumType(QuestPolicyType, { name: 'QuestPolicyType' });
