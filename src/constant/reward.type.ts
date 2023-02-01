import { registerEnumType } from '@nestjs/graphql';

export enum RewardPolicyType {
  LUCKY_DRAW = 'LUCKY_DRAW',
  FCFS = 'FCFS',
}

export enum RewardUnitType {
  USDT = 'USDT',
  NFT = 'NFT',
}

registerEnumType(RewardPolicyType, { name: 'RewardPolicyType' });
registerEnumType(RewardUnitType, { name: 'RewardUnitType' });
