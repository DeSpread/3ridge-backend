import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { TestService } from '../../../service/test.service';
import { LogSearchData } from '../../../model/search.model';

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

  @Mutation(() => Boolean)
  async testLogMessage(@Args('message') message: string) {
    return this.testService.testLogMessage(message);
  }
}
