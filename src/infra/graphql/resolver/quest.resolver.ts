import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Quest } from '../../schema/quest.schema';
import { QuestService } from '../../../service/quest.service';
import { IsCompletedQuestByUserIdResponse } from '../dto/response.dto';

@Resolver(() => Quest)
export class QuestResolver {
  constructor(private readonly questService: QuestService) {}

  @Query(() => Quest)
  async findQuestById(@Args('questId') questId: string) {
    return this.questService.findQuestById(questId);
  }

  @Query(() => IsCompletedQuestByUserIdResponse)
  async isCompletedQuestByUserId(
    @Args('questId') questId: string,
    @Args('userId') userId: string,
  ) {
    return this.questService.isCompletedQuestByUserId(questId, userId);
  }

  @Mutation(() => Quest)
  async completeQuestOfUser(
    @Args('ticketId') ticketId: string,
    @Args('questId') questId: string,
    @Args('userId') userId: string,
  ) {
    return this.questService.completeQuestOfUser(ticketId, questId, userId);
  }

  @Mutation(() => Quest)
  async verifyTwitterFollowQuest(
    @Args('ticketId') ticketId: string,
    @Args('questId') questId: string,
    @Args('userId') userId: string,
  ) {
    return this.questService.verifyTwitterFollowQuest(
      ticketId,
      questId,
      userId,
    );
  }

  @Mutation(() => Quest)
  async verifyTwitterRetweetQuest(
    @Args('ticketId') ticketId: string,
    @Args('questId') questId: string,
    @Args('userId') userId: string,
  ) {
    return this.questService.verifyTwitterRetweetQuest(
      ticketId,
      questId,
      userId,
    );
  }

  @Mutation(() => Quest)
  async verifyTwitterLikingQuest(
    @Args('ticketId') ticketId: string,
    @Args('questId') questId: string,
    @Args('userId') userId: string,
  ) {
    return this.questService.verifyTwitterLikingQuest(
      ticketId,
      questId,
      userId,
    );
  }

  @Mutation(() => Quest)
  async verifyAptosQuest(
    @Args('ticketId') ticketId: string,
    @Args('questId') questId: string,
    @Args('userId') userId: string,
  ) {
    return this.questService.verifyAptosQuest(ticketId, questId, userId);
  }

  @Mutation(() => Quest)
  async verify3ridgePoint(
    @Args('ticketId') ticketId: string,
    @Args('questId') questId: string,
    @Args('userId') userId: string,
  ) {
    return this.questService.verify3ridgePointQuest(ticketId, questId, userId);
  }
}
