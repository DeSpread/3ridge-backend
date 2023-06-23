import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { TestService } from '../../../service/test.service';
import { ChainType } from '../../../constant/chain.type';

@Resolver()
export class TestResolver {
  constructor(private testService: TestService) {}

  @Mutation(() => Boolean)
  async clearParticipatedAllEvents() {
    return this.testService.clearParticipatedAllEvents();
  }

  @Mutation(() => Boolean)
  async clearParticipatedAllEventsByUserId(@Args('userId') userId: string) {
    return this.testService.clearParticipatedAllEventsByUserId(userId);
  }

  @Query(() => [String])
  async getWalletAddressOfWinner(
    @Args('ticketId') ticketId: string,
    @Args('chainType') chainType: ChainType,
  ) {
    return this.testService.getWalletAddressOfWinner(ticketId, chainType);
  }
}
