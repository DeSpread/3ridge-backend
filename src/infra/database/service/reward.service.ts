import { Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER, WinstonLogger } from 'nest-winston';
import { RewardPolicy } from '../../graphql/dto/policy.dto';
import { RewardContext } from '../../../model/reward.model';
import { RewardPolicyType } from '../../../constant/reward.type';

@Injectable()
export class RewardService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: WinstonLogger,
  ) {}

  async isInvalidReward(rewardPolicy: RewardPolicy): Promise<boolean> {
    try {
      switch (rewardPolicy.rewardPolicyType) {
        case RewardPolicyType.FCFS:
          const input: RewardContext = JSON.parse(rewardPolicy.context);
          return false;
      }
    } catch (e) {
      this.logger.error(`Requested reward is invalid. error: [${e.message}]`);
      return true;
    }
  }
}
