import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { TestService } from '../../../service/test.service';
import { SearchService } from '../../../service/search.service';
import { LogSearchData } from '../../../model/search.model';

@Resolver()
export class TestResolver {
  constructor(
    private testService: TestService,
    private searchService: SearchService,
  ) {}

  @Mutation(() => Boolean)
  async clearParticipatedAllEvents() {
    return this.testService.clearParticipatedAllEvents();
  }

  @Mutation(() => Boolean)
  async clearParticipatedAllEventsByUserId(@Args('userId') userId: string) {
    return this.testService.clearParticipatedAllEventsByUserId(userId);
  }

  @Mutation(() => Boolean)
  async indexToLogData(@Args('message') message: string) {
    const payload = new LogSearchData('test');
    return this.searchService.indexToLogData(payload);
  }
}
