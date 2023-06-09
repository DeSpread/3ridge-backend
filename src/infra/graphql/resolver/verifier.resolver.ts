import { Args, Query, Resolver } from '@nestjs/graphql';
import { VerifierService } from '../../../service/verifier.service';
import { User } from '../../schema/user.schema';

@Resolver()
export class VerifierResolver {
  constructor(private verifierService: VerifierService) {}

  @Query(() => User)
  async isLikingTweetByUserId(
    @Args('userId') userId: string,
    @Args('targetTweetId') targetTweetId: string,
  ) {
    return this.verifierService.isLikingTweetByUserId(userId, targetTweetId);
  }

  @Query(() => User)
  async isFollowTwitterByUserId(
    @Args('userId') userId: string,
    @Args('targetTwitterUsername') targetTwitterUsername: string,
  ) {
    return this.verifierService.isFollowTwitterByUserId(
      userId,
      targetTwitterUsername,
    );
  }

  @Query(() => User)
  async isRetweetedTwitterByUserId(
    @Args('userId') userId: string,
    @Args('targetTweetId') targetTweetId: string,
  ) {
    return this.verifierService.isRetweetedTwitterByUserId(
      userId,
      targetTweetId,
    );
  }
}
