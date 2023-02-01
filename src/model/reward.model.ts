import { ChainType } from '../constant/chain.type';
import { RewardUnitType } from '../constant/reward.type';

export class FcfsRewardInput {
  limitNumber: number;
  beginTime: Date;
  untilTime: Date;

  rewardChain: ChainType;
  rewardUnit: RewardUnitType;
  rewardAmount: number;

  nftImageUrl: string;
  collectionName: string;
  tokenName: string;
}

export interface LuckyDrawRewardInput {
  untilTime: Date;
}
