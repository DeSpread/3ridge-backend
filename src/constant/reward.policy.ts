import { registerEnumType } from '@nestjs/graphql';

export enum RewardPolicyType {
  LUCKY_DRAW = 'LUCKY_DRAW',
  FCFS = 'FCFS',
}

registerEnumType(RewardPolicyType, { name: 'RewardPolicyType' });
