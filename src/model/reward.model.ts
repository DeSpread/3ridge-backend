import { ChainType } from '../constant/chain.type';
import { RewardUnitType } from '../constant/reward.type';

export class AptosNFT {
  collectionName: string;
  tokenName: string;
  tokenPropertyVersion = 0;
}

export class RewardContext {
  limitNumber: number;
  beginTime: Date;
  untilTime: Date;

  rewardChain: ChainType;
  rewardUnit: RewardUnitType;
  rewardAmount: number;

  nftImageUrl: string;
  rewardDesp: AptosNFT | undefined;
}

export interface LuckyDrawRewardInput {
  untilTime: Date;
}
