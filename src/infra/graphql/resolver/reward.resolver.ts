import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { RewardService } from '../../database/service/reward.service';

@Resolver()
export class RewardResolver {
  constructor(private readonly rewardService: RewardService) {}

  @Mutation(() => Boolean)
  async claimReward(
    @Args('ticketId') ticketId: string,
    @Args('userId') userId: string,
  ) {
    return this.rewardService.claimReward(ticketId, userId);
  }
}
