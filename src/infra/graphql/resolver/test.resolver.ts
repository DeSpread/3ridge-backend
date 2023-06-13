import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { TestService } from '../../database/service/test.service';

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
}
