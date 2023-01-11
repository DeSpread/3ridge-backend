import { registerEnumType } from '@nestjs/graphql';

export enum QuestPolicyType {
  QUIZ = 'QUIZ',
  VERIFY_TWITTER = 'VERIFY_TWITTER',
  VERIFY_DISCORD = 'VERIFY_DISCORD',
  VERIFY_CONTRACT = 'VERIFY_CONTRACT',
}

registerEnumType(QuestPolicyType, { name: 'QuestPolicyType' });
