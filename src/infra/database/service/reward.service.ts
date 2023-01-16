import { Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER, WinstonLogger } from 'nest-winston';
import { RewardPolicy } from '../../graphql/dto/policy.dto';
import { RewardPolicyType } from '../../../constant/reward.policy';
import { FcfsRewardInput } from '../../../model/reward.model';

@Injectable()
export class RewardService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: WinstonLogger,
  ) {}

  async isInvalidReward(rewardPolicy: RewardPolicy): Promise<boolean> {
    try {
      switch (rewardPolicy.rewardPolicyType) {
        case RewardPolicyType.FCFS:
          const input: FcfsRewardInput = JSON.parse(rewardPolicy.context);
          return false;
      }
    } catch (e) {
      this.logger.error(`Requested reward is invalid. error: [${e.message}]`);
      return true;
    }
  }
}
