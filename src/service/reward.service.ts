import { Injectable } from '@nestjs/common';
import { RewardPolicy } from '../infra/graphql/dto/policy.dto';
import { FcfsReward } from '../model/reward.model';
import { RewardPolicyType } from '../constant/reward.type';
import { LoggerService } from './loggerService';

@Injectable()
export class RewardService {
  constructor(private readonly logger: LoggerService) {}

  async isInvalidReward(rewardPolicy: RewardPolicy): Promise<boolean> {
    try {
      switch (rewardPolicy.rewardPolicyType) {
        case RewardPolicyType.FCFS:
          const input: FcfsReward = JSON.parse(rewardPolicy.context);
          return false;
      }
    } catch (e) {
      this.logger.error(`Requested reward is invalid. error: [${e.message}]`);
      return true;
    }
  }
}
