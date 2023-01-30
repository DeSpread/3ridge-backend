import { Args, Query, Resolver } from '@nestjs/graphql';
import { VerifierService } from '../../database/service/verifier.service';
import { User } from '../../schema/user.schema';

@Resolver()
export class VerifierResolver {
  constructor(private verifierService: VerifierService) {}

  @Query(() => User)
  async isFollowTwitterByUsername(
    @Args('userId') userId: string,
    @Args('targetTwitterUsername') targetTwitterUsername: string,
  ) {
    return this.verifierService.isFollowTwitterByUserId(
      userId,
      targetTwitterUsername,
    );
  }
}
